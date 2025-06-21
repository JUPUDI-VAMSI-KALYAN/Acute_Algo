"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Company Name */}
          <Link href="/" className="text-xl font-bold text-white">
            Acute Algo
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
              Feature Requests
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="https://calendly.com/jupudivamsikalyan/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              Book a Demo
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-300 hover:text-white"
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (with transition) */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 max-h-96 visible' 
            : 'opacity-0 max-h-0 invisible'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95">
          <Link 
            href="/dashboard" 
            className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/features" 
            className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Feature Requests
          </Link>
          <Link 
            href="/about" 
            className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="https://calendly.com/jupudivamsikalyan/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book a Demo
          </Link>
          <Link 
            href="/login" 
            className="block px-3 py-2 text-base font-medium text-gray-300 border border-gray-600 hover:text-white hover:bg-gray-700 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}; 