'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-900 min-h-screen`}>
        {!isDashboard && <Header />}
        <main className={!isDashboard ? 'pt-16' : ''}>
          {children}
        </main>
      </body>
    </html>
  );
}
