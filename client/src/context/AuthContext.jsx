import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'pulsenews_token';
const USER_KEY = 'pulsenews_user';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    // Verify current token on mount if present
    async function verify() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
        } else if (response.status === 401) {
          // Token expired or invalid
          clearSession();
        }
      } catch (_) {
        // Network or offline: keep local user cached
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, []);

  const saveSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    if (authToken) localStorage.setItem(TOKEN_KEY, authToken);
    if (authUser) localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let data;
    try {
      data = await response.json();
    } catch (_) {
      throw new Error(`Server returned HTTP ${response.status}. Please check if the Node.js backend server is running.`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    saveSession(data.token, data.user);
    return data;
  };

  const register = async ({ name, email, password }) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    let data;
    try {
      data = await response.json();
    } catch (_) {
      throw new Error(`Server returned HTTP ${response.status}. Please check if the Node.js backend server is running.`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Registration failed. Please check your details.');
    }

    saveSession(data.token, data.user);
    return data;
  };

  const logout = async () => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    clearSession();
    if (currentToken) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          keepalive: true
        });
      } catch (_) {}
    }
  };

  const killSession = (reason = 'session_killed') => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);
    clearSession();
    sessionStorage.setItem('pulsenews_session_killed', '1');
    if (currentToken) {
      try {
        fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          keepalive: true
        });
      } catch (_) {}
    }
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        killSession,
        clearSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
