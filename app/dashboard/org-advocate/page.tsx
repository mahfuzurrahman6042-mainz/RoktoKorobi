'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function OrgAdvocateDashboard() {
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'org_advocate') {
      router.push('/');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#9c27b0', fontSize: '2rem' }}>🏢 {t('orgAdvocateDashboard')}</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {t('logout')}
        </button>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f3e5f5',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #9c27b0'
      }}>
        <h2 style={{ marginBottom: '0.5rem' }}>{t('dashboard')}</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
          As an Organizational Advocate, you represent partner organizations and help coordinate 
          blood donation campaigns. You can view donor statistics and manage organizational requests.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Statistics</h3>
          <p style={{ color: '#666' }}>View donor and blood request statistics for your region</p>
        </div>

        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Campaigns</h3>
          <p style={{ color: '#666' }}>Create and manage blood donation campaigns</p>
        </div>

        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Partnerships</h3>
          <p style={{ color: '#666' }}>Manage partnerships with hospitals and blood banks</p>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        borderLeft: '4px solid #ff9800'
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          <strong>Note:</strong> Additional features for organizational advocates will be added soon.
        </p>
      </div>
    </div>
  );
}
