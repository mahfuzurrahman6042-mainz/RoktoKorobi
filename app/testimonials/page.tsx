"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTestimonials, useTestimonialActions } from "@/hooks/useTestimonial";
import { getAuth } from "firebase/auth";
import { auth } from "@/lib/firebase";

const CR = '#8B1A1A', LCR = '#C41E3A', CREAM = '#F5F0E8', DCREAM = '#EDE0CF', DK = '#1A0808', WM = '#6B5045';
const HF = "'Playfair Display', serif";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Noto+Serif+Bengali:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes throb   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }

  .u1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .00s both}
  .u2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .12s both}
  .u3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .22s both}
  .u4{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .32s both}
  .pi    { animation: fadeIn .38s ease both; }
  .throb { animation: throb 2.6s ease-in-out infinite; }

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

  .sc { transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease; }
  .sc:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(139,26,26,.18)!important; }
  
  .sc-quote { transition:all .3s ease; }
  .sc:hover .sc-quote { color:CR; transform:scale(1.05); }
  
  .sc-avatar { transition:all .3s cubic-bezier(.22,1,.36,1); }
  .sc:hover .sc-avatar { transform:scale(1.1); box-shadow:0 6px 20px rgba(139,26,26,.3); }
  
  .sc-badge { transition:all .3s ease; }
  .sc:hover .sc-badge { transform:scale(1.08); }

  .nl { transition:opacity .2s ease; cursor:pointer; background:none; border:none; outline:none; font-family:inherit; }
  .nl:hover { opacity:.72; }
  .cb { transition:all .25s ease; cursor:pointer; border:none; outline:none; }
  .cb:hover { transform:translateY(-2px); filter:brightness(1.08); }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#F5F0E8; }
  ::-webkit-scrollbar-thumb { background:#8B1A1A; border-radius:3px; }
`;

const DATA = {
  en: {
    lbl:'TESTIMONIALS', t1:'RoktoKorobi', t2:'Experience',
    desc:'Real, moving stories from donors and patients touched by the gift of blood.',
    back:'← Back', seeAll:'See All Stories →',
    stats:[{n:'0',l:'Donors'},{n:'0',l:'Lives Saved'},{n:'0',l:'Stories'}],
    shareCta:'Share Your Story',
    stories:[],
  },
  bn: {
    lbl:'অভিজ্ঞতা', t1:'রক্তকরবী', t2:'অভিজ্ঞতা',
    desc:'দাতা ও রোগীদের হৃদয়ছোঁয়া সত্যিকারের গল্প যারা রক্তের উপহার দ্বারা ছুঁয়ে গেছেন।',
    back:'← ফিরুন', seeAll:'সব গল্প দেখুন →',
    stats:[{n:'০',l:'দাতা'},{n:'০',l:'জীবন রক্ষা'},{n:'০',l:'গল্প'}],
    shareCta:'আপনার গল্প শেয়ার করুন',
    stories:[],
  },
};

const SLabel = ({ label, dark }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
    <div style={{ width:22, height:1, background: dark ? 'rgba(255,110,110,0.42)' : CR }}/>
    <span style={{ fontSize:9, fontWeight:800, letterSpacing:'0.26em', textTransform:'uppercase',
      color: dark ? 'rgba(255,170,170,0.78)' : CR }}>{label}</span>
  </div>
);

function PageHero({ bg, label, t1, t2, desc, back, stats }) {
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
        {stats && (
          <div style={{ display:'flex',gap:40,marginTop:40,flexWrap:'wrap' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ borderLeft:'2px solid rgba(196,30,58,0.4)',paddingLeft:18 }}>
                <div style={{ fontFamily:HF,fontSize:26,fontWeight:900,color:'#FF9090' }}>{s.n}</div>
                <div style={{ fontSize:11,color:'rgba(255,200,200,0.5)',marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCard({ s, i, currentUser, onDelete, onEdit }) {
  const isOwner = currentUser && s.email === currentUser.email;

  return (
    <div className={`fcard u${(i%2)+1}`}
      style={{ flex:'1 1 280px',maxWidth:360,boxShadow:'0 8px 34px rgba(0,0,0,0.30)' }}>
      <div className="c-bar" style={{ height:3,borderRadius:'18px 18px 0 0' }}/>
      <div className="fbody" style={{ padding:'40px 34px 42px',position:'relative' }}>
        <div className="c-num" style={{
          fontFamily:HF,fontSize:96,fontWeight:900,lineHeight:1,
          position:'absolute',top:8,right:16,letterSpacing:'-0.05em',
          userSelect:'none',pointerEvents:'none',
          color:'rgba(139,26,26,0.055)',
        }}>{i+1}</div>
        <div className="c-iwr" style={{
          width:56,height:56,borderRadius:'50%',border:'1px solid',
          display:'flex',alignItems:'center',justifyContent:'center',marginBottom:28,
          background:`linear-gradient(135deg,${s.c},${s.c}88)`
        }}>
          <span style={{ fontSize:18,fontWeight:700,color:'white' }}>{s.ini}</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
          <span className="c-lbl" style={{ fontSize:9,fontWeight:800,letterSpacing:'0.26em',textTransform:'uppercase',whiteSpace:'nowrap' }}>{s.badge}</span>
          <div className="c-div" style={{ flex:1,height:1 }}/>
        </div>
        <div style={{ marginBottom:14 }}>
          <span className="c-head" style={{ fontFamily:HF,fontSize:27,fontWeight:900,display:'block',lineHeight:1.18 }}>{s.name}</span>
          <em className="c-ital" style={{ fontFamily:HF,fontSize:27,fontWeight:700,display:'block',lineHeight:1.18 }}>{s.role}</em>
        </div>
        <p className="c-desc" style={{ fontSize:13,lineHeight:1.7,marginBottom:30,fontStyle:'italic' }}>{s.q}</p>
        <div style={{ display:'flex',gap:8 }}>
          <button className="c-cta" style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 22px',borderRadius:8 }}>
            Read Story <span className="c-arr">→</span>
          </button>
          {isOwner && (
            <>
              <button 
                onClick={() => onEdit(s)}
                style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 16px',borderRadius:8,border:'1px solid #8B1A1A',background:'transparent',color:'#8B1A1A',cursor:'pointer' }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(s.id)}
                style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 16px',borderRadius:8,border:'1px solid #dc2626',background:'transparent',color:'#dc2626',cursor:'pointer' }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const [lang, setLang] = useState('en');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { testimonials, loading } = useTestimonials();
  const { deleteTestimonial } = useTestimonialActions();
  const router = useRouter();
  const d = DATA[lang];
  const bf = lang === 'bn' ? `'Noto Serif Bengali', sans-serif` : `'DM Sans', sans-serif`;

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি এই সাক্ষ্য মুছে ফেলতে চান?' : 'Are you sure you want to delete this testimonial?')) {
      await deleteTestimonial(id);
    }
  };

  const handleEdit = (testimonial: any) => {
    // Navigate to edit page or open modal
    console.log('Edit testimonial:', testimonial);
  };

  // Only show user-submitted testimonials
  const allStories = testimonials.filter(t => t.approved).map((t, i) => ({
    ini: t.name.charAt(0).toUpperCase(),
    name: t.name,
    role: 'Donor',
    q: t.testimonial,
    badge: `${t.rating} Stars`,
    c: CR,
    id: t.id,
    email: t.email,
    isStatic: false
  }));

  // Dynamic stats based on real data
  const dynamicStats = [
    { n: allStories.length.toString(), l: lang === 'bn' ? 'গল্প' : 'Stories' },
    { n: '0', l: lang === 'bn' ? 'দাতা' : 'Donors' },
    { n: '0', l: lang === 'bn' ? 'জীবন রক্ষা' : 'Lives Saved' }
  ];

  return (
    <div style={{ fontFamily:bf,background:CREAM,minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="pi">
        <PageHero
          bg="linear-gradient(155deg,#4A0A0A 0%,#6B1010 55%,#8B1A1A 100%)"
          label={d.lbl} t1={d.t1} t2={d.t2} desc={d.desc} back={d.back}
          stats={dynamicStats}
        />
        <div style={{ background:'white',minHeight:'55vh' }}>
          <div style={{ maxWidth:1100,margin:'0 auto',padding:'48px 24px' }}>
            {/* Section Header */}
            <div style={{ marginBottom:40 }}>
              <SLabel label={d.seeAll} dark={false}/>
              <h2 style={{ fontFamily:HF,fontSize:32,fontWeight:900,color:DK,lineHeight:1.2 }}>
                {d.t1} <em style={{ fontStyle:'italic',color:CR }}>{d.t2}</em>
              </h2>
              <div style={{ width:60,height:3,background:`linear-gradient(90deg,${CR},${LCR})`,marginTop:16 }}/>
            </div>
            {loading ? (
              <div style={{ textAlign:'center',padding:40 }}>
                <p style={{ color:WM }}>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</p>
              </div>
            ) : (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24 }}>
                {allStories.map((s, i) => (
                  <StoryCard 
                    key={s.id || i} 
                    s={s} 
                    i={i} 
                    currentUser={currentUser}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}

            {/* Share CTA */}
            <div style={{ marginTop:56,padding:'52px 40px',
              background:'linear-gradient(155deg,#4A0A0A,#6B1010)',
              borderRadius:22,position:'relative',overflow:'hidden',textAlign:'center' }}>
              <div style={{ position:'absolute',inset:0,
                background:'radial-gradient(ellipse at 50% 115%,rgba(196,30,58,0.2),transparent 65%)',
                pointerEvents:'none' }}/>
              <div className="throb" style={{ fontSize:34,marginBottom:16 }}>❤️</div>
              <h3 style={{ fontFamily:HF,fontSize:26,fontWeight:900,color:'white',marginBottom:10 }}>
                Have a Story to Share?
              </h3>
              <p style={{ color:'rgba(255,200,200,0.55)',fontSize:13,marginBottom:28 }}>
                Your experience could inspire others to donate and save lives.
              </p>
              <button
                onClick={() => router.push('/share-testimonial')}
                className="cb"
                style={{ background:CR,color:'white',padding:'13px 50px',borderRadius:30,
                  fontSize:12,fontWeight:700,letterSpacing:'0.08em',
                  boxShadow:'0 8px 30px rgba(139,26,26,0.52)',border:'none',cursor:'pointer',
                  transition:'all 0.25s ease',textDecoration:'none',display:'inline-block',position:'relative',zIndex:1 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,26,26,0.65)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,26,26,0.52)';
                }}>
                {d.shareCta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
