'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OfflineMap from '@/components/OfflineMap';
import UrgentBloodRequests from '@/components/UrgentBloodRequests';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '32px' }}>Loading map...</div>
});

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [stats, setStats] = useState({
    registered_donors: 0,
    blood_requests_fulfilled: 0,
    partner_organizations: 0
  });
  const [navSolid, setNavSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [area, setArea] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [eligAge, setEligAge] = useState('');
  const [eligWeight, setEligWeight] = useState('');
  const [eligHealth, setEligHealth] = useState('');
  const [eligResult, setEligResult] = useState<{ eligible: boolean; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const handleBloodTypeSelect = (type: string) => {
    setSelectedBloodType(type);
  };

  const handleEligibilityCheck = () => {
    const ageNum = parseInt(eligAge);
    const weightNum = parseFloat(eligWeight);

    if (!eligAge || !eligWeight || !eligHealth) {
      setEligResult({ eligible: false, message: language === 'bn' ? 'সব ক্ষেত্র পূরণ করুন' : 'Please fill in all fields' });
      return;
    }

    if (isNaN(ageNum) || isNaN(weightNum)) {
      setEligResult({ eligible: false, message: language === 'bn' ? 'সঠিক সংখ্যা দিন' : 'Please enter valid numbers' });
      return;
    }

    if (ageNum < 18 || ageNum > 65) {
      setEligResult({ eligible: false, message: language === 'bn' ? 'বয়স ১৮-৬৫ বছরের মধ্যে হতে হবে' : 'Age must be between 18 and 65' });
      return;
    }

    if (weightNum < 50) {
      setEligResult({ eligible: false, message: language === 'bn' ? 'ওজন কমপক্ষে ৫০ কেজি হতে হবে' : 'Weight must be at least 50 kg' });
      return;
    }

    if (eligHealth !== 'healthy') {
      setEligResult({ eligible: false, message: language === 'bn' ? 'সুস্থ থাকতে হবে' : 'Must be in good health' });
      return;
    }

    setEligResult({ eligible: true, message: language === 'bn' ? 'আপনি যোগ্য!' : 'You are eligible!' });
  };

  const handleSearch = () => {
    if (!selectedBloodType) {
      alert(language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন' : 'Please select a blood type');
      return;
    }
    
    const params = new URLSearchParams();
    if (selectedBloodType) params.append('bloodGroup', selectedBloodType);
    if (selectedDistrict) params.append('location', selectedDistrict);
    if (area) params.append('area', area);
    
    window.location.href = `/donors?${params.toString()}`;
  };

  const t = (key: string) => {
    const translations: Record<string, any> = {
      home: { en: 'Home', bn: 'হোম' },
      donors: { en: 'Donors', bn: 'রক্তদাতা' },
      request: { en: 'Request Blood', bn: 'রক্তের প্রয়োজন' },
      eligibilityLink: { en: 'Eligibility', bn: 'যোগ্যতা' },
      blog: { en: 'Blog', bn: 'ব্লগ' },
      chitrokothon: { en: 'Chitrokothon', bn: 'চিত্রকথন' },
      login: { en: 'Log In', bn: 'লগ ইন' },
      register: { en: 'Register', bn: 'রেজিস্টার' },
      nav: {
        home: { en: 'Home', bn: 'হোম' },
        donors: { en: 'Donors', bn: 'রক্তদাতা' },
        request: { en: 'Request Blood', bn: 'রক্তের প্রয়োজন' },
        blog: { en: 'Blog', bn: 'ব্লগ' },
        illustrations: { en: 'Chitrokothon', bn: 'চিত্রকথন' },
        about: { en: 'About', bn: 'সম্পর্কে' },
        login: { en: 'Log In', bn: 'লগ ইন' },
        register: { en: 'Register', bn: 'রেজিস্টার' },
      },
      hero: {
        title: { en: 'Every Drop Counts', bn: 'প্রতিটি ফোঁটা গুরুত্বপূর্ণ' },
        subtitle: { en: 'Connect with blood donors in your area and save lives', bn: 'আপনার এলাকার রক্তদাতাদের সাথে সংযুক্ত হন এবং জীবন বাঁচান' },
        cta: { en: 'Find A Donor', bn: 'রক্তদাতা খুঁজুন' },
        cta2: { en: 'Become A Donor', bn: 'রক্তদাতা হন' },
      },
      ticker: {
        title: { en: 'Features', bn: 'বৈশিষ্ট্যসমূহ' },
        item1: { en: 'Real-time donor matching', bn: 'রিয়েল-টাইম রক্তদাতা মিলান' },
        item2: { en: 'Emergency blood requests', bn: 'জরুরি রক্তের প্রয়োজন' },
        item3: { en: 'Location-based search', bn: 'অবস্থান ভিত্তিক অনুসন্ধান' },
        item4: { en: 'Secure & verified donors', bn: 'নিরাপদ ও যাচাইকৃত রক্তদাতা' },
      },
      howItWorks: {
        title: { en: 'How It Works', bn: 'কিভাবে কাজ করে' },
        step1: { en: 'Register', bn: 'রেজিস্টার করুন' },
        step1Desc: { en: 'Create your profile as a donor or recipient', bn: 'রক্তদাতা বা প্রাপক হিসেবে আপনার প্রোফাইল তৈরি করুন' },
        step2: { en: 'Search', bn: 'অনুসন্ধান করুন' },
        step2Desc: { en: 'Find donors by blood type and location', bn: 'রক্তের গ্রুপ এবং অবস্থান অনুযায়ী রক্তদাতা খুঁজুন' },
        step3: { en: 'Connect', bn: 'সংযোগ করুন' },
        step3Desc: { en: 'Contact donors and save lives', bn: 'রক্তদাতাদের সাথে যোগাযোগ করুন এবং জীবন বাঁচান' },
      },
      donorSearch: {
        title: { en: 'Find a Blood Donor', bn: 'রক্তদাতা খুঁজুন' },
        subtitle: { en: 'Search by blood type and location', bn: 'রক্তের গ্রুপ এবং অবস্থান অনুযায়ী অনুসন্ধান করুন' },
        bloodType: { en: 'Blood Type', bn: 'রক্তের গ্রুপ' },
        location: { en: 'Location', bn: 'অবস্থান' },
        search: { en: 'Search', bn: 'অনুসন্ধান' },
        noDonors: { en: 'No donors found', bn: 'কোন রক্তদাতা পাওয়া যায়নি' },
      },
      eligibility: {
        title: { en: 'Eligibility Criteria', bn: 'যোগ্যতার মানদণ্ড' },
        item1: { en: 'Age 18-65 years', bn: 'বয়স ১৮-৬৫ বছর' },
        item2: { en: 'Weight 50kg or more', bn: 'ওজন ৫০ কেজি বা তার বেশি' },
        item3: { en: 'No recent tattoos or piercings', bn: 'সাম্প্রতিক ট্যাটু বা পিয়ার্সিং নেই' },
        item4: { en: 'Good general health', bn: 'সুস্থ সাধারণ স্বাস্থ্য' },
        check: { en: 'Check Your Eligibility', bn: 'আপনার যোগ্যতা যাচাই করুন' },
      },
      registerCTA: {
        title: { en: 'Ready to Save Lives?', bn: 'জীবন বাঁচাতে প্রস্তুত?' },
        subtitle: { en: 'Join our community of blood donors today', bn: 'আজই আমাদের রক্তদাতা সম্প্রদায়ে যোগ দিন' },
        cta: { en: 'Register Now', bn: 'এখনই রেজিস্টার করুন' },
      },
      footer: {
        about: { en: 'About RoktoKorobi', bn: 'রক্তকরবী সম্পর্কে' },
        aboutDesc: { en: 'Connecting blood donors with those in need across Bangladesh', bn: 'বাংলাদেশ জুড়ে রক্তদাতাদের প্রয়োজনবানদের সাথে সংযুক্ত করা' },
        quickLinks: { en: 'Quick Links', bn: 'দ্রুত লিঙ্ক' },
        contact: { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
        rights: { en: 'All rights reserved', bn: 'সর্বস্বত্ব সংরক্ষিত' },
      },
    };

    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    if (typeof value === 'object' && language in value) {
      return value[language];
    }
    return key;
  };

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));

    // Nav scroll effect
    const handleScroll = () => {
      setNavSolid(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav role="navigation" aria-label="Main navigation" className={navSolid ? 'solid' : ''}>
        <Link href="/" className="nav-logo" aria-label="RoktoKorobi - Home">
          <span className="nav-logo-icon" aria-hidden="true">???</span>
          <div>
            <span className="nav-logo-text">????????</span>
            <span className="nav-logo-sub">RoktoKorobi</span>
          </div>
        </Link>
        <ul className="nav-links" role="menubar">
          <li role="none"><Link href="/" role="menuitem" aria-label={t('home')}>{t('home')}</Link></li>
          <li role="none"><Link href="/donors" role="menuitem" aria-label={t('donors')}>{t('donors')}</Link></li>
          <li role="none"><Link href="/request" role="menuitem" aria-label={t('request')}>{t('request')}</Link></li>
          <li role="none"><Link href="/eligibility" role="menuitem" aria-label={t('eligibilityLink')}>{t('eligibilityLink')}</Link></li>
          <li role="none"><Link href="/blog" role="menuitem" aria-label={t('blog')}>{t('blog')}</Link></li>
          <li role="none"><Link href="/illustrations" role="menuitem" aria-label={t('chitrokothon')}>{t('chitrokothon')}</Link></li>
          <li role="none"><Link href="/login" className="nav-cta" role="menuitem" aria-label={t('login')}>{t('login')}</Link></li>
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
      </nav>

      {/* Mobile Menu */}
      <div id="mobile-menu" className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile navigation">
        <Link href="/" onClick={() => setMobileOpen(false)} aria-label={t('home')}>{t('home')}</Link>
        <Link href="/donors" onClick={() => setMobileOpen(false)} aria-label={t('donors')}>{t('donors')}</Link>
        <Link href="/request" onClick={() => setMobileOpen(false)} aria-label={t('request')}>{t('request')}</Link>
        <Link href="/eligibility" onClick={() => setMobileOpen(false)} aria-label={t('eligibilityLink')}>{t('eligibilityLink')}</Link>
        <Link href="/blog" onClick={() => setMobileOpen(false)} aria-label={t('blog')}>{t('blog')}</Link>
        <Link href="/illustrations" onClick={() => setMobileOpen(false)} aria-label={t('chitrokothon')}>{t('chitrokothon')}</Link>
        <Link href="/login" className="mm-cta" onClick={() => setMobileOpen(false)} aria-label={t('login')}>{t('login')}</Link>
      </div>

      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-texture"></div>
        <div className="hero-grid-overlay"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-12 lg:py-20">
            
            <div className="hero-left space-y-6 lg:space-y-8">
              <div className="hero-cta-card reveal">
                <div className="hero-cta-badge">
                  <span className="pb-dot"></span>
                  Live Now
                </div>
                <h2 className="hero-cta-title">
                  {language === 'bn' ? 'রক্ত দিন, জীবন বাঁচান' : 'Donate Blood, Save Lives'}
                  <span className="hero-cta-red">{language === 'bn' ? 'আজই' : 'Today'}</span>
                </h2>
                <p className="hero-cta-desc">
                  {language === 'bn' 
                    ? 'বাংলাদেশের বৃহত্তম রক্তদাতা নেটওয়ার্কে যোগ দিন এবং জরুরি মুহূর্তে জীবন বাঁচাতে সাহায্য করুন।'
                    : 'Join Bangladesh\'s largest blood donor network and help save lives in critical moments.'}
                </p>
                <div className="hero-cta-btns flex flex-col sm:flex-row gap-3">
                  <Link href="/register" className="hero-cta-btn-p">
                    {language === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন করুন' : 'Register as Donor'}
                  </Link>
                  <Link href="/request" className="hero-cta-btn-s">
                    {language === 'bn' ? 'রক্তের প্রয়োজন?' : 'Need Blood?'}
                  </Link>
                </div>
              </div>

              <div className="hero-eyebrow reveal delay-1">
                <div className="eyebrow-line"></div>
                <span className="eyebrow-text">{language === 'bn' ? 'আমাদের মিশন' : 'Our Mission'}</span>
              </div>
              <h1 id="hero-title" className="hero-title reveal delay-1">
                {language === 'bn' ? 'প্রতিটি ফোঁটা' : 'Every Drop'}
                <span className="hero-title-accent">{language === 'bn' ? 'রক্ত' : 'Matters'}</span>
                <span className="hero-title-outline">{language === 'bn' ? 'জীবন' : 'Lives'}</span>
              </h1>
              <p className="hero-subtitle reveal delay-2">
                {language === 'bn' ? 'সংযোগ স্থাপন করুন, জীবন বাঁচান' : 'Connecting donors, saving lives'}
              </p>
              <p className="hero-desc reveal delay-2">
                {language === 'bn'
                  ? 'রক্তকরবী হল একটি ডিজিটাল প্ল্যাটফর্ম যা রক্তদাতাদের সাথে রক্তের প্রয়োজনে থাকা মানুষদের সংযোগ করে। আমাদের লক্ষ্য হল বাংলাদেশে রক্তের সংকট কমানো এবং প্রতিটি জরুরি পরিস্থিতিতে সহায়তা প্রদান করা।'
                  : 'RoktoKorobi is a digital platform connecting blood donors with those in need. Our mission is to reduce blood shortages in Bangladesh and provide assistance in every emergency.'}
              </p>
              <div className="hero-btns reveal delay-3 flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-blood">
                  {language === 'bn' ? 'রক্তদাতা হন' : 'Become a Donor'}
                  <span>→</span>
                </Link>
                <Link href="/donors" className="btn-ghost">
                  {language === 'bn' ? 'দাতা খুঁজুন' : 'Find Donors'}
                  <span>→</span>
                </Link>
              </div>
              <div className="hero-stats reveal delay-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="hstat text-center">
                  <span className="hstat-num">{stats.registered_donors}</span>
                  <span className="hstat-label">{language === 'bn' ? 'নিবন্ধিত দাতা' : 'Registered Donors'}</span>
                </div>
                <div className="hstat text-center">
                  <span className="hstat-num">{stats.blood_requests_fulfilled}</span>
                  <span className="hstat-label">{language === 'bn' ? 'পূর্ণ অনুরোধ' : 'Requests Fulfilled'}</span>
                </div>
                <div className="hstat text-center">
                  <span className="hstat-num">{stats.partner_organizations}</span>
                  <span className="hstat-label">{language === 'bn' ? 'অংশীদার সংস্থা' : 'Partner Orgs'}</span>
                </div>
              </div>
            </div>

            <div className="hero-right hidden lg:block">
              <div className="poster-frame">
                <div className="poster-ring"></div>
                <div className="poster-ring"></div>
                <div className="poster-ring"></div>
                <div className="poster-svg-wrap">
                  <svg width="320" height="380" viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="380" rx="20" fill="#FDFAF4"/>
                    <path d="M160 60C115.817 60 80 95.817 80 140c0 44.183 35.817 80 80 80s80-35.817 80-80C240 95.817 204.183 60 160 60zm0 140c-33.137 0-60-26.863-60-60s26.863-60 60-60 60 26.863 60 60-26.863 60-60 60z" fill="#C0152A" opacity="0.1"/>
                    <path d="M160 100c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40S182.091 100 160 100zm0 60c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z" fill="#C0152A" opacity="0.2"/>
                    <circle cx="160" cy="140" r="12" fill="#C0152A"/>
                    <path d="M100 260h120c8.837 0 16-7.163 16-16v-8c0-8.837-7.163-16-16-16H100c-8.837 0-16 7.163-16 16v8c0 8.837 7.163 16 16 16z" fill="#1B5E6B" opacity="0.1"/>
                    <path d="M120 300h80c8.837 0 16-7.163 16-16v-4c0-8.837-7.163-16-16-16h-80c-8.837 0-16 7.163-16 16v4c0 8.837 7.163 16 16 16z" fill="#C8922A" opacity="0.1"/>
                  </svg>
                </div>
                <div className="fcard">
                  <div className="fcard-icon r">🩸</div>
                  <div>
                    <span className="fcard-title">{language === 'bn' ? 'জরুরি' : 'Emergency'}</span>
                    <span className="fcard-sub">{language === 'bn' ? '24/7 সহায়তা' : '24/7 Support'}</span>
                  </div>
                </div>
                <div className="fcard">
                  <div className="fcard-icon t">📍</div>
                  <div>
                    <span className="fcard-title">{language === 'bn' ? 'লাইভ ম্যাপ' : 'Live Map'}</span>
                    <span className="fcard-sub">{language === 'bn' ? 'GPS ট্র্যাকিং' : 'GPS Tracking'}</span>
                  </div>
                </div>
                <div className="fcard">
                  <div className="fcard-icon g">✓</div>
                  <div>
                    <span className="fcard-title">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
                    <span className="fcard-sub">{language === 'bn' ? 'সকল দাতা' : 'All Donors'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Strip */}
      <div className="ticker">
        <div className="ticker-track">
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'বিনামূল্যে রক্তদান' : 'Free Blood Donation'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'জরুরি সেবা' : 'Emergency Service'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'লাইভ ম্যাপ' : 'Live Map'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'GPS ট্র্যাকিং' : 'GPS Tracking'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? '24/7 সহায়তা' : '24/7 Support'}</div>
          <div className="ticker-item gold"><span className="ticker-dot"></span>{language === 'bn' ? 'যাচাইকৃত দাতা' : 'Verified Donors'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'বিনামূল্যে রক্তদান' : 'Free Blood Donation'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'জরুরি সেবা' : 'Emergency Service'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'লাইভ ম্যাপ' : 'Live Map'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? 'GPS ট্র্যাকিং' : 'GPS Tracking'}</div>
          <div className="ticker-item"><span className="ticker-dot"></span>{language === 'bn' ? '24/7 সহায়তা' : '24/7 Support'}</div>
          <div className="ticker-item gold"><span className="ticker-dot"></span>{language === 'bn' ? 'যাচাইকৃত দাতা' : 'Verified Donors'}</div>
        </div>
      </div>

      {/* How It Works */}
      <section className="how py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="how-header reveal text-center mb-12 lg:mb-16">
            <div className="s-label inline-block">
              <div className="s-label-line"></div>
              <span className="s-label-text">{language === 'bn' ? 'কিভাবে কাজ করে' : 'How It Works'}</span>
            </div>
            <h2 className="s-title text-3xl lg:text-4xl font-bold mb-4">
              {language === 'bn' ? 'সহজ চার ধাপে' : 'Simple Four Steps To'} <span className="accent">{language === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
            </h2>
            <p className="s-desc text-lg max-w-3xl mx-auto">
              {language === 'bn'
                ? 'রক্তদান প্রক্রিয়া এখন আরও সহজ। মাত্র কয়েক মিনিটে নিবন্ধন করুন এবং জীবন বাঁচাতে শুরু করুন।'
                : 'The blood donation process is now easier than ever. Register in minutes and start saving lives.'}
            </p>
          </div>
          <div className="steps reveal delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/register')}
            >
              <span className="step-num">01</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'নিবন্ধন করুন' : 'Register'}</h3>
              <p className="step-desc">{language === 'bn' ? 'আপনার তথ্য দিয়ে সহজে নিবন্ধন করুন' : 'Sign up with your details easily'}</p>
              <span className="step-arrow">→</span>
            </div>
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/donors')}
            >
              <span className="step-num">02</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'দাতা খুঁজুন' : 'Find Donors'}</h3>
              <p className="step-desc">{language === 'bn' ? 'আপনার কাছাকাছি রক্তদাতা খুঁজুন' : 'Search donors near your location'}</p>
              <span className="step-arrow">→</span>
            </div>
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/request')}
            >
              <span className="step-num">03</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'রক্ত চাই' : 'Request Blood'}</h3>
              <p className="step-desc">{language === 'bn' ? 'রক্তের প্রয়োজন পোস্ট করুন' : 'Post your blood request'}</p>
              <span className="step-arrow">→</span>
            </div>
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/register')}
            >
              <span className="step-num">04</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'রক্তদান করুন' : 'Donate'}</h3>
              <p className="step-desc">{language === 'bn' ? 'জীবন বাঁচান' : 'Save a life today'}</p>
              <span className="step-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Search Section */}
      <section className="search-sec py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="search-layout grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="search-left reveal space-y-6">
              <div className="s-label">
                <div className="s-label-line"></div>
                <span className="s-label-text">{language === 'bn' ? 'দাতা অনুসন্ধান' : 'Donor Search'}</span>
              </div>
              <h2 className="s-title text-2xl lg:text-3xl font-bold">
                {language === 'bn' ? 'আপনার কাছাকাছি' : 'Donors Near'}
                <span className="teal">{language === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Your Location'}</span>
              </h2>
              <p className="s-desc text-lg">
                {language === 'bn'
                  ? 'আপনার এলাকায় উপলব্ধ রক্তদাতাদের খুঁজুন এবং জরুরি মুহূর্তে সহায়তা পান।'
                  : 'Find available blood donors in your area and get help in emergency situations.'}
              </p>
              <div className="search-banner bg-gradient-to-r from-red-50 to-teal-50 p-6 rounded-xl">
                <div className="search-banner-text">
                  <h3 className="search-banner-title text-xl font-bold">{language === 'bn' ? 'জরুরি রক্তের প্রয়োজন?' : 'Need Blood Urgently?'}</h3>
                  <p className="search-banner-sub">{language === 'bn' ? 'এখনই অনুরোধ জমা দিন' : 'Submit request now'}</p>
                </div>
                <span className="search-banner-art text-4xl">🩸</span>
              </div>
              {searchResults && searchResults.length > 0 ? (
                <div className="donor-list space-y-3">
                  {searchResults.map((donor: any, index: number) => (
                    <div key={index} className="donor-row flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                      <div className="d-avatar w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background: '#C0152A'}}>{donor.name?.[0] || 'D'}</div>
                      <div className="flex-1">
                        <span className="d-name font-semibold">{donor.name}</span>
                        <span className="d-info block text-sm text-gray-600">{donor.blood_group} • {donor.location}</span>
                      </div>
                      <span className="d-badge bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{language === 'bn' ? 'উপলব্ধ' : 'Available'}<span className="d-avail"></span></span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="search-card reveal delay-1 bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="sc-title text-xl font-bold mb-6">{language === 'bn' ? 'দাতা অনুসন্ধান করুন' : 'Search Donors'}</div>
              <div className="form-row space-y-4">
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</label>
                  <div className="bt-grid grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <button 
                        key={type}
                        className={`bt-btn px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedBloodType === type 
                            ? 'border-red-500 bg-red-500 text-white' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                        onClick={() => handleBloodTypeSelect(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'জেলা' : 'District'}</label>
                  <select 
                    className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                    <option value="Dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                    <option value="Faridpur">{language === 'bn' ? 'ফরিদপুর' : 'Faridpur'}</option>
                    <option value="Gazipur">{language === 'bn' ? 'গাজীপুর' : 'Gazipur'}</option>
                    <option value="Gopalganj">{language === 'bn' ? 'গোপালগঞ্জ' : 'Gopalganj'}</option>
                    <option value="Kishoreganj">{language === 'bn' ? 'কিশোরগঞ্জ' : 'Kishoreganj'}</option>
                    <option value="Madaripur">{language === 'bn' ? 'মাদারীপুর' : 'Madaripur'}</option>
                    <option value="Manikganj">{language === 'bn' ? 'মানিকগঞ্জ' : 'Manikganj'}</option>
                    <option value="Munshiganj">{language === 'bn' ? 'মুন্সিগঞ্জ' : 'Munshiganj'}</option>
                    <option value="Narayanganj">{language === 'bn' ? 'নারায়ণগঞ্জ' : 'Narayanganj'}</option>
                    <option value="Narsingdi">{language === 'bn' ? 'নরসিংদী' : 'Narsingdi'}</option>
                    <option value="Rajbari">{language === 'bn' ? 'রাজবাড়ী' : 'Rajbari'}</option>
                    <option value="Shariatpur">{language === 'bn' ? 'শরীয়তপুর' : 'Shariatpur'}</option>
                    <option value="Tangail">{language === 'bn' ? 'টাঙ্গাইল' : 'Tangail'}</option>
                    <option value="Bogra">{language === 'bn' ? 'বগুড়া' : 'Bogra'}</option>
                    <option value="Dinajpur">{language === 'bn' ? 'দিনাজপুর' : 'Dinajpur'}</option>
                    <option value="Gaibandha">{language === 'bn' ? 'গাইবান্ধা' : 'Gaibandha'}</option>
                    <option value="Jaipurhat">{language === 'bn' ? 'জয়পুরহাট' : 'Jaipurhat'}</option>
                    <option value="Kurigram">{language === 'bn' ? 'কুড়িগ্রাম' : 'Kurigram'}</option>
                    <option value="Lalmonirhat">{language === 'bn' ? 'লালমনিরহাট' : 'Lalmonirhat'}</option>
                    <option value="Naogaon">{language === 'bn' ? 'নওগাঁ' : 'Naogaon'}</option>
                    <option value="Natore">{language === 'bn' ? 'নাটোর' : 'Natore'}</option>
                    <option value="Nawabganj">{language === 'bn' ? 'নওয়াবগঞ্জ' : 'Nawabganj'}</option>
                    <option value="Pabna">{language === 'bn' ? 'পাবনা' : 'Pabna'}</option>
                    <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                    <option value="Rangpur">{language === 'bn' ? 'রংপুর' : 'Rangpur'}</option>
                    <option value="Sirajganj">{language === 'bn' ? 'সিরাজগঞ্জ' : 'Sirajganj'}</option>
                    <option value="Thakurgaon">{language === 'bn' ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
                    <option value="Barguna">{language === 'bn' ? 'বরগুনা' : 'Barguna'}</option>
                    <option value="Barisal">{language === 'bn' ? 'বরিশাল' : 'Barisal'}</option>
                    <option value="Bhola">{language === 'bn' ? 'ভোলা' : 'Bhola'}</option>
                    <option value="Jhalokati">{language === 'bn' ? 'ঝালকাঠি' : 'Jhalokati'}</option>
                    <option value="Patuakhali">{language === 'bn' ? 'পটুয়াখালী' : 'Patuakhali'}</option>
                    <option value="Pirojpur">{language === 'bn' ? 'পিরোজপুর' : 'Pirojpur'}</option>
                    <option value="Bandarban">{language === 'bn' ? 'বান্দরবান' : 'Bandarban'}</option>
                    <option value="Brahmanbaria">{language === 'bn' ? 'ব্রাহ্মণবাড়িয়া' : 'Brahmanbaria'}</option>
                    <option value="Chandpur">{language === 'bn' ? 'চাঁদপুর' : 'Chandpur'}</option>
                    <option value="Chittagong">{language === 'bn' ? 'চট্টগ্রাম' : 'Chittagong'}</option>
                    <option value="Comilla">{language === 'bn' ? 'কুমিল্লা' : 'Comilla'}</option>
                    <option value="CoxsBazar">{language === 'bn' ? 'কক্সবাজার' : "Cox's Bazar"}</option>
                    <option value="Feni">{language === 'bn' ? 'ফেনী' : 'Feni'}</option>
                    <option value="Khagrachari">{language === 'bn' ? 'খাগড়াছড়ি' : 'Khagrachari'}</option>
                    <option value="Lakshmipur">{language === 'bn' ? 'লক্ষ্মীপুর' : 'Lakshmipur'}</option>
                    <option value="Noakhali">{language === 'bn' ? 'নোয়াখালী' : 'Noakhali'}</option>
                    <option value="Rangamati">{language === 'bn' ? 'রাঙ্গামাটি' : 'Rangamati'}</option>
                    <option value="Habiganj">{language === 'bn' ? 'হবিগঞ্জ' : 'Habiganj'}</option>
                    <option value="Maulvibazar">{language === 'bn' ? 'মৌলভীবাজার' : 'Maulvibazar'}</option>
                    <option value="Mymensingh">{language === 'bn' ? 'ময়মনসিংহ' : 'Mymensingh'}</option>
                    <option value="Netrokona">{language === 'bn' ? 'নেত্রকোণা' : 'Netrokona'}</option>
                    <option value="Sherpur">{language === 'bn' ? 'শেরপুর' : 'Sherpur'}</option>
                    <option value="Sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                    <option value="Sunamganj">{language === 'bn' ? 'সুনামগঞ্জ' : 'Sunamganj'}</option>
                    <option value="Bagerhat">{language === 'bn' ? 'বাগেরহাট' : 'Bagerhat'}</option>
                    <option value="Chuadanga">{language === 'bn' ? 'চুয়াডাঙ্গা' : 'Chuadanga'}</option>
                    <option value="Jessore">{language === 'bn' ? 'যশোর' : 'Jessore'}</option>
                    <option value="Jhenaidah">{language === 'bn' ? 'ঝিনাইদহ' : 'Jhenaidah'}</option>
                    <option value="Khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                    <option value="Kushtia">{language === 'bn' ? 'কুষ্টিয়া' : 'Kushtia'}</option>
                    <option value="Magura">{language === 'bn' ? 'মাগুরা' : 'Magura'}</option>
                    <option value="Meherpur">{language === 'bn' ? 'মেহেরপুর' : 'Meherpur'}</option>
                    <option value="Narail">{language === 'bn' ? 'নড়াইল' : 'Narail'}</option>
                    <option value="Satkhira">{language === 'bn' ? 'সাতক্ষীরা' : 'Satkhira'}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'এলাকা' : 'Area'}</label>
                  <input 
                    type="text" 
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder={language === 'bn' ? 'এলাকা লিখুন' : 'Enter area'}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>
              <button className="search-submit w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2" onClick={handleSearch}>
                {language === 'bn' ? 'অনুসন্ধান করুন' : 'Search'} <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Blood Requests Section */}
      <UrgentBloodRequests />

      {/* Eligibility Section */}
      <section className="eligibility py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="elig-layout grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="elig-left reveal space-y-6">
              <div className="s-label">
                <div className="s-label-line"></div>
                <span className="s-label-text">{language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}</span>
              </div>
              <h2 className="s-title text-2xl lg:text-3xl font-bold">
                {language === 'bn' ? 'রক্তদানের' : 'Blood Donation'}
                <span className="accent">{language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}</span>
              </h2>
              <p className="s-desc text-lg">
                {language === 'bn'
                  ? 'আপনি কি রক্তদানের জন্য যোগ্য? এখানে বিস্তারিত তথ্য দেখুন।'
                  : 'Are you eligible to donate blood? Check the detailed information here.'}
              </p>
              <div className="criteria-list space-y-4">
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg">
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'বয়স: ১৮-৬৫ বছর' : 'Age: 18-65 years'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'সুস্থ প্রাপ্তবয়স্করা দাতা হতে পারেন' : 'Healthy adults can be donors'}</p>
                  </div>
                </div>
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg">
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'ওজন: ৫০ কেজি বা তার বেশি' : 'Weight: 50kg or more'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'ন্যূনতম ওজন প্রয়োজন' : 'Minimum weight required'}</p>
                  </div>
                </div>
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg">
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'স্বাস্থ্য ভালো থাকতে হবে' : 'Must be in good health'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'কোনো গুরুতর রোগ নেই' : 'No serious illnesses'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="elig-card reveal delay-1 bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="sc-title text-xl font-bold mb-6">{language === 'bn' ? 'যোগ্যতা পরীক্ষা করুন' : 'Check Eligibility'}</div>
              <div className="form-row space-y-4">
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'আপনার বয়স' : 'Your Age'}</label>
                  <input 
                    type="number" 
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder={language === 'bn' ? 'বছরে' : 'In years'} 
                    value={eligAge}
                    onChange={(e) => setEligAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'আপনার ওজন' : 'Your Weight'}</label>
                  <input 
                    type="number" 
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder={language === 'bn' ? 'কেজিতে' : 'In kg'} 
                    value={eligWeight}
                    onChange={(e) => setEligWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'স্বাস্থ্য অবস্থা' : 'Health Status'}</label>
                  <select 
                    className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={eligHealth}
                    onChange={(e) => setEligHealth(e.target.value)}
                  >
                    <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select...'}</option>
                    <option value="healthy">{language === 'bn' ? 'সুস্থ আছি' : 'I am healthy'}</option>
                    <option value="ill">{language === 'bn' ? 'সাময়িক অসুস্থ' : 'Temporarily ill'}</option>
                    <option value="chronic">{language === 'bn' ? 'দীর্ঘমেয়াদী রোগ' : 'Chronic condition'}</option>
                  </select>
                </div>
              </div>
              <button className="search-submit w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mt-6" onClick={handleEligibilityCheck}>
                {language === 'bn' ? 'পরীক্ষা করুন' : 'Check'} <span>→</span>
              </button>
              {eligResult && (
                <div className={`elig-result mt-4 p-4 rounded-lg ${
                  eligResult.eligible 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <h4 className={`elig-result-title font-semibold ${
                    eligResult.eligible 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    {eligResult.message}
                  </h4>
                  {eligResult.eligible && (
                    <p className="elig-result-desc text-green-700 mt-2">{language === 'bn' ? 'আপনি রক্তদান করতে পারেন। নিবন্ধন করুন।' : 'You can donate blood. Register now.'}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-sec">
        <div className="container">
          <div className="map-header reveal">
            <div>
              <h2 className="s-title">
                {language === 'bn' ? 'দাতা ও হাসপাতাল' : 'Donors & Hospitals'}
                <span className="teal">{language === 'bn' ? 'ম্যাপে দেখুন' : 'On Map'}</span>
              </h2>
            </div>
            <Link href="/donors" className="see-all">
              {language === 'bn' ? 'সব দেখুন' : 'View All'} <span>→</span>
            </Link>
          </div>
          <div className="map-visual reveal delay-1">
            <LeafletMap 
              center={[23.6850, 90.3563]} 
              zoom={7} 
              height="400px"
              markers={[
                {
                  id: 'dhaka',
                  lat: 23.8103,
                  lng: 90.4125,
                  title: 'Dhaka',
                  description: 'Capital of Bangladesh',
                  type: 'hospital'
                }
              ]}
            />
          </div>
          <div className="map-stats reveal delay-2">
            <div className="mstat">
              <span className="mstat-num">{stats.registered_donors}</span>
              <span className="mstat-label">{language === 'bn' ? 'সক্রিয় দাতা' : 'Active Donors'}</span>
            </div>
            <div className="mstat">
              <span className="mstat-num">64</span>
              <span className="mstat-label">{language === 'bn' ? 'জেলা' : 'Districts'}</span>
            </div>
            <div className="mstat">
              <span className="mstat-num">24/7</span>
              <span className="mstat-label">{language === 'bn' ? 'সহায়তা' : 'Support'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chitrokothon - Blank */}
      <section className="chitro">
        <div className="container">
          <div className="chitro-header reveal">
            <div>
              <div className="s-label">
                <div className="s-label-line"></div>
                <span className="s-label-text">{language === 'bn' ? 'চিত্রকথন' : 'Chitrokothon'}</span>
              </div>
              <h2 className="s-title">
                {language === 'bn' ? 'শিক্ষামূলক চিত্রকথন' : 'Educational Illustrations'}
                <span className="accent">{language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}</span>
              </h2>
            </div>
            <Link href="/illustrations" className="see-all">
              {language === 'bn' ? 'গ্যালারি দেখুন' : 'View Gallery'} <span>→</span>
            </Link>
          </div>
          <div className="chitro-blank reveal delay-1">
            <svg className="chitro-blank-art" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#C0152A" opacity="0.1"/>
              <path d="M40 20c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20S51.046 20 40 20zm0 32c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12z" fill="#C0152A" opacity="0.3"/>
            </svg>
            <h3 className="chitro-blank-title">{language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}</h3>
            <p className="chitro-blank-sub">{language === 'bn' ? 'সুপার অ্যাডমিন শীঘ্রই আর্ট পোস্ট করবেন' : 'Super admin will post art soon'}</p>
          </div>
        </div>
      </section>

      {/* Blog - Blank */}
      <section className="blog-sec">
        <div className="container">
          <div className="blog-blank reveal">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#1B5E6B" opacity="0.1"/>
              <path d="M25 25h30v6H25v-6zm0 12h30v6H25v-6zm0 12h20v6H25v-6z" fill="#1B5E6B" opacity="0.3"/>
            </svg>
            <h3 className="blog-blank-title">{language === 'bn' ? 'ব্লগ শীঘ্রই আসছে' : 'Blog Coming Soon'}</h3>
            <p className="blog-blank-sub">{language === 'bn' ? 'সুপার অ্যাডমিন শীঘ্রই নিউজ পোস্ট করবেন' : 'Super admin will post news soon'}</p>
          </div>
        </div>
      </section>

      {/* Testimonials - Blank */}
      <section className="testimonials">
        <div className="container">
          <div className="testi-blank reveal">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#C8922A" opacity="0.1"/>
              <path d="M25 30c0-5.523 4.477-10 10-10s10 4.477 10 10v10H25V30zm20 0c0-5.523 4.477-10 10-10s10 4.477 10 10v10H45V30z" fill="#C8922A" opacity="0.3"/>
            </svg>
            <h3 className="testi-blank-title">{language === 'bn' ? 'সাক্ষ্য শীঘ্রই আসছে' : 'Testimonials Coming Soon'}</h3>
            <p className="testi-blank-sub">{language === 'bn' ? 'প্রথম সাক্ষ্য দিন' : 'Be the first to share'}</p>
            <button className="blank-cta">{language === 'bn' ? 'সাক্ষ্য দিন' : 'Share Your Story'}</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 8.954 20 20 20s20-8.954 20-20C40 8.954 31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="#C0152A"/>
                <path d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#E8324A"/>
                <circle cx="20" cy="20" r="4" fill="#FDFAF4"/>
              </svg>
              <h3 style={{fontFamily: 'Tiro Bangla, serif', fontSize: '24px', color: '#FDFAF4', margin: '16px 0 8px'}}>রক্তকরবী</h3>
              <p>
                {language === 'bn'
                  ? 'বাংলাদেশের বৃহত্তম রক্তদাতা নেটওয়ার্ক। আমরা রক্তদাতাদের সাথে রক্তের প্রয়োজনে থাকা মানুষদের সংযোগ করি।'
                  : 'Bangladesh\'s largest blood donor network. We connect blood donors with those in need.'}
              </p>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">{language === 'bn' ? 'দ্রুত লিংক' : 'Quick Links'}</h4>
              <ul className="footer-links">
                <li><Link href="/">{language === 'bn' ? 'হোম' : 'Home'}</Link></li>
                <li><Link href="/donors">{language === 'bn' ? 'দাতা' : 'Donors'}</Link></li>
                <li><Link href="/request">{language === 'bn' ? 'অনুরোধ' : 'Request'}</Link></li>
                <li><Link href="/eligibility">{language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">{language === 'bn' ? 'সম্পদ' : 'Resources'}</h4>
              <ul className="footer-links">
                <li><Link href="/blog">{language === 'bn' ? 'ব্লগ' : 'Blog'}</Link></li>
                <li><Link href="/illustrations">{language === 'bn' ? 'চিত্রকথন' : 'Chitrokothon'}</Link></li>
                <li><Link href="/">{language === 'bn' ? 'FAQ' : 'FAQ'}</Link></li>
                <li><Link href="/">{language === 'bn' ? 'সহায়তা' : 'Support'}</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">{language === 'bn' ? 'আইনি' : 'Legal'}</h4>
              <ul className="footer-links">
                <li><Link href="/">{language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</Link></li>
                <li><Link href="/">{language === 'bn' ? 'শর্তাবলী' : 'Terms of Service'}</Link></li>
                <li><Link href="/">{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 রক্তকরবী. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved.'}</span>
            <div className="socials">
              <a href="#" className="social">f</a>
              <a href="#" className="social">in</a>
              <a href="#" className="social">t</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button id="totop">↑</button>

      {/* Mobile Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          nav {
            padding: 12px 16px !important;
          }
          .nav-links {
            display: none !important;
          }
          .hamburger {
            display: flex !important;
          }
          .mobile-menu {
            display: flex !important;
            flex-direction: column;
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            background: #F5EDD8;
            padding: 20px;
            gap: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            opacity: 0;
            visibility: hidden;
            z-index: 550;
          }
          .mobile-menu.open {
            opacity: 1 !important;
            visibility: visible !important;
          }
          .mobile-menu a {
            font-size: 16px;
            padding: 12px 0;
          }
          .hero {
            grid-template-columns: 1fr !important;
            padding: 60px 16px 40px !important;
            min-height: auto !important;
          }
          .hero-left {
            padding: 0 !important;
            max-width: 100%;
            width: 100%;
          }
          .hero-right {
            display: none !important;
          }
          .hero-cta-card {
            padding: 24px 20px !important;
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            margin-bottom: 32px;
            max-width: 100%;
            width: 100%;
          }
          .hero-title {
            font-size: clamp(32px, 7vw, 48px) !important;
          }
          .hero-subtitle {
            font-size: 14px !important;
          }
          .hero-desc {
            font-size: 14px !important;
            max-width: 100%;
          }
          .hero-btns {
            flex-direction: column !important;
            align-items: flex-start;
            gap: 12px;
          }
          .search-card {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            margin-top: 32px;
            max-width: 100%;
            width: 100%;
          }
          .search-layout {
            display: flex !important;
            flex-direction: column;
          }
          .search-left {
            max-width: 100%;
            width: 100%;
          }
          .bt-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px;
          }
          .form-input,
          .form-select {
            width: 100% !important;
            max-width: 100%;
          }
          .container {
            padding: 0 16px;
          }
          .steps {
            grid-template-columns: 1fr !important;
          }
          .map-stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

