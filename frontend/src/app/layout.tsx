import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acute Algo",
  description: "Frontend for Acute Algo platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900 min-h-screen">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
