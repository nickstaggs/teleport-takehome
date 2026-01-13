package api

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

const (
	maxPathLength = 1024
)

var (
	// pathWhitelistRegex allows alphanumeric, /, _, ., and -
	pathWhitelistRegex = regexp.MustCompile(`^[a-zA-Z0-9/_.\-]*$`)
)

// Server serves the directory browser API and webapp.
type Server struct {
	handler http.Handler
	rootDir string
}

// FileInfo represents information about a file or directory
type FileInfo struct {
	Name     string      `json:"name"`
	Type     string      `json:"type"`
	Size     int64       `json:"size"`
	Contents []*FileInfo `json:"contents,omitempty"`
}

// NewServer creates a directory browser server.
// It serves webassets from the provided filesystem.
func NewServer(webassets fs.FS) (*Server, error) {
	// Get the current working directory as the root directory
	rootDir, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get working directory: %w", err)
	}

	mux := http.NewServeMux()
	s := &Server{
		handler: mux,
		rootDir: rootDir,
	}

	// API routes
	mux.Handle("/api/hello", http.HandlerFunc(s.hello))
	mux.Handle("/api/files/", http.HandlerFunc(s.getFiles))

	// web assets
	hfs := http.FS(webassets)
	files := http.FileServer(hfs)
	mux.Handle("/assets/", files)
	mux.Handle("/favicon.ico", files)

	// fall back to index.html for all unknown routes
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, webassets, "index.html")
	}))

	return s, nil
}

func (s *Server) ListenAndServe(addr string) error {
	return http.ListenAndServe(addr, s.handler)
}

// hello is an example API endpoint
func (s *Server) hello(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello"))
}

// getFiles handles GET requests to /api/files/<path>
func (s *Server) getFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract the path from the URL
	urlPath := strings.TrimPrefix(r.URL.Path, "/api/files")
	if urlPath == "" {
		urlPath = "/"
	}

	// Validate the path
	if err := s.validatePath(urlPath); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Resolve the full path
	fullPath, err := s.resolvePath(urlPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Check if the path exists
	info, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "File or directory does not exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Read directory information
	fileInfo, err := s.readFileInfo(fullPath, info)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(fileInfo); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

// validatePath validates the path according to security requirements
func (s *Server) validatePath(path string) error {
	// Check length
	if len(path) > maxPathLength {
		return fmt.Errorf("path exceeds maximum length of %d characters", maxPathLength)
	}

	// Check against whitelist regex
	if !pathWhitelistRegex.MatchString(path) {
		return fmt.Errorf("path contains invalid characters")
	}

	return nil
}

// resolvePath resolves the path and ensures it's within the root directory
func (s *Server) resolvePath(urlPath string) (string, error) {
	// Clean the path to remove any .. or . components
	cleanPath := filepath.Clean(urlPath)
	
	// Join with root directory
	fullPath := filepath.Join(s.rootDir, cleanPath)
	
	// Get absolute paths for comparison
	fullPathAbs, err := filepath.Abs(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to get absolute path: %w", err)
	}
	
	rootDirAbs, err := filepath.Abs(s.rootDir)
	if err != nil {
		return "", fmt.Errorf("failed to get absolute root directory: %w", err)
	}
	
	// Use filepath.Rel to check if fullPath is within rootDir
	relPath, err := filepath.Rel(rootDirAbs, fullPathAbs)
	if err != nil {
		return "", fmt.Errorf("failed to compute relative path: %w", err)
	}
	
	// If the relative path starts with "..", it's outside the root directory
	if strings.HasPrefix(relPath, "..") {
		return "", fmt.Errorf("path traversal attempt detected")
	}
	
	// Resolve any symlinks if the path exists
	resolvedPath, err := filepath.EvalSymlinks(fullPath)
	if err != nil {
		// If the path doesn't exist, EvalSymlinks will fail
		// Check if it's because the file doesn't exist
		if os.IsNotExist(err) {
			return fullPath, nil
		}
		return "", fmt.Errorf("failed to resolve path: %w", err)
	}
	
	// Ensure the resolved path is still within the root directory (in case of symlinks)
	relPathResolved, err := filepath.Rel(rootDirAbs, resolvedPath)
	if err != nil {
		return "", fmt.Errorf("failed to compute relative path for resolved path: %w", err)
	}
	
	// If the relative path starts with "..", it's outside the root directory
	if strings.HasPrefix(relPathResolved, "..") {
		return "", fmt.Errorf("path traversal attempt detected")
	}
	
	return resolvedPath, nil
}

// readFileInfo reads information about a file or directory
func (s *Server) readFileInfo(path string, info os.FileInfo) (*FileInfo, error) {
	fileInfo := &FileInfo{
		Name: info.Name(),
		Size: info.Size(),
	}

	if info.IsDir() {
		fileInfo.Type = "directory"
		fileInfo.Size = 0

		// Read directory contents
		entries, err := os.ReadDir(path)
		if err != nil {
			return nil, fmt.Errorf("failed to read directory: %w", err)
		}

		fileInfo.Contents = make([]*FileInfo, 0, len(entries))
		for _, entry := range entries {
			entryInfo, err := entry.Info()
			if err != nil {
				// Skip entries we can't read
				continue
			}

			entryFileInfo := &FileInfo{
				Name: entry.Name(),
				Size: entryInfo.Size(),
			}

			if entry.IsDir() {
				entryFileInfo.Type = "directory"
				entryFileInfo.Size = 0
			} else {
				entryFileInfo.Type = "file"
			}

			fileInfo.Contents = append(fileInfo.Contents, entryFileInfo)
		}
	} else {
		fileInfo.Type = "file"
	}

	return fileInfo, nil
}
