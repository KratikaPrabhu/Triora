import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';
import { authService } from '../services/authService';
import { getStoredToken } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string; user?: User; isNewUser?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateOnboarding: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setToken(currentToken);
      } else {
        authService.logout();
        setUser(null);
        setToken(null);
      }
    } catch {
      authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await authService.login(email, password);
    setIsLoading(false);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Login failed.' };
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const res = await authService.signup(name, email, password);
    setIsLoading(false);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Signup failed.' };
  };

  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    const res = await authService.googleAuth(credential);
    setIsLoading(false);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user, isNewUser: res.data.isNewUser };
    }
    return { success: false, error: res.error?.message || 'Google login failed.' };
  };

  const updateOnboarding = async (data: any) => {
    const res = await authService.updateOnboarding(data);
    if (res.success) {
      await refreshUser();
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Failed to update onboarding.' };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        googleLogin,
        logout,
        refreshUser,
        updateOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
