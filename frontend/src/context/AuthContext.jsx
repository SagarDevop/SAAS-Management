import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kaamsetu_auth_user') || localStorage.getItem('shreedev_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem('kaamsetu_business');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('kaamsetu_auth_token') || localStorage.getItem('shreedev_auth_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            setBusiness(res.data.business);
            localStorage.setItem('kaamsetu_auth_user', JSON.stringify(res.data.user));
            if (res.data.business) {
              localStorage.setItem('kaamsetu_business', JSON.stringify(res.data.business));
            }
          }
        } catch (err) {
          // Token invalid or expired
          setUser(null);
          setBusiness(null);
          localStorage.removeItem('kaamsetu_auth_token');
          localStorage.removeItem('kaamsetu_auth_user');
          localStorage.removeItem('kaamsetu_business');
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (emailOrUsername, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { 
        email: emailOrUsername,
        username: emailOrUsername,
        password 
      });
      if (res.data?.success) {
        const userData = res.data.user;
        const bizData = res.data.business;
        const token = res.data.token;
        setUser(userData);
        setBusiness(bizData);
        localStorage.setItem('kaamsetu_auth_user', JSON.stringify(userData));
        if (bizData) {
          localStorage.setItem('kaamsetu_business', JSON.stringify(bizData));
        }
        if (token) {
          localStorage.setItem('kaamsetu_auth_token', token);
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

  const registerWithOtp = (userData, bizData, token) => {
    setUser(userData);
    setBusiness(bizData);
    localStorage.setItem('kaamsetu_auth_user', JSON.stringify(userData));
    if (bizData) {
      localStorage.setItem('kaamsetu_business', JSON.stringify(bizData));
    }
    if (token) {
      localStorage.setItem('kaamsetu_auth_token', token);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      setUser(null);
      setBusiness(null);
      localStorage.removeItem('kaamsetu_auth_token');
      localStorage.removeItem('kaamsetu_auth_user');
      localStorage.removeItem('kaamsetu_business');
      localStorage.removeItem('shreedev_auth_token');
      localStorage.removeItem('shreedev_auth_user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      business,
      login, 
      registerWithOtp,
      logout, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
