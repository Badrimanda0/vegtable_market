'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <Link href="/" className="nav-link nav-brand" onClick={closeMenu}>
          🥬 VegiMarket
        </Link>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          ☰
        </button>
      </div>
      
      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>Dashboard</Link>
        <Link href="/customers" className={`nav-link ${pathname === '/customers' ? 'active' : ''}`} onClick={closeMenu}>Customers</Link>
        <Link href="/sales/new" className={`nav-link ${pathname === '/sales/new' ? 'active' : ''}`} onClick={closeMenu}>Add Sale</Link>
        <Link href="/payments/new" className={`nav-link ${pathname === '/payments/new' ? 'active' : ''}`} onClick={closeMenu}>Receive Payment</Link>
        <Link href="/reports" className={`nav-link ${pathname === '/reports' ? 'active' : ''}`} onClick={closeMenu}>Daily Reports</Link>
      </div>
    </nav>
  );
}
