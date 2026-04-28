'use client';

import { useState } from 'react';

interface EmergencyActionsProps {
  language?: 'en' | 'bn';
}

export default function EmergencyActions({ language = 'en' }: EmergencyActionsProps) {
  const [showSOS, setShowSOS] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Emergency Actions', bn: 'জরুরি পদক্ষেপ' },
      sos: { en: 'SOS Blood Request', bn: 'এসওএস রক্তের অনুরোধ' },
      dial: { en: 'Call National Blood Bank', bn: 'জাতীয় রক্ত ব্যাংকে কল করুন' },
      share: { en: 'Share on Social Media', bn: 'সোশ্যাল মিডিয়ায় শেয়ার করুন' },
      sosConfirm: { en: 'Create Emergency Blood Request', bn: 'জরুরি রক্তের অনুরোধ তৈরি করুন' },
      sosDesc: { en: 'This will create an urgent blood request and notify nearby donors', bn: 'এটি একটি জরুরি রক্তের অনুরোধ তৈরি করবে এবং কাছাকাছি দাতাদের অবহিত করবে' },
      cancel: { en: 'Cancel', bn: 'বাতিল' },
      confirm: { en: 'Confirm', bn: 'নিশ্চিত করুন' },
      bloodBankNumber: { en: '16263', bn: '১৬২৬৩' },
      bloodBankName: { en: 'National Blood Bank', bn: 'জাতীয় রক্ত ব্যাংক' },
      shareText: { en: 'Need blood urgently! Use RoktoKorobi to find donors nearby', bn: 'জরুরি রক্ত প্রয়োজন! কাছাকাছি দাতা খুঁজতে রক্তকরবী ব্যবহার করুন' },
    };
    return translations[key]?.[language] || key;
  };

  const handleSOS = () => {
    setShowSOS(true);
  };

  const handleDialBloodBank = () => {
    window.location.href = 'tel:16263';
  };

  const handleShare = () => {
    const shareText = t('shareText');
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'RoktoKorobi - Blood Donation Platform',
        text: shareText,
        url: shareUrl
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleConfirmSOS = () => {
    // Redirect to request page with urgency set to critical
    window.location.href = '/request?urgency=critical';
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* SOS Button */}
        <button
          onClick={handleSOS}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#E53935',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(229, 57, 53, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title={t('sos')}
        >
          🆘
        </button>

        {/* Quick Dial Button */}
        <button
          onClick={handleDialBloodBank}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title={t('dial')}
        >
          📞
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title={t('share')}
        >
          📤
        </button>
      </div>

      {/* SOS Confirmation Modal */}
      {showSOS && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🆘</div>
            <h2 style={{ color: '#E53935', marginBottom: '1rem' }}>{t('sosConfirm')}</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{t('sosDesc')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSOS(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmSOS}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#E53935',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
