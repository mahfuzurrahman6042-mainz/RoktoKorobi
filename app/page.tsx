'use client';



import Link from 'next/link';

import { useLanguage } from '@/lib/LanguageContext';



export default function Home() {

  const { t, language } = useLanguage();



  return (

    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>

        <h1 style={{ color: '#e53935', fontSize: '2rem', margin: 0 }}>

          🩸 {t('appTitle')}

        </h1>

        <Link href="/login" style={{

          padding: '0.75rem 1.5rem',

          backgroundColor: '#2196f3',

          color: 'white',

          textDecoration: 'none',

          borderRadius: '8px',

          fontWeight: 'bold'

        }}>

          {t('login')}

        </Link>

      </div>



      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>

        <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>

          {t('appSubtitle')}

        </p>

        <p style={{ fontSize: '1.1rem', color: '#888' }}>

          {t('aboutText')}

        </p>

      </div>



      <div style={{

        display: 'grid',

        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',

        gap: '1.5rem',

        marginBottom: '3rem'

      }}>

        <Link href="/register" style={{ textDecoration: 'none' }}>

          <div style={{

            padding: '2rem',

            backgroundColor: 'white',

            border: '2px solid #e53935',

            borderRadius: '12px',

            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

            transition: 'transform 0.2s',

            cursor: 'pointer'

          }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>

            <h2 style={{ color: '#e53935', fontSize: '1.5rem', marginBottom: '0.5rem' }}>

              {t('feature1')}

            </h2>

            <p style={{ color: '#666' }}>

              {t('feature1Desc')}

            </p>

          </div>

        </Link>



        <Link href="/request" style={{ textDecoration: 'none' }}>

          <div style={{

            padding: '2rem',

            backgroundColor: 'white',

            border: '2px solid #ff9800',

            borderRadius: '12px',

            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

            transition: 'transform 0.2s',

            cursor: 'pointer'

          }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>

            <h2 style={{ color: '#ff9800', fontSize: '1.5rem', marginBottom: '0.5rem' }}>

              {t('feature2')}

            </h2>

            <p style={{ color: '#666' }}>

              {t('feature2Desc')}

            </p>

          </div>

        </Link>



        <Link href="/donors" style={{ textDecoration: 'none' }}>

          <div style={{

            padding: '2rem',

            backgroundColor: 'white',

            border: '2px solid #4caf50',

            borderRadius: '12px',

            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

            transition: 'transform 0.2s',

            cursor: 'pointer'

          }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>

            <h2 style={{ color: '#4caf50', fontSize: '1.5rem', marginBottom: '0.5rem' }}>

              {t('feature3')}

            </h2>

            <p style={{ color: '#666' }}>

              {t('feature3Desc')}

            </p>

          </div>

        </Link>



        <Link href="/eligibility" style={{ textDecoration: 'none' }}>

          <div style={{

            padding: '2rem',

            backgroundColor: 'white',

            border: '2px solid #2196f3',

            borderRadius: '12px',

            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

            transition: 'transform 0.2s',

            cursor: 'pointer'

          }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</div>

            <h2 style={{ color: '#2196f3', fontSize: '1.5rem', marginBottom: '0.5rem' }}>

              {t('feature4')}

            </h2>

            <p style={{ color: '#666' }}>

              {t('feature4Desc')}

            </p>

          </div>

        </Link>



        <Link href="/blog" style={{ textDecoration: 'none' }}>

          <div style={{

            padding: '2rem',

            backgroundColor: 'white',

            border: '2px solid #9c27b0',

            borderRadius: '12px',

            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

            transition: 'transform 0.2s',

            cursor: 'pointer'

          }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📰</div>

            <h2 style={{ color: '#9c27b0', fontSize: '1.5rem', marginBottom: '0.5rem' }}>

              {language === 'bn' ? 'ব্লগ এবং সংবাদ' : 'Blog & News'}

            </h2>

            <p style={{ color: '#666' }}>

              {language === 'bn' 

                ? 'সংস্থা এবং ক্লাব থেকে রক্তদান সংবাদ ও ইভেন্ট দেখুন' 

                : 'View blood donation news and events from organizations and clubs'}

            </p>

          </div>

        </Link>

        <Link href="/illustrations" style={{ textDecoration: 'none' }}>

          <div style={{

            padding: '2rem',

            backgroundColor: 'white',

            border: '2px solid #ff5722',

            borderRadius: '12px',

            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

            transition: 'transform 0.2s',

            cursor: 'pointer'

          }}>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20C35 20 25 35 25 50C25 65 35 80 50 80C65 80 75 65 75 50C75 35 65 20 50 20Z" fill="#DC143C"/>
                <path d="M50 30C42 30 36 38 36 50C36 62 42 70 50 70C58 70 64 62 64 50C64 38 58 30 50 30Z" fill="#FF6B6B"/>
                <path d="M50 40C46 40 44 44 44 50C44 56 46 60 50 60C54 60 56 56 56 50C56 44 54 40 50 40Z" fill="#FFB6C1"/>
                <circle cx="50" cy="50" r="5" fill="#8B0000"/>
                <path d="M50 20L50 35" stroke="#8B0000" strokeWidth="2"/>
                <path d="M50 65L50 80" stroke="#8B0000" strokeWidth="2"/>
                <path d="M25 50L40 50" stroke="#8B0000" strokeWidth="2"/>
                <path d="M60 50L75 50" stroke="#8B0000" strokeWidth="2"/>
                <path d="M32 32L43 43" stroke="#8B0000" strokeWidth="2"/>
                <path d="M57 57L68 68" stroke="#8B0000" strokeWidth="2"/>
                <path d="M68 32L57 43" stroke="#8B0000" strokeWidth="2"/>
                <path d="M43 57L32 68" stroke="#8B0000" strokeWidth="2"/>
              </svg>
            </div>

            <h2 style={{ color: '#ff5722', fontSize: '1.5rem', marginBottom: '0.5rem' }}>

              {language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon'}

            </h2>

            <p style={{ color: '#666' }}>

              {language === 'bn' 

                ? 'রক্তদান সচেতনতা বৃদ্ধির জন্য তৈরি চিত্রকল্প দেখুন' 

                : 'View illustrations raising blood donation awareness'}

            </p>

          </div>

        </Link>

      </div>



      <div style={{

        padding: '2rem',

        backgroundColor: '#f5f5f5',

        borderRadius: '12px',

        textAlign: 'center'

      }}>

        <h2 style={{ color: '#333', marginBottom: '1rem' }}>{t('about')}</h2>

        <p style={{ color: '#666', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>

          {t('aboutText')}

        </p>

      </div>



      <div style={{

        marginTop: '3rem',

        padding: '1.5rem',

        backgroundColor: '#e3f2fd',

        borderRadius: '8px',

        borderLeft: '4px solid #2196f3'

      }}>

        <h3 style={{ color: '#1565c0', marginBottom: '0.5rem' }}>📱 {t('features')}</h3>

        <p style={{ color: '#666', margin: 0 }}>

          {t('pwaText')}

        </p>

      </div>

    </main>

  );

}

