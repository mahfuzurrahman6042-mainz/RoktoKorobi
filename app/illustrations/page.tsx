"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const CR = '#8B1A1A', LCR = '#C41E3A', CREAM = '#F5F0E8', DCREAM = '#EDE0CF', DK = '#1A0808', WM = '#6B5045';
const HF = "'Playfair Display', serif";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Noto+Serif+Bengali:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

  .u1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .00s both}
  .u2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .12s both}
  .u3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .22s both}
  .u4{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .32s both}
  .pi    { animation: fadeIn .38s ease both; }

  /* ── Feature card – bottom-flood ── */
  .fcard {
    position: relative; overflow: hidden; cursor: pointer;
    border-radius: 18px; background: white;
    transition: transform .46s cubic-bezier(.22,1,.36,1), box-shadow .42s ease;
  }
  .fcard::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(162deg,#6B1010 0%,#8B1A1A 50%,#530E0E 100%);
    transform: scaleY(0); transform-origin: bottom center;
    transition: transform .62s cubic-bezier(.76,0,.24,1); z-index: 0;
  }
  .fcard:hover { transform: translateY(-11px); box-shadow: 0 44px 88px rgba(0,0,0,.40),0 16px 36px rgba(0,0,0,.16); }
  .fcard:hover::before { transform: scaleY(1); }
  .fbody { position: relative; z-index: 1; }

  .c-num  { transition: color .42s ease; }
  .c-lbl  { color:#8B1A1A; transition: color .36s ease; }
  .c-div  { background: rgba(139,26,26,0.14); transition: background .36s ease; }
  .c-head { color:#1A0808; transition: color .36s ease; }
  .c-ital { color:#8B1A1A; font-style:italic; transition: color .36s ease; }
  .c-desc { color:#6B5045; transition: color .36s ease; }
  .c-iwr  { border-color:rgba(139,26,26,0.18); transition: border-color .36s ease; }
  .c-svg  { stroke:#8B1A1A; transition: stroke .36s ease; }
  .c-bar  { background:#8B1A1A; transition: opacity .36s ease; }
  .c-cta  { color:#8B1A1A; border:1px solid rgba(139,26,26,0.22); background:transparent; cursor:pointer; outline:none; transition:color .36s ease,border-color .36s ease; }
  .c-arr  { display:inline-block; transition: transform .36s ease; }

  .fcard:hover .c-num  { color: rgba(255,255,255,0.07)!important; }
  .fcard:hover .c-lbl  { color: rgba(255,200,200,0.66)!important; }
  .fcard:hover .c-div  { background: rgba(255,255,255,0.16)!important; }
  .fcard:hover .c-head { color: white!important; }
  .fcard:hover .c-ital { color: #FFBBBB!important; }
  .fcard:hover .c-desc { color: rgba(255,215,215,0.72)!important; }
  .fcard:hover .c-iwr  { border-color: rgba(255,255,255,0.22)!important; }
  .fcard:hover .c-svg  { stroke: rgba(255,200,200,0.82)!important; }
  .fcard:hover .c-bar  { opacity:0; }
  .fcard:hover .c-cta  { color:white!important; border-color:rgba(255,255,255,0.28)!important; }
  .fcard:hover .c-arr  { transform: translateX(5px); }

  .at { transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease; cursor:pointer; overflow:hidden; }
  .at:hover { transform:scale(1.04); box-shadow:0 20px 50px rgba(139,26,26,.2)!important; }
  .at .ao { opacity:0; transition:opacity .4s ease; backdrop-filter:blur(4px); }
  .at:hover .ao { opacity:1; }

  .at-info { transition:all .3s ease; }
  .at:hover .at-info { transform:translateY(-4px); }

  .at-btn { transition:all .3s cubic-bezier(.22,1,.36,1); }
  .at:hover .at-btn { background:white; color:CR; transform:scale(1.05); }

  .nl { transition:opacity .2s ease; cursor:pointer; background:none; border:none; outline:none; font-family:inherit; }
  .nl:hover { opacity:.72; }

  .btn-gallery {
    background-color: #C0392B;
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .btn-gallery:hover {
    background-color: #A93226;
  }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#F5F0E8; }
  ::-webkit-scrollbar-thumb { background:#8B1A1A; border-radius:3px; }
`;

const DATA = {
  en: {
    lbl: 'CHITROKOTHON', t1: 'Artwork', t2: 'Gallery',
    desc: 'Artwork by our community, created in the spirit of saving lives.',
    back: '← Back', all: 'View Full Gallery',
    artworkLabel: 'ARTWORK',
    viewArtwork: 'View Artwork',
    arts: [],
  },
  bn: {
    lbl: 'চিত্রকথন', t1: 'শিল্পকর্ম', t2: 'গ্যালারি',
    desc: 'জীবন বাঁচানোর অনুপ্রেরণায় আমাদের সম্প্রদায়ের শিল্পকর্ম।',
    back: '← ফিরুন', all: 'পূর্ণ গ্যালারি দেখুন',
    artworkLabel: 'শিল্পকর্ম',
    viewArtwork: 'শিল্প দেখুন',
    arts: [],
  },
};

const SLabel = ({ label, dark }: { label: string; dark?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
    <div style={{ width: 22, height: 1, background: dark ? 'rgba(255,110,110,0.42)' : CR }} />
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase',
      color: dark ? 'rgba(255,170,170,0.78)' : CR
    }}>{label}</span>
  </div>
);

function PageHero({ bg, label, t1, t2, desc, back }: any) {
  return (
    <div style={{ background: bg, padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 260, height: 260, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', transform: 'translate(28%,-28%)'
      }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <Link href="/" className="nl"
          style={{ color: 'rgba(255,210,210,0.72)', fontSize: 11, marginBottom: 20, display: 'block', textDecoration: 'none' }}>
          {back}
        </Link>
        <SLabel label={label} dark />
        <h1 style={{ fontFamily: HF, fontSize: 'clamp(30px,5vw,58px)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
          {t1} <em style={{ fontStyle: 'italic', color: '#FFD0D0' }}>{t2}</em>
        </h1>
        <p style={{ color: 'rgba(255,215,215,0.72)', fontSize: 14, marginTop: 10, maxWidth: 520 }}>{desc}</p>
      </div>
    </div>
  );
}

function ArtTile({ a, i, d }: any) {
  return (
    <div className={`fcard u${(i % 2) + 1}`}
      style={{ flex: '1 1 280px', maxWidth: 360, boxShadow: '0 8px 34px rgba(0,0,0,0.30)' }}>
      <div className="c-bar" style={{ height: 3, borderRadius: '18px 18px 0 0' }} />
      <div className="fbody" style={{ padding: '40px 34px 42px', position: 'relative' }}>
        <div className="c-num" style={{
          fontFamily: HF, fontSize: 96, fontWeight: 900, lineHeight: 1,
          position: 'absolute', top: 8, right: 16, letterSpacing: '-0.05em',
          userSelect: 'none', pointerEvents: 'none',
          color: 'rgba(139,26,26,0.055)',
        }}>{i + 1}</div>
        <div className="c-iwr" style={{
          width: 56, height: 56, borderRadius: '50%', border: '1px solid',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
          background: a.g
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="c-lbl" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{d.artworkLabel}</span>
          <div className="c-div" style={{ flex: 1, height: 1 }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <span className="c-head" style={{ fontFamily: HF, fontSize: 27, fontWeight: 900, display: 'block', lineHeight: 1.18 }}>{a.title}</span>
          <em className="c-ital" style={{ fontFamily: HF, fontSize: 27, fontWeight: 700, display: 'block', lineHeight: 1.18 }}>{a.artist}</em>
        </div>
        <p className="c-desc" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 30 }}>{a.desc}</p>
        <button className="c-cta" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', padding: '10px 22px', borderRadius: 8 }}>
          {d.viewArtwork} <span className="c-arr">→</span>
        </button>
      </div>
    </div>
  );
}

export default function IllustrationsPage() {
  const { language } = useLanguage();
  // Safe fallback: if `language` ever returns something other than 'en'/'bn'
  // (e.g. during initial hydration), default to English instead of crashing.
  const d = DATA[language as keyof typeof DATA] || DATA.en;
  const bf = language === 'bn' ? "'Noto Serif Bengali',sans-serif" : "'DM Sans',sans-serif";

  return (
    <div style={{ fontFamily: bf, background: CREAM, minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pi">
        <PageHero
          bg={`linear-gradient(148deg,${CR} 0%,${LCR} 100%)`}
          label={d.lbl} t1={d.t1} t2={d.t2} desc={d.desc} back={d.back}
        />
        <div style={{ background: CREAM, minHeight: '55vh' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
            {/* Section Header */}
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <SLabel label={d.all} dark={false} />
                <h2 style={{ fontFamily: HF, fontSize: 32, fontWeight: 900, color: DK, lineHeight: 1.2 }}>
                  {d.t1} <em style={{ fontStyle: 'italic', color: CR }}>{d.t2}</em>
                </h2>
                <div style={{ width: 60, height: 3, background: `linear-gradient(90deg,${CR},${LCR})`, marginTop: 16 }} />
              </div>
              <button
                className="btn-gallery"
                style={{
                  backgroundColor: '#C0392B',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 500,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A93226'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C0392B'}
              >
                {d.all} →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
              {d.arts.map((a: any, i: number) => (
                <ArtTile key={i} a={a} i={i} d={d} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
