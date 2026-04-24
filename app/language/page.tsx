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
    router.push('/register');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#e53935',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          margin: 0
        }}>
          🩸 RoktoKorobi
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem'
        }}>
          Choose your language / আপনার ভাষা নির্বাচন করুন
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <button
            onClick={() => selectLanguage('en')}
            style={{
              padding: '1.5rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            English
          </button>
          
          <button
            onClick={() => selectLanguage('bn')}
            style={{
              padding: '1.5rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            বাংলা (Bangla)
          </button>
        </div>
      </div>
    </div>
  );
}
