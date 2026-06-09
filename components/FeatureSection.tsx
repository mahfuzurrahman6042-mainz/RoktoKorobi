import { useState } from "react";

const CR = '#8B1A1A', LCR = '#C41E3A';
const HF = "'Playfair Display', serif";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .u1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .00s both}
  .u2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .12s both}
  .u3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .22s both}

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

  .lp { transition:all .25s ease; cursor:pointer; border:none; outline:none; }
`;

/* ── Data ── */
const DATA = {
  en: {
    fHead:'Explore Our', fHeadI:'Features',
    fSub:'Everything you need to connect, give, and be inspired',
    feats:[
      { id:'blog',       lbl:'BLOG',         t1:'Latest',      t2:'Posts',      desc:'Read the latest articles and stories about blood donation and our growing community.',       btn:'Explore Posts' },
      { id:'gallery',    lbl:'CHITROKOTHON', t1:'Artwork',     t2:'Gallery',    desc:'Discover artwork created for blood donation awareness by our community of talented artists.', btn:'View Gallery'  },
      { id:'experience', lbl:'TESTIMONIALS', t1:'RoktoKorobi', t2:'Experience', desc:'Hear real, moving stories from donors and patients touched by the gift of life.',            btn:'Read Stories'  },
    ],
  },
  bn: {
    fHead:'আমাদের', fHeadI:'বৈশিষ্ট্যসমূহ',
    fSub:'সংযুক্ত হন, দান করুন এবং অনুপ্রেরণা নিন',
    feats:[
      { id:'blog',       lbl:'ব্লগ',      t1:'সর্বশেষ',   t2:'পোস্ট',    desc:'রক্তদান সম্পর্কে সর্বশেষ নিবন্ধ, গাইড ও গল্প পড়ুন।',       btn:'পোস্ট দেখুন'    },
      { id:'gallery',    lbl:'চিত্রকথন', t1:'শিল্পকর্ম', t2:'গ্যালারি', desc:'প্রতিভাবান শিল্পীদের রক্তদান সচেতনতামূলক শিল্পকর্ম দেখুন।', btn:'গ্যালারি দেখুন' },
      { id:'experience', lbl:'অভিজ্ঞতা', t1:'রক্তকরবী',  t2:'অভিজ্ঞতা', desc:'দাতা ও রোগীদের হৃদয়ছোঁয়া সত্যিকারের গল্প শুনুন।',         btn:'গল্প পড়ুন'      },
    ],
  },
};

/* ── SVG Icons ── */
const PenIcon   = () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
const FrameIcon = () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const DropIcon  = () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const ICONS = [PenIcon, FrameIcon, DropIcon];

/* ── Feature Cards Section ── */
export function FeatureSection({ onCardClick }: { onCardClick?: (id: string) => void }) {
  const [lang, setLang] = useState('en');
  const d = DATA[lang];
  const bf = lang === 'bn' ? "'Noto Serif Bengali',sans-serif" : "'DM Sans',sans-serif";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <section style={{
        position:'relative', overflow:'hidden', fontFamily: bf,
        background:'linear-gradient(160deg,#080101 0%,#130505 48%,#1C0808 100%)',
        padding:'80px 24px 88px',
      }}>
        {/* Ambient glows */}
        <div style={{ position:'absolute',top:'8%',left:'6%',width:340,height:340,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(139,26,26,0.13),transparent 70%)' }}/>
        <div style={{ position:'absolute',bottom:'4%',right:'4%',width:440,height:440,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(196,30,58,0.07),transparent 70%)' }}/>

        {/* Lang toggle */}
        <div style={{ position:'absolute',top:24,right:24,display:'flex',
          background:'rgba(255,255,255,0.07)',borderRadius:22,padding:3,
          border:'1px solid rgba(255,255,255,0.09)',backdropFilter:'blur(6px)' }}>
          {['en','bn'].map(l => (
            <button key={l} className="lp" onClick={() => setLang(l)}
              style={{ padding:'5px 14px',borderRadius:18,fontSize:10,fontWeight:700,
                background:lang===l ? CR : 'transparent',
                color:lang===l ? 'white' : 'rgba(255,200,200,0.56)',
                letterSpacing:'0.1em' }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="u1" style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginBottom:16 }}>
            <div style={{ width:46,height:1,background:'rgba(139,26,26,0.5)' }}/>
            <span style={{ fontSize:9,fontWeight:800,letterSpacing:'0.34em',color:'rgba(196,30,58,0.72)',textTransform:'uppercase' }}>FEATURES</span>
            <div style={{ width:46,height:1,background:'rgba(139,26,26,0.5)' }}/>
          </div>
          <h2 style={{ fontFamily:HF,fontSize:'clamp(26px,4vw,52px)',fontWeight:900,color:'white',lineHeight:1.1 }}>
            {d.fHead} <em style={{ color:'#FF8080',fontStyle:'italic',fontSize:'inherit' }}>{d.fHeadI}</em>
          </h2>
          <p style={{ color:'rgba(255,200,200,0.38)',fontSize:14,marginTop:10 }}>{d.fSub}</p>
        </div>

        {/* Cards */}
        <div style={{ display:'flex',gap:22,justifyContent:'center',flexWrap:'wrap',maxWidth:1160,margin:'0 auto' }}>
          {d.feats.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={f.id}
                className={`fcard u${i+2}`}
                onClick={() => onCardClick?.(f.id)}
                style={{ flex:'1 1 280px',maxWidth:360,boxShadow:'0 8px 34px rgba(0,0,0,0.30)' }}
              >
                <div className="c-bar" style={{ height:3,borderRadius:'18px 18px 0 0' }}/>
                <div className="fbody" style={{ padding:'40px 34px 42px',position:'relative' }}>
                  {/* Ghost number */}
                  <div className="c-num" style={{
                    fontFamily:HF,fontSize:96,fontWeight:900,lineHeight:1,
                    position:'absolute',top:8,right:16,letterSpacing:'-0.05em',
                    userSelect:'none',pointerEvents:'none',
                    color:'rgba(139,26,26,0.055)',
                  }}>0{i+1}</div>

                  {/* Icon ring */}
                  <div className="c-iwr" style={{
                    width:56,height:56,borderRadius:'50%',border:'1px solid',
                    display:'flex',alignItems:'center',justifyContent:'center',marginBottom:28,
                  }}>
                    <Icon/>
                  </div>

                  {/* Label + divider */}
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
                    <span className="c-lbl" style={{ fontSize:9,fontWeight:800,letterSpacing:'0.26em',textTransform:'uppercase',whiteSpace:'nowrap' }}>{f.lbl}</span>
                    <div className="c-div" style={{ flex:1,height:1 }}/>
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom:14 }}>
                    <span className="c-head" style={{ fontFamily:HF,fontSize:27,fontWeight:900,display:'block',lineHeight:1.18 }}>{f.t1}</span>
                    <em className="c-ital" style={{ fontFamily:HF,fontSize:27,fontWeight:700,display:'block',lineHeight:1.18 }}>{f.t2}</em>
                  </div>

                  {/* Description */}
                  <p className="c-desc" style={{ fontSize:13,lineHeight:1.7,marginBottom:30 }}>{f.desc}</p>

                  {/* CTA */}
                  <button className="c-cta" style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 22px',borderRadius:8 }}>
                    {f.btn} <span className="c-arr">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
