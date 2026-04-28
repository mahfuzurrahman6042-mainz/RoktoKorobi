'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Illustration {
  id: string;
  title: string;
  title_bn: string | null;
  description: string;
  description_bn: string | null;
  image_url: string;
  section_id: string;
  created_at: string;
}

export default function IllustrationsPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Educational Illustrations', bn: 'শিক্ষামূলক চিত্রকথন' },
      loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
      error: { en: 'Failed to load illustrations', bn: 'চিত্রকথন লোড করতে ব্যর্থ' },
      noIllustrations: { en: 'No illustrations available', bn: 'কোন চিত্রকথন নেই' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIllustrations();
  }, []);

  const fetchIllustrations = async () => {
    try {
      const response = await fetch('/api/illustrations');
      if (!response.ok) throw new Error('Failed to fetch illustrations');
      const data = await response.json();
      setIllustrations(data.illustrations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch illustrations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTitle = (illustration: Illustration) => {
    if (language === 'bn' && illustration.title_bn) {
      return illustration.title_bn;
    }
    return illustration.title;
  };

  const getDescription = (illustration: Illustration) => {
    if (language === 'bn' && illustration.description_bn) {
      return illustration.description_bn;
    }
    return illustration.description;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#757575', fontSize: '1.1rem' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '80px 20px 40px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🎨 {language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon'}
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
            {language === 'bn'
              ? 'রক্তদান সচেতনতা বৃদ্ধির জন্য তৈরি চিত্রকল্প দেখুন'
              : 'View illustrations created to raise blood donation awareness'}
          </p>
        </div>

        {error && (
          <div className="card" style={{
            background: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {illustrations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
            <h3 style={{ color: '#212121', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {language === 'bn' ? 'কোন চিত্র নেই' : 'No illustrations yet'}
            </h3>
            <p style={{ color: '#757575' }}>
              {language === 'bn' ? 'পরে আবার চেক করুন!' : 'Check back later!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {illustrations.map((illustration) => (
              <Link
                key={illustration.id}
                href={`/illustrations/${illustration.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    aspectRatio: '16/9',
                    background: '#e0e0e0',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={illustration.image_url}
                      alt={getTitle(illustration)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 'bold', 
                      color: '#212121',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4'
                    }}>
                      {getTitle(illustration)}
                    </h2>
                    <p style={{ 
                      color: '#757575', 
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      marginBottom: '1rem',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {getDescription(illustration)}
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <span style={{ color: '#757575', fontSize: '0.85rem' }}>
                        {formatDate(illustration.created_at)}
                      </span>
                      <span style={{ color: '#FF5722', fontSize: '0.9rem', fontWeight: '600' }}>
                        {language === 'bn' ? 'দেখুন →' : 'View →'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
