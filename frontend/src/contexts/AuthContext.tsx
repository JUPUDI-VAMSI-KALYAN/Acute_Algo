'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AuthUser } from '@/lib/api';
import { getCallbackUrl, logEnvironmentInfo } from '@/lib/environment';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    // Log environment info on mount for debugging
    logEnvironmentInfo();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a stored token first
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (!storedToken) {
        setUser(null);
        console.log('No stored token found');
        return;
      }
      
      const response = await authApi.getAuthStatus();
      
      if (response.authenticated && response.user) {
        setUser(response.user);
        console.log('User authenticated:', response.user);
      } else {
        setUser(null);
        console.log('User not authenticated');
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
      // Clear invalid token on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (redirectUrl?: string) => {
    try {
      setIsLoading(true);
      
      // Use provided URL or generate callback URL using environment utility
      const callbackUrl = redirectUrl || getCallbackUrl();
      
      console.log('🔗 Using callback URL:', callbackUrl);
      
      const response = await authApi.getGithubAuthUrl(callbackUrl);
      
      if (response.success && response.authUrl) {
        console.log('✅ Redirecting to GitHub OAuth:', response.authUrl);
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
      // Even if logout fails, clear user state and tokens
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 