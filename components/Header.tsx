"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  isLoggedIn?: boolean;
  userData?: { name: string; bloodGroup: string } | null;
}

export default function Header({ isLoggedIn = false, userData = null }: HeaderProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavSolid(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    router.push('/');
    setMobileOpen(false);
  };

  const navigationLinks = [
    { href: '/', label: 'Home', labelBn: 'হোম' },
    { href: '/donors', label: 'Donors', labelBn: 'রক্তদাতা' },
    { href: '/request', label: 'Request Blood', labelBn: 'রক্তের প্রয়োজন' },
    { href: '/eligibility', label: 'Eligibility', labelBn: 'যোগ্যতা' },
    { href: '/blog', label: 'Blog', labelBn: 'ব্লগ' },
  ];

  const moreLinks = [
    { href: '/illustrations', label: 'Chitrokothon', labelBn: 'চিত্রকথন' },
    { href: '/testimonials', label: 'Testimonials', labelBn: 'অভিজ্ঞতা' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        navSolid 
          ? 'bg-white/95 backdrop-blur shadow-md' 
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="RoktoKorobi - Home"
          >
            <svg width="28" height="32" viewBox="0 0 32 38" fill="none">
              <path d="M16 2C16 2 2 16 2 24C2 31.2 8.3 36 16 36C23.7 36 30 31.2 30 24C30 16 16 2 16 2Z" fill="#dc2626" opacity=".15"/>
              <path d="M16 6C16 6 5 18 5 25C5 30.5 10 35 16 35C22 35 27 30.5 27 25C27 18 16 6 16 6Z" fill="#dc2626"/>
            </svg>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-red-600 text-base">রক্তকরবী</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">roktokorobi</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                {language === 'bn' ? link.labelBn : link.label}
              </Link>
            ))}
            
            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                aria-label="More options"
              >
                More ▼
              </button>
              {showMoreMenu && (
                <div className="absolute top-full right-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  {moreLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowMoreMenu(false)}
                    >
                      {language === 'bn' ? link.labelBn : link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-full hover:border-red-600 hover:text-red-600 transition-colors"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* User Profile or Login */}
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Go to dashboard"
                aria-label="User profile"
              >
                {(userData?.name || 'U').charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Log In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            {navigationLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {language === 'bn' ? link.labelBn : link.label}
              </Link>
            ))}
            {moreLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {language === 'bn' ? link.labelBn : link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
