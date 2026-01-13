package api

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"sync"
	"time"

	"golang.org/x/crypto/argon2"
)

const (
	sessionTokenLength    = 16 // 128 bits
	sessionCookieName     = "session"
	inactivityTimeout     = 10 * time.Minute
	maxSessionDuration    = 8 * time.Hour
	argon2Time            = 1
	argon2Memory          = 64 * 1024 // 64 MB
	argon2Threads         = 4
	argon2KeyLength       = 32
	argon2SaltLength      = 16
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrSessionNotFound    = errors.New("session not found")
	ErrSessionExpired     = errors.New("session expired")
)

// User represents a user in the system
type User struct {
	Username     string
	PasswordHash string // Argon2ID hash in encoded format
}

// Session represents an active user session
type Session struct {
	UserID             string
	InactivityExpiry   time.Time
	MaxExpiry          time.Time
}

// SessionManager manages user sessions
type SessionManager struct {
	sessions map[string]*Session
	users    map[string]*User
	mu       sync.RWMutex
}

// NewSessionManager creates a new session manager with hardcoded users
func NewSessionManager() *SessionManager {
	sm := &SessionManager{
		sessions: make(map[string]*Session),
		users:    make(map[string]*User),
	}
	
	// Create 2 fake users with hardcoded password hashes
	// Password for both users: "password"
	// These hashes are pre-generated and static so they work across server restarts
	sm.users["alice"] = &User{
		Username: "alice",
		// Hash for password "password"
		PasswordHash: "yJg3w0gbQpVei0eHpVQJ9Q:Vm7sOUeOYCRxoye3oyFnOEXnOzmTiDAb2JzD4YYUEkA",
	}
	sm.users["bob"] = &User{
		Username: "bob",
		// Hash for password "password"
		PasswordHash: "AD2My0yV5W1IftJuXrjnnw:yrqh7B4FSIDjncTLbkXte/0KpTIyQtOt0llOTNUOjzE",
	}
	
	return sm
}

// generateSalt generates a random salt
func generateSalt() []byte {
	salt := make([]byte, argon2SaltLength)
	if _, err := rand.Read(salt); err != nil {
		panic(fmt.Sprintf("failed to generate salt: %v", err))
	}
	return salt
}

// encodePasswordHash encodes a password with salt using Argon2ID
func encodePasswordHash(password string, salt []byte) string {
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		argon2Time,
		argon2Memory,
		argon2Threads,
		argon2KeyLength,
	)
	
	// Encode as: base64(salt):base64(hash)
	return fmt.Sprintf("%s:%s",
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	)
}

// verifyPassword verifies a password against a stored hash
func verifyPassword(password, encodedHash string) bool {
	// Parse the encoded hash (format: base64(salt):base64(hash))
	parts := []byte(encodedHash)
	colonIdx := -1
	for i, b := range parts {
		if b == ':' {
			colonIdx = i
			break
		}
	}
	if colonIdx == -1 {
		return false
	}
	
	// Decode salt and hash from base64
	salt, err := base64.RawStdEncoding.DecodeString(string(parts[:colonIdx]))
	if err != nil {
		return false
	}
	hash, err := base64.RawStdEncoding.DecodeString(string(parts[colonIdx+1:]))
	if err != nil {
		return false
	}
	
	// Compute hash of provided password with stored salt
	computedHash := argon2.IDKey(
		[]byte(password),
		salt,
		argon2Time,
		argon2Memory,
		argon2Threads,
		argon2KeyLength,
	)
	
	// Constant-time comparison to prevent timing attacks
	return subtle.ConstantTimeCompare(hash, computedHash) == 1
}

// generateSessionToken generates a random session token
func generateSessionToken() (string, error) {
	b := make([]byte, sessionTokenLength)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate session token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// CreateSession creates a new session for a user
func (sm *SessionManager) CreateSession(username, password string) (string, error) {
	sm.mu.RLock()
	user, exists := sm.users[username]
	sm.mu.RUnlock()
	
	if !exists {
		return "", ErrInvalidCredentials
	}
	
	// Verify password
	if !verifyPassword(password, user.PasswordHash) {
		return "", ErrInvalidCredentials
	}
	
	// Generate session token
	token, err := generateSessionToken()
	if err != nil {
		return "", err
	}
	
	// Create session
	now := time.Now()
	session := &Session{
		UserID:           username,
		InactivityExpiry: now.Add(inactivityTimeout),
		MaxExpiry:        now.Add(maxSessionDuration),
	}
	
	sm.mu.Lock()
	sm.sessions[token] = session
	sm.mu.Unlock()
	
	return token, nil
}

// ValidateSession validates a session token and returns the user ID
func (sm *SessionManager) ValidateSession(token string) (string, error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	session, exists := sm.sessions[token]
	if !exists {
		return "", ErrSessionNotFound
	}

	now := time.Now()

	// Check if session has expired
	if now.After(session.InactivityExpiry) || now.After(session.MaxExpiry) {
		delete(sm.sessions, token)
		return "", ErrSessionExpired
	}

	// Update inactivity expiry (but don't exceed max expiry)
	newInactivityExpiry := now.Add(inactivityTimeout)
	if newInactivityExpiry.After(session.MaxExpiry) {
		newInactivityExpiry = session.MaxExpiry
	}

	session.InactivityExpiry = newInactivityExpiry

	return session.UserID, nil
}

// DeleteSession deletes a session
func (sm *SessionManager) DeleteSession(token string) {
	sm.mu.Lock()
	delete(sm.sessions, token)
	sm.mu.Unlock()
}

// CleanupExpiredSessions removes all expired sessions
func (sm *SessionManager) CleanupExpiredSessions() {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	
	now := time.Now()
	for token, session := range sm.sessions {
		if now.After(session.InactivityExpiry) || now.After(session.MaxExpiry) {
			delete(sm.sessions, token)
		}
	}
}
