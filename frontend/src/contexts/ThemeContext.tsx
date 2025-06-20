'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isDashboard: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const [dashboardTheme, setDashboardTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load dashboard theme from localStorage
    if (isDashboard) {
      const savedTheme = localStorage.getItem('dashboard-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setDashboardTheme(savedTheme);
      }
    }
  }, [isDashboard]);

  useEffect(() => {
    if (!mounted) return;

    if (isDashboard) {
      // Apply dashboard theme
      document.documentElement.className = dashboardTheme;
      localStorage.setItem('dashboard-theme', dashboardTheme);
    } else {
      // Always use dark theme for landing pages
      document.documentElement.className = 'dark';
    }
  }, [isDashboard, dashboardTheme, mounted]);

  const setTheme = (theme: 'light' | 'dark') => {
    if (isDashboard) {
      setDashboardTheme(theme);
    }
    // Ignore theme changes for non-dashboard pages
  };

  const currentTheme = isDashboard ? dashboardTheme : 'dark';

  const value: ThemeContextType = {
    theme: currentTheme,
    setTheme,
    isDashboard,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 