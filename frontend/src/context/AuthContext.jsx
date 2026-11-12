import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shreedev_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('shreedev_auth_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('shreedev_auth_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Token invalid or expired
          setUser(null);
          localStorage.removeItem('shreedev_auth_token');
          localStorage.removeItem('shreedev_auth_user');
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data?.success) {
        const userData = res.data.user;
        const token = res.data.token;
        setUser(userData);
        localStorage.setItem('shreedev_auth_user', JSON.stringify(userData));
        if (token) {
          localStorage.setItem('shreedev_auth_token', token);
        }
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: res.data?.message || 'Authentication failed' };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Unable to connect to authentication server';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      setUser(null);
      localStorage.removeItem('shreedev_auth_token');
      localStorage.removeItem('shreedev_auth_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
