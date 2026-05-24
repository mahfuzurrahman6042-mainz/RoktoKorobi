// @ts-nocheck - Supabase type inference issues with Database types
"use client";

import { useState } from "react";
import { FeatureSection } from "@/components/FeatureSection";

const CR = '#8B1A1A', LCR = '#C41E3A', CREAM = '#F5F0E8', DCREAM = '#EDE0CF', DK = '#1A0808', WM = '#6B5045';
const HF = "'Playfair Display', serif";

/* ─────────────────────── Global CSS ─────────────────────── */
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
  .u5{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .42s both}
  .u6{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .52s both}
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

  /* colour transitions */
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

  /* ── Post card ── */
  .pc { transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; cursor:pointer; }
  .pc:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(139,26,26,.18)!important; }
  
  .pc-tag { transition:all .3s ease; }
  .pc:hover .pc-tag { transform:scale(1.05); }
  
  .pc-link { transition:all .3s cubic-bezier(.22,1,.36,1); }
  .pc:hover .pc-link { color:CR; transform:translateX(4px); }

  /* ── Art tile ── */
  .at { transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease; cursor:pointer; overflow:hidden; }
  .at:hover { transform:scale(1.04); box-shadow:0 20px 50px rgba(139,26,26,.2)!important; }
  .at .ao { opacity:0; transition:opacity .4s ease; backdrop-filter:blur(4px); }
  .at:hover .ao { opacity:1; }
  
  .at-info { transition:all .3s ease; }
  .at:hover .at-info { transform:translateY(-4px); }

  /* ── Story card ── */
  .sc { transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease; }
  .sc:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(139,26,26,.18)!important; }
  
  .sc-quote { transition:all .3s ease; }
  .sc:hover .sc-quote { color:CR; transform:scale(1.05); }
  
  .sc-avatar { transition:all .3s cubic-bezier(.22,1,.36,1); }
  .sc:hover .sc-avatar { transform:scale(1.1); box-shadow:0 6px 20px rgba(139,26,26,.3); }
  
  .sc-badge { transition:all .3s ease; }
  .sc:hover .sc-badge { transform:scale(1.08); }

  /* ── Misc ── */
  .cb { transition:all .25s ease; cursor:pointer; border:none; outline:none; }
  .cb:hover { transform:translateY(-2px); filter:brightness(1.08); }
  .ob { transition:all .25s ease; cursor:pointer; outline:none; }
  .ob:hover { background:#8B1A1A!important; color:white!important; border-color:#8B1A1A!important; }
  .nl { transition:opacity .2s ease; cursor:pointer; background:none; border:none; outline:none; font-family:inherit; }
  .nl:hover { opacity:.72; }
  .lp { transition:all .25s ease; cursor:pointer; border:none; outline:none; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#F5F0E8; }
  ::-webkit-scrollbar-thumb { background:#8B1A1A; border-radius:3px; }
`;

/* ─────────────────────── Data ─────────────────────── */
const DATA = {
  en: {
    fHead:'Explore Our', fHeadI:'Features',
    fSub:'Everything you need to connect, give, and be inspired',
    feats:[
      { id:'blog',       lbl:'BLOG',         t1:'Latest',      t2:'Posts',      desc:'Read the latest articles and stories about blood donation and our growing community.',      btn:'Explore Posts' },
      { id:'gallery',    lbl:'CHITROKOTHON', t1:'Artwork',     t2:'Gallery',    desc:'Discover artwork created for blood donation awareness by our community of talented artists.',btn:'View Gallery'  },
      { id:'experience', lbl:'TESTIMONIALS', t1:'RoktoKorobi', t2:'Experience', desc:'Hear real, moving stories from donors and patients touched by the gift of life.',           btn:'Read Stories'  },
    ],
    blog:{
      lbl:'BLOG', t1:'Latest', t2:'Posts',
      desc:'Discover articles, guides, and stories about blood donation.',
      more:'Read More →', back:'← Back', all:'See All Posts',
      posts:[
        { date:'October 20, 2024',   title:'Importance of Blood Donation', ex:'Every blood donation can save up to three lives. Understanding why this matters is the first step toward becoming a hero.',  tag:'Health'    },
        { date:'October 18, 2024',   title:'Hospital Blood Needs',         ex:'Blood demand is increasing in Bangladesh hospitals. Learn how you can help bridge the critical gap.',                       tag:'News'      },
        { date:'October 15, 2024',   title:'As a Volunteer',               ex:'How to volunteer for blood donation campaigns and make a real, lasting difference in your community.',                     tag:'Community' },
        { date:'October 10, 2024',   title:'Understanding Blood Types',    ex:'A complete guide to blood type compatibility and why it matters for safe, life-saving transfusions.',                      tag:'Education' },
        { date:'October 5, 2024',    title:'Post-Donation Care',           ex:'Essential tips for a healthy recovery after giving blood — what to eat, drink, and avoid.',                               tag:'Health'    },
        { date:'September 28, 2024', title:'Youth in Blood Donation',      ex:'How young Bangladeshis are leading the charge in saving lives across the country.',                                       tag:'Community' },
      ],
    },
    gallery:{
      lbl:'CHITROKOTHON', t1:'Artwork', t2:'Gallery',
      desc:'Artwork by our community, created in the spirit of saving lives.',
      back:'← Back', all:'View Full Gallery',
      arts:[
        { title:'Blood Bond',    artist:'Rahim',  desc:'Blood donation creates lasting bonds between people.',         g:'radial-gradient(ellipse at 28% 38%,#7A1010 0%,#C41E3A 48%,#4A0808 100%)' },
        { title:'Gift of Life',  artist:'Sara',   desc:'Blood donation is the most profound way to give life.',        g:'radial-gradient(circle at 72% 28%,#E05050 0%,#8B1A1A 50%,#300808 100%)' },
        { title:'Light of Hope', artist:'Kamal',  desc:'Every donor is a light of hope for someone in the dark.',      g:'conic-gradient(from 200deg at 50% 65%,#C41E3A,#6B1515,#FF6060,#C41E3A)' },
        { title:'Red River',     artist:'Fatema', desc:'Our blood flows through each other, connecting all of us.',    g:'linear-gradient(140deg,#5A1010 0%,#C41E3A 35%,#8B1A1A 65%,#D04040 100%)' },
        { title:'Lifeline',      artist:'Arif',   desc:"A single drop is all it takes to change someone's world.",    g:'radial-gradient(circle at 50% 32%,#FF7070 0%,#C41E3A 38%,#3A0808 100%)' },
        { title:'Unity in Red',  artist:'Nadia',  desc:'Together in red, we rise and save lives.',                     g:'radial-gradient(ellipse at 22% 78%,#7A1010 0%,#C41E3A 52%,#5A1010 100%)' },
      ],
    },
    experience:{
      lbl:'TESTIMONIALS', t1:'RoktoKorobi', t2:'Experience',
      desc:'Real, moving stories from donors and patients touched by the gift of blood.',
      back:'← Back', seeAll:'See All Stories →',
      stats:[{n:'500+',l:'Donors'},{n:'200+',l:'Lives Saved'},{n:'50+',l:'Stories'}],
      shareCta:'Share Your Story',
      stories:[
        { ini:'A', name:'Aminul Islam',   role:'Regular Donor',  q:'I feel proud after donating blood. It is the easiest way to save lives. RoktoKorobi made it incredibly simple to find where I am needed.',  badge:'12 Donations',    c:CR       },
        { ini:'S', name:'Salma Begum',    role:'Patient Family', q:'My mother needed blood during surgery. We found a donor within hours through RoktoKorobi. This platform is a true lifesaver.',              badge:'Grateful Family', c:LCR      },
        { ini:'R', name:'Rajib Hossain', role:'New Donor',      q:'I was nervous donating for the first time, but felt incredible afterwards. I am already planning my next visit.',                           badge:'1st Donation',    c:'#6B1515' },
        { ini:'F', name:'Fatema Akter',  role:'Regular Donor',  q:'Donating blood is my way of giving back. RoktoKorobi makes it so easy to find exactly where I am needed most.',                            badge:'8 Donations',     c:'#A02020' },
        { ini:'K', name:'Karim Uddin',   role:'Patient',        q:'I was in a critical condition. RoktoKorobi connected me with a donor within hours. I owe my life to this platform.',                       badge:'Life Saved',      c:'#D04040' },
        { ini:'N', name:'Nasreen Jahan', role:'Volunteer',      q:'I have seen RoktoKorobi bridge the gap between donors and patients countless times. It is truly inspiring work.',                           badge:'50+ Helped',      c:'#8B3A3A' },
      ],
    },
  },
  bn: {
    fHead:'আমাদের', fHeadI:'বৈশিষ্ট্যসমূহ',
    fSub:'সংযুক্ত হন, দান করুন এবং অনুপ্রেরণা নিন',
    feats:[
      { id:'blog',       lbl:'ব্লগ',       t1:'সর্বশেষ',   t2:'পোস্ট',    desc:'রক্তদান সম্পর্কে সর্বশেষ নিবন্ধ, গাইড ও গল্প পড়ুন।',        btn:'পোস্ট দেখুন'    },
      { id:'gallery',    lbl:'চিত্রকথন',  t1:'শিল্পকর্ম', t2:'গ্যালারি', desc:'প্রতিভাবান শিল্পীদের রক্তদান সচেতনতামূলক শিল্পকর্ম দেখুন।',  btn:'গ্যালারি দেখুন' },
      { id:'experience', lbl:'অভিজ্ঞতা',  t1:'রক্তকরবী',  t2:'অভিজ্ঞতা', desc:'দাতা ও রোগীদের হৃদয়ছোঁয়া সত্যিকারের গল্প শুনুন।',          btn:'গল্প পড়ুন'      },
    ],
    blog:{
      lbl:'ব্লগ', t1:'সর্বশেষ', t2:'পোস্ট',
      desc:'রক্তদান বিষয়ক নিবন্ধ, গাইড ও গল্প আবিষ্কার করুন।',
      more:'আরও পড়ুন →', back:'← ফিরুন', all:'সব পোস্ট দেখুন',
      posts:[
        { date:'২০ অক্টোবর, ২০২৪',    title:'রক্তদানের গুরুত্ব',        ex:'প্রতিটি রক্তদান তিনটি পর্যন্ত জীবন বাঁচাতে পারে। কেন এটি গুরুত্বপূর্ণ তা বোঝাটাই প্রথম পদক্ষেপ।', tag:'স্বাস্থ্য'  },
        { date:'১৮ অক্টোবর, ২০২৪',    title:'হাসপাতালে রক্তের চাহিদা',  ex:'বাংলাদেশের হাসপাতালে রক্তের চাহিদা বাড়ছে। কীভাবে আপনি এই গুরুত্বপূর্ণ ব্যবধান পূরণ করতে পারেন।', tag:'সংবাদ'    },
        { date:'১৫ অক্টোবর, ২০২৪',    title:'স্বেচ্ছাসেবক হিসেবে',      ex:'রক্তদান ক্যাম্পেইনে স্বেচ্ছাসেবী হওয়ার উপায় এবং আপনার সম্প্রদায়ে স্থায়ী পার্থক্য আনার সুযোগ।', tag:'সম্প্রদায়'},
        { date:'১০ অক্টোবর, ২০২৪',    title:'রক্তের গ্রুপ বোঝা',         ex:'রক্তের ধরনের সামঞ্জস্যতা এবং নিরাপদ রক্ত সঞ্চালনের জন্য কেন এটি গুরুত্বপূর্ণ তার সম্পূর্ণ গাইড।',  tag:'শিক্ষা'   },
        { date:'৫ অক্টোবর, ২০২৪',     title:'দান পরবর্তী যত্ন',           ex:'রক্ত দেওয়ার পরে সুস্থ থাকার জরুরি টিপস — কী খাবেন, পান করবেন এবং কী এড়িয়ে চলবেন।',               tag:'স্বাস্থ্য'  },
        { date:'২৮ সেপ্টেম্বর, ২০২৪', title:'রক্তদানে তরুণ প্রজন্ম',    ex:'কীভাবে বাংলাদেশের তরুণরা সারা দেশে জীবন বাঁচানোর নেতৃত্ব দিচ্ছে।',                                    tag:'সম্প্রদায়'},
      ],
    },
    gallery:{
      lbl:'চিত্রকথন', t1:'শিল্পকর্ম', t2:'গ্যালারি',
      desc:'জীবন বাঁচানোর অনুপ্রেরণায় আমাদের সম্প্রদায়ের শিল্পকর্ম।',
      back:'← ফিরুন', all:'পূর্ণ গ্যালারি দেখুন',
      arts:[
        { title:'রক্তের বন্ধন',  artist:'রহিম',    desc:'রক্তদান মানুষের মধ্যে দীর্ঘস্থায়ী বন্ধন তৈরি করে।',             g:'radial-gradient(ellipse at 28% 38%,#7A1010 0%,#C41E3A 48%,#4A0808 100%)' },
        { title:'জীবনের উপহার', artist:'সারা',    desc:'রক্তদান জীবন দেওয়ার সবচেয়ে গভীর উপায়।',                          g:'radial-gradient(circle at 72% 28%,#E05050 0%,#8B1A1A 50%,#300808 100%)' },
        { title:'আশার আলো',     artist:'কামাল',   desc:'প্রতিটি দাতা অন্ধকারে আলোর বাতিঘর।',                               g:'conic-gradient(from 200deg at 50% 65%,#C41E3A,#6B1515,#FF6060,#C41E3A)' },
        { title:'লাল নদী',      artist:'ফাতেমা',  desc:'আমাদের রক্ত একে অপরের মধ্য দিয়ে প্রবাহিত হয়।',                    g:'linear-gradient(140deg,#5A1010 0%,#C41E3A 35%,#8B1A1A 65%,#D04040 100%)' },
        { title:'জীবনরেখা',     artist:'আরিফ',    desc:'একটি ফোঁটাই কারো পৃথিবী বদলে দিতে পারে।',                          g:'radial-gradient(circle at 50% 32%,#FF7070 0%,#C41E3A 38%,#3A0808 100%)' },
        { title:'লালে একতা',    artist:'নাদিয়া',  desc:'লালে একত্রিত, আমরা উঠি এবং জীবন বাঁচাই।',                          g:'radial-gradient(ellipse at 22% 78%,#7A1010 0%,#C41E3A 52%,#5A1010 100%)' },
      ],
    },
    experience:{
      lbl:'অভিজ্ঞতা', t1:'রক্তকরবী', t2:'অভিজ্ঞতা',
      desc:'দাতা ও রোগীদের হৃদয়ছোঁয়া সত্যিকারের গল্প যারা রক্তের উপহার দ্বারা ছুঁয়ে গেছেন।',
      back:'← ফিরুন', seeAll:'সব গল্প দেখুন →',
      stats:[{n:'৫০০+',l:'দাতা'},{n:'২০০+',l:'জীবন রক্ষা'},{n:'৫০+',l:'গল্প'}],
      shareCta:'আপনার গল্প শেয়ার করুন',
      stories:[
        { ini:'আ', name:'আমিনুল ইসলাম',  role:'নিয়মিত দাতা',   q:'রক্ত দেওয়ার পরে আমি গর্ববোধ করি। এটি জীবন বাঁচানোর সবচেয়ে সহজ উপায়। রক্তকরবী সহজ করে দিয়েছে।',                   badge:'১২টি দান',      c:CR       },
        { ini:'স', name:'সালমা বেগম',    role:'রোগীর পরিবার',  q:'অস্ত্রোপচারের সময় আমার মায়ের রক্তের প্রয়োজন ছিল। রক্তকরবীর মাধ্যমে আমরা কয়েক ঘণ্টায় দাতা পেয়েছিলাম।',              badge:'কৃতজ্ঞ পরিবার', c:LCR      },
        { ini:'র', name:'রাজিব হোসেন',  role:'নতুন দাতা',      q:'প্রথমবার নার্ভাস ছিলাম, কিন্তু পরে অসাধারণ লেগেছিল। পরের দানের জন্য ইতিমধ্যে পরিকল্পনা করছি।',                          badge:'প্রথম দান',    c:'#6B1515' },
        { ini:'ফ', name:'ফাতেমা আক্তার',role:'নিয়মিত দাতা',   q:'রক্তদান আমার সম্প্রদায়কে ফিরিয়ে দেওয়ার উপায়। রক্তকরবী আমার যেখানে দরকার সেখানে খুঁজে পেতে সহজ করে দেয়।',           badge:'৮টি দান',      c:'#A02020' },
        { ini:'ক', name:'করিম উদ্দিন',  role:'রোগী',           q:'আমি সংকটজনক অবস্থায় ছিলাম। রক্তকরবী কয়েক ঘণ্টায় দাতার সাথে সংযুক্ত করেছিল। আমি এই প্ল্যাটফর্মের কাছে জীবন ঋণী।',  badge:'জীবন রক্ষা',  c:'#D04040' },
        { ini:'ন', name:'নাসরিন জাহান', role:'স্বেচ্ছাসেবক',  q:'আমি দেখেছি রক্তকরবী অগণিতবার দাতা ও রোগীদের মধ্যে সেতুবন্ধন করেছে। সত্যিই অনুপ্রেরণামূলক।',                              badge:'৫০+ সাহায্য', c:'#8B3A3A' },
      ],
    },
  },
};

/* ─────────────────────── SVG Icons ─────────────────────── */
const PenIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);
const FrameIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const DropIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);
const ICONS = [PenIcon, FrameIcon, DropIcon];

/* ─────────────────────── Helpers ─────────────────────── */
const SLabel = ({ label, dark }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
    <div style={{ width:22, height:1, background: dark ? 'rgba(255,110,110,0.42)' : CR }}/>
    <span style={{ fontSize:9, fontWeight:800, letterSpacing:'0.26em', textTransform:'uppercase',
      color: dark ? 'rgba(255,170,170,0.78)' : CR }}>{label}</span>
  </div>
);

const TAG_C = { Health:'#1A7A40',News:'#1A508B',Community:'#8B5A1A',Education:'#5A1A8B',
  'স্বাস্থ্য':'#1A7A40','সংবাদ':'#1A508B','সম্প্রদায়':'#8B5A1A','শিক্ষা':'#5A1A8B' };

/* ─────────────────────── Blog Preview ─────────────────────── */
function BlogPreview({ d, setPage }) {
  return (
    <section style={{ padding:'60px 24px',background:DCREAM }}>
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <div className="u1" style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36,gap:16,flexWrap:'wrap' }}>
          <div>
            <SLabel label={d.lbl}/>
            <h2 style={{ fontFamily:HF,fontSize:'clamp(28px,3vw,40px)',fontWeight:900,color:DK }}>
              {d.t1} <em style={{ color:CR,fontStyle:'italic' }}>{d.t2}</em>
            </h2>
            <p style={{ color:WM,fontSize:13,marginTop:6 }}>{d.desc}</p>
          </div>
          <button className="ob" onClick={() => setPage('blog')}
            style={{ border:`1.5px solid ${CR}`,color:CR,padding:'9px 22px',borderRadius:9,
              fontSize:11,fontWeight:700,whiteSpace:'nowrap',background:'transparent' }}>
            {d.all}
          </button>
        </div>

        {/* 2 preview posts side by side */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24 }}>
          {d.posts.slice(0,2).map((p, i) => (
            <div key={i} className={`fcard u${i+2}`}
              style={{ flex:'1 1 280px',maxWidth:360,boxShadow:'0 8px 34px rgba(0,0,0,0.30)' }}
              onClick={() => setPage('blog')}>
              <div className="c-bar" style={{ height:3,borderRadius:'18px 18px 0 0' }}/>
              <div className="fbody" style={{ padding:'40px 34px 42px',position:'relative' }}>
                <div className="c-num" style={{
                  fontFamily:HF,fontSize:96,fontWeight:900,lineHeight:1,
                  position:'absolute',top:8,right:16,letterSpacing:'-0.05em',
                  userSelect:'none',pointerEvents:'none',
                  color:'rgba(139,26,26,0.055)',
                }}>0{i+1}</div>
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
    </section>
  );
}

/* ─────────────────────── Gallery Preview ─────────────────────── */
function ArtTile({ a, i }) {
  return (
    <div className={`fcard u${i+2}`}
      style={{ flex:'1 1 280px',maxWidth:360,boxShadow:'0 8px 34px rgba(0,0,0,0.30)' }}
      onClick={() => {}}>
      <div className="c-bar" style={{ height:3,borderRadius:'18px 18px 0 0' }}/>
      <div className="fbody" style={{ padding:'40px 34px 42px',position:'relative' }}>
        <div className="c-num" style={{
          fontFamily:HF,fontSize:96,fontWeight:900,lineHeight:1,
          position:'absolute',top:8,right:16,letterSpacing:'-0.05em',
          userSelect:'none',pointerEvents:'none',
          color:'rgba(139,26,26,0.055)',
        }}>0{i+1}</div>
        <div className="c-iwr" style={{
          width:56,height:56,borderRadius:'50%',border:'1px solid',
          display:'flex',alignItems:'center',justifyContent:'center',marginBottom:28,
          background:a.g
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="c-svg">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
          <span className="c-lbl" style={{ fontSize:9,fontWeight:800,letterSpacing:'0.26em',textTransform:'uppercase',whiteSpace:'nowrap' }}>ARTWORK</span>
          <div className="c-div" style={{ flex:1,height:1 }}/>
        </div>
        <div style={{ marginBottom:14 }}>
          <span className="c-head" style={{ fontFamily:HF,fontSize:27,fontWeight:900,display:'block',lineHeight:1.18 }}>{a.title}</span>
          <em className="c-ital" style={{ fontFamily:HF,fontSize:27,fontWeight:700,display:'block',lineHeight:1.18 }}>{a.artist}</em>
        </div>
        <p className="c-desc" style={{ fontSize:13,lineHeight:1.7,marginBottom:30 }}>{a.desc}</p>
        <button className="c-cta" style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 22px',borderRadius:8 }}>
          View Artwork <span className="c-arr">→</span>
        </button>
      </div>
    </div>
  );
}

function GalleryPreview({ d, setPage }) {
  return (
    <section style={{ padding:'60px 24px',background:CREAM }}>
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <div className="u1" style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36,gap:16,flexWrap:'wrap' }}>
          <div>
            <SLabel label={d.lbl}/>
            <h2 style={{ fontFamily:HF,fontSize:'clamp(28px,3vw,40px)',fontWeight:900,color:DK }}>
              {d.t1} <em style={{ color:CR,fontStyle:'italic' }}>{d.t2}</em>
            </h2>
            <p style={{ color:WM,fontSize:13,marginTop:6 }}>{d.desc}</p>
          </div>
          <button className="ob" onClick={() => setPage('gallery')}
            style={{ border:`1.5px solid ${CR}`,color:CR,padding:'9px 22px',borderRadius:9,
              fontSize:11,fontWeight:700,whiteSpace:'nowrap',background:'transparent' }}>
            {d.all}
          </button>
        </div>
        {/* Responsive: 3 tiles on wide, 2 on medium, 1 on narrow */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24 }}>
          {d.arts.slice(0,3).map((a, i) => <ArtTile key={i} a={a} i={i}/>)}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Experience Preview ─────────────────────── */
function StoryCard({ s, i }) {
  return (
    <div className={`fcard u${i+2}`}
      style={{ flex:'1 1 280px',maxWidth:360,boxShadow:'0 8px 34px rgba(0,0,0,0.30)' }}
      onClick={() => {}}>
      <div className="c-bar" style={{ height:3,borderRadius:'18px 18px 0 0' }}/>
      <div className="fbody" style={{ padding:'40px 34px 42px',position:'relative' }}>
        <div className="c-num" style={{
          fontFamily:HF,fontSize:96,fontWeight:900,lineHeight:1,
          position:'absolute',top:8,right:16,letterSpacing:'-0.05em',
          userSelect:'none',pointerEvents:'none',
          color:'rgba(139,26,26,0.055)',
        }}>0{i+1}</div>
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
        <button className="c-cta" style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',padding:'10px 22px',borderRadius:8 }}>
          Read Story <span className="c-arr">→</span>
        </button>
      </div>
    </div>
  );
}

function ExperiencePreview({ d, setPage }) {
  return (
    <section style={{ padding:'60px 24px',background:'linear-gradient(155deg,#0A0202 0%,#180707 55%,#200909 100%)' }}>
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <div className="u1" style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36,gap:16,flexWrap:'wrap' }}>
          <div>
            <SLabel label={d.lbl} dark/>
            <h2 style={{ fontFamily:HF,fontSize:'clamp(28px,3vw,40px)',fontWeight:900,color:'white' }}>
              {d.t1} <em style={{ color:'#FF9090',fontStyle:'italic' }}>{d.t2}</em>
            </h2>
            <p style={{ color:'rgba(255,200,200,0.46)',fontSize:13,marginTop:6 }}>{d.desc}</p>
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24,marginBottom:36 }}>
          {d.stories.slice(0,2).map((s, i) => (
            <StoryCard key={i} s={s} i={i}/>
          ))}
        </div>

        <div style={{ textAlign:'center' }}>
          <button className="cb" onClick={() => setPage('experience')}
            style={{ background:CR,color:'white',padding:'14px 52px',borderRadius:30,
              fontSize:12,fontWeight:700,letterSpacing:'0.09em',
              boxShadow:'0 8px 32px rgba(139,26,26,0.5)' }}>
            {d.seeAll}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Home ─────────────────────── */
function HomePage({ d, lang, setLang, setPage }) {
  return (
    <div>
      <FeatureSection onCardClick={setPage} />
      <BlogPreview     d={d.blog}       setPage={setPage}/>
      <GalleryPreview  d={d.gallery}    setPage={setPage}/>
      <ExperiencePreview d={d.experience} setPage={setPage}/>
    </div>
  );
}

/* ─────────────────────── Page Hero ─────────────────────── */
function PageHero({ bg, label, t1, t2, desc, back, setPage, stats }) {
  return (
    <div style={{ background:bg,padding:'60px 24px',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,right:0,width:260,height:260,borderRadius:'50%',
        background:'rgba(255,255,255,0.05)',transform:'translate(28%,-28%)' }}/>
      <div style={{ maxWidth:1100,margin:'0 auto',position:'relative' }}>
        <button onClick={() => setPage('home')} className="nl"
          style={{ color:'rgba(255,210,210,0.72)',fontSize:11,marginBottom:20,display:'block' }}>
          {back}
        </button>
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

/* ─────────────────────── Blog page ─────────────────────── */
function BlogPage({ d, setPage }) {
  return (
    <div className="pi">
      <PageHero
        bg="linear-gradient(148deg,#3D0808 0%,#8B1A1A 65%,#9C2020 100%)"
        label={d.lbl} t1={d.t1} t2={d.t2} desc={d.desc} back={d.back} setPage={setPage}
      />
      <div style={{ background:CREAM,minHeight:'55vh' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',padding:'48px 24px' }}>
          {/* Responsive: 2-col on wide, 1-col on narrow */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24 }}>
            {d.posts.map((p, i) => (
              <div key={i} className={`pc u${(i%2)+1}`}
                style={{ background:'white',borderRadius:18,overflow:'hidden',
                  boxShadow:'0 6px 28px rgba(0,0,0,0.08)',border:'1px solid rgba(139,26,26,0.07)' }}>
                <div style={{ height:6,background:`linear-gradient(90deg,${CR},${LCR})` }}/>
                <div style={{ padding:'24px 26px 28px' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                    <span style={{ fontSize:10,color:WM }}>{p.date}</span>
                    <span style={{ fontSize:8,fontWeight:800,letterSpacing:'0.1em',textTransform:'uppercase',
                      padding:'4px 12px',borderRadius:20,background:`${TAG_C[p.tag]||CR}14`,color:TAG_C[p.tag]||CR }}>{p.tag}</span>
                  </div>
                  <h3 style={{ fontFamily:HF,fontSize:20,fontWeight:700,color:DK,marginBottom:10,lineHeight:1.3 }}>{p.title}</h3>
                  <p style={{ fontSize:13.5,color:WM,lineHeight:1.68,marginBottom:20 }}>{p.ex}</p>
                  <div style={{ borderTop:'1px solid rgba(139,26,26,0.1)',paddingTop:16 }}>
                    <span style={{ color:CR,fontSize:12,fontWeight:700,cursor:'pointer' }}>{d.more}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Gallery page ─────────────────────── */
function GalleryPage({ d, setPage }) {
  return (
    <div className="pi">
      <PageHero
        bg={`linear-gradient(148deg,${CR} 0%,${LCR} 100%)`}
        label={d.lbl} t1={d.t1} t2={d.t2} desc={d.desc} back={d.back} setPage={setPage}
      />
      <div style={{ background:CREAM,minHeight:'55vh' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',padding:'48px 24px' }}>
          {/* Responsive grid: 3-col wide, 2-col medium, 1-col narrow */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>
            {d.arts.map((a, i) => (
              <div key={i} className={`u${(i%3)+1}`}><ArtTile a={a}/></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Experience page ─────────────────────── */
function ExperiencePage({ d, setPage }) {
  return (
    <div className="pi">
      <PageHero
        bg="linear-gradient(155deg,#0A0202 0%,#180707 55%,#200909 100%)"
        label={d.lbl} t1={d.t1} t2={d.t2} desc={d.desc} back={d.back} setPage={setPage}
        stats={d.stats}
      />
      <div style={{ background:'white',minHeight:'55vh' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',padding:'48px 24px' }}>
          {/* Responsive: 2-col wide, 1-col narrow */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:24 }}>
            {d.stories.map((s, i) => (
              <div key={i} className={`u${(i%2)+1}`}><StoryCard s={s} dark={false}/></div>
            ))}
          </div>

          {/* Share CTA */}
          <div style={{ marginTop:56,padding:'52px 40px',
            background:'linear-gradient(155deg,#0A0202,#180707)',
            borderRadius:22,position:'relative',overflow:'hidden',textAlign:'center' }}>
            <div style={{ position:'absolute',inset:0,
              background:'radial-gradient(ellipse at 50% 115%,rgba(196,30,58,0.2),transparent 65%)' }}/>
            <div className="throb" style={{ fontSize:34,marginBottom:16 }}>❤️</div>
            <h3 style={{ fontFamily:HF,fontSize:26,fontWeight:900,color:'white',marginBottom:10 }}>
              Have a Story to Share?
            </h3>
            <p style={{ color:'rgba(255,200,200,0.55)',fontSize:13,marginBottom:28 }}>
              Your experience could inspire others to donate and save lives.
            </p>
            <button className="cb"
              style={{ background:CR,color:'white',padding:'13px 50px',borderRadius:30,
                fontSize:12,fontWeight:700,letterSpacing:'0.08em',
                boxShadow:'0 8px 30px rgba(139,26,26,0.52)' }}>
              {d.shareCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Root ─────────────────────── */
export default function FeaturesPage() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const d = DATA[lang];
  const bf = lang === 'bn' ? "'Noto Serif Bengali',sans-serif" : "'DM Sans',sans-serif";

  const go = p => {
    setPage(p);
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 10);
  };

  return (
    <div style={{ fontFamily:bf,background:CREAM,minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div key={`${page}-${lang}`} className="pi">
        {page === 'home'       && <HomePage       d={d}            lang={lang} setLang={setLang} setPage={go}/>}
        {page === 'blog'       && <BlogPage       d={d.blog}       setPage={go}/>}
        {page === 'gallery'    && <GalleryPage    d={d.gallery}    setPage={go}/>}
        {page === 'experience' && <ExperiencePage d={d.experience} setPage={go}/>}
      </div>
    </div>
  );
}
