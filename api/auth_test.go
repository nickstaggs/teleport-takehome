package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestSessionManager(t *testing.T) {
	sm := NewSessionManager()

	t.Run("create session with valid credentials", func(t *testing.T) {
		token, err := sm.CreateSession("alice", "password")
		if err != nil {
			t.Errorf("CreateSession() error = %v, want nil", err)
		}
		if token == "" {
			t.Error("CreateSession() returned empty token")
		}
	})

	t.Run("create session with invalid username", func(t *testing.T) {
		_, err := sm.CreateSession("invalid", "password")
		if err != ErrInvalidCredentials {
			t.Errorf("CreateSession() error = %v, want %v", err, ErrInvalidCredentials)
		}
	})

	t.Run("create session with invalid password", func(t *testing.T) {
		_, err := sm.CreateSession("alice", "wrongpassword")
		if err != ErrInvalidCredentials {
			t.Errorf("CreateSession() error = %v, want %v", err, ErrInvalidCredentials)
		}
	})

	t.Run("validate valid session", func(t *testing.T) {
		token, err := sm.CreateSession("bob", "password")
		if err != nil {
			t.Fatalf("CreateSession() error = %v", err)
		}

		userID, err := sm.ValidateSession(token)
		if err != nil {
			t.Errorf("ValidateSession() error = %v, want nil", err)
		}
		if userID != "bob" {
			t.Errorf("ValidateSession() userID = %v, want %v", userID, "bob")
		}
	})

	t.Run("validate invalid session", func(t *testing.T) {
		_, err := sm.ValidateSession("invalid-token")
		if err != ErrSessionNotFound {
			t.Errorf("ValidateSession() error = %v, want %v", err, ErrSessionNotFound)
		}
	})

	t.Run("delete session", func(t *testing.T) {
		token, err := sm.CreateSession("alice", "password")
		if err != nil {
			t.Fatalf("CreateSession() error = %v", err)
		}

		sm.DeleteSession(token)

		_, err = sm.ValidateSession(token)
		if err != ErrSessionNotFound {
			t.Errorf("ValidateSession() after delete error = %v, want %v", err, ErrSessionNotFound)
		}
	})
}

func TestLoginEndpoint(t *testing.T) {
	sm := NewSessionManager()
	s := &Server{sessionManager: sm}

	t.Run("successful login", func(t *testing.T) {
		reqBody := LoginRequest{
			Username: "alice",
			Password: "password",
		}
		body, _ := json.Marshal(reqBody)

		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		s.login(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("login() status = %v, want %v", w.Code, http.StatusOK)
		}

		// Check that a cookie was set
		cookies := w.Result().Cookies()
		if len(cookies) == 0 {
			t.Error("login() did not set a cookie")
		}

		var found bool
		for _, cookie := range cookies {
			if cookie.Name == sessionCookieName {
				found = true
				if cookie.Value == "" {
					t.Error("login() set empty cookie value")
				}
				if !cookie.HttpOnly {
					t.Error("login() cookie is not HttpOnly")
				}
				if !cookie.Secure {
					t.Error("login() cookie is not Secure")
				}
				if cookie.SameSite != http.SameSiteStrictMode {
					t.Error("login() cookie SameSite is not Strict")
				}
			}
		}
		if !found {
			t.Errorf("login() did not set %s cookie", sessionCookieName)
		}
	})

	t.Run("login with invalid credentials", func(t *testing.T) {
		reqBody := LoginRequest{
			Username: "alice",
			Password: "wrongpassword",
		}
		body, _ := json.Marshal(reqBody)

		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		s.login(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("login() status = %v, want %v", w.Code, http.StatusUnauthorized)
		}
	})

	t.Run("login without Content-Type header", func(t *testing.T) {
		reqBody := LoginRequest{
			Username: "alice",
			Password: "password",
		}
		body, _ := json.Marshal(reqBody)

		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body))
		// No Content-Type header
		w := httptest.NewRecorder()

		s.login(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("login() status = %v, want %v", w.Code, http.StatusBadRequest)
		}
	})

	t.Run("login with wrong method", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/login", nil)
		w := httptest.NewRecorder()

		s.login(w, req)

		if w.Code != http.StatusMethodNotAllowed {
			t.Errorf("login() status = %v, want %v", w.Code, http.StatusMethodNotAllowed)
		}
	})
}

func TestLogoutEndpoint(t *testing.T) {
	sm := NewSessionManager()
	s := &Server{sessionManager: sm}

	t.Run("successful logout", func(t *testing.T) {
		// Create a session first
		token, err := sm.CreateSession("alice", "password")
		if err != nil {
			t.Fatalf("CreateSession() error = %v", err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/logout", nil)
		req.AddCookie(&http.Cookie{
			Name:  sessionCookieName,
			Value: token,
		})
		w := httptest.NewRecorder()

		s.logout(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("logout() status = %v, want %v", w.Code, http.StatusOK)
		}

		// Check that session was deleted
		_, err = sm.ValidateSession(token)
		if err != ErrSessionNotFound {
			t.Errorf("ValidateSession() after logout error = %v, want %v", err, ErrSessionNotFound)
		}

		// Check that cookie was cleared
		cookies := w.Result().Cookies()
		var found bool
		for _, cookie := range cookies {
			if cookie.Name == sessionCookieName {
				found = true
				if cookie.MaxAge != -1 {
					t.Errorf("logout() cookie MaxAge = %v, want -1", cookie.MaxAge)
				}
			}
		}
		if !found {
			t.Error("logout() did not clear session cookie")
		}
	})

	t.Run("logout with wrong method", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/logout", nil)
		w := httptest.NewRecorder()

		s.logout(w, req)

		if w.Code != http.StatusMethodNotAllowed {
			t.Errorf("logout() status = %v, want %v", w.Code, http.StatusMethodNotAllowed)
		}
	})
}

func TestRequireAuthMiddleware(t *testing.T) {
	sm := NewSessionManager()
	s := &Server{sessionManager: sm}

	// Create a dummy handler
	dummyHandler := func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("success"))
	}

	t.Run("with valid session", func(t *testing.T) {
		token, err := sm.CreateSession("alice", "password")
		if err != nil {
			t.Fatalf("CreateSession() error = %v", err)
		}

		req := httptest.NewRequest(http.MethodGet, "/api/files/", nil)
		req.AddCookie(&http.Cookie{
			Name:  sessionCookieName,
			Value: token,
		})
		w := httptest.NewRecorder()

		handler := s.requireAuth(dummyHandler)
		handler(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("requireAuth() status = %v, want %v", w.Code, http.StatusOK)
		}
	})

	t.Run("without session cookie", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/files/", nil)
		w := httptest.NewRecorder()

		handler := s.requireAuth(dummyHandler)
		handler(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("requireAuth() status = %v, want %v", w.Code, http.StatusUnauthorized)
		}
	})

	t.Run("with invalid session token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/files/", nil)
		req.AddCookie(&http.Cookie{
			Name:  sessionCookieName,
			Value: "invalid-token",
		})
		w := httptest.NewRecorder()

		handler := s.requireAuth(dummyHandler)
		handler(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("requireAuth() status = %v, want %v", w.Code, http.StatusUnauthorized)
		}
	})
}

func TestSessionExpiration(t *testing.T) {
	// This test is challenging in real-time, so we'll just verify the logic
	sm := NewSessionManager()

	token, err := sm.CreateSession("alice", "password")
	if err != nil {
		t.Fatalf("CreateSession() error = %v", err)
	}

	// Validate immediately - should succeed
	_, err = sm.ValidateSession(token)
	if err != nil {
		t.Errorf("ValidateSession() immediate error = %v, want nil", err)
	}

	// Check that the session exists
	sm.mu.RLock()
	session, exists := sm.sessions[token]
	sm.mu.RUnlock()

	if !exists {
		t.Fatal("Session was not created")
	}

	// Verify session expiry times are set correctly
	now := time.Now()
	if session.InactivityExpiry.Before(now) {
		t.Error("InactivityExpiry is in the past")
	}
	if session.MaxExpiry.Before(now) {
		t.Error("MaxExpiry is in the past")
	}
	if session.InactivityExpiry.After(session.MaxExpiry) {
		t.Error("InactivityExpiry is after MaxExpiry")
	}
}

func TestPasswordHashing(t *testing.T) {
	salt := generateSalt()
	if len(salt) != argon2SaltLength {
		t.Errorf("generateSalt() length = %v, want %v", len(salt), argon2SaltLength)
	}

	password := "testpassword"
	hash := encodePasswordHash(password, salt)

	if hash == "" {
		t.Error("encodePasswordHash() returned empty hash")
	}

	// Verify correct password
	if !verifyPassword(password, hash) {
		t.Error("verifyPassword() failed for correct password")
	}

	// Verify incorrect password
	if verifyPassword("wrongpassword", hash) {
		t.Error("verifyPassword() succeeded for incorrect password")
	}
}
