"use client";

import { useState } from "react";

type Lang = "en" | "bn";

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<Lang>("en");
  const isBn = lang === "bn";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Hind+Siliguri:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --crimson: #8B0000;
          --crimson-light: #a80000;
          --crimson-faint: #f9f0f0;
          --bg: #FAF7F2;
          --charcoal: #1A1A1A;
          --charcoal-mid: #3a3a3a;
          --charcoal-soft: #5a5a5a;
          --rule: #ddd8d0;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--charcoal);
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 16px;
          line-height: 1.85;
          -webkit-font-smoothing: antialiased;
        }

        .bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          line-height: 2;
        }

        /* ── LANGUAGE TOGGLE ── */
        .lang-toggle {
          position: fixed;
          top: 20px;
          right: 24px;
          z-index: 200;
          display: flex;
          border: 1.5px solid var(--rule);
          border-radius: 6px;
          overflow: hidden;
          background: var(--bg);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .lang-btn {
          padding: 7px 14px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--charcoal-soft);
          transition: background 0.18s, color 0.18s;
          font-family: 'Source Serif 4', serif;
        }
        .lang-btn.active {
          background: var(--crimson);
          color: #fff;
        }
        .lang-btn:not(.active):hover { background: var(--crimson-faint); color: var(--crimson); }

        /* ── HERO BAND ── */
        .hero-band {
          background: var(--crimson);
          color: #fff;
          text-align: center;
          padding: 72px 40px 60px;
          position: relative;
          overflow: hidden;
        }
        .hero-band::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            -45deg, transparent, transparent 28px,
            rgba(255,255,255,0.025) 28px, rgba(255,255,255,0.025) 29px
          );
          pointer-events: none;
        }
        .hero-name-primary {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          letter-spacing: 0.03em;
          line-height: 1.1;
        }
        .hero-name-secondary {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          font-weight: 400;
          font-style: italic;
          opacity: 0.82;
          margin-top: 4px;
        }
        .hero-tagline {
          margin-top: 18px;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.7;
          font-weight: 300;
        }
        .hero-rule {
          width: 48px;
          height: 1px;
          background: rgba(255,255,255,0.4);
          margin: 20px auto;
        }
        .hero-doc-title {
          font-family: 'Source Serif 4', serif;
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.65;
          font-weight: 300;
        }
        .hero-doc-title.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.04em;
          text-transform: none;
        }
        .hero-version {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.5;
          margin-top: 6px;
          font-weight: 300;
        }

        /* ── DOCUMENT BODY ── */
        .doc-wrap {
          max-width: 800px;
          margin: 0 auto;
          padding: 56px 40px 80px;
        }

        /* ── PREAMBLE ── */
        .preamble-block {
          background: var(--crimson-faint);
          border-left: 3px solid var(--crimson);
          padding: 22px 26px;
          border-radius: 0 4px 4px 0;
          margin-bottom: 52px;
        }
        .preamble-block p {
          font-size: 0.95rem;
          color: var(--charcoal-mid);
          line-height: 1.9;
        }
        .preamble-block p + p { margin-top: 14px; }
        .preamble-block strong { color: var(--crimson); font-weight: 600; }
        .preamble-block.bn-text p { font-family: 'Hind Siliguri', sans-serif; line-height: 2.1; }

        /* ── ARTICLE ── */
        .article {
          margin-bottom: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid var(--rule);
        }
        .article:last-child { border-bottom: none; margin-bottom: 0; }

        .article-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
          padding-left: 16px;
          border-left: 3px solid var(--crimson);
        }
        .article-number {
          font-family: 'Playfair Display', serif;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--crimson);
          font-weight: 600;
          padding-top: 5px;
          white-space: nowrap;
          opacity: 0.8;
        }
        .article-number.bn-num {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: none;
        }
        .article-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--crimson);
          line-height: 1.25;
        }
        .article-title.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
        }

        /* ── SUB ARTICLE ── */
        .sub-article { margin-bottom: 22px; }
        .sub-title {
          font-family: 'Playfair Display', serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .sub-title.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0;
          text-transform: none;
          font-weight: 600;
        }
        .sub-num { color: var(--crimson); margin-right: 6px; font-size: 0.8rem; }

        /* ── BODY TEXT ── */
        .article p, .body-text {
          font-size: 1rem;
          color: var(--charcoal-mid);
          line-height: 1.85;
          margin-bottom: 12px;
        }
        .article p:last-child { margin-bottom: 0; }
        .article p.bn-text { font-family: 'Hind Siliguri', sans-serif; line-height: 2.1; }

        /* ── BULLET LIST ── */
        .dot-list {
          list-style: none;
          margin: 10px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dot-list li {
          display: flex;
          gap: 12px;
          font-size: 1rem;
          color: var(--charcoal-mid);
          line-height: 1.8;
        }
        .dot-list li.bn-text { font-family: 'Hind Siliguri', sans-serif; line-height: 2.1; }
        .dot-mark {
          color: var(--crimson);
          font-size: 1.1rem;
          min-width: 14px;
          padding-top: 2px;
          line-height: 1.8;
        }

        /* ── DEFINITION LIST ── */
        .def-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }
        .def-item {
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 12px 20px;
          font-size: 0.96rem;
          line-height: 1.75;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--rule);
        }
        .def-item:last-child { border-bottom: none; }
        .def-term {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          color: var(--crimson);
          font-size: 0.88rem;
          line-height: 1.6;
          padding-top: 2px;
        }
        .def-term.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .def-meaning { color: var(--charcoal-mid); }
        .def-meaning.bn-text { font-family: 'Hind Siliguri', sans-serif; line-height: 2.1; }

        /* ── RIGHTS LIST ── */
        .rights-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 10px;
        }
        .right-item {
          padding: 14px 0;
          border-bottom: 1px solid var(--rule);
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 12px 20px;
          font-size: 0.96rem;
          color: var(--charcoal-mid);
          line-height: 1.75;
        }
        .right-item:last-child { border-bottom: none; }
        .right-name {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          color: var(--charcoal);
          font-size: 0.9rem;
          padding-top: 2px;
        }
        .right-name.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
        }
        .right-desc.bn-text { font-family: 'Hind Siliguri', sans-serif; line-height: 2.1; }

        /* ── RESPONSE NOTE ── */
        .response-note {
          margin-top: 20px;
          padding: 14px 18px;
          background: var(--crimson-faint);
          border-left: 3px solid var(--crimson);
          font-size: 0.9rem;
          color: var(--charcoal-mid);
          font-style: italic;
          line-height: 1.75;
        }
        .response-note.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-style: normal;
          line-height: 2;
        }

        /* ── DATA RETENTION TABLE ── */
        .retention-table-wrap {
          overflow-x: auto;
          margin-top: 16px;
          border-radius: 4px;
          border: 1px solid var(--rule);
        }
        .retention-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .retention-table th {
          background: var(--crimson);
          color: #fff;
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 12px 16px;
          text-align: left;
          white-space: nowrap;
        }
        .retention-table th.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.82rem;
          letter-spacing: 0;
          text-transform: none;
        }
        .retention-table td {
          padding: 12px 16px;
          color: var(--charcoal-mid);
          border-bottom: 1px solid var(--rule);
          line-height: 1.6;
          vertical-align: top;
        }
        .retention-table td.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          line-height: 1.9;
        }
        .retention-table tr:last-child td { border-bottom: none; }
        .retention-table tr:nth-child(even) td { background: rgba(139,0,0,0.025); }
        .retention-table td:first-child { font-weight: 500; color: var(--charcoal); }
        .retention-table td:nth-child(2) {
          color: var(--crimson);
          font-weight: 600;
          white-space: nowrap;
        }

        .table-note {
          margin-top: 16px;
          font-size: 0.88rem;
          color: var(--charcoal-soft);
          font-style: italic;
          line-height: 1.75;
        }
        .table-note.bn-text { font-family: 'Hind Siliguri', sans-serif; font-style: normal; }

        /* ── SECURITY GRID ── */
        .security-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 20px;
          margin-top: 10px;
        }
        .security-item {
          display: flex;
          gap: 10px;
          font-size: 0.93rem;
          color: var(--charcoal-mid);
          line-height: 1.75;
          padding: 10px 12px;
          background: #fff;
          border: 1px solid var(--rule);
          border-left: 3px solid var(--crimson);
          border-radius: 0 4px 4px 0;
        }
        .security-item.bn-text { font-family: 'Hind Siliguri', sans-serif; line-height: 2; }

        /* ── FOOTER ── */
        .doc-footer {
          text-align: center;
          padding: 32px 40px;
          border-top: 1px solid var(--rule);
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--charcoal-soft);
          font-weight: 300;
        }
        .doc-footer.bn-text {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0;
          text-transform: none;
        }
        .doc-footer span { color: var(--crimson); font-weight: 600; }

        @media (max-width: 680px) {
          .hero-band { padding: 56px 24px 44px; }
          .doc-wrap { padding: 40px 20px 60px; }
          .def-item, .right-item { grid-template-columns: 1fr; gap: 4px; }
          .security-grid { grid-template-columns: 1fr; }
          .doc-footer { padding: 24px 20px; }
          .lang-toggle { top: 12px; right: 12px; }
        }
      `}</style>

      {/* ── LANGUAGE TOGGLE ── */}
      <div className="lang-toggle">
        <button
          className={`lang-btn${!isBn ? " active" : ""}`}
          onClick={() => setLang("en")}
        >EN</button>
        <button
          className={`lang-btn${isBn ? " active" : ""}`}
          onClick={() => setLang("bn")}
        >বাং</button>
      </div>

      {/* ── HERO BAND ── */}
      <section className="hero-band">
        {isBn ? (
          <>
            <div className={`hero-name-primary bn-text`} style={{fontFamily:"'Hind Siliguri', sans-serif", fontWeight:600}}>রক্তকরবী</div>
            <div className="hero-name-secondary" style={{fontFamily:"'Hind Siliguri', sans-serif", fontStyle:'normal', fontWeight:300}}>RoktoKorobi</div>
            <div className="hero-tagline" style={{fontFamily:"'Hind Siliguri', sans-serif", letterSpacing:'0.04em', textTransform:'none'}}>রক্তদান প্ল্যাটফর্ম — বাংলাদেশ</div>
            <div className="hero-rule" />
            <div className={`hero-doc-title bn-text`}>গোপনীয়তা নীতি ও তথ্য সুরক্ষা বিধিমালা</div>
            <div className="hero-version" style={{letterSpacing:'0.04em'}}>সংস্করণ ১.১ &nbsp;·&nbsp; এপ্রিল ২০২৬</div>
          </>
        ) : (
          <>
            <div className="hero-name-primary">RoktoKorobi</div>
            <div className="hero-name-secondary">রক্তকরবী</div>
            <div className="hero-tagline">Blood Donation Platform — Bangladesh</div>
            <div className="hero-rule" />
            <div className="hero-doc-title">Privacy Policy &amp; Data Protection Regulations</div>
            <div className="hero-version">Version 1.1 &nbsp;·&nbsp; April 2026</div>
          </>
        )}
      </section>

      {/* ── DOCUMENT BODY ── */}
      <main className="doc-wrap">

        {/* PREAMBLE */}
        {isBn ? (
          <div className={`preamble-block bn-text`}>
            <p className="bn-text">
              এই গোপনীয়তা নীতি (<strong>"নীতিমালা"</strong>) বাংলাদেশের ভূখণ্ডে পরিচালিত একটি রক্তদান সহজীকরণ প্ল্যাটফর্ম রক্তকরবী (<strong>"প্ল্যাটফর্ম"</strong>, <strong>"আমরা"</strong>, <strong>"আমাদের"</strong>) কর্তৃক ব্যক্তিগত ডেটার সংগ্রহ, সংরক্ষণ, প্রক্রিয়াকরণ, ব্যবহার এবং প্রকাশ পরিচালনা করে।
            </p>
            <p className="bn-text">
              প্ল্যাটফর্ম গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের ৪৩ অনুচ্ছেদ, খসড়া ব্যক্তিগত তথ্য সুরক্ষা আইন ২০২৩, সাইবার নিরাপত্তা অধ্যাদেশ ২০২৫, স্বেচ্ছামূলক রক্তদানের জন্য WHO নৈতিক নির্দেশিকা এবং GDPR-এর নীতিসহ আন্তর্জাতিকভাবে স্বীকৃত সর্বোত্তম অনুশীলনের আলোকে তথ্য গোপনীয়তার সর্বোচ্চ মানদণ্ড বজায় রাখতে প্রতিশ্রুতিবদ্ধ।
            </p>
            <p className="bn-text">
              এই প্ল্যাটফর্মে নিবন্ধন করে এবং সাইন-আপে সক্রিয়ভাবে সম্মতি চেকবক্সে টিক দিয়ে, আপনি (<strong>"দাতা"</strong> বা <strong>"ডেটা বিষয়"</strong>) স্বীকার করছেন যে আপনি এই নীতিমালা সম্পূর্ণরূপে পড়েছেন, বুঝেছেন এবং সম্মত হয়েছেন।
            </p>
          </div>
        ) : (
          <div className="preamble-block">
            <p>
              This Privacy Policy (<strong>"the Policy"</strong>) governs the collection, storage, processing, use, and disclosure of personal data by RoktoKorobi (<strong>"the Platform"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), a blood donation facilitation platform operating within the territory of Bangladesh.
            </p>
            <p>
              The Platform is committed to upholding the highest standards of data privacy in the spirit of Article 43 of the Constitution of the People's Republic of Bangladesh, the Draft Personal Data Protection Act 2023, the Cyber Security Ordinance 2025, WHO ethical guidelines for voluntary blood donation, and internationally recognised best practices including principles of the GDPR.
            </p>
            <p>
              By registering on this Platform and actively ticking the consent checkbox at sign-up, you (the <strong>"Donor"</strong> or <strong>"Data Subject"</strong>) acknowledge that you have read, understood, and agreed to this Policy in full.
            </p>
          </div>
        )}

        {/* ── ARTICLE 1 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১" : "Article 1"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "সংজ্ঞাসমূহ" : "Definitions"}</h2>
          </div>
          {isBn ? (
            <div className="def-list">
              {[
                ['"ব্যক্তিগত ডেটা"', 'একজন চিহ্নিত বা চিহ্নিতযোগ্য প্রাকৃতিক ব্যক্তির সাথে সম্পর্কিত যেকোনো তথ্য, যার মধ্যে নাম, জন্মতারিখ, যোগাযোগের বিবরণ, রক্তের ধরন এবং স্বাস্থ্য-সম্পর্কিত তথ্য অন্তর্ভুক্ত।'],
                ['"সংবেদনশীল স্বাস্থ্য ডেটা"', 'শারীরিক বা মানসিক স্বাস্থ্য সম্পর্কিত ব্যক্তিগত ডেটা, রক্তের ধরন, চিকিৎসা ইতিহাস, দানের যোগ্যতার অবস্থা এবং রক্ত সঞ্চালন-সংক্রমক সংক্রমণ (TTI) পরীক্ষার ফলাফল সহ।'],
                ['"ডেটা নিয়ন্ত্রক"', 'রক্তকরবী, যা ব্যক্তিগত ডেটা প্রক্রিয়াকরণের উদ্দেশ্য এবং মাধ্যম নির্ধারণ করে।'],
                ['"ডেটা প্রসেসর"', 'একটি বাধ্যকর চুক্তির অধীনে এর পক্ষ থেকে ব্যক্তিগত ডেটা প্রক্রিয়া করতে প্ল্যাটফর্ম কর্তৃক নিযুক্ত যেকোনো তৃতীয় পক্ষ।'],
                ['"ডেটা বিষয়"', 'যেকোনো প্রাকৃতিক ব্যক্তি যার ব্যক্তিগত ডেটা প্ল্যাটফর্ম সংগ্রহ ও প্রক্রিয়া করে।'],
                ['"সম্মতি"', 'ডেটা বিষয়ের তাদের ব্যক্তিগত ডেটা প্রক্রিয়াকরণে সম্মতির স্বাধীনভাবে প্রদত্ত, নির্দিষ্ট, অবহিত এবং দ্ব্যর্থহীন ইঙ্গিত।'],
                ['"ডেটা লঙ্ঘন"', 'ব্যক্তিগত ডেটার যেকোনো আকস্মিক বা বেআইনি ধ্বংস, ক্ষতি, পরিবর্তন, অননুমোদিত প্রকাশ বা অ্যাক্সেস।'],
              ].map(([term, meaning]) => (
                <div className="def-item" key={term}>
                  <span className="def-term bn-text">{term}</span>
                  <span className="def-meaning bn-text">{meaning}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="def-list">
              {[
                ['"Personal Data"', 'means any information relating to an identified or identifiable natural person, including name, date of birth, contact details, blood type, and health-related information.'],
                ['"Sensitive Health Data"', 'means personal data pertaining to physical or mental health, including blood type, medical history, donation eligibility status, and transfusion-transmissible infection (TTI) test results.'],
                ['"Data Controller"', 'means RoktoKorobi, which determines the purposes and means of processing personal data.'],
                ['"Data Processor"', 'means any third party engaged by the Platform to process personal data on its behalf under a binding agreement.'],
                ['"Data Subject"', 'means any natural person whose personal data is collected and processed by the Platform.'],
                ['"Consent"', 'means a freely given, specific, informed, and unambiguous indication of the Data Subject\'s agreement to the processing of their personal data.'],
                ['"Data Breach"', 'means any accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to personal data.'],
              ].map(([term, meaning]) => (
                <div className="def-item" key={term}>
                  <span className="def-term">{term}</span>
                  <span className="def-meaning">{meaning}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── ARTICLE 2 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ২" : "Article 2"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা প্রক্রিয়াকরণের আইনগত ভিত্তি" : "Legal Basis for Data Processing"}</h2>
          </div>

          {isBn ? (
            <>
              {[
                ['২.১', 'অবহিত সম্মতি', 'নিবন্ধনের পূর্বে, প্রতিটি দাতাকে একটি স্পষ্ট, সাধারণ-ভাষার সম্মতি নোটিশ উপস্থাপন করা হবে। সম্মতি একটি সক্রিয়, দ্ব্যর্থহীন চেকবক্সের মাধ্যমে নেওয়া হয়। দাতারা যেকোনো সময় অ্যাকাউন্ট সেটিংস বা লিখিত অনুরোধের মাধ্যমে সম্মতি প্রত্যাহার করতে পারেন। প্রত্যাহার পূর্ববর্তী প্রক্রিয়াকরণের বৈধতাকে প্রভাবিত করবে না।'],
                ['২.২', 'চুক্তিগত প্রয়োজনীয়তা', 'দাতা-প্রাপক ম্যাচিং, অনুরোধ ব্যবস্থাপনা এবং চিকিৎসা ফলো-আপ সহ স্বেচ্ছামূলক রক্তদান সেবা সহজ করতে প্ল্যাটফর্মের বাধ্যবাধকতা পূরণের জন্য প্রক্রিয়াকরণ প্রয়োজন।'],
                ['২.৩', 'অত্যাবশ্যক স্বার্থ', 'জরুরি চিকিৎসা পরিস্থিতি সহ দাতা বা অন্য প্রাকৃতিক ব্যক্তির অত্যাবশ্যক স্বার্থ রক্ষার জন্য যেখানে প্রয়োজন সেখানে প্রক্রিয়াকরণ করা যেতে পারে।'],
                ['২.৪', 'আইনগত বাধ্যবাধকতা', 'প্রযোজ্য বাংলাদেশি আইন, বিচারিক আদেশ বা উপযুক্ত নিয়ন্ত্রক কর্তৃপক্ষের নির্দেশনা মেনে চলতে প্রয়োজন হলে প্ল্যাটফর্ম ব্যক্তিগত ডেটা প্রক্রিয়া করতে পারে।'],
              ].map(([num, title, text]) => (
                <div className="sub-article" key={num}>
                  <div className="sub-title bn-text"><span className="sub-num">{num}</span>{title}</div>
                  <p className="bn-text">{text}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                ['2.1', 'Informed Consent', 'Prior to registration, each Donor shall be presented with a clear, plain-language consent notice. Consent is obtained through an active, unambiguous checkbox. Donors may withdraw consent at any time via account settings or written request. Withdrawal shall not affect the lawfulness of prior processing.'],
                ['2.2', 'Contractual Necessity', 'Processing is necessary to fulfil the Platform\'s obligations in facilitating voluntary blood donation services, including donor-recipient matching, request management, and medical follow-up.'],
                ['2.3', 'Vital Interests', 'Processing may be carried out where necessary to protect the vital interests of the Donor or another natural person, including in emergency medical situations.'],
                ['2.4', 'Legal Obligation', 'The Platform may process personal data where required to comply with applicable Bangladeshi laws, judicial orders, or directives of competent regulatory authorities.'],
              ].map(([num, title, text]) => (
                <div className="sub-article" key={num}>
                  <div className="sub-title"><span className="sub-num">{num}</span>{title}</div>
                  <p>{text}</p>
                </div>
              ))}
            </>
          )}
        </section>

        {/* ── ARTICLE 3 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৩" : "Article 3"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "সংগৃহীত ডেটা" : "Data Collected"}</h2>
          </div>

          {isBn ? (
            <>
              <div className="sub-article">
                <div className="sub-title bn-text"><span className="sub-num">৩.১</span>সংগৃহীত ডেটার বিভাগসমূহ</div>
                <p className="bn-text">প্ল্যাটফর্ম দাতাদের কাছ থেকে নিম্নলিখিত ব্যক্তিগত ডেটা সংগ্রহ করে:</p>
                {[
                  ['(ক) পরিচয় ও যোগাযোগ ডেটা:', ['পূর্ণ আইনি নাম', 'জন্মতারিখ ও বয়স', 'মোবাইল নম্বর ও ইমেইল ঠিকানা', 'বাসস্থানের জেলা ও বিভাগ']],
                  ['(খ) স্বাস্থ্য ও দান ডেটা:', ['রক্তের গ্রুপ ও Rh ফ্যাক্টর', 'দানের যোগ্যতার সাথে সম্পর্কিত চিকিৎসা ইতিহাস', 'দানের ইতিহাস ও ফ্রিকোয়েন্সি', 'TTI স্ক্রিনিং পরীক্ষার ফলাফল (যেখানে প্রযোজ্য)', 'জরুরি যোগাযোগের তথ্য']],
                  ['(গ) প্রযুক্তিগত ও ব্যবহার ডেটা:', ['আইপি ঠিকানা, ডিভাইসের ধরন, ব্রাউজার/অ্যাপ সংস্করণ এবং অ্যাক্সেস টাইমস্ট্যাম্প (শুধুমাত্র নিরাপত্তা ও প্রতারণা প্রতিরোধ উদ্দেশ্যে)']],
                ].map(([cat, items]) => (
                  <div key={String(cat)} style={{marginTop:'14px'}}>
                    <div style={{fontFamily:"'Hind Siliguri', sans-serif", fontWeight:600, fontSize:'0.9rem', color:'var(--charcoal)', marginBottom:'6px'}}>{cat}</div>
                    <ul className="dot-list">
                      {(items as string[]).map((item) => (
                        <li key={item} className="bn-text"><span className="dot-mark">·</span><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="sub-article">
                <div className="sub-title bn-text"><span className="sub-num">৩.২</span>ডেটা ন্যূনীকরণ</div>
                <p className="bn-text">প্ল্যাটফর্ম কেবলমাত্র এমন ব্যক্তিগত ডেটা সংগ্রহ করে যা যে উদ্দেশ্যে প্রক্রিয়া করা হয় তার জন্য কঠোরভাবে প্রয়োজনীয় ও আনুপাতিক। সরকার-প্রদত্ত পরিচয় নম্বর এই প্ল্যাটফর্ম সংগ্রহ করে না।</p>
              </div>
              <div className="sub-article">
                <div className="sub-title bn-text"><span className="sub-num">৩.৩</span>নির্ভুলতা</div>
                <p className="bn-text">নিবন্ধনের সময় এবং প্ল্যাটফর্ম ব্যবহারকালে প্রদত্ত তথ্য সঠিক ও আপ টু ডেট রাখার দায়িত্ব দাতাদের।</p>
              </div>
            </>
          ) : (
            <>
              <div className="sub-article">
                <div className="sub-title"><span className="sub-num">3.1</span>Categories of Data Collected</div>
                <p>The Platform collects the following personal data from Donors:</p>
                {[
                  ['(a) Identity & Contact Data:', ['Full legal name', 'Date of birth and age', 'Mobile number and email address', 'District and division of residence']],
                  ['(b) Health & Donation Data:', ['Blood group and Rh factor', 'Medical history relevant to donation eligibility (recent illness, current medications, recent travel history)', 'Donation history and frequency', 'Results of TTI screening tests (where applicable)', 'Emergency contact information']],
                  ['(c) Technical & Usage Data:', ['IP address, device type, browser/app version, and access timestamps (for security and fraud prevention purposes only)']],
                ].map(([cat, items]) => (
                  <div key={String(cat)} style={{marginTop:'14px'}}>
                    <div style={{fontFamily:"'Playfair Display', serif", fontWeight:600, fontSize:'0.88rem', color:'var(--charcoal)', marginBottom:'6px'}}>{cat}</div>
                    <ul className="dot-list">
                      {(items as string[]).map((item) => (
                        <li key={item}><span className="dot-mark">·</span><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="sub-article">
                <div className="sub-title"><span className="sub-num">3.2</span>Data Minimisation</div>
                <p>The Platform collects only such personal data as is strictly necessary and proportionate to the purposes for which it is processed. Government-issued identification numbers are not collected by this Platform.</p>
              </div>
              <div className="sub-article">
                <div className="sub-title"><span className="sub-num">3.3</span>Accuracy</div>
                <p>Donors are responsible for ensuring that information provided during registration and throughout their use of the Platform is accurate and up to date.</p>
              </div>
            </>
          )}
        </section>

        {/* ── ARTICLE 4 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৪" : "Article 4"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা প্রক্রিয়াকরণের উদ্দেশ্যসমূহ" : "Purposes of Data Processing"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn ? "প্ল্যাটফর্ম কেবলমাত্র নিম্নলিখিত উদ্দেশ্যে দাতার ডেটা প্রক্রিয়া করবে:" : "The Platform shall process Donor data solely for the following purposes:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'রক্তদানের জন্য দাতার যোগ্যতা যাচাইকরণ',
              'রক্তের প্রয়োজনে প্রাপকদের সাথে যোগ্য দাতাদের ম্যাচিং',
              'রক্তের অনুরোধ ব্যবস্থাপনা ও প্রতিক্রিয়া',
              'যোগ্য দাতাদের কাছে জরুরি রক্ত সরবরাহের প্রয়োজনীয়তা জানানো',
              'দাতাদের TTI পরীক্ষার ফলাফল জানানো এবং উপযুক্ত রেফারেল প্রদান',
              'নিরাপদ ও নির্ভরযোগ্য স্বেচ্ছামূলক রক্ত সরবরাহ শৃঙ্খল বজায় রাখা',
              'অভ্যন্তরীণ মান নিশ্চিতকরণ ও পরিচালনামূলক পর্যালোচনা পরিচালনা',
              'প্রযোজ্য স্বাস্থ্য বিধিমালা ও রিপোর্টিং বাধ্যবাধকতা মেনে চলা',
              'একত্রিত, নামহীন জনস্বাস্থ্য বিশ্লেষণ ও গবেষণা (পৃথক লিখিত সম্মতি প্রয়োজন)',
              'দুর্যোগ ত্রাণ ও জরুরি সমন্বয়, যেখানে প্রযোজ্য',
            ] : [
              'Verification of Donor eligibility for blood donation',
              'Matching eligible Donors with Recipients in need of blood',
              'Managing and responding to blood requests',
              'Communicating urgent blood supply needs to eligible Donors',
              'Notifying Donors of TTI test results and providing appropriate referrals',
              'Maintaining a safe and reliable voluntary blood supply chain',
              'Conducting internal quality assurance and operational reviews',
              'Complying with applicable health regulations and reporting obligations',
              'Aggregated, anonymised public health analytics and research (requiring separate written consent)',
              'Disaster relief and emergency coordination, where applicable',
            ]).map((item) => (
              <li key={item} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{item}</span></li>
            ))}
          </ul>
          <div className={`response-note${isBn ? " bn-text" : ""}`} style={{marginTop:'20px', fontStyle: isBn ? 'normal':'italic'}}>
            {isBn
              ? "প্ল্যাটফর্ম বাণিজ্যিক বিপণন, বিজ্ঞাপন, তৃতীয়-পক্ষ প্রোফাইলিং বা উপরের সাথে অসামঞ্জস্যপূর্ণ অন্য কোনো উদ্দেশ্যে স্পষ্ট ও পৃথক অবহিত সম্মতি ছাড়া দাতার ডেটা প্রক্রিয়া করবে না।"
              : "The Platform shall not process Donor data for commercial marketing, advertising, third-party profiling, or any other purpose incompatible with the above, without explicit and separate informed consent."}
          </div>
        </section>

        {/* ── ARTICLE 5 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৫" : "Article 5"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা শেয়ারিং ও প্রকাশ" : "Data Sharing and Disclosure"}</h2>
          </div>

          {isBn ? (
            <>
              <div className="sub-article">
                <div className="sub-title bn-text"><span className="sub-num">৫.১</span>তৃতীয়-পক্ষ প্রকাশ</div>
                <p className="bn-text">প্ল্যাটফর্ম নিম্নলিখিত কঠোরভাবে সীমিত পরিস্থিতি ছাড়া তৃতীয় পক্ষের কাছে ব্যক্তিগত ডেটা বিক্রয়, ভাড়া, ব্যবসা বা প্রকাশ করবে না:</p>
                <ul className="dot-list" style={{marginTop:'10px'}}>
                  {['দাতার যত্ন বা চিকিৎসায় সরাসরি সম্পৃক্ত স্বাস্থ্যসেবা প্রদানকারীদের কাছে','বাংলাদেশি আইন দ্বারা প্রয়োজনীয় সরকারি স্বাস্থ্য কর্তৃপক্ষ বা নিয়ন্ত্রক সংস্থার কাছে','জাতীয়ভাবে ঘোষিত জরুরি অবস্থায় দুর্যোগ ত্রাণ সংস্থার কাছে','TTI পরীক্ষা ও রক্ত গ্রুপ সেরোলজির জন্য স্বীকৃত পরীক্ষাগারের কাছে','বাধ্যকর ডেটা প্রক্রিয়াকরণ চুক্তির অধীনে আইটি অবকাঠামো ও হোস্টিং সেবা প্রদানকারীদের কাছে'].map(i=><li key={i} className="bn-text"><span className="dot-mark">·</span><span>{i}</span></li>)}
                </ul>
              </div>
              {[['৫.২','দাতা-প্রাপকের পরিচয় গোপনীয়তা','রক্তের প্রাপকের সাথে সম্পর্কিত দাতার পরিচয় গোপনীয়তা সর্বদা কঠোরভাবে বজায় রাখা হবে, যদি না আইন দ্বারা স্পষ্টভাবে প্রয়োজন হয় বা দাতা স্পষ্ট লিখিত সম্মতি প্রদান করেন।'],['৫.৩','ডেটা প্রক্রিয়াকরণ চুক্তি','প্ল্যাটফর্ম কর্তৃক নিযুক্ত সকল তৃতীয়-পক্ষ ডেটা প্রসেসর এই নীতিমালার সমতুল্য ডেটা সুরক্ষা বাধ্যবাধকতা আরোপকারী একটি আনুষ্ঠানিক ডেটা প্রক্রিয়াকরণ চুক্তিতে প্রবেশ করবে।'],['৫.৪','ডেটা বিক্রয় নেই','প্ল্যাটফর্ম কখনও দাতার ব্যক্তিগত ডেটা বিক্রয়, বিনিময় বা অন্যথায় বাণিজ্যিকভাবে শোষণ করবে না।']].map(([num,title,text])=>(
                <div className="sub-article" key={num}><div className="sub-title bn-text"><span className="sub-num">{num}</span>{title}</div><p className="bn-text">{text}</p></div>
              ))}
            </>
          ) : (
            <>
              <div className="sub-article">
                <div className="sub-title"><span className="sub-num">5.1</span>Third-Party Disclosure</div>
                <p>The Platform shall not sell, rent, trade, or disclose personal data to third parties except in the following strictly limited circumstances:</p>
                <ul className="dot-list" style={{marginTop:'10px'}}>
                  {['To healthcare providers directly involved in Donor care or treatment','To government health authorities or regulatory bodies as required by Bangladeshi law','To disaster relief agencies in the event of a nationally declared emergency','To accredited laboratories for TTI testing and blood group serology','To IT infrastructure and hosting service providers under binding Data Processing Agreements'].map(i=><li key={i}><span className="dot-mark">·</span><span>{i}</span></li>)}
                </ul>
              </div>
              {[['5.2','Donor-Recipient Anonymity','The anonymity of the Donor in relation to the blood recipient shall be strictly maintained at all times, except where expressly required by law or where the Donor has provided explicit written consent.'],['5.3','Data Processing Agreements','All third-party Data Processors engaged by the Platform shall enter into a formal Data Processing Agreement imposing data protection obligations equivalent to those in this Policy.'],['5.4','No Sale of Data','The Platform shall never sell, exchange, or otherwise commercially exploit Donor personal data.']].map(([num,title,text])=>(
                <div className="sub-article" key={num}><div className="sub-title"><span className="sub-num">{num}</span>{title}</div><p>{text}</p></div>
              ))}
            </>
          )}
        </section>

        {/* ── ARTICLE 6 — RIGHTS ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৬" : "Article 6"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "দাতার অধিকারসমূহ" : "Donor Rights"}</h2>
          </div>
          <div className="rights-list">
            {(isBn ? [
              ['অ্যাক্সেসের অধিকার', 'প্ল্যাটফর্ম কর্তৃক তাদের সম্পর্কে রাখা সকল ব্যক্তিগত ডেটার একটি কপি অনুরোধ করুন।'],
              ['সংশোধনের অধিকার', 'অসঠিক বা অসম্পূর্ণ ব্যক্তিগত ডেটা সংশোধনের অনুরোধ করুন।'],
              ['মুছে ফেলার অধিকার', 'আইনগত বা স্বাস্থ্য সুরক্ষা বাধ্যবাধকতার অধীনে, ব্যক্তিগত ডেটা মুছে ফেলার অনুরোধ করুন।'],
              ['প্রক্রিয়াকরণ সীমাবদ্ধ করার অধিকার', 'বিরোধ নিষ্পত্তির অপেক্ষায় ডেটা প্রক্রিয়াকরণের অস্থায়ী স্থগিতাদেশ অনুরোধ করুন।'],
              ['সম্মতি প্রত্যাহারের অধিকার', 'অ্যাকাউন্ট সেটিংস বা লিখিত অনুরোধের মাধ্যমে কোনো জরিমানা ছাড়াই যেকোনো সময় সম্মতি প্রত্যাহার করুন।'],
              ['স্বয়ংক্রিয় প্রক্রিয়াকরণে আপত্তির অধিকার', 'অর্থপূর্ণ মানবিক পর্যালোচনা ছাড়াই শুধুমাত্র স্বয়ংক্রিয় মাধ্যমে নেওয়া সিদ্ধান্তে আপত্তি করুন।'],
              ['ডেটা পোর্টেবিলিটির অধিকার', 'কাঠামোগত, সাধারণভাবে ব্যবহৃত, মেশিন-পাঠযোগ্য ফরম্যাটে ব্যক্তিগত ডেটা অনুরোধ করুন।'],
              ['অভিযোগ দাখিলের অধিকার', 'বাংলাদেশ ডেটা সুরক্ষা বোর্ড বা উপযুক্ত আদালতে অভিযোগ দাখিল করুন।'],
            ] : [
              ['Right to Access', 'Request a copy of all personal data held about them by the Platform.'],
              ['Right to Rectification', 'Request correction of inaccurate or incomplete personal data.'],
              ['Right to Erasure', 'Request deletion of personal data, subject to overriding legal or health safety obligations.'],
              ['Right to Restrict Processing', 'Request temporary suspension of data processing pending dispute resolution.'],
              ['Right to Withdraw Consent', 'Withdraw consent at any time without penalty via account settings or written request.'],
              ['Right to Object to Automated Processing', 'Object to decisions made solely by automated means without meaningful human review.'],
              ['Right to Data Portability', 'Request personal data in a structured, commonly used, machine-readable format.'],
              ['Right to Lodge a Complaint', 'File a complaint with the Bangladesh Data Protection Board or competent courts.'],
            ]).map(([name, desc]) => (
              <div className="right-item" key={name}>
                <span className={`right-name${isBn ? " bn-text" : ""}`}>{name}</span>
                <span className={`right-desc${isBn ? " bn-text" : ""}`}>{desc}</span>
              </div>
            ))}
          </div>
          <div className={`response-note${isBn ? " bn-text" : ""}`} style={{fontStyle: isBn ? 'normal' : 'italic'}}>
            {isBn
              ? "সকল অধিকার অনুরোধ ত্রিশ (৩০) ক্যালেন্ডার দিনের মধ্যে স্বীকার ও প্রতিক্রিয়া জানানো হবে। প্রক্রিয়াকরণের আগে পরিচয় যাচাইকরণ প্রয়োজন হতে পারে।"
              : "All rights requests shall be acknowledged and responded to within thirty (30) calendar days. Identity verification may be required before processing."}
          </div>
        </section>

        {/* ── ARTICLE 7 — SECURITY ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৭" : "Article 7"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা নিরাপত্তা ব্যবস্থা" : "Data Security Measures"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'16px'}}>
            {isBn ? "প্ল্যাটফর্ম নিম্নলিখিত নিরাপত্তা ব্যবস্থা বাস্তবায়ন ও বজায় রাখে:" : "The Platform implements and maintains the following security measures:"}
          </p>
          <div className="security-grid">
            {(isBn ? [
              'ট্রানজিটে সংবেদনশীল স্বাস্থ্য ডেটার এন্ড-টু-এন্ড এনক্রিপশন (TLS 1.2+) এবং বিশ্রামে (AES-256)',
              'সমস্ত প্রশাসনিক অ্যাক্সেসের জন্য মাল্টি-ফ্যাক্টর অথেন্টিকেশন (MFA)',
              'শুধুমাত্র অনুমোদিত কর্মীদের কাছে ডেটা অ্যাক্সেস সীমিত করতে ভূমিকা-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ',
              'বিশ্লেষণাত্মক ও পরিচালনামূলক ওয়ার্কফ্লোতে দাতার রেকর্ডের ছদ্মনামীকরণ',
              'নিয়মিত নিরাপত্তা অডিট, পেনিট্রেশন টেস্টিং এবং দুর্বলতা মূল্যায়ন',
              'ঘটনা প্রতিক্রিয়া ও ডেটা লঙ্ঘন ব্যবস্থাপনা পদ্ধতির ডকুমেন্টেশন',
              'ব্যবসায়িক ধারাবাহিকতা ও দুর্যোগ পুনরুদ্ধারের জন্য অফলাইন অপরিবর্তনীয় ব্যাকআপ',
              'ডেটা গোপনীয়তা, গোপনীয়তা এবং নিরাপত্তা প্রোটোকলে বার্ষিক কর্মী প্রশিক্ষণ',
            ] : [
              'End-to-end encryption of sensitive health data in transit (TLS 1.2+) and at rest (AES-256)',
              'Multi-factor authentication (MFA) for all administrative access',
              'Role-based access controls limiting data access to authorised personnel only',
              'Pseudonymisation of donor records in analytical and operational workflows',
              'Regular security audits, penetration testing, and vulnerability assessments',
              'Documented incident response and data breach management procedures',
              'Offline immutable backups for business continuity and disaster recovery',
              'Annual staff training on data privacy, confidentiality, and security protocols',
            ]).map((item) => (
              <div key={item} className={`security-item${isBn ? " bn-text" : ""}`}>{item}</div>
            ))}
          </div>
        </section>

        {/* ── ARTICLE 8 — RETENTION TABLE ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৮" : "Article 8"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা ধারণ ও মুছে ফেলা" : "Data Retention and Deletion"}</h2>
          </div>
          <div className="retention-table-wrap">
            <table className="retention-table">
              <thead>
                <tr>
                  <th className={isBn ? "bn-text" : ""}>{isBn ? "ডেটার বিভাগ" : "Data Category"}</th>
                  <th className={isBn ? "bn-text" : ""}>{isBn ? "ধারণের মেয়াদ" : "Retention Period"}</th>
                  <th className={isBn ? "bn-text" : ""}>{isBn ? "ভিত্তি" : "Basis"}</th>
                </tr>
              </thead>
              <tbody>
                {(isBn ? [
                  ['দাতার পরিচয় ও যোগাযোগ ডেটা', 'অ্যাকাউন্ট সক্রিয় মেয়াদ + ৫ বছর', 'পরিচালনাগত প্রয়োজনীয়তা'],
                  ['দান ও চিকিৎসা ইতিহাস', 'ন্যূনতম ১০ বছর', 'WHO ও স্বাস্থ্য সুরক্ষা মানদণ্ড'],
                  ['TTI পরীক্ষার ফলাফল', 'ন্যূনতম ১০ বছর', 'আইনগত ও সুরক্ষা বাধ্যবাধকতা'],
                  ['ডিভাইস ও প্রযুক্তিগত লগ ডেটা', '৯০ দিন', 'নিরাপত্তা পর্যবেক্ষণ'],
                  ['নামহীন বিশ্লেষণ ডেটা', 'অনির্দিষ্টকাল', 'একত্রিত জনস্বাস্থ্য ব্যবহার'],
                ] : [
                  ['Donor identity & contact data', 'Account active period + 5 years', 'Operational necessity'],
                  ['Donation & medical history', 'Minimum 10 years', 'WHO & health safety standards'],
                  ['TTI test results', 'Minimum 10 years', 'Legal & safety obligations'],
                  ['Device & technical log data', '90 days', 'Security monitoring'],
                  ['Anonymised analytics data', 'Indefinite', 'Aggregate public health use'],
                ]).map(([cat, period, basis]) => (
                  <tr key={cat}>
                    <td className={isBn ? "bn-text" : ""}>{cat}</td>
                    <td className={isBn ? "bn-text" : ""}>{period}</td>
                    <td className={isBn ? "bn-text" : ""}>{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`table-note${isBn ? " bn-text" : ""}`}>
            {isBn
              ? "অ্যাকাউন্ট মুছে ফেলার পর, প্রযোজ্য আইন, স্বাস্থ্য বিধিমালা বা বৈধ সুরক্ষা স্বার্থ দ্বারা ধারণ প্রয়োজন না হলে সকল ব্যক্তিগত ডেটা নিরাপদে মুছে ফেলা হবে।"
              : "Upon account deletion, all personal data shall be securely erased unless retention is required by applicable law, health regulation, or legitimate safety interest."}
          </p>
        </section>

        {/* ── ARTICLE 9 — BREACH ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৯" : "Article 9"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা লঙ্ঘনের বিজ্ঞপ্তি" : "Data Breach Notification"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn ? "দাতাদের উল্লেখযোগ্য ঝুঁকি সৃষ্টিকারী ডেটা লঙ্ঘনের ক্ষেত্রে, প্ল্যাটফর্ম নিম্নলিখিত কাজ করবে:" : "In the event of a Data Breach posing significant risk to Donors, the Platform shall:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'খসড়া ব্যক্তিগত তথ্য সুরক্ষা আইন ২০২৩-এর অধীনে প্রয়োজনীয়ভাবে লঙ্ঘন সম্পর্কে অবগত হওয়ার বাহাত্তর (৭২) ঘণ্টার মধ্যে প্রাসঙ্গিক নিয়ন্ত্রক কর্তৃপক্ষকে অবহিত করুন',
              'লঙ্ঘন তাদের অধিকার বা সুরক্ষায় উচ্চ ঝুঁকি সৃষ্টি করার সম্ভাবনা থাকলে অযথা বিলম্ব ছাড়াই ক্ষতিগ্রস্ত দাতাদের অবহিত করুন',
              'সকল লঙ্ঘন, তাদের প্রকৃতি, সুযোগ, প্রভাব এবং সকল প্রতিকারমূলক পদক্ষেপের ডকুমেন্টেড রেকর্ড বজায় রাখুন',
            ] : [
              'Notify the relevant regulatory authority within seventy-two (72) hours of becoming aware of the breach, as required under the Draft Personal Data Protection Act 2023',
              'Notify affected Donors without undue delay where the breach is likely to result in high risk to their rights or safety',
              'Maintain documented records of all breaches, their nature, scope, effects, and all remedial actions taken',
            ]).map(i=><li key={i} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{i}</span></li>)}
          </ul>
        </section>

        {/* ── ARTICLE 10 — CHILDREN ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১০" : "Article 10"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "শিশুদের ডেটা" : "Children's Data"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "এই প্ল্যাটফর্ম আঠারো (১৮) বছরের কম বয়সী ব্যক্তিদের জন্য নয়। যেখানে ষোল (১৬) থেকে আঠারো (১৮) বছর বয়সী দাতাকে প্রযোজ্য বাংলাদেশি স্বাস্থ্য বিধিমালার অধীনে রক্তদানের অনুমতি দেওয়া হয়, সেখানে নিবন্ধন ও ডেটা প্রক্রিয়াকরণের আগে যাচাইযোগ্য পিতামাতা বা আইনি অভিভাবকের সম্মতি নেওয়া হবে। কোনো অবস্থায়ই নাবালকদের ডেটার লক্ষ্যমাত্রা প্রক্রিয়াকরণ, প্রোফাইলিং বা আচরণগত বিশ্লেষণ পরিচালনা করা হবে না।"
              : "This Platform is not intended for persons under eighteen (18) years of age. Where a Donor between sixteen (16) and eighteen (18) years is permitted under applicable Bangladeshi health regulations to donate blood, verifiable parental or legal guardian consent shall be obtained prior to registration and data processing. No targeted processing, profiling, or behavioural analysis of minors' data shall be conducted under any circumstances."}
          </p>
        </section>

        {/* ── ARTICLE 11 — COOKIES ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১১" : "Article 11"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "কুকিজ ও ট্র্যাকিং প্রযুক্তি" : "Cookies and Tracking Technologies"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn ? "প্ল্যাটফর্ম কেবলমাত্র নিম্নলিখিত উদ্দেশ্যে কুকিজ ও অনুরূপ প্রযুক্তি ব্যবহার করে:" : "The Platform uses cookies and similar technologies solely for:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'সেশন নিরাপত্তা ও ব্যবহারকারী অথেন্টিকেশন',
              'প্ল্যাটফর্ম কার্যকারিতা ও পছন্দ সংরক্ষণ',
              'প্ল্যাটফর্মের কার্যকারিতা উন্নত করতে নামহীন, একত্রিত বিশ্লেষণ',
            ] : [
              'Session security and user authentication',
              'Platform functionality and preference storage',
              'Anonymised, aggregated analytics to improve Platform performance',
            ]).map(i=><li key={i} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{i}</span></li>)}
          </ul>
          <div className={`response-note${isBn ? " bn-text" : ""}`} style={{marginTop:'16px', fontStyle: isBn ? 'normal' : 'italic'}}>
            {isBn
              ? "কোনো তৃতীয়-পক্ষ বিজ্ঞাপন, রিটার্গেটিং বা ট্র্যাকিং কুকিজ মোতায়েন করা হয় না। প্রথম ব্যবহারে দাতাদের অবহিত করা হয় এবং প্ল্যাটফর্ম সেটিংসের মাধ্যমে কুকি পছন্দ পরিচালনা করতে পারেন।"
              : "No third-party advertising, retargeting, or tracking cookies are deployed. Donors are informed upon first use and may manage cookie preferences through Platform settings."}
          </div>
        </section>

        {/* ── ARTICLE 12 — CROSS BORDER ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১২" : "Article 12"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "আন্তঃসীমান্ত ডেটা স্থানান্তর" : "Cross-Border Data Transfers"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn
              ? "বাংলাদেশি দাতাদের ব্যক্তিগত ডেটা পরিচালনাগতভাবে সম্ভব হলে বাংলাদেশের মধ্যে অবস্থিত সার্ভারে সংরক্ষণ করা হবে। যেকোনো আন্তঃসীমান্ত স্থানান্তর কেবলমাত্র নিম্নলিখিত ক্ষেত্রে ঘটবে:"
              : "Personal data of Bangladeshi Donors shall be stored on servers located within Bangladesh wherever operationally feasible. Any cross-border transfer shall only occur where:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'প্রাপক দেশ পর্যাপ্ত মাত্রার ডেটা সুরক্ষা নিশ্চিত করে',
              'স্ট্যান্ডার্ড চুক্তিভিত্তিক ধারার মতো উপযুক্ত সুরক্ষা ব্যবস্থা রয়েছে',
              'দাতার স্পষ্ট অবহিত সম্মতি নেওয়া হয়েছে',
            ] : [
              'The recipient country ensures an adequate level of data protection',
              'Appropriate safeguards such as standard contractual clauses are in place',
              'Explicit informed consent of the Donor has been obtained',
            ]).map(i=><li key={i} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{i}</span></li>)}
          </ul>
        </section>

        {/* ── ARTICLE 13 — DPO (no contact info) ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১৩" : "Article 13"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ডেটা সুরক্ষা কর্মকর্তা (DPO)" : "Data Protection Officer (DPO)"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn
              ? "প্ল্যাটফর্ম নিম্নলিখিত দায়িত্বে একজন ডেটা সুরক্ষা কর্মকর্তা মনোনীত করে:"
              : "The Platform designates a Data Protection Officer responsible for:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'এই নীতিমালা ও প্রযোজ্য ডেটা সুরক্ষা আইন মেনে চলার তদারকি',
              'তাদের অধিকার প্রয়োগকারী দাতাদের জন্য প্রাথমিক যোগাযোগ হিসেবে কাজ করা',
              'বাংলাদেশ ডেটা সুরক্ষা বোর্ড ও নিয়ন্ত্রক কর্তৃপক্ষের সাথে সমন্বয়',
              'পর্যায়ক্রমিক গোপনীয়তা প্রভাব মূল্যায়ন (PIA) পরিচালনা',
            ] : [
              'Overseeing compliance with this Policy and applicable data protection law',
              'Acting as the primary contact for Donors exercising their rights',
              'Liaising with the Bangladesh Data Protection Board and regulatory authorities',
              'Conducting periodic Privacy Impact Assessments (PIAs)',
            ]).map(i=><li key={i} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{i}</span></li>)}
          </ul>
          <div className={`response-note${isBn ? " bn-text" : ""}`} style={{marginTop:'16px', fontStyle: isBn ? 'normal' : 'italic'}}>
            {isBn
              ? "DPO-এর সাথে যোগাযোগ করতে, অনুগ্রহ করে প্ল্যাটফর্মের অ্যাকাউন্ট সেটিংস বা সাপোর্ট চ্যানেলের মাধ্যমে একটি লিখিত অনুরোধ জমা দিন।"
              : "To contact the DPO, please submit a written request through the Platform's account settings or support channel."}
          </div>
        </section>

        {/* ── ARTICLE 14 — AMENDMENTS ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১৪" : "Article 14"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "এই নীতিমালায় সংশোধন" : "Amendments to this Policy"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "প্ল্যাটফর্ম যেকোনো সময় এই নীতিমালা সংশোধনের অধিকার সংরক্ষণ করে। গুরুত্বপূর্ণ পরিবর্তন কার্যকর হওয়ার কমপক্ষে ত্রিশ (৩০) দিন আগে অ্যাপ-মধ্যে বিজ্ঞপ্তি এবং/অথবা ইমেইলের মাধ্যমে দাতাদের অবহিত করা হবে। কার্যকর তারিখের পরে প্ল্যাটফর্মের অব্যাহত ব্যবহার সংশোধিত নীতিমালা গ্রহণ করা বোঝায়।"
              : "The Platform reserves the right to amend this Policy at any time. Material changes shall be notified to Donors via in-app notice and/or email no less than thirty (30) days prior to taking effect. Continued use of the Platform after the effective date constitutes acceptance of the amended Policy."}
          </p>
        </section>

        {/* ── ARTICLE 15 — GOVERNING LAW ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১৫" : "Article 15"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি" : "Governing Law and Dispute Resolution"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "এই নীতিমালা গণপ্রজাতন্ত্রী বাংলাদেশের আইন দ্বারা পরিচালিত হবে। এই নীতিমালা থেকে উদ্ভূত যেকোনো বিরোধ প্রথমে সমাধানের জন্য প্ল্যাটফর্মের DPO-এর কাছে পাঠানো হবে। ত্রিশ (৩০) দিনের মধ্যে অমীমাংসিত থাকলে, বিরোধ বাংলাদেশের উপযুক্ত আদালতের এখতিয়ারে জমা দেওয়া হবে।"
              : "This Policy shall be governed by the laws of the People's Republic of Bangladesh. Any dispute arising from this Policy shall first be referred to the Platform for resolution. If unresolved within thirty (30) days, disputes shall be submitted to the jurisdiction of the competent courts of Bangladesh."}
          </p>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className={`doc-footer${isBn ? " bn-text" : ""}`}>
        {isBn
          ? <span style={{letterSpacing:0}}>© ২০২৬ <span>রক্তকরবী</span>। সর্বস্বত্ব সংরক্ষিত।</span>
          : <>© 2026 <span>RoktoKorobi</span>. All rights reserved.</>}
      </footer>
    </>
  );
}
