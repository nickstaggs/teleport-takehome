package api

import (
	"io/fs"
	"net/http"
)

// Server serves the directory browser API and webapp.
type Server struct {
	handler http.Handler
}

// NewServer creates a directory browser server.
// It serves webassets from the provided filesystem.
func NewServer(webassets fs.FS) (*Server, error) {
	mux := http.NewServeMux()
	s := &Server{handler: mux}

	// API routes
	mux.Handle("/api/hello", http.HandlerFunc(s.hello))

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
