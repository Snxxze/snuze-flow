import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { LoginPayload, RegisterPayload, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { MOCK_TOKEN, MOCK_USER } from '@/mocks';

// =========================================================================================
// SECURITY WARNING / CAUTION:
// VITE_USE_MOCK is strictly for Local UI/UX Development without running Backend Services.
// MUST BE SET TO 'false' OR REMOVED IN PRODUCTION BUILD/DEPLOYMENT TO PREVENT AUTH BYPASS!
// =========================================================================================
const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => (IS_MOCK_MODE ? MOCK_USER : null));
  const [token, setToken] = useState<string | null>(() =>
    IS_MOCK_MODE ? MOCK_TOKEN : localStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(!IS_MOCK_MODE);

  useEffect(() => {
    // If Mock Mode is active, bypass backend token verification completely
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      setToken(MOCK_TOKEN);
      setIsLoading(false);
      return;
    }

    // REAL BACKEND AUTHENTICATION (UNTOUCHED)
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch {
        // Token invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      setToken(MOCK_TOKEN);
      return;
    }
    const res = await authService.login(payload);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (payload: RegisterPayload) => {
    if (IS_MOCK_MODE) {
      setUser(MOCK_USER);
      setToken(MOCK_TOKEN);
      return;
    }
    const res = await authService.register(payload);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    if (IS_MOCK_MODE) {
      setUser(null);
      setToken(null);
      return;
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
