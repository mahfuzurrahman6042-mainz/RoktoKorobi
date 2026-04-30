'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);

  if (!mounted) return null;

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      privacy: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
      terms: { en: 'Terms of Service', bn: 'শর্তাবলী' },
      about: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
      copyright: { en: `© ${new Date().getFullYear()} RoktoKorobi. All rights reserved.`, bn: `© ${new Date().getFullYear()} রক্তকরবী। সর্বস্বত্ব সংরক্ষিত।` },
    };
    return translations[key]?.[language] || key;
  };

  return (
    <footer role="contentinfo" aria-label="Site footer" style={{
      background: '#1B5E6B',
      color: 'white',
      padding: '2rem 1rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <nav aria-label="Footer navigation" style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link
            href="/privacy"
            aria-label={t('privacy')}
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            aria-label={t('terms')}
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {t('terms')}
          </Link>
          <Link
            href="/about"
            aria-label={t('about')}
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {t('about')}
          </Link>
        </nav>
        <p style={{
          fontSize: '0.85rem',
          opacity: 0.8,
          margin: 0,
        }}>
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
