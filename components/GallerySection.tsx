"use client";

import { useState, useRef, useEffect } from "react";

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

  /* Gallery tiles */
  .rk-atile { border-radius: 22px; overflow: hidden; cursor: pointer; position: relative;
    transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }
  .rk-atile:hover { transform: scale(1.03) translateY(-6px); box-shadow: 0 36px 80px rgba(0,0,0,0.45); }
  .rk-atile .rk-aover { opacity:0; transition: opacity .38s ease; }
  .rk-atile:hover .rk-aover { opacity:1; }
  .rk-atile .rk-azoom { transition: transform .5s cubic-bezier(.22,1,.36,1); }
  .rk-atile:hover .rk-azoom { transform: scale(1.06); }

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

  .rk-tag { display:inline-block; font-size:9px; font-weight:800; letter-spacing:.12em;
    text-transform:uppercase; padding:4px 12px; border-radius:20px; }

  .btn-gallery {
    background-color: #C0392B;
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  .btn-gallery:hover {
    background-color: #A93226;
  }

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
  const featured = posts[0];
  const side = posts.slice(1, 4);

  return (
    <section ref={ref} style={{ background: DCREAM, padding:'80px 24px', overflow:'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div style={{ maxWidth:1140, margin:'0 auto' }}>
        {/* Header row */}
        <div className={`rk-reveal ${vis?'rk-vis':''}`}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
            marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div style={{ textAlign:'left', flex:1, minWidth:'280px', display:'flex', flexDirection:'column', gap:'16px', alignItems:'flex-start' }}>
            <div className="section-label" style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'0' }}>
              <span className="label-red">{data.lbl.split(' ')[0]}</span>
              <span className="label-black">{data.lbl.split(' ')[1] || ''}</span>
            </div>
            <h2 className="section-heading" style={{ marginBottom:'0', marginTop:'0' }}>
              {data.t1} <span className="heading-red" style={{ fontStyle:'italic' }}>{data.t2}</span>
            </h2>
            <p style={{ fontSize:13, color:'#3D2314', maxWidth:400, marginTop:'0' }}>
              {data.desc}
            </p>
          </div>
          <button className="rk-ob"
            onClick={onSeeAll}
            style={{ border:`1.5px solid ${CR}`, color:CR, padding:'10px 26px',
              borderRadius:10, fontSize:11, fontWeight:700, background:'transparent',
              whiteSpace:'nowrap', letterSpacing:'.06em', alignSelf:'flex-start', flexShrink:0, marginTop:'0' }}>
            {data.all}
          </button>
        </div>

        {/* Magazine grid: featured left + 3 stacked right */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}
          className={`rk-reveal ${vis?'rk-vis':''}`}>
          <style>{`
            @media (max-width: 768px) {
              .rk-reveal > div[style*="grid"] {
                grid-template-columns: 1fr !important;
                gap: 16px !important;
              }
            }
          `}</style>

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
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={2} strokeLinecap="round">
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


/* ════════════════════════════════════════════
   SECTION 2 — CHITROKOTHON  (New horizontal scroll design)
════════════════════════════════════════════ */

function InkSplat({ size = 60, opacity = 0.06, style = {} }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}
      style={{ position: "absolute", opacity, pointerEvents: "none", ...style }}>
      <path d="M50,10 C60,5 80,15 85,30 C92,50 80,75 60,85 C40,95 15,85 8,65 C0,45 10,20 30,12 C38,8 45,12 50,10Z"
        fill="#8b1a1a" />
      <circle cx="75" cy="25" r="5" fill="#8b1a1a" />
      <circle cx="20" cy="70" r="3" fill="#8b1a1a" />
      <circle cx="80" cy="60" r="2" fill="#8b1a1a" />
    </svg>
  );
}

function ArtCard({ art, index, language }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ x: (y - 0.5) * 12, y: -(x - 0.5) * 12 });
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const title = language === 'bn' ? art.titleBn : art.title;
  const author = language === 'bn' ? art.authorBn : art.author;
  const quote = language === 'bn' ? art.quote : art.quoteEn;
  const num = language === 'bn' ? art.num : art.numEn;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        flexShrink: 0,
        width: "min(310px, 80vw)",
        borderRadius: "20px",
        overflow: "hidden",
        scrollSnapAlign: "center",
        cursor: "pointer",
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -14 : 0}px) scale(${hovered ? 1.02 : 1})`,
        transition: hovered ? "transform 0.08s linear" : "transform 0.7s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hovered
          ? `0 32px 70px -8px rgba(120,10,20,0.28), 0 0 0 1px rgba(160,40,40,0.12)` 
          : `0 6px 30px rgba(100,10,10,0.1), 0 2px 8px rgba(0,0,0,0.06)`,
        animation: `cardIn 0.8s cubic-bezier(0.23,1,0.32,1) ${index * 0.12}s both`,
        background: "#fff",
        position: "relative",
      }}
    >
      {/* Cursor glow */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(160,20,20,0.07) 0%, transparent 65%)`,
          pointerEvents: "none", borderRadius: 20,
        }} />
      )}

      {/* Art Area */}
      <div style={{
        height: 290,
        background: `radial-gradient(ellipse at 30% 20%, ${art.c3}77 0%, transparent 55%),
                     radial-gradient(ellipse at 80% 80%, ${art.c1}99 0%, transparent 55%),
                     linear-gradient(160deg, ${art.c1} 0%, ${art.c2} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Scanlines */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
        }} />

        {/* Morphing blobs */}
        <div style={{
          position: "absolute", width: 220, height: 220,
          background: `radial-gradient(circle, ${art.c3} 0%, transparent 70%)`,
          filter: "blur(45px)", opacity: 0.8,
          top: "-10%", left: "-10%",
          animation: `blob${index % 2 === 0 ? "A" : "B"} ${6 + index}s ease-in-out infinite alternate`,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        }} />
        <div style={{
          position: "absolute", width: 160, height: 160,
          background: `radial-gradient(circle, ${art.c1} 0%, transparent 70%)`,
          filter: "blur(35px)", opacity: 0.65,
          bottom: "5%", right: "0%",
          animation: `blob${index % 2 === 0 ? "B" : "A"} ${7 + index}s ease-in-out infinite alternate`,
          borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%",
        }} />

        {/* Brush strokes */}
        <svg viewBox="0 0 310 290" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          opacity: 0.07, zIndex: 2,
        }}>
          <path d="M-10,160 Q80,60 180,140 Q250,200 330,110" stroke="white" strokeWidth="55"
            fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20,250 Q120,190 240,230" stroke="white" strokeWidth="25"
            fill="none" strokeLinecap="round"/>
          <path d="M200,20 Q260,60 290,40" stroke="white" strokeWidth="15"
            fill="none" strokeLinecap="round"/>
        </svg>

        {/* Ghost circle */}
        <div style={{
          position: "absolute", width: 180, height: 180,
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "50%", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", zIndex: 2,
        }} />

        {/* Ghost number */}
        <div style={{
          position: "absolute", bottom: -25, right: -5,
          fontSize: 160, fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
          fontWeight: 700, color: "rgba(255,255,255,0.04)",
          lineHeight: 1, userSelect: "none", pointerEvents: "none", zIndex: 3,
        }}>
          {num}
        </div>

        {/* Badge */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px", padding: "3px 10px",
          fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
          fontSize: 11, color: "rgba(255,210,210,0.7)",
          letterSpacing: "1px", zIndex: 4,
        }}>
          {num} / 04
        </div>

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 5,
          background: "rgba(8,0,2,0.82)",
          backdropFilter: hovered ? "blur(8px)" : "blur(0px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "32px 28px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(1.03)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}>
          {[
            { top: 16, left: 16, borderRight: "none", borderBottom: "none" },
            { top: 16, right: 16, borderLeft: "none", borderBottom: "none" },
            { bottom: 16, left: 16, borderRight: "none", borderTop: "none" },
            { bottom: 16, right: 16, borderLeft: "none", borderTop: "none" },
          ].map((s, ci) => (
            <div key={ci} style={{
              position: "absolute", width: 20, height: 20,
              border: "1px solid rgba(200,60,60,0.4)", ...s,
            }} />
          ))}
          <svg width="20" height="26" viewBox="0 0 20 26" fill="#8b1a1a" style={{ marginBottom: 16, opacity: 0.9 }}>
            <path d="M10 0C10 0 0 11 0 17a10 10 0 0020 0C20 11 10 0 10 0z"/>
          </svg>
          <p style={{
            fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
            fontSize: 15, color: "#f5e8e8",
            lineHeight: 1.8, textAlign: "center",
            margin: "0 0 10px", whiteSpace: "pre-line",
          }}>
            {quote}
          </p>
          <p style={{
            fontFamily: HF,
            fontSize: 12, color: "rgba(210,140,140,0.65)",
            fontStyle: "italic", textAlign: "center", margin: "0 0 18px",
          }}>
            {language === 'bn' ? art.quoteEn : art.quote}
          </p>
          <div style={{
            padding: "7px 20px",
            border: "1px solid rgba(180,50,50,0.45)",
            borderRadius: 20,
            fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
            fontSize: 11, letterSpacing: "2px",
            color: "rgba(230,140,140,0.85)",
          }}>
            {language === 'bn' ? 'শিল্পকর্ম দেখুন' : 'View Artwork'}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div style={{
        background: "#fffaf8",
        padding: "18px 20px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        borderTop: `2.5px solid ${art.c1}`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3,
          background: `linear-gradient(to bottom, ${art.c1}, transparent)`,
        }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{
            fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
            fontSize: 17, fontWeight: 700, color: "#1a0505", marginBottom: 2,
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: HF,
            fontSize: 13, color: "#8b1a1a", fontStyle: "italic", marginBottom: 5,
          }}>
            {language === 'bn' ? art.title : art.titleBn}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 16, height: 16, borderRadius: "50%",
              background: `linear-gradient(135deg, ${art.c1}, ${art.c3})`,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
              fontSize: 11, color: "#9b7070",
              letterSpacing: "1px", textTransform: "uppercase",
            }}>
              {author}
            </span>
          </div>
        </div>
        <button
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${art.c1} 0%, #3a0808 100%)`,
            border: "none", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            boxShadow: `0 6px 20px ${art.c1}44`,
            transition: "transform 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12) rotate(15deg)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 17l5-5-5-5"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function GallerySection({ data, onSeeAll, language }) {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const [ref, vis] = useInView();

  // Handle empty arts
  if (!data.arts || data.arts.length === 0) {
    return (
      <section ref={ref}
        style={{
          background: "#f5ede6",
          minHeight: "100vh",
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
          fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
        }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,400;1,700&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
        `}</style>
        <div style={{
          padding: "16px 28px 32px",
          position: "relative", zIndex: 2,
        }}>
          <div className="section-label">
            <span className="label-red">{language === 'bn' ? 'চিত্রকথন' : 'CHITROKOTHON'}</span>
            <span className="label-black">{language === 'bn' ? 'CHITROKOTHON' : 'চিত্রকথন'}</span>
          </div>
          <h2 className="section-heading">
            {language === 'bn' ? 'রক্তকরবী ' : 'RoktoKorobi '}
            <span className="heading-red">{language === 'bn' ? 'চিত্রকথন' : 'Chitrokothon'}</span>
          </h2>
          <p style={{
            margin: "0 0 24px",
            fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
            fontSize: 13, color: "rgba(80,20,20,0.55)",
            fontWeight: 400, lineHeight: 1.6,
          }}>
            {language === 'bn' ? 'সম্প্রদায়ের শিল্পকর্ম — জীবন বাঁচানোর অনুপ্রেরণায়' : 'Artwork by our community, created in the spirit of saving lives.'}
          </p>
          <button 
            className="btn-gallery" 
            onClick={onSeeAll}
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
            {language === 'bn' ? 'পুরো গ্যালারি দেখুন' : 'View Full Gallery'} →
          </button>
        </div>
        <div style={{ padding: '60px 20px', background:'white', borderRadius:20, margin:'0 28px', textAlign:'center' }}>
          <div style={{
            border: '2px dashed #E0D5D5',
            borderRadius: '12px',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '40px 20px'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9E8080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <p style={{ color: '#9E8080', fontSize: 16, margin: 0 }}>
              {language === 'bn' ? 'এখনও কোনো শিল্পকর্ম নেই। আপনার সৃষ্টি প্রথম শেয়ার করুন!' : 'No artwork yet. Be the first to share your creation!'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleScroll = () => {
    const c = scrollRef.current;
    if (!c) return;
    const cardW = c.scrollWidth / data.arts.length;
    setActive(Math.min(Math.round(c.scrollLeft / cardW), data.arts.length - 1));
  };

  const goTo = (i) => {
    setActive(i);
    scrollRef.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section ref={ref}
      style={{
        background: "#f5ede6",
        minHeight: "100vh",
        paddingBottom: 80,
        position: "relative",
        overflow: "hidden",
        fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
      }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,400;1,700&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');

        @keyframes cardIn {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes blobA {
          0%   { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; transform:scale(1) translate(0,0); }
          100% { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; transform:scale(1.15) translate(10px,-8px); }
        }
        @keyframes blobB {
          0%   { border-radius:40% 60% 70% 30%/40% 70% 30% 60%; transform:scale(1) translate(0,0); }
          100% { border-radius:70% 30% 40% 60%/30% 50% 70% 40%; transform:scale(1.12) translate(-8px,10px); }
        }
        @keyframes floatWm {
          0%,100% { transform:translate(-50%,-50%) rotate(-12deg) translateY(0); }
          50%      { transform:translate(-50%,-50%) rotate(-12deg) translateY(-14px); }
        }
        @keyframes pulseOrb {
          0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.55; }
          50%      { transform:translate(-50%,-50%) scale(1.08); opacity:0.75; }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes rotateSlow {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }

        .scroll-hide::-webkit-scrollbar { display:none; }
        .scroll-hide { -ms-overflow-style:none; scrollbar-width:none; }

        .view-all-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px;
          background: #C0392B;
          border: none;
          border-radius:8px;
          color: white;
          font-family:'Hind Siliguri',sans-serif;
          font-size:13px; letter-spacing:0.5px;
          font-weight: 500;
          cursor:pointer;
          transition:all 0.35s ease;
          position:relative; overflow:hidden;
        }
        .view-all-btn::before {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
          transform:translateX(-100%);
          transition:transform 0.5s ease;
        }
        .view-all-btn:hover::before { transform:translateX(100%); }
        .view-all-btn:hover {
          background: #A93226;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Subtle cream-to-warm gradient mesh */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse at 8% 15%, rgba(200,140,130,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 88% 75%, rgba(180,100,100,0.12) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 100%, rgba(210,160,140,0.15) 0%, transparent 55%)
        `,
      }} />

      {/* Grain texture overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.025,
      }} />

      {/* Warm background orbs */}
      {[
        { size: 380, x: "5%",  y: "15%", color: "rgba(180,80,80,0.1)",  d: "0s" },
        { size: 300, x: "80%", y: "60%", color: "rgba(160,60,60,0.08)", d: "3s" },
        { size: 220, x: "45%", y: "90%", color: "rgba(190,100,80,0.1)", d: "6s" },
      ].map((orb, i) => (
        <div key={i} style={{
          position: "absolute",
          width: orb.size, height: orb.size, borderRadius: "50%",
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          left: orb.x, top: orb.y,
          transform: "translate(-50%, -50%)",
          filter: "blur(50px)", zIndex: 0,
          animation: `pulseOrb 9s ease-in-out ${orb.d} infinite`,
        }} />
      ))}

      {/* Decorative rotating ring */}
      <div style={{
        position: "absolute", top: "10%", right: "-60px",
        width: 200, height: 200,
        border: "1px solid rgba(122,14,28,0.07)",
        borderRadius: "50%",
        zIndex: 0,
        animation: "rotateSlow 40s linear infinite",
      }} />
      <div style={{
        position: "absolute", top: "10%", right: "-40px",
        width: 160, height: 160,
        border: "1px dashed rgba(122,14,28,0.05)",
        borderRadius: "50%",
        zIndex: 0,
        animation: "rotateSlow 28s linear infinite reverse",
      }} />

      {/* Watermark */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        fontSize: "clamp(60px,20vw,180px)",
        fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF, fontWeight: 700,
        color: "rgba(122,14,28,0.04)",
        whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none", zIndex: 0,
        animation: "floatWm 11s ease-in-out infinite",
      }}>
        {language === 'bn' ? 'চিত্রকথন' : 'Chitrokothon'}
      </div>

      {/* Vertical side text */}
      <div style={{
        position: "absolute", right: 14, top: "50%",
        transform: "translateY(-50%) rotate(90deg)",
        fontFamily: HF,
        fontSize: 10, letterSpacing: "4px",
        color: "rgba(122,14,28,0.15)", textTransform: "uppercase",
        whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none", zIndex: 0,
      }}>
        রক্তকরবী · RoktoKorobi · চিত্রকথন · Chitrokothon
      </div>

      {/* Ink splats */}
      <InkSplat size={90}  opacity={0.045} style={{ top: 60,  right: "12%", transform: "rotate(22deg)",  zIndex: 1 }} />
      <InkSplat size={55}  opacity={0.035} style={{ top: 210, left: "4%",   transform: "rotate(-18deg)", zIndex: 1 }} />
      <InkSplat size={110} opacity={0.025} style={{ bottom: 100, right: "6%", transform: "rotate(38deg)", zIndex: 1 }} />

      {/* Top decorative rule */}
      <div style={{
        position: "relative", zIndex: 2,
        height: 28,
        display: "flex", alignItems: "center",
        padding: "0 28px",
        marginTop: 12,
      }}>
        <div style={{
          flex: 1, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(122,14,28,0.25) 40%, rgba(122,14,28,0.25) 60%, transparent)",
        }} />
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "rgba(122,14,28,0.3)", margin: "0 12px",
          flexShrink: 0,
        }} />
        <div style={{
          width: 3, height: 3, borderRadius: "50%",
          background: "rgba(122,14,28,0.2)", marginRight: 12,
          flexShrink: 0,
        }} />
      </div>

      {/* Header */}
      <div style={{
        padding: "16px 28px 32px",
        position: "relative", zIndex: 2,
        animation: "fadeSlideUp 0.9s ease 0.1s both",
      }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 28, height: 1, background: "rgba(122,14,28,0.4)" }} />
          <span style={{
            fontFamily: HF,
            fontSize: 10, letterSpacing: "4px",
            color: "rgba(122,14,28,1)", textTransform: "uppercase",
          }}>
            Chitrokothon · চিত্রকথন
          </span>
          <div style={{ width: 28, height: 1, background: "rgba(122,14,28,0.4)" }} />
        </div>

        {/* Title */}
        <h2 style={{
          margin: "0 0 2px",
          fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
          fontSize: "clamp(30px,8vw,50px)", fontWeight: 700,
          color: "#1a0505", lineHeight: 1.1, letterSpacing: "-0.5px",
        }}>
          {language === 'bn' ? 'রক্তকরবী' : 'RoktoKorobi'}
        </h2>
        <h3 style={{
          margin: "0 0 14px",
          fontFamily: HF,
          fontSize: "clamp(20px,5.5vw,36px)", fontWeight: 400, fontStyle: "italic",
          background: "linear-gradient(90deg, #8b1a1a, #c0392b, #8b1a1a)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 5s linear infinite",
          lineHeight: 1.2,
        }}>
          {language === 'bn' ? 'চিত্রকথন' : 'Chitrokothon'}
        </h3>

        <p style={{
          margin: "0 0 4px",
          fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : HF,
          fontSize: 13, color: "rgba(80,20,20,0.55)",
          fontWeight: 400, lineHeight: 1.6,
        }}>
          {language === 'bn' ? 'সম্প্রদায়ের শিল্পকর্ম — জীবন বাঁচানোর অনুপ্রেরণায়' : 'Artwork by our community, created in the spirit of saving lives.'}
        </p>
        <p style={{
          margin: "0 0 24px",
          fontFamily: HF,
          fontSize: 13, fontStyle: "italic",
          color: "rgba(100,40,40,0.4)",
        }}>
          {language === 'bn' ? 'Artwork by our community, created in the spirit of saving lives.' : 'সম্প্রদায়ের শিল্পকর্ম — জীবন বাঁচানোর অনুপ্রেরণায়'}
        </p>

        <button className="view-all-btn" onClick={onSeeAll}>
          {language === 'bn' ? 'পুরো গ্যালারি দেখুন →' : 'View Full Gallery →'}
        </button>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="scroll-hide"
        onScroll={handleScroll}
        style={{
          display: "flex", gap: 20,
          overflowX: "auto",
          padding: "8px 28px 28px",
          scrollSnapType: "x mandatory",
          position: "relative", zIndex: 2,
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .scroll-hide {
              padding: 8px 16px 24px !important;
              gap: 16px !important;
            }
          }
        `}</style>
        {data.arts.map((art, i) => (
          <ArtCard key={art.id} art={art} index={i} language={language} />
        ))}
      </div>

      {/* Pagination dots */}
      <div style={{
        display: "flex", justifyContent: "center",
        alignItems: "center", gap: 8, marginTop: 12,
        position: "relative", zIndex: 2,
      }}>
        {data.arts.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: active === i ? 26 : 7, height: 7,
              borderRadius: 4, border: "none",
              background: active === i
                ? "linear-gradient(90deg, #7a0e1c, #c0392b)"
                : "rgba(122,14,28,0.2)",
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
              boxShadow: active === i ? "0 0 10px rgba(122,14,28,0.3)" : "none",
            }}
          />
        ))}
      </div>

      {/* Bottom rule */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", alignItems: "center", gap: 14,
        padding: "44px 28px 0", opacity: 0.35,
      }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #7a0e1c)" }} />
        <svg width="12" height="16" viewBox="0 0 12 16" fill="#7a0e1c">
          <path d="M6 0C6 0 0 7 0 11a6 6 0 0012 0C12 7 6 0 6 0z"/>
        </svg>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #7a0e1c)" }} />
      </div>
    </section>
  );
}
