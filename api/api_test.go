package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestValidatePath(t *testing.T) {
	s := &Server{}

	tests := []struct {
		name    string
		path    string
		wantErr bool
	}{
		{
			name:    "valid simple path",
			path:    "/test",
			wantErr: false,
		},
		{
			name:    "valid nested path",
			path:    "/test/path/to/file",
			wantErr: false,
		},
		{
			name:    "valid path with dash",
			path:    "/test-file",
			wantErr: false,
		},
		{
			name:    "valid path with underscore",
			path:    "/test_file",
			wantErr: false,
		},
		{
			name:    "valid path with dot",
			path:    "/test.txt",
			wantErr: false,
		},
		{
			name:    "invalid path with space",
			path:    "/test file",
			wantErr: true,
		},
		{
			name:    "invalid path with special char",
			path:    "/test$file",
			wantErr: true,
		},
		{
			name:    "path too long",
			path:    "/" + string(make([]byte, maxPathLength)),
			wantErr: true,
		},
		{
			name:    "empty path is valid",
			path:    "",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := s.validatePath(tt.path)
			if (err != nil) != tt.wantErr {
				t.Errorf("validatePath() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestResolvePath(t *testing.T) {
	// Create a temporary directory for testing
	tmpDir, err := os.MkdirTemp("", "test-resolve-path")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	s := &Server{rootDir: tmpDir}

	// Create a test subdirectory
	subDir := filepath.Join(tmpDir, "subdir")
	if err := os.Mkdir(subDir, 0755); err != nil {
		t.Fatalf("failed to create subdir: %v", err)
	}

	tests := []struct {
		name       string
		path       string
		wantErr    bool
		wantPrefix string
	}{
		{
			name:       "root path",
			path:       "/",
			wantErr:    false,
			wantPrefix: tmpDir,
		},
		{
			name:       "valid subdirectory",
			path:       "/subdir",
			wantErr:    false,
			wantPrefix: tmpDir,
		},
		{
			name:       "path with .. that stays within root",
			path:       "/subdir/../subdir",
			wantErr:    false,
			wantPrefix: tmpDir,
		},
		{
			name:       "path with .. that resolves to root",
			path:       "/../..",
			wantErr:    false,
			wantPrefix: tmpDir,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resolved, err := s.resolvePath(tt.path)
			if (err != nil) != tt.wantErr {
				t.Errorf("resolvePath() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.wantPrefix != "" {
				if len(resolved) < len(tt.wantPrefix) || resolved[:len(tt.wantPrefix)] != tt.wantPrefix {
					t.Errorf("resolvePath() = %v, want prefix %v", resolved, tt.wantPrefix)
				}
			}
		})
	}
}

func TestReadFileInfo(t *testing.T) {
	// Create a temporary directory for testing
	tmpDir, err := os.MkdirTemp("", "test-read-file-info")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Create test files and directories
	testFile := filepath.Join(tmpDir, "test.txt")
	if err := os.WriteFile(testFile, []byte("test content"), 0644); err != nil {
		t.Fatalf("failed to create test file: %v", err)
	}

	testDir := filepath.Join(tmpDir, "testdir")
	if err := os.Mkdir(testDir, 0755); err != nil {
		t.Fatalf("failed to create test dir: %v", err)
	}

	s := &Server{rootDir: tmpDir}

	t.Run("read file info", func(t *testing.T) {
		info, err := os.Stat(testFile)
		if err != nil {
			t.Fatalf("failed to stat test file: %v", err)
		}

		fileInfo, err := s.readFileInfo(testFile, info)
		if err != nil {
			t.Errorf("readFileInfo() error = %v", err)
			return
		}

		if fileInfo.Name != "test.txt" {
			t.Errorf("fileInfo.Name = %v, want %v", fileInfo.Name, "test.txt")
		}
		if fileInfo.Type != "file" {
			t.Errorf("fileInfo.Type = %v, want %v", fileInfo.Type, "file")
		}
		if fileInfo.Size != 12 {
			t.Errorf("fileInfo.Size = %v, want %v", fileInfo.Size, 12)
		}
	})

	t.Run("read directory info", func(t *testing.T) {
		info, err := os.Stat(tmpDir)
		if err != nil {
			t.Fatalf("failed to stat test dir: %v", err)
		}

		fileInfo, err := s.readFileInfo(tmpDir, info)
		if err != nil {
			t.Errorf("readFileInfo() error = %v", err)
			return
		}

		if fileInfo.Type != "directory" {
			t.Errorf("fileInfo.Type = %v, want %v", fileInfo.Type, "directory")
		}
		if fileInfo.Size != 0 {
			t.Errorf("fileInfo.Size = %v, want %v", fileInfo.Size, 0)
		}
		if len(fileInfo.Contents) != 2 {
			t.Errorf("len(fileInfo.Contents) = %v, want %v", len(fileInfo.Contents), 2)
		}
	})
}

func TestGetFilesEndpoint(t *testing.T) {
	// Create a temporary directory for testing
	tmpDir, err := os.MkdirTemp("", "test-get-files")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Create test structure
	testFile := filepath.Join(tmpDir, "test.txt")
	if err := os.WriteFile(testFile, []byte("test content"), 0644); err != nil {
		t.Fatalf("failed to create test file: %v", err)
	}

	testDir := filepath.Join(tmpDir, "testdir")
	if err := os.Mkdir(testDir, 0755); err != nil {
		t.Fatalf("failed to create test dir: %v", err)
	}

	s := &Server{rootDir: tmpDir}

	t.Run("get root directory", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/files/", nil)
		w := httptest.NewRecorder()

		s.getFiles(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("status code = %v, want %v", w.Code, http.StatusOK)
		}

		var fileInfo FileInfo
		if err := json.NewDecoder(w.Body).Decode(&fileInfo); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if fileInfo.Type != "directory" {
			t.Errorf("fileInfo.Type = %v, want %v", fileInfo.Type, "directory")
		}
		if len(fileInfo.Contents) != 2 {
			t.Errorf("len(fileInfo.Contents) = %v, want %v", len(fileInfo.Contents), 2)
		}
	})

	t.Run("get non-existent path", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/files/nonexistent", nil)
		w := httptest.NewRecorder()

		s.getFiles(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("status code = %v, want %v", w.Code, http.StatusNotFound)
		}
	})

	t.Run("invalid method", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/files/", nil)
		w := httptest.NewRecorder()

		s.getFiles(w, req)

		if w.Code != http.StatusMethodNotAllowed {
			t.Errorf("status code = %v, want %v", w.Code, http.StatusMethodNotAllowed)
		}
	})

	t.Run("invalid path characters", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/files/test%20file", nil)
		w := httptest.NewRecorder()

		s.getFiles(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("status code = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})
}
