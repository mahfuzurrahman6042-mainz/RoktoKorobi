"use client";

import { useState } from "react";

type Lang = "en" | "bn";

export default function TermsOfService() {
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
            <div className={`hero-doc-title bn-text`}>শর্তাবলী ও ব্যবহারের শর্তসমূহ</div>
            <div className="hero-version" style={{letterSpacing:'0.04em'}}>সংস্করণ ১.১ &nbsp;·&nbsp; এপ্রিল ২০২৬</div>
          </>
        ) : (
          <>
            <div className="hero-name-primary">RoktoKorobi</div>
            <div className="hero-name-secondary">রক্তকরবী</div>
            <div className="hero-tagline">Blood Donation Platform — Bangladesh</div>
            <div className="hero-rule" />
            <div className="hero-doc-title">Terms of Service &amp; Conditions of Use</div>
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
              এই শর্তাবলী ও ব্যবহারের শর্তসমূহ (<strong>"শর্তাবলী"</strong>) বাংলাদেশের ভূখণ্ডে পরিচালিত একটি রক্তদান সহজীকরণ প্ল্যাটফর্ম রক্তকরবী (<strong>"প্ল্যাটফর্ম"</strong>, <strong>"আমরা"</strong>, <strong>"আমাদের"</strong>) ব্যবহারের আইনগত চুক্তি গঠন করে।
            </p>
            <p className="bn-text">
              এই প্ল্যাটফর্মে নিবন্ধন করে এবং সাইন-আপে সক্রিয়ভাবে সম্মতি চেকবক্সে টিক দিয়ে, আপনি (<strong>"ব্যবহারকারী"</strong> বা <strong>"দাতা"</strong>) স্বীকার করছেন যে আপনি এই শর্তাবলী সম্পূর্ণরূপে পড়েছেন, বুঝেছেন এবং সম্মত হয়েছেন।
            </p>
            <p className="bn-text">
              এই শর্তাবলী প্ল্যাটফর্ম ব্যবহার সম্পর্কে আপনার অধিকার ও দায়িত্ব নির্ধারণ করে। প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী দ্বারা আবদ্ধ হবেন।
            </p>
          </div>
        ) : (
          <div className="preamble-block">
            <p>
              These Terms of Service and Conditions of Use (<strong>"the Terms"</strong>) constitute a legally binding agreement between you and RoktoKorobi (<strong>"the Platform"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), a blood donation facilitation platform operating within the territory of Bangladesh.
            </p>
            <p>
              By registering on this Platform and actively ticking the consent checkbox at sign-up, you (the <strong>"User"</strong> or <strong>"Donor"</strong>) acknowledge that you have read, understood, and agreed to these Terms in full.
            </p>
            <p>
              These Terms govern your rights and obligations regarding use of the Platform. By using the Platform, you agree to be bound by these Terms.
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
                ['"প্ল্যাটফর্ম"', 'রক্তকরবী দ্বারা পরিচালিত রক্তদান সহজীকরণ প্ল্যাটফর্ম, যার মধ্যে ওয়েবসাইট, মোবাইল অ্যাপ্লিকেশন এবং সম্পর্কিত পরিষেবা অন্তর্ভুক্ত।'],
                ['"ব্যবহারকারী"', 'প্ল্যাটফর্মে নিবন্ধিত যেকোনো ব্যক্তি, রক্তদাতা বা প্রাপক।'],
                ['"দাতা"', 'স্বেচ্ছামূলক রক্তদানের জন্য নিবন্ধিত ব্যবহারকারী।'],
                ['"প্রাপক"', 'রক্তের প্রয়োজনে রক্তদাতার সাথে সংযোগ স্থাপনকারী ব্যবহারকারী।'],
                ['"অ্যাকাউন্ট"', 'প্ল্যাটফর্মে নিবন্ধিত ব্যবহারকারীর ব্যক্তিগত প্রোফাইল ও সেটিংস।'],
                ['"সামগ্রী"', 'প্ল্যাটফর্মে উপলব্ধ সকল তথ্য, টেক্সট, চিত্র, ভিডিও এবং অন্যান্য উপাদান।'],
                ['"ব্যবহারের শর্ত"', 'এই শর্তাবলী ও ব্যবহারের শর্তসমূহ।'],
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
                ['"Platform"', 'the blood donation facilitation platform operated by RoktoKorobi, including the website, mobile application, and related services.'],
                ['"User"', 'any individual registered on the Platform, whether as a Donor or Recipient.'],
                ['"Donor"', 'a User registered for voluntary blood donation.'],
                ['"Recipient"', 'a User seeking to connect with Donors for blood needs.'],
                ['"Account"', 'the personal profile and settings of a registered User on the Platform.'],
                ['"Content"', 'all information, text, images, videos, and other materials available on the Platform.'],
                ['"Terms"', 'these Terms of Service and Conditions of Use.'],
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
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "গ্রহণ ও সম্মতি" : "Acceptance and Consent"}</h2>
          </div>

          {isBn ? (
            <>
              {[
                ['২.১', 'সম্মতি', 'নিবন্ধনের পূর্বে, প্রতিটি ব্যবহারকারীকে একটি স্পষ্ট, সাধারণ-ভাষার সম্মতি নোটিশ উপস্থাপন করা হবে। সম্মতি একটি সক্রিয়, দ্ব্যর্থহীন চেকবক্সের মাধ্যমে নেওয়া হয়।'],
                ['২.২', 'শর্তাবলী গ্রহণ', 'প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী গ্রহণ করছেন এবং তাতে আবদ্ধ হচ্ছেন।'],
                ['২.৩', 'সম্মতি প্রত্যাহার', 'ব্যবহারকারীরা যেকোনো সময় অ্যাকাউন্ট মুছে ফেলার মাধ্যমে প্ল্যাটফর্ম ব্যবহার বন্ধ করতে পারেন।'],
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
                ['2.1', 'Consent', 'Prior to registration, each User shall be presented with a clear, plain-language consent notice. Consent is obtained through an active, unambiguous checkbox.'],
                ['2.2', 'Acceptance of Terms', 'By using the Platform, you accept and agree to be bound by these Terms.'],
                ['2.3', 'Withdrawal of Consent', 'Users may discontinue use of the Platform at any time by deleting their account.'],
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
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "যোগ্যতা ও নিবন্ধন" : "Eligibility and Registration"}</h2>
          </div>

          {isBn ? (
            <>
              {[
                ['৩.১', 'বয়স সীমা', 'প্ল্যাটফর্ম ব্যবহার করার জন্য ব্যবহারকারীর বয়স অন্তত ১৮ বছর হতে হবে।'],
                ['৩.২', 'সঠিক তথ্য', 'নিবন্ধনের সময় প্রদত্ত সকল তথ্য সঠিক, সম্পূর্ণ এবং আপ টু ডেট হতে হবে।'],
                ['৩.৩', 'অ্যাকাউন্ট দায়িত্ব', 'ব্যবহারকারী তাদের অ্যাকাউন্টের নিরাপত্তা এবং তাদের পাসওয়ার্ডের গোপনীয়তার জন্য দায়ী।'],
                ['৩.৪', 'একটি অ্যাকাউন্ট', 'প্রতিটি ব্যবহারকারী কেবলমাত্র একটি অ্যাকাউন্ট রাখতে পারেন।'],
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
                ['3.1', 'Age Requirement', 'Users must be at least 18 years of age to use the Platform.'],
                ['3.2', 'Accurate Information', 'All information provided during registration must be accurate, complete, and up to date.'],
                ['3.3', 'Account Responsibility', 'Users are responsible for maintaining the security of their account and the confidentiality of their password.'],
                ['3.4', 'One Account Per User', 'Each User may maintain only one account.'],
              ].map(([num, title, text]) => (
                <div className="sub-article" key={num}>
                  <div className="sub-title"><span className="sub-num">{num}</span>{title}</div>
                  <p>{text}</p>
                </div>
              ))}
            </>
          )}
        </section>

        {/* ── ARTICLE 4 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৪" : "Article 4"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ব্যবহারকারীর আচরণ" : "User Conduct"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn ? "ব্যবহারকারীরা নিম্নলিখিত আচরণ থেকে বিরত থাকতে সম্মত হন:" : "Users agree to refrain from the following conduct:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'প্ল্যাটফর্মটি কোনো অবৈধ উদ্দেশ্যে ব্যবহার করা',
              'মিথ্যা বা বিভ্রান্তিকর তথ্য প্রদান করা',
              'অন্য ব্যবহারকারীদের হয়রানি বা হুমকি দেওয়া',
              'প্ল্যাটফর্মের নিরাপত্তা বা কার্যকারিতা ব্যাহত করা',
              'বাণিজ্যিক বিজ্ঞাপন বা স্প্যাম প্রেরণ করা',
              'অন্য ব্যবহারকারীর পরিচয় ছদ্মবেশ ধারণ করা',
            ] : [
              'Using the Platform for any illegal purpose',
              'Providing false or misleading information',
              'Harassing or threatening other Users',
              'Interfering with the security or functionality of the Platform',
              'Sending commercial advertisements or spam',
              'Impersonating another User',
            ]).map((item) => (
              <li key={item} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{item}</span></li>
            ))}
          </ul>
        </section>

        {/* ── ARTICLE 5 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৫" : "Article 5"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "ব্যবহারকারীর অধিকার" : "User Rights"}</h2>
          </div>

          {isBn ? (
            <>
              {[
                ['৫.১', 'অ্যাক্সেস', 'ব্যবহারকারীরা তাদের অ্যাকাউন্ট অ্যাক্সেস এবং পরিচালনা করতে পারেন।'],
                ['৫.২', 'তথ্য সংশোধন', 'ব্যবহারকারীরা তাদের ব্যক্তিগত তথ্য যেকোনো সময় আপডেট করতে পারেন।'],
                ['৫.৩', 'অ্যাকাউন্ট মুছে ফেলা', 'ব্যবহারকারীরা যেকোনো সময় তাদের অ্যাকাউন্ট মুছে ফেলতে পারেন।'],
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
                ['5.1', 'Access', 'Users may access and manage their accounts.'],
                ['5.2', 'Data Correction', 'Users may update their personal information at any time.'],
                ['5.3', 'Account Deletion', 'Users may delete their accounts at any time.'],
              ].map(([num, title, text]) => (
                <div className="sub-article" key={num}>
                  <div className="sub-title"><span className="sub-num">{num}</span>{title}</div>
                  <p>{text}</p>
                </div>
              ))}
            </>
          )}
        </section>

        {/* ── ARTICLE 6 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৬" : "Article 6"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "গোপনীয়তা নীতি" : "Privacy Policy"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "প্ল্যাটফর্ম ব্যবহার আমাদের গোপনীয়তা নীতি দ্বারাও নিয়ন্ত্রিত হয়। দয়া করে আমাদের গোপনীয়তা নীতি পর্যালোচনা করুন, যা প্ল্যাটফর্মে তথ্য সংগ্রহ ও ব্যবহার সম্পর্কে ব্যবহারকারীদের অবহিত করে।"
              : "Your use of the Platform is also governed by our Privacy Policy. Please review our Privacy Policy, which informs Users about data collection and use on the Platform."}
          </p>
        </section>

        {/* ── ARTICLE 7 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৭" : "Article 7"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "বৌদ্ধিক সম্পত্তি" : "Intellectual Property"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn ? "প্ল্যাটফর্মের সকল সামগ্রী, বৈশিষ্ট্য এবং কার্যকারিতা রক্তকরবীর মালিকানাধীন এবং আন্তর্জাতিক কপিরাইট, ট্রেডমার্ক এবং অন্যান্য বৌদ্ধিক সম্পত্তি আইন দ্বারা সুরক্ষিত।" : "All content, features, and functionality of the Platform are owned by RoktoKorobi and are protected by international copyright, trademark, and other intellectual property laws."}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'আমাদের স্পষ্ট লিখিত সম্মতি ছাড়া সামগ্রী পুনরুৎপাদন করা',
              'আমাদের স্পষ্ট লিখিত সম্মতি ছাড়া সামগ্রী বিতরণ করা',
              'আমাদের স্পষ্ট লিখিত সম্মতি ছাড়া উদ্ভূত কাজ তৈরি করা',
            ] : [
              'Reproducing content without our express written consent',
              'Distributing content without our express written consent',
              'Creating derivative works without our express written consent',
            ]).map((item) => (
              <li key={item} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{item}</span></li>
            ))}
          </ul>
        </section>

        {/* ── ARTICLE 8 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৮" : "Article 8"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "দাবিত্যাগ" : "Disclaimer"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)', marginBottom:'14px'}}>
            {isBn ? "প্ল্যাটফর্মটি কোনো ধরনের ওয়ারেন্টি ছাড়া \"যেমন আছে\" এবং \"যেমন উপলব্ধ\" ভিত্তিতে প্রদান করা হয়:" : "The Platform is provided on an \"as is\" and \"as available\" basis without warranties of any kind:"}
          </p>
          <ul className="dot-list">
            {(isBn ? [
              'প্ল্যাটফর্মটি অবিচ্ছিন্ন বা নিরাপদ হবে তার নিশ্চয়তা নেই',
              'প্ল্যাটফর্মটি ত্রুটিমুক্ত হবে না তার নিশ্চয়তা নেই',
              'প্রদত্ত চিকিৎসা তথ্য শুধুমাত্র তথ্যের উদ্দেশ্যে এবং চিকিৎসা পরামর্শ হিসাবে বিবেচনা করা উচিত নয়',
            ] : [
              'We do not guarantee that the Platform will be uninterrupted or secure',
              'We do not guarantee that the Platform will be error-free',
              'Medical information provided is for informational purposes only and should not be considered medical advice',
            ]).map((item) => (
              <li key={item} className={isBn ? "bn-text" : ""}><span className="dot-mark">·</span><span>{item}</span></li>
            ))}
          </ul>
        </section>

        {/* ── ARTICLE 9 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ৯" : "Article 9"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "দায়বদ্ধতার সীমাবদ্ধতা" : "Limitation of Liability"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "কোনো পরিস্থিতিতেই রক্তকরবী প্ল্যাটফর্ম ব্যবহারের ফলে বা তার সাথে সম্পর্কিত কোনো পরোক্ষ, আকস্মিক, বিশেষ বা ফলস্বরূপ ক্ষতির জন্য দায়ী থাকবে না।"
              : "In no event shall RoktoKorobi be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of the Platform."}
          </p>
        </section>

        {/* ── ARTICLE 10 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১০" : "Article 10"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "সমাপ্তি" : "Termination"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "আমরা যে কোনো সময়ে, পূর্ব নোটিশ ছাড়াই, যে কোনো কারণে, সহিত এই শর্তাবলী লঙ্ঘন সহ কিন্তু সীমাবদ্ধ নয়, প্ল্যাটফর্মে আপনার অ্যাক্সেস বন্ধ বা স্থগিত করার অধিকার সংরক্ষণ করি।"
              : "We reserve the right to terminate or suspend your access to the Platform at any time, without prior notice, for any reason, including but not limited to breach of these Terms."}
          </p>
        </section>

        {/* ── ARTICLE 11 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১১" : "Article 11"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "শর্তাবলী পরিবর্তন" : "Changes to Terms"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "আমরা যে কোনো সময়ে এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি। এই ধরনের পরিবর্তনের পরে আপনার প্ল্যাটফর্ম চালিয়ে যাওয়া নতুন শর্তাবলী গ্রহণ হিসাবে গণ্য হবে।"
              : "We reserve the right to modify these Terms at any time. Your continued use of the Platform after such modifications constitutes your acceptance of the new Terms."}
          </p>
        </section>

        {/* ── ARTICLE 12 ── */}
        <section className="article">
          <div className="article-header">
            <span className={`article-number${isBn ? " bn-num" : ""}`}>{isBn ? "অনুচ্ছেদ ১২" : "Article 12"}</span>
            <h2 className={`article-title${isBn ? " bn-text" : ""}`}>{isBn ? "প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি" : "Governing Law and Dispute Resolution"}</h2>
          </div>
          <p className={isBn ? "bn-text" : ""} style={{color:'var(--charcoal-mid)'}}>
            {isBn
              ? "এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন দ্বারা পরিচালিত হবে। এই শর্তাবলী থেকে উদ্ভূত যেকোনো বিরোধ বাংলাদেশের উপযুক্ত আদালতের এখতিয়ারে জমা দেওয়া হবে।"
              : "These Terms shall be governed by the laws of the People's Republic of Bangladesh. Any dispute arising from these Terms shall be submitted to the jurisdiction of the competent courts of Bangladesh."}
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
