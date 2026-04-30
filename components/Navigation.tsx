'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navigation() {
  const { language, setLanguage } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const content = {
    en: {
      donate: 'Donate',
      request: 'Request Blood',
      find: 'Find Donors',
      bloodRequests: 'Blood Requests',
      blogs: 'Blogs',
      chitrokothon: 'Chitrokothon',
      join: 'Join Now'
    },
    bn: {
      donate: 'রক্ত দিন',
      request: 'রক্ত চাই',
      find: 'দাতা খুঁজুন',
      bloodRequests: 'রক্তের অনুরোধ',
      blogs: 'ব্লগ',
      chitrokothon: 'চিত্রকথন',
      join: 'যোগ দিন'
    }
  };

  const c = language === 'bn' ? content.bn : content.en;

  const handleLanguageChange = (lang: 'en' | 'bn') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLangDropdown(false);
  };

  return (
    <>
      <nav role="navigation" aria-label="Main navigation">
        <a className="nav-logo" href="/" aria-label="RoktoKorobi - Home">
          <svg viewBox="0 0 32 32" fill="none" style={{ width: '28px', height: '28px' }} aria-hidden="true">
            <path d="M16 4 C16 4 6 14 6 20 A10 10 0 0 0 26 20 C26 14 16 4 16 4Z" fill="#E02020"/>
          </svg>
          {language === 'bn' ? 'রক্তকরবী' : 'RoktoKorobi'}
        </a>
        <ul className="nav-links" role="menubar">
          <li role="none"><Link href="/register" role="menuitem" aria-label={c.donate}>{c.donate}</Link></li>
          <li role="none"><Link href="/request" role="menuitem" aria-label={c.request}>{c.request}</Link></li>
          <li role="none"><Link href="/donors" role="menuitem" aria-label={c.find}>{c.find}</Link></li>
          <li role="none"><Link href="/blood-requests" role="menuitem" aria-label={c.bloodRequests}>{c.bloodRequests}</Link></li>
          <li role="none"><Link href="/blog" role="menuitem" aria-label={c.blogs}>{c.blogs}</Link></li>
          <li role="none"><Link href="/illustrations" role="menuitem" aria-label={c.chitrokothon}>{c.chitrokothon}</Link></li>
          <li role="none"><Link href="/register" className="nav-cta" role="menuitem" aria-label={c.join}>{c.join}</Link></li>
        </ul>
        <div className="lang-selector">
          <button 
            className="lang-btn" 
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            aria-label="Select language"
            aria-expanded={showLangDropdown}
            aria-haspopup="menu"
          >
            {language === 'bn' ? '🇧🇩' : '🇬🇧'} {language === 'bn' ? 'বাংলা' : 'English'}
          </button>
          {showLangDropdown && (
            <div className="lang-dropdown" role="menu">
              <button 
                onClick={() => handleLanguageChange('en')}
                role="menuitem"
                aria-label="Switch to English"
              >
                🇬🇧 English
              </button>
              <button 
                onClick={() => handleLanguageChange('bn')}
                role="menuitem"
                aria-label="Switch to Bengali"
              >
                🇧🇩 বাংলা
              </button>
            </div>
          )}
        </div>
      </nav>
      <style jsx>{`
        .lang-selector {
          position: relative;
        }
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(155, 28, 28, 0.1);
          border: 1px solid rgba(155, 28, 28, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #0E0E0E;
          transition: all 0.2s;
        }
        .lang-btn:hover {
          background: rgba(155, 28, 28, 0.15);
          border-color: rgba(155, 28, 28, 0.5);
        }
        .lang-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #E8E4DC;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          min-width: 160px;
          padding: 8px;
          z-index: 1000;
        }
        .lang-dropdown button {
          display: block;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #0E0E0E;
          transition: background 0.2s;
        }
        .lang-dropdown button:hover {
          background: #F5F3EF;
        }
      `}</style>
    </>
  );
}
