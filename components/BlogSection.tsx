"use client";

import { useState, useEffect, useRef } from "react";

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

  /* Blog cards */
  .rk-bcard {
    background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(139,26,26,0.07);
    transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease;
    cursor: pointer; position: relative;
  }
  .rk-bcard:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(139,26,26,0.16); }
  .rk-bcard .rk-read { opacity:0; transform:translateX(-6px); transition: opacity .28s ease, transform .28s ease; }
  .rk-bcard:hover .rk-read { opacity:1; transform:translateX(0); }

  /* Misc */
  .rk-ob { transition: all .25s ease; cursor:pointer; outline:none; }
  .rk-ob:hover { background: ${CR} !important; color: white !important; border-color: ${CR} !important; }
  .rk-cb { transition: all .25s ease; cursor:pointer; border:none; outline:none; }
  .rk-cb:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 36px rgba(139,26,26,0.45) !important; }
  .rk-nl { background:none; border:none; outline:none; cursor:pointer; transition: opacity .2s ease; }
  .rk-nl:hover { opacity:.7; }

  .rk-tag { display:inline-block; font-size:9px; font-weight:800; letter-spacing:.12em;
    text-transform:uppercase; padding:4px 12px; border-radius:20px; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:${CREAM}; }
  ::-webkit-scrollbar-thumb { background:${CR}; border-radius:2px; }
`;

const TAG_C = {
  Health:'#1A7A40', News:'#1A508B', Community:'#8B5A1A', Education:'#5A1A8B',
  'স্বাস্থ্য':'#1A7A40','সংবাদ':'#1A508B','সম্প্রদায়':'#8B5A1A','শিক্ষা':'#5A1A8B'
};

/* ════════════════════════════════════════════
   SECTION 1 — BLOG  (Magazine grid layout)
════════════════════════════════════════════ */
export function BlogSection({ data, onSeeAll }) {
  const [ref, vis] = useInView();
  const posts = data.posts;

  // Handle empty posts
  if (!posts || posts.length === 0) {
    return (
      <section ref={ref} style={{ background: DCREAM, padding:'80px 24px', overflow:'hidden' }}>
        <style dangerouslySetInnerHTML={{ __html: CSS }}/>
        <div style={{ maxWidth:1140, margin:'0 auto', textAlign:'center' }}>
          <div className={`rk-reveal ${vis?'rk-vis':''}`}
            style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              marginBottom:48, flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:28, height:2, background:CR, borderRadius:1 }}/>
                <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.28em',
                  textTransform:'uppercase', color:CR }}>{data.lbl}</span>
              </div>
              <h2 style={{ fontFamily:HF, fontSize:'clamp(28px,3.5vw,46px)',
                fontWeight:900, color:DK, lineHeight:1.1 }}>
                {data.t1}{' '}
                <em style={{ color:CR, fontStyle:'italic' }}>{data.t2}</em>
              </h2>
              <p style={{ color:WM, fontSize:13.5, marginTop:8, maxWidth:400 }}>{data.desc}</p>
            </div>
            <button className="rk-ob"
              onClick={onSeeAll}
              style={{ border:`1.5px solid ${CR}`, color:CR, padding:'10px 26px',
                borderRadius:10, fontSize:11, fontWeight:700, background:'transparent',
                whiteSpace:'nowrap', letterSpacing:'.06em' }}>
              {data.all}
            </button>
          </div>
          <div style={{ padding:'60px 20px', background:'white', borderRadius:20, marginTop:40 }}>
            <p style={{ color:WM, fontSize:16, marginBottom:16 }}>
              No blog posts yet. Be the first to share your story!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const featured = posts[0];
  const side = posts.slice(1, 4);

  return (
    <section ref={ref} style={{ background: DCREAM, padding:'80px 24px', overflow:'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div style={{ maxWidth:1140, margin:'0 auto' }}>

        {/* Header row */}
        <div className={`rk-reveal ${vis?'rk-vis':''}`}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end',
            marginBottom:48, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:28, height:2, background:CR, borderRadius:1 }}/>
              <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.28em',
                textTransform:'uppercase', color:CR }}>{data.lbl}</span>
            </div>
            <h2 style={{ fontFamily:HF, fontSize:'clamp(28px,3.5vw,46px)',
              fontWeight:900, color:DK, lineHeight:1.1 }}>
              {data.t1}{' '}
              <em style={{ color:CR, fontStyle:'italic' }}>{data.t2}</em>
            </h2>
            <p style={{ color:WM, fontSize:13.5, marginTop:8, maxWidth:400 }}>{data.desc}</p>
          </div>
          <button className="rk-ob"
            onClick={onSeeAll}
            style={{ border:`1.5px solid ${CR}`, color:CR, padding:'10px 26px',
              borderRadius:10, fontSize:11, fontWeight:700, background:'transparent',
              whiteSpace:'nowrap', letterSpacing:'.06em' }}>
            {data.all}
          </button>
        </div>

        {/* Magazine grid: featured left + 3 stacked right */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}
          className={`rk-reveal ${vis?'rk-vis':''}`} >

          {/* Featured post — tall card */}
          <div className="rk-bcard" style={{ height:'100%', borderLeft:`5px solid ${CR}` }}>
            {/* Colour bar header */}
            <div style={{ height:8,
              background:`linear-gradient(90deg,${CR} 0%,${LCR} 60%,#D04040 100%)` }}/>
            <div style={{ padding:'32px 34px 36px' }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:20 }}>
                <span style={{ fontSize:10, color:WM, letterSpacing:'.04em' }}>{featured.date}</span>
                <span className="rk-tag"
                  style={{ background:`${TAG_C[featured.tag]||CR}16`, color:TAG_C[featured.tag]||CR }}>
                  {featured.tag}
                </span>
              </div>
              {/* Large drop-cap style number */}
              <div style={{ fontFamily:HF, fontSize:120, fontWeight:900, lineHeight:.9,
                color:`${CR}09`, marginBottom:-20, userSelect:'none' }}>01</div>
              <h3 style={{ fontFamily:HF, fontSize:'clamp(22px,2.5vw,30px)',
                fontWeight:900, color:DK, lineHeight:1.25, marginBottom:18, position:'relative', zIndex:1 }}>
                {featured.title}
              </h3>
              <p style={{ fontSize:14, color:WM, lineHeight:1.75, marginBottom:28 }}>{featured.ex}</p>
              <div style={{ display:'flex', alignItems:'center', gap:12,
                borderTop:`1px solid ${CR}18`, paddingTop:20 }}>
                <div style={{ width:38, height:38, borderRadius:'50%',
                  background:`linear-gradient(135deg,${CR},${LCR})`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <span className="rk-read rk-nl" style={{ color:CR, fontSize:12, fontWeight:700 }}>
                  {data.more}
                </span>
              </div>
            </div>
          </div>

          {/* 3 stacked side posts */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {side.map((p, i) => (
              <div key={i} className="rk-bcard"
                style={{ borderTop:`3px solid ${TAG_C[p.tag]||CR}` }}>
                <div style={{ padding:'22px 26px 24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontSize:9, color:WM }}>{p.date}</span>
                    <span className="rk-tag"
                      style={{ background:`${TAG_C[p.tag]||CR}14`, color:TAG_C[p.tag]||CR }}>
                      {p.tag}
                    </span>
                  </div>
                  <h4 style={{ fontFamily:HF, fontSize:17, fontWeight:700,
                    color:DK, lineHeight:1.3, marginBottom:8 }}>{p.title}</h4>
                  <p style={{ fontSize:12.5, color:WM, lineHeight:1.65, marginBottom:14 }}>{p.ex}</p>
                  <span className="rk-read rk-nl" style={{ color:CR, fontSize:11, fontWeight:700 }}>
                    {data.more}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
