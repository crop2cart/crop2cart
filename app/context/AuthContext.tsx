'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Wrapper functions to allow external updates
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
      // Also set as cookie
      document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
  };

  // Check if user is logged in on mount (session persistence)
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Try to get token from localStorage
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setTokenState(savedToken);
          setUserState(JSON.parse(savedUser));
          console.log('Session restored from localStorage');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    // Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear from cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    
    // Clear state
    setUserState(null);
    setTokenState(null);
    
    // Redirect to home
    window.location.href = '/home';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
