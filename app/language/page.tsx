'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSelector() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if language already selected
  useEffect(() => {
    const savedLanguage = localStorage.getItem('roktokorobi-language');
    if (savedLanguage) {
      router.push('/');
    }
  }, [router]);

  if (!mounted) return null;

  const selectLanguage = (lang: 'en' | 'bn') => {
    localStorage.setItem('roktokorobi-language', lang);
    setTimeout(() => {
      router.push('/register');
    }, 100);
  };

  return (
    <div id="lang-select">
      <svg className="ls-drop" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 8.954 20 20 20s20-8.954 20-20C40 8.954 31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="#C0152A"/>
        <path d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#E8324A"/>
        <circle cx="20" cy="20" r="4" fill="#FDFAF4"/>
      </svg>
      <p className="ls-title">Select your language / আপনার ভাষা নির্বাচন করুন</p>
      <div className="ls-cards">
        <div className="ls-card" onClick={() => selectLanguage('en')}>
          <span className="ls-card-flag">🇬🇧</span>
          <span className="ls-card-name">English</span>
          <span className="ls-card-sub">ইংরেজি</span>
        </div>
        <div className="ls-card" onClick={() => selectLanguage('bn')}>
          <span className="ls-card-flag">🇧🇩</span>
          <span className="ls-card-name">বাংলা</span>
          <span className="ls-card-sub">Bangla</span>
        </div>
      </div>
    </div>
  );
}
