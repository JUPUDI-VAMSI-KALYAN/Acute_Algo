import type { Metadata } from "next";
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
