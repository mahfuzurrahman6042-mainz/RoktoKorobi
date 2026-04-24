'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useEffect, useState } from 'react';
import OfflineMap from '@/components/OfflineMap';

export default function Home() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    registered_donors: 0,
    blood_requests_fulfilled: 0,
    partner_organizations: 0
  });

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));

    // Fade-in animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav>
        <Link href="/" className="nav-logo">
          <span className="drop">🩸</span>
          {t('appTitle')}
        </Link>
        <ul className="nav-links">
          <li><Link href="/">{t('home')}</Link></li>
          <li><Link href="/donors">{t('donors')}</Link></li>
          <li><Link href="/request">{t('request')}</Link></li>
          <li><Link href="/eligibility">{t('eligibility')}</Link></li>
          <li><Link href="/blog">{t('blog')}</Link></li>
          <li><Link href="/illustrations">{t('chitrokothon')}</Link></li>
          <li><Link href="/login" className="nav-cta">{t('login')}</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero fade-in">
        <div className="hero-tag">
          <span className="pulse"></span>
          {t('heroTag')}
        </div>
        <h1 dangerouslySetInnerHTML={{ __html: t('heroTitle') }} />
        <p className="hero-sub">{t('heroSubtitle')}</p>
        <div className="hero-actions">
          <Link href="/register" className="btn-primary">
            {t('heroBtnRegister')} →
          </Link>
          <Link href="/request" className="btn-secondary">
            {t('heroBtnRequest')}
          </Link>
        </div>
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num">{stats.registered_donors}</div>
            <div className="stat-label">{t('statDonorsLabel')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.blood_requests_fulfilled}</div>
            <div className="stat-label">{t('statRequestsLabel')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.partner_organizations}</div>
            <div className="stat-label">{t('statPartnersLabel')}</div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* How It Works */}
      <section className="fade-in">
        <div className="section-eyebrow">{t('howItWorks')}</div>
        <h2 className="section-title">{t('howItWorksSub')}</h2>
        <p className="section-sub">{t('howItWorksSub')}</p>
        <div className="cards-grid">
          <div className="card">
            <div className="card-icon icon-red">📝</div>
            <h3>{t('step1Title')}</h3>
            <p>{t('step1Desc')}</p>
            <Link href="/register" className="card-link link-red">
              {t('step1Link')} →
            </Link>
          </div>
          <div className="card">
            <div className="card-icon icon-blue">🔍</div>
            <h3>{t('step2Title')}</h3>
            <p>{t('step2Desc')}</p>
            <Link href="/donors" className="card-link link-blue">
              {t('step2Link')} →
            </Link>
          </div>
          <div className="card">
            <div className="card-icon icon-green">🚨</div>
            <h3>{t('step3Title')}</h3>
            <p>{t('step3Desc')}</p>
            <Link href="/request" className="card-link link-green">
              {t('step3Link')} →
            </Link>
          </div>
          <div className="card">
            <div className="card-icon icon-purple">🗺️</div>
            <h3>Find Your Way</h3>
            <p>Navigate to donation centers or track donors with live GPS sharing</p>
            <Link href="/navigation" className="card-link link-purple">
              Explore Map →
            </Link>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Map Section */}
      <section className="fade-in">
        <div className="section-eyebrow">Location Map</div>
        <h2 className="section-title">Find Donors & Hospitals Near You</h2>
        <p className="section-sub">View real-time locations of blood donors and hospitals across Bangladesh</p>
        <div className="card" style={{ padding: '20px' }}>
          <OfflineMap
            center={[23.6850, 90.3563]}
            zoom={7}
            height="500px"
            showUserLocation={true}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🩸</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Blood Donors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏥</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Hospitals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Your Location</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <Link href="/donors" className="btn-primary" style={{ display: 'inline-block' }}>
              View All Donors on Map →
            </Link>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Emergency Banner */}
      <section className="fade-in">
        <div className="emergency-banner">
          <div className="badge">⚡ {t('emergencyBadge')}</div>
          <h2>{t('emergencyTitle')}</h2>
          <p>{t('emergencyDesc')}</p>
          <Link href="/request" className="btn-primary">
            {t('emergencyBtn')}
          </Link>
        </div>
      </section>

      <div className="divider"></div>

      {/* Blogs */}
      <section className="fade-in">
        <div className="section-eyebrow">{t('blogs')}</div>
        <h2 className="section-title">{t('blogsSub')}</h2>
        <p className="section-sub">{t('blogsSub')}</p>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📰</div>
          <h3 style={{ marginBottom: '8px' }}>No blogs yet</h3>
          <p style={{ color: 'var(--gray-500)' }}>Stay tuned! The super admin will post news and updates soon.</p>
        </div>
      </section>

      {/* Chitrokothon */}
      <section className="chitrokothon fade-in">
        <div className="section-eyebrow">{t('chitrokothon')}</div>
        <h2 className="section-title">{t('chitrokothonSub')}</h2>
        <p className="section-sub">{t('chitrokothonSub')}</p>
        <div className="chitra-grid">
          <Link href="/illustrations" className="chitra-card">
            <div className="chitra-thumb chitra-thumb-1">
              <span className="chitra-thumb-icon">🎨</span>
            </div>
            <div className="chitra-body">
              <h3>{t('chitra1Title')}</h3>
              <p>{t('chitra1Desc')}</p>
            </div>
          </Link>
          <Link href="/illustrations" className="chitra-card">
            <div className="chitra-thumb chitra-thumb-2">
              <span className="chitra-thumb-icon">✏️</span>
            </div>
            <div className="chitra-body">
              <h3>{t('chitra2Title')}</h3>
              <p>{t('chitra2Desc')}</p>
            </div>
          </Link>
          <Link href="/illustrations" className="chitra-card">
            <div className="chitra-thumb chitra-thumb-3">
              <span className="chitra-illustration">🤝</span>
              <span className="ep-badge">{t('chitra3Ep')}</span>
            </div>
            <div className="chitra-body">
              <div className="step-num">{t('chitra3Ep')}</div>
              <h3>{t('chitra3Title')}</h3>
              <p>{t('chitra3Desc')}</p>
              <span className="chitra-link">View →</span>
            </div>
          </Link>
          <Link href="/illustrations" className="chitra-card">
            <div className="chitra-thumb chitra-thumb-4">
              <span className="chitra-illustration">🚀</span>
              <span className="ep-badge">{t('chitra4Ep')}</span>
            </div>
            <div className="chitra-body">
              <div className="step-num">{t('chitra4Ep')}</div>
              <h3>{t('chitra4Title')}</h3>
              <p>{t('chitra4Desc')}</p>
              <span className="chitra-link">View →</span>
            </div>
          </Link>
        </div>
        <div className="chitra-view-all">
          <Link href="/illustrations" className="btn-outline-warm">
            {t('chitraViewAll')}
          </Link>
        </div>
      </section>

      {/* Eligibility */}
      <section className="eligibility-section fade-in">
        <div className="eligibility-inner">
          <div className="section-eyebrow">{t('eligibility')}</div>
          <h2 className="section-title">{t('eligibilityTitle')}</h2>
          <p className="section-sub">{t('eligibilityDesc')}</p>
          <Link href="/eligibility" className="btn-primary">
            {t('eligibilityBtn')}
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section fade-in">
        <div className="section-eyebrow">{t('testimonials')}</div>
        <h2 className="section-title">{t('testimonials')}</h2>
        <p className="section-sub">{t('testimonials')}</p>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
          <h3 style={{ marginBottom: '8px' }}>No testimonials yet</h3>
          <p style={{ color: 'var(--gray-500)' }}>Be the first to share your experience with RoktoKorobi!</p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-brand">
          <span>🩸</span>
          <span>{t('appTitle')}</span>
        </div>
        <p className="footer-tagline">{t('footerTagline')}</p>
        <div className="footer-grid">
          <div className="footer-col">
            <h4>{t('footerQuickLinks')}</h4>
            <Link href="/">{t('footerAbout')}</Link>
            <Link href="/">{t('footerContact')}</Link>
            <Link href="/">{t('footerPrivacy')}</Link>
            <Link href="/">{t('footerTerms')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('footerResources')}</h4>
            <Link href="/">{t('footerSupport')}</Link>
            <Link href="/">{t('footerFAQ')}</Link>
            <Link href="/blog">{t('footerBlog')}</Link>
            <Link href="/">{t('footerAbout')}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © 2024 {t('appTitle')}. {t('footerRights')}
        </div>
      </footer>
    </>
  );
}

