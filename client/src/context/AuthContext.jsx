import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'uscoded_auth_token';
const USER_KEY = 'uscoded_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Verify stored token on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res?.success && res.user) {
          const freshUser = {
            id: res.user._id || res.user.id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            avatar: res.user.avatar,
            designation: res.user.designation,
            teamMemberId: res.user.teamMemberId,
          };
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } else {
          throw new Error('Invalid user profile response');
        }
      } catch (err) {
        console.warn('[Auth] Stored session invalid or expired:', err.message);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = useCallback(async (email, password, rememberMe = true, loginMode = 'admin') => {
    const res = await authApi.login({ email, password, loginMode });
    if (res?.success && res.token && res.user) {
      const userObj = {
        id: res.user._id || res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar: res.user.avatar,
        designation: res.user.designation,
        teamMemberId: res.user.teamMemberId,
      };
      setToken(res.token);
      setUser(userObj);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      if (!rememberMe) {
        sessionStorage.setItem('uscoded_session_only', 'true');
      } else {
        sessionStorage.removeItem('uscoded_session_only');
      }
      return res;
    }
    throw new Error(res?.message || 'Login failed');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res?.success && res.token && res.user) {
      const userObj = {
        id: res.user._id || res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar: res.user.avatar,
        designation: res.user.designation,
        teamMemberId: res.user.teamMemberId,
      };
      setToken(res.token);
      setUser(userObj);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      return res;
    }
    throw new Error(res?.message || 'Registration failed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('uscoded_session_only');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
