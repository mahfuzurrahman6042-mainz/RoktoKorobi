'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  language?: string;
  setLanguage?: (lang: string) => void;
  isLoggedIn?: boolean;
  userData?: any;
  setIsLoggedIn?: (logged: boolean) => void;
}

export default function Navbar({ 
  language = 'en', 
  setLanguage, 
  isLoggedIn = false, 
  userData,
  setIsLoggedIn 
}: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLLIElement>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        home: 'Home',
        donors: 'Donors',
        request: 'Request Blood',
        eligibilityLink: 'Eligibility',
        blog: 'Blog',
        chitrokothon: 'Chitrokothon',
        testimonials: 'Testimonials',
        login: 'Login',
        lang: 'বাংলা'
      },
      bn: {
        home: 'হোম',
        donors: 'দাতা',
        request: 'রক্ত চাই',
        eligibilityLink: 'যোগ্যতা',
        blog: 'ব্লগ',
        chitrokothon: 'চিত্রকথন',
        testimonials: 'সাক্ষ্যগ্রন্থ',
        login: 'লগইন',
        lang: 'English'
      }
    };
    return translations[language][key] || key;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    if (setLanguage) {
      setLanguage(newLang);
      localStorage.setItem('language', newLang);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    if (setIsLoggedIn) setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <Link href="/" className="nav-logo" aria-label="RoktoKorobi Home">
            <div className="logo-icon">🩸</div>
            <div className="logo-text">
              <span className="logo-bn">রক্তকরবী</span>
              <span className="logo-en">ROKTOKOROBI</span>
            </div>
          </Link>

          <ul className="nav-links" role="menubar">
            <li role="none"><Link href="/" className="nav-link" role="menuitem" aria-label={t('home')}>{t('home')}</Link></li>
            <li role="none"><Link href="/donors" className="nav-link" role="menuitem" aria-label={t('donors')}>{t('donors')}</Link></li>
            <li role="none"><Link href="/request" className="nav-link" role="menuitem" aria-label={t('request')}>{t('request')}</Link></li>
            <li role="none"><Link href="/eligibility" className="nav-link" role="menuitem" aria-label={t('eligibilityLink')}>{t('eligibilityLink')}</Link></li>
            <li role="none"><Link href="/blog" className="nav-link" role="menuitem" aria-label={t('blog')}>{t('blog')}</Link></li>
            <li role="none"><Link href="/illustrations" className="nav-link" role="menuitem" aria-label={t('chitrokothon')}>{t('chitrokothon')}</Link></li>
            <li role="none"><Link href="/testimonials" className="nav-link" role="menuitem" aria-label={t('testimonials')}>{t('testimonials')}</Link></li>
            <li role="none">
              <button 
                className="nav-lang"
                onClick={handleLanguageToggle}
                aria-label={`Switch to ${language === 'en' ? 'Bangla' : 'English'}`}
              >
                {t('lang')}
              </button>
            </li>
            {isLoggedIn && userData ? (
              <li role="none" ref={profileRef} style={{ position: 'relative' }}>
                <button
                  className="avatar-trigger"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label="Open account menu"
                >
                  {(userData?.name || 'U').charAt(0).toUpperCase()}{(userData?.name || 'U').split(' ')[1]?.charAt(0).toUpperCase() || ''}
                </button>
                {menuOpen && (
                  <>
                    <div className="avatar-backdrop" onClick={() => setMenuOpen(false)} />
                    <div className="avatar-panel" role="menu">
                      <div className="avatar-panel-header">
                        <div className="avatar-panel-photo">{(userData?.name || 'U').charAt(0).toUpperCase()}{(userData?.name || 'U').split(' ')[1]?.charAt(0).toUpperCase() || ''}</div>
                        <div>
                          <p className="avatar-panel-name">{userData?.name || 'User'}</p>
                          <p className="avatar-panel-tag"><span className="avatar-tag-dot"></span>{userData?.bloodGroup || 'O+'} donor</p>
                        </div>
                      </div>

                      <div className="avatar-menu">
                        <a href="/profile" className="avatar-menu-item" role="menuitem">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                          My profile
                        </a>
                        <a href="/donations" className="avatar-menu-item" role="menuitem">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5Z"/><path d="M9 12.5 11.2 15 15.5 10"/></svg>
                          Donation history
                        </a>
                        <a href="/notifications" className="avatar-menu-item" role="menuitem">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
                          Notifications
                        </a>
                        <a href="/settings" className="avatar-menu-item" role="menuitem">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.14.68.36 1 .6"/></svg>
                          Settings
                        </a>
                      </div>

                      <div className="avatar-menu-divider"></div>

                      <div className="avatar-menu">
                        <button className="avatar-menu-item avatar-menu-item-danger" role="menuitem" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ) : (
              <li role="none"><Link href="/login" className="nav-cta" role="menuitem" aria-label={t('login')}>{t('login')}</Link></li>
            )}
          </ul>

          <button 
            className={`hamburger ${mobileOpen ? 'open' : ''}`} 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div id="mobile-menu" className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile navigation">
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>
        <div className="mobile-menu-content">
          <button
            onClick={handleLanguageToggle}
            className="mobile-lang-btn"
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} aria-label="Dashboard">Dashboard</Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} aria-label="Profile">Profile</Link>
              <button onClick={handleLogout} className="mobile-logout">Log Out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="mobile-login">{t('login')}</Link>
          )}
          <Link href="/donors" onClick={() => setMobileOpen(false)} aria-label={t('donors')}>{t('donors')}</Link>
          <Link href="/request" onClick={() => setMobileOpen(false)} aria-label={t('request')}>{t('request')}</Link>
          <Link href="/eligibility" onClick={() => setMobileOpen(false)} aria-label={t('eligibilityLink')}>{t('eligibilityLink')}</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} aria-label={t('blog')}>{t('blog')}</Link>
          <Link href="/illustrations" onClick={() => setMobileOpen(false)} aria-label={t('chitrokothon')}>{t('chitrokothon')}</Link>
          <Link href="/testimonials" onClick={() => setMobileOpen(false)} aria-label={t('testimonials')}>{t('testimonials')}</Link>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 16px clamp(20px, 4vw, 32px);
          z-index: 1000;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-bn {
          font-size: 18px;
          font-weight: 800;
          color: #8B1A1A;
        }

        .logo-en {
          font-size: 11px;
          font-weight: 700;
          color: #8B1A1A;
          letter-spacing: 1px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          text-decoration: none;
          color: #1A1A1A;
          font-weight: 600;
          font-size: 15px;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #8B1A1A;
        }

        .nav-lang {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .nav-lang:hover {
          background: rgba(220, 38, 38, 0.2);
        }

        /* ---------- Avatar trigger ---------- */
        .avatar-trigger {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid #C8202E;
          background: #ffffff;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          color: #C8202E;
          letter-spacing: 0.01em;
          transition: box-shadow 0.15s ease, transform 0.1s ease;
        }
        .avatar-trigger:hover { box-shadow: 0 0 0 3px rgba(200,32,46,0.15); }
        .avatar-trigger:active { transform: scale(0.96); }
        .avatar-trigger:focus-visible {
          outline: 2px solid #C8202E;
          outline-offset: 3px;
        }

        /* ---------- Backdrop + panel ---------- */
        .avatar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(20,8,8,0.45);
          z-index: 999;
        }

        .avatar-panel {
          position: absolute;
          top: 54px;
          right: 0;
          width: 264px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 44px -10px rgba(20,8,8,0.28), 0 2px 8px rgba(20,8,8,0.06);
          z-index: 1000;
          overflow: hidden;
        }

        .avatar-panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 18px 16px;
          background: #FBF6F4;
        }
        .avatar-panel-photo {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #ffffff;
          border: 2px solid #C8202E;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #C8202E;
        }
        .avatar-panel-name {
          font-weight: 600;
          font-size: 14px;
          margin: 0;
          color: #2B1B18;
        }
        .avatar-panel-tag {
          margin: 3px 0 0;
          font-size: 12px;
          font-weight: 600;
          color: #C8202E;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .avatar-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C8202E;
        }

        .avatar-menu { padding: 6px; }
        .avatar-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border: none;
          background: none;
          border-radius: 9px;
          color: #2B1B18;
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s ease;
          text-decoration: none;
        }
        .avatar-menu-item:hover { background: #FBF6F4; }
        .avatar-menu-item svg { flex-shrink: 0; color: #8A7570; }

        .avatar-menu-divider {
          height: 1px;
          margin: 4px 18px;
          background: rgba(20,10,10,0.08);
        }

        .avatar-menu-item-danger { color: #9E1621; }
        .avatar-menu-item-danger svg { color: #C8202E; }
        .avatar-menu-item-danger:hover { background: rgba(200,32,46,0.06); }

        .nav-cta {
          background: #dc2626;
          color: white;
          padding: 10px 24px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s;
        }

        .nav-cta:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 1001;
        }

        .hamburger span {
          width: 24px;
          height: 2px;
          background: #8B1A1A;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 999;
          display: flex;
          flex-direction: column;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .mobile-menu.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-title {
          color: white;
          font-size: 20px;
          font-weight: 700;
        }

        .mobile-menu-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
        }

        .mobile-menu-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 16px;
        }

        .mobile-lang-btn {
          background: rgba(220, 38, 38, 0.2);
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
        }

        .mobile-menu-content a {
          color: white;
          text-decoration: none;
          font-size: 18px;
          font-weight: 600;
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }

        .mobile-menu-content a:hover {
          color: #dc2626;
          padding-left: 20px;
        }

        .mobile-logout {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-login {
          background: #dc2626;
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }

          .hamburger {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 12px 16px;
          }

          .logo-bn {
            font-size: 16px;
          }

          .logo-en {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}
