'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AuthUser } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getAuthStatus();
      
      if (response.authenticated && response.user) {
        setUser(response.user);
        console.log('User authenticated:', response.user);
      } else {
        setUser(null);
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (redirectUrl?: string) => {
    try {
      setIsLoading(true);
      
      // Default redirect URL to dashboard
      const callbackUrl = redirectUrl || `${window.location.origin}/auth/callback`;
      
      const response = await authApi.getGithubAuthUrl(callbackUrl);
      
      if (response.success && response.authUrl) {
        console.log('Redirecting to GitHub OAuth:', response.authUrl);
        window.location.href = response.authUrl;
      } else {
        throw new Error('Failed to get GitHub auth URL');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      console.log('User logged out successfully');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear user state
      setUser(null);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      
      if (response.success && response.user) {
        setUser(response.user);
        console.log('User data refreshed:', response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 