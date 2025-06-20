'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-gray-900 min-h-screen`}
      >
        {isMounted && !isDashboard && <Header />}
        <main className={isMounted && !isDashboard ? 'pt-16' : ''}>
          {children}
        </main>
      </body>
    </html>
  );
}
