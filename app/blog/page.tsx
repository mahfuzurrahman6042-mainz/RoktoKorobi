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

  @media (max-width: 768px) {
    div[style*="padding:'60px 24px'"] {
      padding: 40px 16px !important;
    }
    
    div[style*="padding:'48px 24px'"] {
      padding: 32px 16px !important;
    }
    
    div[style*="gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))'"] {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    
    .fbody {
      padding: 24px 20px 28px !important;
    }
    
    .c-num {
      font-size: 64px !important;
      top: 4px !important;
      right: 12px !important;
    }
    
    span[style*="fontFamily:HF,fontSize:27"] {
      font-size: 20px !important;
    }
    
    p.c-desc {
      font-size: 12px !important;
      margin-bottom: 20px !important;
    }
    
    button.c-cta {
      padding: 8px 16px !important;
      font-size: 10px !important;
    }
    
    h1[style*="clamp(30px,5vw,58px)"] {
      font-size: 28px !important;
    }
    
    h2[style*="fontSize:32"] {
      font-size: 24px !important;
    }
  }

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

  .pc { transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; cursor:pointer; }
  .pc:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(139,26,26,.18)!important; }
  
  .pc-top { transition:height .4s cubic-bezier(.22,1,.36,1); }
  .pc:hover .pc-top { height:8px; }
  
  .pc-tag { transition:all .3s ease; }
  .pc:hover .pc-tag { transform:scale(1.05); }
  
  .pc-btn { transition:all .3s cubic-bezier(.22,1,.36,1); }
  .pc:hover .pc-btn { background:CR; color:white; border-color:CR; transform:translateX(4px); }

  .nl { transition:opacity .2s ease; cursor:pointer; background:none; border:none; outline:none; font-family:inherit; }
  .nl:hover { opacity:.72; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#F5F0E8; }
  ::-webkit-scrollbar-thumb { background:#8B1A1A; border-radius:3px; }
`;

const DATA = {
  en: {
    lbl:'BLOG', t1:'Latest', t2:'Posts',
    desc:'Discover articles, guides, and stories about blood donation.',
    more:'Read More →', back:'← Back', all:'See All Posts',
    posts:[],
  },
  bn: {
    lbl:'ব্লগ', t1:'সর্বশেষ', t2:'পোস্ট',
    desc:'রক্তদান বিষয়ক নিবন্ধ, গাইড ও গল্প আবিষ্কার করুন।',
    more:'আরও পড়ুন →', back:'← ফিরুন', all:'সব পোস্ট দেখুন',
    posts:[],
  },
};

const TAG_C = { Health:'#1A7A40',News:'#1A508B',Community:'#8B5A1A',Education:'#5A1A8B',
  'স্বাস্থ্য':'#1A7A40','সংবাদ':'#1A508B','সম্প্রদায়':'#8B5A1A','শিক্ষা':'#5A1A8B' };

const SLabel = ({ label, dark }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
    <div style={{ width:22, height:1, background: dark ? 'rgba(255,110,110,0.42)' : CR }}/>
    <span style={{ fontSize:9, fontWeight:800, letterSpacing:'0.26em', textTransform:'uppercase',
      color: dark ? 'rgba(255,170,170,0.78)' : CR }}>{label}</span>
  </div>
);

function PageHero({ bg, label, t1, t2, desc, back }) {
  return (
    <div style={{ background:bg,padding:'60px 24px',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,right:0,width:260,height:260,borderRadius:'50%',
        background:'rgba(255,255,255,0.05)',transform:'translate(28%,-28%)' }}/>
      <div style={{ maxWidth:1100,margin:'0 auto',position:'relative' }}>
        <Link href="/" className="nl"
          style={{ color:'rgba(255,210,210,0.72)',fontSize:11,marginBottom:20,display:'block',textDecoration:'none' }}>
          {back}
        </Link>
        <SLabel label={label} dark/>
        <h1 style={{ fontFamily:HF,fontSize:'clamp(30px,5vw,58px)',fontWeight:900,color:'white',lineHeight:1.1 }}>
          {t1} <em style={{ fontStyle:'italic',color:'#FFD0D0' }}>{t2}</em>
        </h1>
        <p style={{ color:'rgba(255,215,215,0.72)',fontSize:14,marginTop:10,maxWidth:520 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const { language } = useLanguage();
  const d = DATA[language];
  const bf = language === 'bn' ? "'Noto Serif Bengali',sans-serif" : "'DM Sans',sans-serif";

  return (
    <div style={{ fontFamily:bf,background:CREAM,minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="pi">
        <PageHero
          bg="linear-gradient(148deg,#3D0808 0%,#8B1A1A 65%,#9C2020 100%)"
          label={d.lbl} t1={d.t1} t2={d.t2} desc={d.desc} back={d.back}
        />
        <div style={{ background:CREAM,minHeight:'55vh' }}>
          <div style={{ maxWidth:1100,margin:'0 auto',padding:'48px 24px' }}>
            {/* Section Header */}
            <div style={{ marginBottom:40 }}>
              <SLabel label={d.all} dark={false}/>
              <h2 style={{ fontFamily:HF,fontSize:32,fontWeight:900,color:DK,lineHeight:1.2 }}>
                {d.t1} <em style={{ fontStyle:'italic',color:CR }}>{d.t2}</em>
              </h2>
              <div style={{ width:60,height:3,background:`linear-gradient(90deg,${CR},${LCR})`,marginTop:16 }}/>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24 }}>
              {d.posts.map((p, i) => (
                <div key={i} className={`fcard u${(i%2)+1}`}
                  style={{ flex:'1 1 280px',maxWidth:360,boxShadow:'0 8px 34px rgba(0,0,0,0.30)' }}>
                  <div className="c-bar" style={{ height:3,borderRadius:'18px 18px 0 0' }}/>
                  <div className="fbody" style={{ padding:'40px 34px 42px',position:'relative' }}>
                    <div className="c-num" style={{
                      fontFamily:HF,fontSize:96,fontWeight:900,lineHeight:1,
                      position:'absolute',top:8,right:16,letterSpacing:'-0.05em',
                      userSelect:'none',pointerEvents:'none',
                      color:'rgba(139,26,26,0.055)',
                    }}>{i+1}</div>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28 }}>
                      <span className="c-lbl" style={{ fontSize:9,fontWeight:800,letterSpacing:'0.26em',textTransform:'uppercase',whiteSpace:'nowrap' }}>{p.tag}</span>
                      <span style={{ fontSize:10,color:WM,fontWeight:600,letterSpacing:'0.02em' }}>{p.date}</span>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <span className="c-head" style={{ fontFamily:HF,fontSize:27,fontWeight:900,display:'block',lineHeight:1.18 }}>{p.title}</span>
                    </div>
                    <p className="c-desc" style={{ fontSize:13,lineHeight:1.7,marginBottom:30 }}>{p.ex}</p>
                    <button className="c-cta" style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 22px',borderRadius:8 }}>
                      {d.more} <span className="c-arr">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
