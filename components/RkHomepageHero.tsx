'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

type Language = 'en' | 'bn';
type StatKey = 'partners' | 'users' | 'donors' | 'fulfilled';
type Stats = Record<StatKey, number>;

declare global {
  interface Window { rkHeroSetLang?: (language: Language) => void; }
}

// ---- EDIT HERE ----
const DATA: Stats = { partners: 117, users: 583, donors: 350, fulfilled: 105 };
const PUBLISHED_AT: string | null = null;
// -------------------

const T = {
  en: {
    h1a: 'Every Drop', h1b: 'Of Blood', h1c: 'Saves Life', tag: 'Connect. Donate. Save a Life.',
    lede: 'Roktokorobi is a digital platform that connects blood donors with people in urgent need of blood transfusions across Bangladesh, India and Pakistan.',
    cta1: 'Become a Donor', cta2: 'Find a Donor', partners: 'Partner organisations',
    regions: 'Across Bangladesh, India and Pakistan',
    perPartner: 'Each partner brings in about {usersPerPartner} users and {donorsPerPartner} donors',
    users: 'Registered users', donors: 'Registered donors', fulfilled: 'Requests fulfilled',
    fulfilledNote: '{donatedPercent}% of registered donors have donated', published: 'Counts last published ',
  },
  bn: {
    h1a: 'প্রতি ফোঁটা', h1b: 'রক্ত', h1c: 'বাঁচায় জীবন', tag: 'যুক্ত হোন। রক্ত দিন। জীবন বাঁচান।',
    lede: 'রক্তকরবী একটি ডিজিটাল প্ল্যাটফর্ম, যা বাংলাদেশ, ভারত ও পাকিস্তান জুড়ে জরুরি রক্তসঞ্চালনের প্রয়োজনে থাকা মানুষদের সঙ্গে রক্তদাতাদের যুক্ত করে।',
    cta1: 'রক্তদাতা হোন', cta2: 'রক্তদাতা খুঁজুন', partners: 'পার্টনার প্রতিষ্ঠান',
    regions: 'বাংলাদেশ, ভারত ও পাকিস্তান জুড়ে',
    perPartner: 'প্রতিটি পার্টনার গড়ে {usersPerPartner} জন ব্যবহারকারী ও {donorsPerPartner} জন রক্তদাতা আনে',
    users: 'নিবন্ধিত ব্যবহারকারী', donors: 'নিবন্ধিত রক্তদাতা', fulfilled: 'পূর্ণ হওয়া অনুরোধ',
    fulfilledNote: 'নিবন্ধিত রক্তদাতাদের {donatedPercent}% রক্তদান করেছেন', published: 'সংখ্যা সর্বশেষ প্রকাশিত: ',
  },
};

function formatNumber(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US').format(value);
}

function translated(key: keyof typeof T.en, language: Language) {
  const derived = {
    usersPerPartner: formatNumber(Math.round(DATA.users / DATA.partners), language),
    donorsPerPartner: formatNumber(Math.round(DATA.donors / DATA.partners), language),
    donatedPercent: formatNumber(Math.round((DATA.fulfilled / DATA.donors) * 100), language),
  };
  return T[language][key].replace(/\{(usersPerPartner|donorsPerPartner|donatedPercent)\}/g, (_match, name: keyof typeof derived) => derived[name]);
}

const styles = `
.rk-hero{--rk-bg:#F1E6DD;--rk-red:#B5172B;--rk-red-bright:#E23B4F;--rk-ink:#1E1E1E;--rk-teal:#2F6F6B;--rk-muted:#6B5B52;--rk-dark:#21130A;--rk-cream:#F6EADF;--rk-cream-muted:#C9B5A8;font-family:"Hind Siliguri","Hind",system-ui,sans-serif;color:var(--rk-ink);background:var(--rk-bg);padding:72px 24px 88px;box-sizing:border-box}
.rk-hero *{box-sizing:border-box}.rk-hero .rk-wrap{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(32px,6vw,88px);align-items:center}
.rk-hero h1{margin:0;font-size:clamp(3rem,7.2vw,5.75rem);line-height:1.02;font-weight:700;letter-spacing:-.01em}.rk-hero h1 span{display:block}.rk-hero h1 .l2{font-style:italic;font-weight:700}.rk-hero h1 .l3{color:var(--rk-red)}.rk-hero[data-lang="bn"] h1{line-height:1.25}.rk-hero[data-lang="bn"] h1 .l2{font-style:normal}
.rk-hero .rk-tag{margin:28px 0 0;color:var(--rk-teal);font-size:clamp(1.25rem,2.2vw,1.625rem);font-weight:600}.rk-hero .rk-lede{margin:14px 0 0;color:var(--rk-muted);font-size:1.125rem;line-height:1.7;max-width:48ch}.rk-hero .rk-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:36px}.rk-hero .rk-btn{display:inline-flex;align-items:center;min-height:52px;padding:0 30px;border-radius:999px;font:inherit;font-weight:600;font-size:1.0625rem;text-decoration:none;border:1.5px solid transparent;transition:background-color .2s,border-color .2s,color .2s}.rk-hero .rk-btn.primary{background:var(--rk-red);color:#fff}.rk-hero .rk-btn.primary:hover{background:#98111F}.rk-hero .rk-btn.ghost{border-color:#B9A89C;color:var(--rk-ink)}.rk-hero .rk-btn.ghost:hover{border-color:var(--rk-ink)}.rk-hero .rk-btn:focus-visible{outline:3px solid var(--rk-teal);outline-offset:3px}
.rk-hero .rk-panel{background:var(--rk-dark);color:var(--rk-cream);border-radius:28px;padding:clamp(28px,4vw,44px)}.rk-hero .rk-lead-num{font-size:clamp(4.5rem,9vw,7rem);font-weight:700;line-height:.9;color:#fff;font-variant-numeric:tabular-nums}.rk-hero .rk-lead-label{margin-top:14px;font-size:1.25rem;font-weight:600}.rk-hero .rk-lead-sub{margin-top:4px;color:var(--rk-cream-muted);font-size:1rem}.rk-hero .rk-lead-note{margin-top:12px;color:var(--rk-cream-muted);font-size:.875rem}
.rk-hero .rk-rows{display:grid;gap:24px;margin:36px 0 0;padding:28px 0 0;list-style:none;border-top:1px solid rgba(255,255,255,.16)}.rk-hero .rk-row{display:grid;grid-template-columns:auto 1fr;column-gap:18px;row-gap:8px;align-items:baseline}.rk-hero .rk-row .n{font-size:2rem;font-weight:700;line-height:1;min-width:3.2ch;font-variant-numeric:tabular-nums}.rk-hero .rk-row .t{font-size:1.0625rem;font-weight:600}.rk-hero .rk-row .t small{display:block;margin-top:2px;color:var(--rk-cream-muted);font-size:.875rem;font-weight:400}.rk-hero .rk-bar{grid-column:1/-1;height:10px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}.rk-hero .rk-bar i{display:block;height:100%;width:0;border-radius:inherit;background:var(--rk-red-bright);transition:width 1.1s cubic-bezier(.2,.7,.2,1)}.rk-hero.is-in .rk-bar i{width:var(--w)}.rk-hero .rk-meta{margin:28px 0 0;color:var(--rk-cream-muted);font-size:.8125rem}.rk-hero .rk-meta:empty{display:none}
@media(max-width:900px){.rk-hero{padding:48px 20px 64px}.rk-hero .rk-wrap{grid-template-columns:1fr;gap:44px}}@media(prefers-reduced-motion:reduce){.rk-hero .rk-bar i,.rk-hero .rk-btn{transition:none}}
`;

export default function RkHomepageHero() {
  const pathname = usePathname();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (pathname !== '/') return;
    let observer: MutationObserver | undefined;
    let mount: HTMLDivElement | undefined;
    let oldMission: HTMLElement | null = null;
    let oldDisplay = '';

    const attach = () => {
      const mission = document.querySelector<HTMLElement>('.home-page .mission-section');
      if (!mission || mount) return;
      oldMission = mission;
      oldDisplay = mission.style.display;
      mission.style.display = 'none';
      mount = document.createElement('div');
      mount.dataset.rkHeroMount = 'true';
      mission.before(mount);
      setTarget(mount);
      setLanguage(localStorage.getItem('language') === 'bn' ? 'bn' : 'en');
    };

    attach();
    if (!mount) {
      observer = new MutationObserver(attach);
      observer.observe(document.body, { childList: true, subtree: true });
    }
    window.rkHeroSetLang = next => setLanguage(next === 'bn' ? 'bn' : 'en');
    const syncLanguage = () => window.setTimeout(() => setLanguage(localStorage.getItem('language') === 'bn' ? 'bn' : 'en'), 0);
    document.addEventListener('click', syncLanguage, true);

    return () => {
      observer?.disconnect();
      document.removeEventListener('click', syncLanguage, true);
      delete window.rkHeroSetLang;
      mount?.remove();
      if (oldMission) oldMission.style.display = oldDisplay;
      setTarget(null);
    };
  }, [pathname]);

  useEffect(() => {
    if (!target) return;
    const root = target.querySelector<HTMLElement>('#rkHero');
    if (!root) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paint = (values: Stats = DATA) => root.querySelectorAll<HTMLElement>('[data-count]').forEach(element => {
      element.textContent = formatNumber(values[element.dataset.count as StatKey], language);
    });
    const countUp = () => {
      if (reduceMotion) { paint(); return; }
      const started = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - started) / 1100, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const values = Object.fromEntries(Object.entries(DATA).map(([key, value]) => [key, Math.round(value * eased)])) as Stats;
        paint(values);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    paint();
    root.querySelectorAll<HTMLElement>('[data-t]').forEach(element => {
      element.textContent = translated(element.dataset.t as keyof typeof T.en, language);
    });
    const meta = root.querySelector<HTMLElement>('#rkMeta');
    if (meta) meta.textContent = PUBLISHED_AT ? T[language].published + new Date(PUBLISHED_AT).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB') : '';
    const intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        root.classList.add('is-in');
        countUp();
        intersectionObserver.disconnect();
      }
    }, { threshold: 0.3 });
    intersectionObserver.observe(root);
    return () => intersectionObserver.disconnect();
  }, [language, target]);

  if (pathname !== '/' || !target) return null;
  const widths = {
    users: DATA.users ? '100%' : '0%',
    donors: DATA.users ? `${DATA.donors / DATA.users * 100}%` : '0%',
    fulfilled: DATA.users ? `${DATA.fulfilled / DATA.users * 100}%` : '0%',
  };
  return createPortal(
    <section className="rk-hero" id="rkHero" data-lang={language} aria-labelledby="rkH1">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{styles}</style>
      <div className="rk-wrap">
        <div className="rk-msg">
          <h1 id="rkH1"><span className="l1" data-t="h1a">{T[language].h1a}</span><span className="l2" data-t="h1b">{T[language].h1b}</span><span className="l3" data-t="h1c">{T[language].h1c}</span></h1>
          <p className="rk-tag" data-t="tag">{T[language].tag}</p>
          <p className="rk-lede" data-t="lede">{T[language].lede}</p>
          <div className="rk-cta"><a className="rk-btn primary" href="/register" data-t="cta1">{T[language].cta1}</a><a className="rk-btn ghost" href="/donors" data-t="cta2">{T[language].cta2}</a></div>
        </div>
        <aside className="rk-panel" aria-label="Platform numbers">
          <div className="rk-lead-num" data-count="partners">117</div><div className="rk-lead-label" data-t="partners">{T[language].partners}</div><div className="rk-lead-sub" data-t="regions">{T[language].regions}</div><div className="rk-lead-note">{translated('perPartner', language)}</div>
          <ul className="rk-rows">
            <li className="rk-row"><span className="n" data-count="users">583</span><span className="t" data-t="users">{T[language].users}</span><span className="rk-bar" aria-hidden="true"><i style={{ '--w': widths.users } as React.CSSProperties} /></span></li>
            <li className="rk-row"><span className="n" data-count="donors">350</span><span className="t" data-t="donors">{T[language].donors}</span><span className="rk-bar" aria-hidden="true"><i style={{ '--w': widths.donors } as React.CSSProperties} /></span></li>
            <li className="rk-row"><span className="n" data-count="fulfilled">105</span><span className="t"><span data-t="fulfilled">{T[language].fulfilled}</span><small>{translated('fulfilledNote', language)}</small></span><span className="rk-bar" aria-hidden="true"><i style={{ '--w': widths.fulfilled } as React.CSSProperties} /></span></li>
          </ul>
          <p className="rk-meta" id="rkMeta">{PUBLISHED_AT ? T[language].published + new Date(PUBLISHED_AT).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB') : ''}</p>
        </aside>
      </div>
    </section>, target,
  );
}
