"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserData, logoutUser } from '@/lib/firebase';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Mahfuzur Rahman',
    bloodGroup: 'O+',
    donations: 0,
    fulfilledRequests: 0,
    rating: 0
  });

  const translations = {
    en: {
      brandSub: 'RoktoKorobi',
      quickActions: 'Quick actions',
      quickHome: 'Go to home',
      quickHomeSub: 'Back to the main site',
      quickRequest: 'Request blood',
      quickRequestSub: 'Start a verified request',
      quickEligibility: 'Check eligibility',
      quickEligibilitySub: 'Confirm you\'re ready to give',
      quickChitrokothon: 'Visit Chitrokothon',
      quickChitrokothonSub: 'Stories from real donors',
      quickBlog: 'Blog',
      quickBlogSub: 'Read our latest posts',
      quickTestimonials: 'Testimonials',
      quickTestimonialsSub: 'Stories from donors',
      quickProfile: 'Complete your profile',
      quickProfileSub: 'Add your blood type & location',
      profileVerified: 'Verified donor',
      logout: 'Log out',
      langBtn: 'English',
      newRequest: 'New request',
      greeting: 'Good morning',
      greetingSub: 'Here\'s what\'s happening with your donor account today.',
      sectionHeading: 'Overview',
      viewAll: 'View all activity →',
      trendAll: 'All time',
      trendCommunity: 'Community',
      stat1Label: 'Total donations',
      stat1Foot: 'No donations logged yet',
      stat2Label: 'Fulfilled requests',
      stat2Foot: 'Waiting on your first match',
      stat3Label: 'Donor rating',
      stat3Foot: 'No ratings yet',
      panelRecent: 'Recent activity',
      emptyTitle: 'No activity yet',
      emptyText: "Once you respond to a request or complete a donation, it'll show up here so you can track your impact over time.",
      checkEligibility: 'Check your eligibility',
      panelQuick: 'Quick actions'
    },
    bn: {
      brandSub: 'রক্তদান নেটওয়ার্ক',
      quickActions: 'দ্রুত পদক্ষেপ',
      quickHome: 'হোমে যান',
      quickHomeSub: 'মূল সাইটে ফিরে যান',
      quickRequest: 'রক্ত চাই',
      quickRequestSub: 'একটি যাচাইকৃত আবেদন শুরু করুন',
      quickEligibility: 'যোগ্যতা যাচাই করুন',
      quickEligibilitySub: 'আপনি প্রস্তুত কিনা নিশ্চিত করুন',
      quickChitrokothon: 'চিত্রকথন দেখুন',
      quickChitrokothonSub: 'সত্যিকারের দাতাদের গল্প',
      quickBlog: 'ব্লগ',
      quickBlogSub: 'আমাদের সাম্প্রতিক পোস্ট পড়ুন',
      quickTestimonials: 'সাক্ষ্যকথা',
      quickTestimonialsSub: 'দাতাদের গল্প',
      quickProfile: 'প্রোফাইল সম্পূর্ণ করুন',
      quickProfileSub: 'আপনার ব্লাড গ্রুপ ও ঠিকানা যুক্ত করুন',
      profileVerified: 'যাচাইকৃত দাতা',
      logout: 'লগ আউট',
      langBtn: 'বাংলা',
      newRequest: 'নতুন আবেদন',
      greeting: 'শুভ সকাল',
      greetingSub: 'আজ আপনার দাতা অ্যাকাউন্টে কী ঘটছে তা এখানে দেখুন।',
      sectionHeading: 'সারসংক্ষেপ',
      viewAll: 'সব কার্যক্রম দেখুন →',
      trendAll: 'সর্বমোট',
      trendCommunity: 'কমিউনিটি',
      stat1Label: 'মোট রক্তদান',
      stat1Foot: 'এখনও কোনো রক্তদান হয়নি',
      stat2Label: 'পূর্ণকৃত আবেদন',
      stat2Foot: 'প্রথম মিলের অপেক্ষায়',
      stat3Label: 'দাতার রেটিং',
      stat3Foot: 'এখনও কোনো রেটিং নেই',
      panelRecent: 'সাম্প্রতিক কার্যক্রম',
      emptyTitle: 'এখনও কোনো কার্যক্রম নেই',
      emptyText: 'আপনি কোনো আবেদনে সাড়া দিলে বা রক্তদান সম্পন্ন করলে, তা এখানে দেখা যাবে যাতে আপনি সময়ের সাথে আপনার অবদান পর্যবেক্ষণ করতে পারেন।',
      checkEligibility: 'আপনার যোগ্যতা যাচাই করুন',
      panelQuick: 'দ্রুত পদক্ষেপ'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
        } else {
          const data = await getUserData(user.uid);
          if (data) {
            setUserData(prev => ({ ...prev, ...data }));
          }
        }
      } catch (error) {
        router.push('/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (kebabOpen) {
        setKebabOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [kebabOpen]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = async () => {
    setKebabOpen(false);
    if (!confirm(language === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to logout?')) {
      return;
    }
    await logoutUser();
    router.push('/login');
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleKebab = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKebabOpen(!kebabOpen);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#FBF6EE' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --crimson: #B3221C;
          --crimson-deep: #8C1B16;
          --gold: #C99A2E;
          --gold-soft: #E3C988;
          --cream: #FBF6EE;
          --cream-dim: #F0E8D8;
          --ink: #241B16;
          --ink-soft: #6E6258;
          --line: #E7DCC8;
          --white: #FFFFFF;
          --radius: 14px;
          --shadow: 0 1px 3px rgba(36,27,22,0.06), 0 8px 24px -8px rgba(36,27,22,0.12);
          --sidebar-w: 268px;
        }

        html, body {
          height: 100%;
          background: var(--cream);
          color: var(--ink);
          font-family: ${language === 'bn' ? "'Noto Sans Bengali', 'DM Sans', sans-serif" : "'DM Sans', sans-serif"};
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .layout {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          min-height: 100vh;
          width: 100%;
        }

        .sidebar {
          width: var(--sidebar-w);
          min-width: var(--sidebar-w);
          max-width: var(--sidebar-w);
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          left: 0;
          background: var(--white);
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 100;
          transition: transform .25s cubic-bezier(.4,0,.2,1);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(36,27,22,0.15);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(36,27,22,0.35);
            z-index: 90;
          }
          .overlay.open { display: block; }
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 11px;
          padding: 20px 18px 18px;
          border-bottom: 1px solid var(--line);
          flex-shrink: 0;
        }
        .brand-left { display: flex; align-items: center; gap: 11px; }
        .brand-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(145deg, var(--crimson) 0%, var(--crimson-deep) 100%);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 8px -2px rgba(140,27,22,0.50);
        }
        .brand-icon svg { width: 17px; height: 17px; }
        .brand-text-bn {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 17px; font-weight: 700;
          color: var(--crimson); line-height: 1.1;
        }
        .brand-text-en {
          font-size: 10px; font-weight: 600;
          letter-spacing: .13em; text-transform: uppercase;
          color: var(--ink-soft); margin-top: 2px;
        }
        .sidebar-close {
          display: none;
          width: 30px; height: 30px;
          border-radius: 8px; border: 1px solid var(--line);
          background: var(--cream-dim);
          align-items: center; justify-content: center;
          cursor: pointer; color: var(--ink-soft);
          flex-shrink: 0;
        }
        .sidebar-close svg { width: 15px; height: 15px; }
        @media (max-width: 768px) { .sidebar-close { display: flex; } }

        .sidebar-actions {
          padding: 12px 12px 4px;
          flex: 1;
          overflow-y: auto;
        }
        .sidebar-actions-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          color: var(--ink-soft); opacity: .55;
          padding: 4px 8px 8px;
        }
        .action-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          text-decoration: none;
          color: var(--ink);
          transition: background .14s;
          width: 100%;
        }
        .action-link:hover { background: var(--cream-dim); }
        .action-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: rgba(179,34,28,0.08);
          color: var(--crimson);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .action-icon svg { width: 14px; height: 14px; }
        .action-text-main { font-size: 13px; font-weight: 500; color: var(--ink); line-height: 1.2; }
        .action-text-sub  { font-size: 11px; color: var(--ink-soft); margin-top: 1px; }
        .action-chev { margin-left: auto; color: var(--ink-soft); flex-shrink: 0; }
        .action-chev svg { width: 12px; height: 12px; }

        .sidebar-footer {
          border-top: 1px solid var(--line);
          padding: 10px 12px;
          flex-shrink: 0;
          position: relative;
        }

        .user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          transition: background .14s;
        }
        .user-row:hover { background: var(--cream-dim); }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(145deg, var(--crimson) 0%, var(--crimson-deep) 100%);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; flex-shrink: 0;
        }
        .user-info { flex: 1; min-width: 0; }
        .user-name {
          font-size: 13px; font-weight: 600; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .user-badge { font-size: 11px; color: var(--ink-soft); }

        .kebab-wrap { position: relative; flex-shrink: 0; }
        .kebab-btn {
          width: 26px; height: 26px;
          border-radius: 7px; border: none;
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-soft); cursor: pointer;
        }
        .kebab-btn:hover { background: var(--line); color: var(--ink); }
        .kebab-btn svg { width: 15px; height: 15px; }
        .kebab-drop {
          position: absolute;
          bottom: calc(100% + 6px);
          right: 0;
          background: var(--white);
          border: 1px solid var(--line);
          border-radius: 10px;
          box-shadow: 0 8px 24px -4px rgba(36,27,22,0.18);
          padding: 5px;
          min-width: 148px;
          display: none;
          z-index: 200;
        }
        .kebab-drop.open { display: block; }
        .kebab-item {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 12px; border-radius: 7px;
          font-size: 13px; font-weight: 500;
          color: var(--crimson); cursor: pointer;
          transition: background .14s;
          border: none; background: transparent;
          width: 100%; font-family: inherit;
        }
        .kebab-item:hover { background: rgba(179,34,28,0.07); }
        .kebab-item svg { width: 14px; height: 14px; }

        .main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: var(--cream);
          overflow-y: auto;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 32px;
          background: var(--cream);
          border-bottom: 1px solid var(--line);
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 12px;
        }
        .topbar-left  { display: flex; align-items: center; gap: 8px; }
        .topbar-right { display: flex; align-items: center; gap: 8px; }

        .hamburger {
          width: 38px; height: 38px;
          border-radius: 9px;
          border: 1px solid var(--line);
          background: var(--white);
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4.5px;
          cursor: pointer;
          box-shadow: var(--shadow);
          flex-shrink: 0;
        }
        .hamburger span {
          display: block;
          width: 16px; height: 1.8px;
          background: var(--ink);
          border-radius: 2px;
          transition: all .2s;
        }
        @media (max-width: 768px) { .hamburger { display: flex; } }

        .lang-btn {
          display: flex; align-items: center; gap: 6px;
          border: 1px solid var(--line); background: var(--white);
          color: var(--ink); font-size: 13px; font-weight: 600;
          height: 36px; padding: 0 14px; border-radius: 999px;
          cursor: pointer; font-family: inherit;
          box-shadow: var(--shadow); transition: border-color .14s;
        }
        .lang-btn:hover { border-color: var(--gold); }
        .lang-btn svg { width: 14px; height: 14px; }

        .notif-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--line); background: var(--white);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-soft); cursor: pointer;
          box-shadow: var(--shadow); position: relative;
          transition: border-color .14s, color .14s;
        }
        .notif-btn:hover { color: var(--crimson); border-color: var(--gold); }
        .notif-btn svg { width: 16px; height: 16px; }
        .notif-dot {
          position: absolute; top: 6px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--gold); border: 2px solid var(--white);
        }

        .new-req-btn {
          display: flex; align-items: center; gap: 6px;
          background: var(--crimson); color: #fff;
          border: none; border-radius: 999px;
          font-size: 13px; font-weight: 600;
          height: 36px; padding: 0 16px;
          cursor: pointer; font-family: inherit;
          transition: background .14s;
          box-shadow: 0 2px 8px -2px rgba(140,27,22,0.4);
          white-space: nowrap;
        }
        .new-req-btn:hover { background: var(--crimson-deep); }
        .new-req-btn svg { width: 14px; height: 14px; }

        .page-header { padding: 26px 32px 0; }
        .page-title {
          font-family: 'Sora', sans-serif;
          font-size: 23px; font-weight: 700;
          color: var(--ink); letter-spacing: -0.01em;
        }
        .page-sub { font-size: 13.5px; color: var(--ink-soft); margin-top: 4px; }

        .content {
          padding: 22px 32px 48px;
          display: flex; flex-direction: column; gap: 20px;
        }

        .section-row {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 14px;
        }
        .section-title {
          font-family: 'Sora', sans-serif;
          font-size: 15px; font-weight: 600; color: var(--ink);
        }
        .view-all {
          font-size: 12.5px; font-weight: 600;
          color: var(--crimson); text-decoration: none;
        }
        .view-all:hover { text-decoration: underline; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .stat-card {
          background: var(--white);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 20px 20px 16px;
          box-shadow: var(--shadow);
          display: flex; flex-direction: column;
          min-height: 148px;
          transition: transform .18s, box-shadow .18s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -10px rgba(36,27,22,0.16); }
        .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .stat-icon { width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-icon svg { width: 16px; height: 16px; }
        .stat-icon.red   { background: rgba(179,34,28,0.09);  color: var(--crimson); }
        .stat-icon.green { background: rgba(47,122,77,0.10);  color: #2F7A4D; }
        .stat-icon.gold  { background: rgba(201,154,46,0.13); color: #9C7820; }
        .stat-badge {
          font-size: 11px; font-weight: 600; color: var(--ink-soft);
          background: var(--cream-dim); padding: 3px 9px; border-radius: 999px;
        }
        .stat-number {
          font-family: 'Sora', sans-serif;
          font-size: 34px; font-weight: 700;
          color: var(--ink); line-height: 1; letter-spacing: -0.02em;
          display: block;
        }
        .stat-label { font-size: 13px; color: var(--ink-soft); font-weight: 500; margin-top: 5px; }
        .stat-note {
          margin-top: auto; padding-top: 12px;
          font-size: 11.5px; color: var(--ink-soft);
          display: flex; align-items: center; gap: 6px;
        }
        .stat-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 15px;
        }
        .panel {
          background: var(--white); border: 1px solid var(--line);
          border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow);
        }
        .panel-title {
          font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 4px;
        }

        .empty {
          display: flex; flex-direction: column;
          align-items: center; text-align: center; padding: 28px 16px 12px;
        }
        .empty-ring {
          width: 50px; height: 50px; border-radius: 50%;
          background: var(--cream-dim); border: 1.5px dashed var(--gold-soft);
          display: flex; align-items: center; justify-content: center;
          color: var(--crimson); margin-bottom: 12px;
        }
        .empty-ring svg { width: 21px; height: 21px; }
        .empty-head { font-size: 13.5px; font-weight: 600; color: var(--ink); margin-bottom: 5px; }
        .empty-body { font-size: 12.5px; color: var(--ink-soft); line-height: 1.55; max-width: 290px; margin-bottom: 14px; }
        .cta-link {
          font-size: 12.5px; font-weight: 600; color: var(--crimson);
          display: inline-flex; align-items: center; gap: 5px;
          border-bottom: 1.5px solid transparent; text-decoration: none;
          transition: border-color .14s;
        }
        .cta-link:hover { border-color: var(--crimson); }
        .cta-link svg { width: 12px; height: 12px; }

        .quick-list { display: flex; flex-direction: column; gap: 3px; margin-top: 8px; }
        .quick-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 8px; border-radius: 9px;
          text-decoration: none; color: inherit;
          transition: background .14s;
        }
        .quick-row:hover { background: var(--cream-dim); }
        .quick-icon {
          width: 29px; height: 29px; border-radius: 8px;
          background: rgba(179,34,28,0.08); color: var(--crimson);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .quick-icon svg { width: 13px; height: 13px; }
        .quick-label { font-size: 12.5px; font-weight: 500; color: var(--ink); }
        .quick-sub   { font-size: 11px; color: var(--ink-soft); margin-top: 1px; }
        .quick-chev  { margin-left: auto; color: var(--ink-soft); }
        .quick-chev svg { width: 12px; height: 12px; }

        @media (max-width: 1024px) {
          .stats-grid  { grid-template-columns: 1fr 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .page-header { padding: 20px 18px 0; }
          .content     { padding: 18px 18px 40px; }
          .topbar      { padding: 14px 18px; }
          .stats-grid  { grid-template-columns: 1fr; }
        }

        :focus-visible { outline: 2px solid var(--crimson); outline-offset: 2px; border-radius: 6px; }
      `}</style>

      <div className="layout">
        <div className={`overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <div className="brand-left">
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div>
                  <div className="brand-text-bn">রক্তকরবী</div>
                  <div className="brand-text-en">{t.brandSub}</div>
                </div>
              </div>
            </div>
            <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="sidebar-actions">
            <div className="sidebar-actions-label">{t.quickActions}</div>

            <div className="action-link" onClick={() => router.push('/')}>
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg></div>
              <div><div className="action-text-main">{t.quickHome}</div><div className="action-text-sub">{t.quickHomeSub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>

            <div className="action-link" onClick={() => router.push('/request')}>
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 20.5s-7-4.4-7-9.8A4 4 0 0 1 12 7.9 4 4 0 0 1 19 10.7c0 5.4-7 9.8-7 9.8Z"/></svg></div>
              <div><div className="action-text-main">{t.quickRequest}</div><div className="action-text-sub">{t.quickRequestSub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>

            <div className="action-link" onClick={() => router.push('/eligibility')}>
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 12.5 11 14.5 15.5 9.5"/><circle cx="12" cy="12" r="8.5"/></svg></div>
              <div><div className="action-text-main">{t.quickEligibility}</div><div className="action-text-sub">{t.quickEligibilitySub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>

            <div className="action-link" onClick={() => router.push('/illustrations')}>
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3.5" y="4.5" width="17" height="14" rx="2"/><path d="m3.5 15 4.5-4.5 3 3L17 8l3.5 4"/></svg></div>
              <div><div className="action-text-main">{t.quickChitrokothon}</div><div className="action-text-sub">{t.quickChitrokothonSub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>

            <div className="action-link">
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M5 4.5h11l3 3V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"/><path d="M8 9h7M8 12.5h7M8 16h4"/></svg></div>
              <div><div className="action-text-main">{t.quickBlog}</div><div className="action-text-sub">{t.quickBlogSub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>

            <div className="action-link">
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 14h5"/></svg></div>
              <div><div className="action-text-main">{t.quickTestimonials}</div><div className="action-text-sub">{t.quickTestimonialsSub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>

            <div className="action-link" onClick={() => router.push('/profile')}>
              <div className="action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="8.2" r="3.2"/><path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/></svg></div>
              <div><div className="action-text-main">{t.quickProfile}</div><div className="action-text-sub">{t.quickProfileSub}</div></div>
              <span className="action-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="user-row">
              <div className="user-avatar">{userData.name.charAt(0)}</div>
              <div className="user-info">
                <div className="user-name">{userData.name}</div>
                <div className="user-badge">{userData.bloodGroup} · {t.profileVerified}</div>
              </div>
              <div className="kebab-wrap">
                <button className="kebab-btn" onClick={toggleKebab} aria-label="Options">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5"  r="1" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    <circle cx="12" cy="19" r="1" fill="currentColor"/>
                  </svg>
                </button>
                <div className={`kebab-drop ${kebabOpen ? 'open' : ''}`}>
                  <button className="kebab-item" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={openSidebar} aria-label="Open menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
              <button className="lang-btn" onClick={toggleLanguage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.3 2.5 3.5 5.6 3.5 9s-1.2 6.5-3.5 9c-2.3-2.5-3.5-5.6-3.5-9s1.2-6.5-3.5-9Z"/></svg>
                {t.langBtn}
              </button>
              <button className="notif-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9.5a6 6 0 1 1 12 0c0 3.2 1 4.6 2 6H4c1-1.4 2-2.8 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
                <span className="notif-dot"></span>
              </button>
            </div>
            <div className="topbar-right">
              <button className="new-req-btn" onClick={() => router.push('/request')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                {t.newRequest}
              </button>
            </div>
          </div>

          <div className="page-header">
            <div className="page-title">{t.greeting}, {userData.name} 👋</div>
            <div className="page-sub">{t.greetingSub}</div>
          </div>

          <div className="content">
            <div>
              <div className="section-row">
                <span className="section-title">{t.sectionHeading}</span>
                <a href="#" className="view-all">{t.viewAll}</a>
              </div>
              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon red">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 21s-7.5-5.1-7.5-11A4.5 4.5 0 0 1 12 6.8 4.5 4.5 0 0 1 19.5 10c0 5.9-7.5 11-7.5 11Z"/></svg>
                    </div>
                    <span className="stat-badge">{t.trendAll}</span>
                  </div>
                  <span className="stat-number">{userData.donations}</span>
                  <div className="stat-label">{t.stat1Label}</div>
                  <div className="stat-note"><span className="stat-dot"></span>{t.stat1Foot}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
                    </div>
                    <span className="stat-badge">{t.trendAll}</span>
                  </div>
                  <span className="stat-number">{userData.fulfilledRequests}</span>
                  <div className="stat-label">{t.stat2Label}</div>
                  <div className="stat-note"><span className="stat-dot"></span>{t.stat2Foot}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon gold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 4.5 14.6 9.6 20.5 10.5 16.2 14.5 17.3 20.3 12 17.5 6.7 20.3 7.8 14.5 3.5 10.5 9.4 9.6 12 4.5Z"/></svg>
                    </div>
                    <span className="stat-badge">{t.trendCommunity}</span>
                  </div>
                  <span className="stat-number">{userData.rating}</span>
                  <div className="stat-label">{t.stat3Label}</div>
                  <div className="stat-note"><span className="stat-dot"></span>{t.stat3Foot}</div>
                </div>

              </div>
            </div>

            <div className="bottom-grid">

              <div className="panel">
                <div className="panel-title">{t.panelRecent}</div>
                <div className="empty">
                  <div className="empty-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V7l8-4 8 4v12"/><path d="M9 19v-6h6v6"/></svg>
                  </div>
                  <div className="empty-head">{t.emptyTitle}</div>
                  <div className="empty-body">{t.emptyText}</div>
                  <a href="/eligibility" className="cta-link">
                    {t.checkEligibility}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </a>
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">{t.panelQuick}</div>
                <div className="quick-list">
                  <div className="quick-row" onClick={() => router.push('/')}>
                    <div className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg></div>
                    <div><div className="quick-label">{t.quickHome}</div><div className="quick-sub">{t.quickHomeSub}</div></div>
                    <span className="quick-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </div>
                  <div className="quick-row" onClick={() => router.push('/request')}>
                    <div className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 20.5s-7-4.4-7-9.8A4 4 0 0 1 12 7.9 4 4 0 0 1 19 10.7c0 5.4-7 9.8-7 9.8Z"/></svg></div>
                    <div><div className="quick-label">{t.quickRequest}</div><div className="quick-sub">{t.quickRequestSub}</div></div>
                    <span className="quick-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </div>
                  <div className="quick-row" onClick={() => router.push('/eligibility')}>
                    <div className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 12.5 11 14.5 15.5 9.5"/><circle cx="12" cy="12" r="8.5"/></svg></div>
                    <div><div className="quick-label">{t.quickEligibility}</div><div className="quick-sub">{t.quickEligibilitySub}</div></div>
                    <span className="quick-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </div>
                  <div className="quick-row" onClick={() => router.push('/illustrations')}>
                    <div className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3.5" y="4.5" width="17" height="14" rx="2"/><path d="m3.5 15 4.5-4.5 3 3L17 8l3.5 4"/></svg></div>
                    <div><div className="quick-label">{t.quickChitrokothon}</div><div className="quick-sub">{t.quickChitrokothonSub}</div></div>
                    <span className="quick-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </div>
                  <div className="quick-row" onClick={() => router.push('/profile')}>
                    <div className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="8.2" r="3.2"/><path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/></svg></div>
                    <div><div className="quick-label">{t.quickProfile}</div><div className="quick-sub">{t.quickProfileSub}</div></div>
                    <span className="quick-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>

      </div>
    </>
  );
}
