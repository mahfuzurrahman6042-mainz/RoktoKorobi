'use client';

import { useState, useEffect } from 'react';

interface EmergencyActionsProps {
  language?: 'en' | 'bn';
}

export default function EmergencyActions({ language = 'en' }: EmergencyActionsProps) {
  const [showSOS, setShowSOS] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      sos: { en: 'SOS Blood Request', bn: 'এসওএস রক্তের অনুরোধ' },
      share: { en: 'Share RoktoKorobi', bn: 'রক্তকরবী শেয়ার করুন' },
      sosConfirm: { en: 'Create Emergency Blood Request', bn: 'জরুরি রক্তের অনুরোধ তৈরি করুন' },
      sosDesc: { en: 'This will create an urgent blood request and notify nearby donors', bn: 'এটি একটি জরুরি রক্তের অনুরোধ তৈরি করবে এবং কাছাকাছি দাতাদের অবহিত করবে' },
      cancel: { en: 'Cancel', bn: 'বাতিল' },
      confirm: { en: 'Confirm', bn: 'নিশ্চিত করুন' },
      emergencyLabel: { en: 'EMERGENCY', bn: 'জরুরি' },
      shareLabel: { en: 'SHARE', bn: 'শেয়ার' },
      shareTitle: { en: 'SHARE ROKTOKOROBI', bn: 'রক্তকরবী শেয়ার করুন' },
      shareSub: { en: 'Help someone find a donor today', bn: 'আজ কাউকে দাতা খুঁজতে সাহায্য করুন' },
      copy: { en: 'COPY', bn: 'কপি' },
      copied: { en: '✓ DONE', bn: '✓ হয়েছে' },
      facebook: { en: 'Facebook', bn: 'ফেসবুক' },
      whatsapp: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
      twitter: { en: 'X (Twitter)', bn: 'এক্স (টুইটার)' },
      linkedin: { en: 'LinkedIn', bn: 'লিংকডইন' },
    };
    return translations[key]?.[language] || key;
  };

  const handleSOS = () => {
    setShowSOS(true);
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleConfirmSOS = () => {
    window.location.href = '/request?urgency=critical';
  };

  const closeShare = () => {
    setShowShare(false);
    setCopied(false);
  };

  const closeShareOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeShare();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = language === 'bn' 
      ? 'জরুরি রক্ত প্রয়োজন! কাছাকাছি দাতা খুঁজতে রক্তকরবী ব্যবহার করুন:'
      : 'Need blood urgently! Use RoktoKorobi to find donors nearby:';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.origin)}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = language === 'bn'
      ? 'জরুরি রক্ত প্রয়োজন! কাছাকাছি দাতা খুঁজতে রক্তকরবী ব্যবহার করুন:'
      : 'Need blood urgently! Use RoktoKorobi to find donors nearby:';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`, '_blank');
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowShare(false);
        setShowSOS(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Buttons Container */}
      <div className="emergency-actions-container">
        {/* Emergency Button */}
        <div className="btn-wrapper">
          <button className="emergency-btn" onClick={handleSOS} aria-label={t('sos')}>
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="core">
              <svg className="phone-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
              <span className="label">{t('emergencyLabel')}</span>
            </div>
          </button>
        </div>

        {/* Share Button */}
        <div className="btn-wrapper">
          <button className="share-btn" onClick={handleShare} aria-label={t('share')}>
            <div className="orbit"></div>
            <div className="core">
              <svg className="share-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span className="label">{t('shareLabel')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="sos-modal" onClick={() => setShowSOS(false)}>
          <div className="modal-card sos-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSOS(false)}>×</button>
            <div className="sos-icon">🆘</div>
            <h2 className="sos-title">{t('sosConfirm')}</h2>
            <p className="sos-desc">{t('sosDesc')}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSOS(false)}>{t('cancel')}</button>
              <button className="btn-confirm" onClick={handleConfirmSOS}>{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className={`share-modal ${showShare ? 'open' : ''}`} onClick={closeShareOutside}>
          <div className="modal-card share-card">
            <button className="modal-close" onClick={closeShare}>×</button>
            <div className="modal-title">{t('shareTitle')}</div>
            <div className="modal-sub">{t('shareSub')}</div>

            <div className="social-grid">
              <button className="social-pill" onClick={shareToFacebook}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t('facebook')}
              </button>
              <button className="social-pill" onClick={shareToWhatsApp}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('whatsapp')}
              </button>
              <button className="social-pill" onClick={shareToTwitter}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                {t('twitter')}
              </button>
              <button className="social-pill" onClick={shareToLinkedIn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                {t('linkedin')}
              </button>
            </div>

            <div className="copy-row">
              <input className="copy-input" value={typeof window !== 'undefined' ? window.location.origin : ''} readOnly />
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyLink}>
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .emergency-actions-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        .btn-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        /* Emergency Button */
        .emergency-btn {
          position: relative;
          width: 72px;
          height: 72px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          background: none;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          padding: 0;
        }

        .emergency-btn .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(220, 38, 38, 0.4);
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .emergency-btn .ring:nth-child(2) { animation-delay: 0.4s; inset: -6px; border-color: rgba(220,38,38,0.25); }
        .emergency-btn .ring:nth-child(3) { animation-delay: 0.8s; inset: -12px; border-color: rgba(220,38,38,0.12); }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .emergency-btn .core {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: radial-gradient(circle at 35% 30%, #ff3b3b, #b91c1c 60%, #7f1d1d);
          box-shadow:
            0 0 0 1px rgba(255,80,80,0.3),
            0 8px 32px rgba(185,28,28,0.7),
            0 2px 8px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,160,160,0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .emergency-btn:hover .core {
          transform: scale(1.05);
          box-shadow:
            0 0 0 1px rgba(255,80,80,0.5),
            0 12px 48px rgba(185,28,28,0.9),
            0 4px 12px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,160,160,0.4);
        }

        .emergency-btn:active .core {
          transform: scale(0.96);
        }

        .emergency-btn .core::before {
          content: '';
          position: absolute;
          top: 12%;
          left: 20%;
          width: 60%;
          height: 35%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.18), transparent);
          border-radius: 50%;
          filter: blur(4px);
        }

        .emergency-btn .phone-icon {
          width: 26px;
          height: 26px;
          fill: #fff;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .emergency-btn .label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.92);
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }

        /* Share Button */
        .share-btn {
          position: relative;
          width: 72px;
          height: 72px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          background: none;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          padding: 0;
        }

        .share-btn .orbit {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1.5px dashed rgba(34, 197, 94, 0.35);
          animation: orbit-spin 8s linear infinite;
        }

        .share-btn .orbit::after {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.5);
          transform: translateX(-50%);
        }

        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .share-btn .core {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: radial-gradient(circle at 35% 30%, #4ade80, #16a34a 60%, #14532d);
          box-shadow:
            0 0 0 1px rgba(74,222,128,0.3),
            0 8px 32px rgba(22,163,74,0.6),
            0 2px 8px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(167,243,208,0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .share-btn:hover .core {
          transform: scale(1.05);
          box-shadow:
            0 0 0 1px rgba(74,222,128,0.5),
            0 12px 48px rgba(22,163,74,0.8),
            0 4px 12px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(167,243,208,0.4);
        }

        .share-btn:hover .orbit {
          animation-duration: 3s;
          border-color: rgba(74, 222, 128, 0.6);
        }

        .share-btn:active .core {
          transform: scale(0.96);
        }

        .share-btn .core::before {
          content: '';
          position: absolute;
          top: 12%;
          left: 20%;
          width: 60%;
          height: 35%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.18), transparent);
          border-radius: 50%;
          filter: blur(4px);
        }

        .share-btn .share-icon {
          width: 26px;
          height: 26px;
          fill: #fff;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .share-btn:hover .share-icon {
          transform: translateY(-2px) scale(1.1);
        }

        .share-btn .label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.92);
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }

        /* Modals */
        .sos-modal, .share-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .share-modal.open, .sos-modal {
          opacity: 1;
          pointer-events: auto;
        }

        .modal-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 32px;
          width: min(360px, 90vw);
          box-shadow: 0 32px 64px rgba(0,0,0,0.8);
          animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        @keyframes modal-in {
          from { transform: scale(0.85) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.16); }

        /* SOS Modal Specific */
        .sos-card {
          text-align: center;
          padding: 40px 32px;
        }

        .sos-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .sos-title {
          color: #E53935;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .sos-desc {
          color: #999;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-cancel, .btn-confirm {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.2); }

        .btn-confirm {
          background: #E53935;
          color: #fff;
        }
        .btn-confirm:hover { background: #ff5252; }

        /* Share Modal Specific */
        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #fff;
          margin-bottom: 6px;
        }

        .modal-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 24px;
        }

        .social-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .social-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 0.2s;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          border: none;
        }

        .social-pill:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .copy-row {
          display: flex;
          gap: 8px;
        }

        .copy-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          padding: 12px 14px;
          outline: none;
          font-family: monospace;
        }

        .copy-btn {
          padding: 12px 18px;
          background: #4ade80;
          border: none;
          border-radius: 10px;
          color: #000;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
          min-width: 70px;
        }

        .copy-btn:hover { background: #86efac; }
        .copy-btn.copied { background: #fff; }
      `}</style>
    </>
  );
}
