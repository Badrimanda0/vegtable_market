import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vegetable Market",
  description: "Simple vegetable market management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="layout-container">
          <nav className="navbar">
            <Link href="/" className="nav-link" style={{fontWeight: 700, color: 'var(--foreground)'}}>🥬 VegiMarket</Link>
            <Link href="/customers" className="nav-link">Customers</Link>
            <Link href="/sales/new" className="nav-link">Add Sale</Link>
            <Link href="/payments/new" className="nav-link">Receive Payment</Link>
            <Link href="/reports" className="nav-link">Daily Reports</Link>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
