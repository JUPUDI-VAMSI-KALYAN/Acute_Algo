'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider>
          {isMounted && !isDashboard && !isLogin && <Header />}
          <main className={isMounted && !isDashboard && !isLogin ? 'pt-16' : ''}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
