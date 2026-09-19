import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'devcollab_token';
const USER_KEY = 'devcollab_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while we verify a persisted session
  const [authError, setAuthError] = useState('');

  // On mount: if a token is persisted, verify it against the backend so a
  // page refresh keeps the user logged in only while the token is still valid.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    setAuthError('');
    try {
      const res = await authApi.login({ email, password });
      const { token, user: loggedInUser } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      const message = err.normalizedMessage || 'Login failed';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (payload) => {
    setAuthError('');
    try {
      const res = await authApi.register(payload);
      const { token, user: newUser } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const message = err.normalizedMessage || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout should always succeed on the client even if the request fails.
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = { user, setUser, isLoading, isAuthenticated: Boolean(user), authError, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
