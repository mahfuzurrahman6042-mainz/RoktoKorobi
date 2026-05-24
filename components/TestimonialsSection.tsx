"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTestimonials } from "@/hooks/useTestimonial";

const CR = '#8B1A1A', LCR = '#C41E3A';
const CREAM = '#F5F0E8', DCREAM = '#EDE0CF';
const DK = '#1A0808', WM = '#6B5045';
const HF = "'Playfair Display', serif";

/* ── Intersection observer hook ── */
function useInView(threshold = 0.15): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=Noto+Serif+Bengali:wght@400;600;700&display=swap');

  @keyframes rk-up   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rk-left { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes rk-in   { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  @keyframes rk-line { from{width:0} to{width:100%} }
  @keyframes rk-throb { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }

  .rk-reveal { opacity:0; }
  .rk-reveal.rk-vis { animation: rk-up .72s cubic-bezier(.22,1,.36,1) both; }

  /* Story cards */
  .rk-scard {
    border-radius: 22px; cursor: pointer; position: relative; overflow: hidden;
    transition: transform .38s cubic-bezier(.22,1,.36,1), box-shadow .38s ease;
  }
  .rk-scard:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.5) !important; }
  .rk-scard .rk-sqmark { transition: transform .38s ease, opacity .38s ease; }
  .rk-scard:hover .rk-sqmark { transform: scale(1.15) translateY(-4px); opacity:.22; }

  /* Misc */
  .rk-ob { transition: all .25s ease; cursor:pointer; outline:none; }
  .rk-ob:hover { background: ${CR} !important; color: white !important; border-color: ${CR} !important; }
  .rk-cb { transition: all .25s ease; cursor:pointer; border:none; outline:none; }
  .rk-cb:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 36px rgba(139,26,26,0.45) !important; }
  .rk-nl { background:none; border:none; outline:none; cursor:pointer; transition: opacity .2s ease; }
  .rk-nl:hover { opacity:.7; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:${CREAM}; }
  ::-webkit-scrollbar-thumb { background:${CR}; border-radius:2px; }
`;

/* ════════════════════════════════════════════
   SECTION 3 — TESTIMONIALS  (Glassmorphism dark)
════════════════════════════════════════════ */
function StoryCard({ s, delay = 0, vis }) {
  return (
    <div className={`rk-scard rk-reveal ${vis?'rk-vis':''}`}
      style={{ animationDelay:`${delay}s`,
        background:'white',
        border:`1px solid rgba(139,26,26,0.1)`,
        padding:'34px 36px 32px',
        boxShadow:'0 6px 28px rgba(139,26,26,0.08)' }}>

      {/* Giant quote mark */}
      <div className="rk-sqmark" style={{
        fontFamily:HF, fontSize:120, lineHeight:.8,
        color:s.c, opacity:.07,
        position:'absolute', top:10, left:18,
        userSelect:'none', pointerEvents:'none',
      }}>❝</div>

      {/* Blood type accent bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
        borderRadius:'22px 22px 0 0',
        background:`linear-gradient(90deg,${s.c},transparent)` }}/>

      <div style={{ paddingTop:28, position:'relative' }}>
        {/* Quote text */}
        <p style={{ fontSize:14, lineHeight:1.82, fontStyle:'italic',
          color:DK, marginBottom:28 }}>
          "{s.q}"
        </p>

        {/* Author row */}
        <div style={{ display:'flex', alignItems:'center', gap:14,
          borderTop:`1px solid rgba(139,26,26,0.1)`, paddingTop:20 }}>
          {/* Avatar */}
          <div style={{ width:50, height:50, borderRadius:'50%', flexShrink:0,
            background:`linear-gradient(135deg,${s.c} 0%,${s.c}66 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, fontWeight:700, color:'white',
            boxShadow:`0 4px 18px ${s.c}50` }}>
            {s.ini}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, color:DK, marginBottom:3 }}>{s.name}</div>
            <div style={{ fontSize:11, color:WM }}>{s.role}</div>
          </div>
          {/* Badge */}
          <div style={{ flexShrink:0, background:s.c,
            padding:'5px 14px', borderRadius:20,
            fontSize:9, color:'white', fontWeight:800,
            letterSpacing:'.08em', textTransform:'uppercase',
            boxShadow:`0 4px 14px ${s.c}44` }}>
            {s.badge}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ data, onSeeAll }) {
  const [ref, vis] = useInView();
  const { testimonials, loading } = useTestimonials();

  // Combine static stories with user-submitted testimonials (approved only)
  const allStories = [
    ...data.stories,
    ...testimonials.filter(t => t.approved).map(t => ({
      ini: t.name.charAt(0).toUpperCase(),
      name: t.name,
      role: 'Donor',
      q: t.testimonial,
      badge: `${t.rating} Stars`,
      c: CR
    }))
  ];

  // Display first 2 stories (prioritize user-submitted)
  const featuredStories = allStories.slice(0, 2);

  return (
    <section ref={ref}
      style={{ padding:'80px 24px',
        background:DCREAM,
        overflow:'hidden', position:'relative' }}>
      <style>{`
        @media (max-width: 768px) {
          section {
            padding: 60px 16px !important;
          }
          
          .rk-reveal > div[style*="flex"] {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .rk-scard {
            padding: 24px 20px !important;
          }
          
          .rk-scard p {
            font-size: 13px !important;
          }
          
          .rk-scard .rk-sqmark {
            font-size: 80px !important;
            top: 8px !important;
            left: 12px !important;
          }
        }
      `}</style>

      {/* Ambient */}
      <div style={{ position:'absolute', top:'15%', right:'8%',
        width:400, height:400, borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(circle,rgba(139,26,26,0.06),transparent 70%)' }}/>
      <div style={{ position:'absolute', bottom:'5%', left:'2%',
        width:320, height:320, borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(circle,rgba(139,26,26,0.04),transparent 70%)' }}/>

      <div style={{ maxWidth:1140, margin:'0 auto', position:'relative' }}>

        {/* Stats bar */}
        <div className={`rk-reveal ${vis?'rk-vis':''}`}
          style={{ display:'flex', gap:0, marginBottom:56,
            background:'white',
            border:`1px solid rgba(139,26,26,0.12)`,
            borderRadius:16, overflow:'hidden', flexWrap:'wrap',
            boxShadow:'0 4px 20px rgba(139,26,26,0.06)' }}>
          {data.stats.map((s, i) => (
            <div key={i} style={{ flex:'1 1 120px', textAlign:'center',
              padding:'20px 16px',
              borderRight: i < data.stats.length - 1 ? `1px solid rgba(139,26,26,0.1)` : 'none' }}>
              <div style={{ fontFamily:HF, fontSize:28, fontWeight:900,
                color:CR, lineHeight:1 }}>{s.n}</div>
              <div style={{ fontSize:10, color:WM,
                fontWeight:700, letterSpacing:'.18em',
                textTransform:'uppercase', marginTop:6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className={`rk-reveal ${vis?'rk-vis':''}`}
          style={{ display:'flex', justifyContent:'space-between',
            alignItems:'flex-end', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:28, height:2, background:CR, borderRadius:1 }}/>
              <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.28em',
                textTransform:'uppercase', color:CR }}>
                {data.lbl}
              </span>
            </div>
            <h2 style={{ fontFamily:HF, fontSize:'clamp(28px,3.5vw,46px)',
              fontWeight:900, color:DK, lineHeight:1.1 }}>
              {data.t1}{' '}
              <em style={{ color:CR, fontStyle:'italic' }}>{data.t2}</em>
            </h2>
            <p style={{ color:WM, fontSize:13.5, marginTop:8, maxWidth:440 }}>{data.desc}</p>
          </div>
        </div>

        {/* Story cards — 2 col responsive */}
        <div style={{ display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',
          gap:20, marginBottom:44 }}>
          {loading ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40 }}>
              <p style={{ color:WM }}>Loading...</p>
            </div>
          ) : (
            featuredStories.map((s, i) => (
              <StoryCard key={i} s={s} delay={i * 0.12} vis={vis}/>
            ))
          )}
        </div>

        {/* CTA row */}
        <div className={`rk-reveal ${vis?'rk-vis':''}`}
          style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
          <button className="rk-cb" onClick={onSeeAll}
            style={{ background:CR, color:'white',
              padding:'14px 52px', borderRadius:30,
              fontSize:12, fontWeight:700, letterSpacing:'.08em',
              boxShadow:'0 8px 32px rgba(139,26,26,0.48)' }}>
            {data.seeAll}
          </button>
          <Link href="/share-testimonial" className="rk-ob"
            style={{ border:'1.5px solid rgba(76,175,80,0.65)',
              color:'rgba(165,230,165,0.95)', padding:'14px 36px',
              borderRadius:30, fontSize:12, fontWeight:700,
              background:'transparent', letterSpacing:'.08em',
              transition:'all .25s ease', textDecoration:'none', display:'inline-block' }}>
            {data.shareCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
