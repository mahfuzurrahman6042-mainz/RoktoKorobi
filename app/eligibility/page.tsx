'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Eligibility() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eligAge, setEligAge] = useState('');
  const [eligWeight, setEligWeight] = useState('');
  const [eligHealth, setEligHealth] = useState('');
  const [eligResult, setEligResult] = useState<{ eligible: boolean; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const handleEligibilityCheck = () => {
    setIsChecking(true);
    setEligResult(null);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      console.log('Eligibility check clicked');
      console.log('eligAge:', eligAge);
      console.log('eligWeight:', eligWeight);
      console.log('eligHealth:', eligHealth);
      
      const ageNum = parseInt(eligAge);
      const weightNum = parseFloat(eligWeight);
      
      console.log('ageNum:', ageNum);
      console.log('weightNum:', weightNum);

      if (!eligAge || !eligWeight || !eligHealth) {
        console.log('Missing fields');
        setEligResult({ eligible: false, message: language === 'bn' ? 'সব ক্ষেত্র পূরণ করুন' : 'Please fill in all fields' });
        setIsChecking(false);
        return;
      }

      if (isNaN(ageNum) || isNaN(weightNum)) {
        console.log('Invalid numbers');
        setEligResult({ eligible: false, message: language === 'bn' ? 'সঠিক সংখ্যা দিন' : 'Please enter valid numbers' });
        setIsChecking(false);
        return;
      }

      if (ageNum < 18 || ageNum > 65) {
        console.log('Age out of range');
        setEligResult({ eligible: false, message: language === 'bn' ? 'বয়স ১৮-৬৫ বছরের মধ্যে হতে হবে' : 'Age must be between 18 and 65' });
        setIsChecking(false);
        return;
      }

      if (weightNum < 50) {
        console.log('Weight too low');
        setEligResult({ eligible: false, message: language === 'bn' ? 'ওজন কমপক্ষে ৫০ কেজি হতে হবে' : 'Weight must be at least 50 kg' });
        setIsChecking(false);
        return;
      }

      if (eligHealth !== 'healthy') {
        console.log('Not healthy');
        setEligResult({ eligible: false, message: language === 'bn' ? 'সুস্থ থাকতে হবে' : 'Must be in good health' });
        setIsChecking(false);
        return;
      }

      console.log('Eligible!');
      setEligResult({ eligible: true, message: language === 'bn' ? 'আপনি যোগ্য!' : 'You are eligible!' });
      setIsChecking(false);
    }, 500);
  };

  if (!mounted) return null;

  return (
    <div>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '28px' }}>🩸</span>
          <span style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#8B1A1A',
            whiteSpace: 'nowrap'
          }}>
            {language === 'bn' ? 'রক্তকরবী' : 'RoktoKorobi'}
          </span>
        </div>
        <div className="elig-nav-links" style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'center'
        }}>
          <a href="/" style={{
            textDecoration: 'none',
            color: '#1A1A1A',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'color 0.3s ease'
          }}>
            {language === 'bn' ? 'হোম' : 'Home'}
          </a>
          <a href="/donors" style={{
            textDecoration: 'none',
            color: '#1A1A1A',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'color 0.3s ease'
          }}>
            {language === 'bn' ? 'দাতা' : 'Donors'}
          </a>
          <a href="/eligibility" style={{
            textDecoration: 'none',
            color: '#8B1A1A',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            {language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}
          </a>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '20px',
                background: language === 'en' ? '#8B1A1A' : 'transparent',
                color: language === 'en' ? 'white' : '#8B1A1A',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '20px',
                background: language === 'bn' ? '#8B1A1A' : 'transparent',
                color: language === 'bn' ? 'white' : '#8B1A1A',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
            >
              বাংলা
            </button>
          </div>
        </div>
        <button
          className="elig-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '5px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <span style={{
            width: '24px',
            height: '2px',
            background: '#8B1A1A',
            transition: 'all 0.3s ease'
          }} />
          <span style={{
            width: '24px',
            height: '2px',
            background: '#8B1A1A',
            transition: 'all 0.3s ease'
          }} />
          <span style={{
            width: '24px',
            height: '2px',
            background: '#8B1A1A',
            transition: 'all 0.3s ease'
          }} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          background: 'white',
          padding: '24px',
          zIndex: 999,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <a href="/" style={{
            textDecoration: 'none',
            color: '#1A1A1A',
            fontWeight: 600,
            fontSize: '18px',
            padding: '12px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {language === 'bn' ? 'হোম' : 'Home'}
          </a>
          <a href="/donors" style={{
            textDecoration: 'none',
            color: '#1A1A1A',
            fontWeight: 600,
            fontSize: '18px',
            padding: '12px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {language === 'bn' ? 'দাতা' : 'Donors'}
          </a>
          <a href="/eligibility" style={{
            textDecoration: 'none',
            color: '#8B1A1A',
            fontWeight: 700,
            fontSize: '18px',
            padding: '12px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}
          </a>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '24px',
                background: language === 'en' ? '#8B1A1A' : 'transparent',
                color: language === 'en' ? 'white' : '#8B1A1A',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '24px',
                background: language === 'bn' ? '#8B1A1A' : 'transparent',
                color: language === 'bn' ? 'white' : '#8B1A1A',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px'
              }}
            >
              বাংলা
            </button>
          </div>
        </div>
      )}

      {/* Eligibility Section */}
      <section className="eligibility py-16 lg:py-24" style={{ paddingTop: '120px', background: '#faf5f0', minHeight: '100vh' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="elig-layout grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="elig-left space-y-6">
              <div className="s-label">
                <div className="s-label-line"></div>
                <span className="s-label-text">{language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}</span>
              </div>
              <h2 className="s-title text-2xl lg:text-3xl font-bold">
                {language === 'bn' ? 'রক্তদানের' : 'Blood Donation'}
                <span className="accent">{language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}</span>
              </h2>
              <p className="s-desc text-lg">
                {language === 'bn'
                  ? 'আপনি কি রক্তদানের জন্য যোগ্য? এখানে বিস্তারিত তথ্য দেখুন।'
                  : 'Are you eligible to donate blood? Check the detailed information here.'}
              </p>
              <div className="criteria-list space-y-4">
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg" style={{ boxSizing: 'border-box', overflow: 'hidden', width: '100%' }}>
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div style={{ flex: 1, minWidth: 0, wordWrap: 'break-word' }}>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'বয়স: ১৮-৬৫ বছর' : 'Age: 18-65 years'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'সুস্থ প্রাপ্তবয়স্করা দাতা হতে পারেন' : 'Healthy adults can be donors'}</p>
                  </div>
                </div>
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg" style={{ boxSizing: 'border-box', overflow: 'hidden', width: '100%' }}>
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div style={{ flex: 1, minWidth: 0, wordWrap: 'break-word' }}>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'ওজন: ৫০ কেজি বা তার বেশি' : 'Weight: 50kg or more'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'ন্যূনতম ওজন প্রয়োজন' : 'Minimum weight required'}</p>
                  </div>
                </div>
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg" style={{ boxSizing: 'border-box', overflow: 'hidden', width: '100%' }}>
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div style={{ flex: 1, minWidth: 0, wordWrap: 'break-word' }}>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'স্বাস্থ্য ভালো থাকতে হবে' : 'Must be in good health'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'কোনো গুরুতর রোগ নেই' : 'No serious illnesses'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="elig-card bg-white rounded-2xl shadow-2xl p-8 lg:p-10 border border-gray-100" style={{ boxSizing: 'border-box', overflow: 'hidden', width: '100%' }}>
              <div className="sc-title text-2xl font-bold mb-8 text-center" style={{ color: '#1A0F0A' }}>
                {language === 'bn' ? 'যোগ্যতা পরীক্ষা করুন' : 'Check Eligibility'}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleEligibilityCheck(); }}>
                <div className="form-row space-y-5 flex flex-col">
                  <div>
                    <label className="form-label block text-sm font-semibold mb-2" style={{ color: '#3D2314' }}>
                      {language === 'bn' ? 'আপনার বয়স' : 'Your Age'}
                    </label>
                    <input 
                      type="number" 
                      className="form-input w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" 
                      placeholder={language === 'bn' ? 'বছরে' : 'In years'} 
                      value={eligAge}
                      onChange={(e) => setEligAge(e.target.value)}
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label block text-sm font-semibold mb-2" style={{ color: '#3D2314' }}>
                      {language === 'bn' ? 'আপনার ওজন' : 'Your Weight'}
                    </label>
                    <input 
                      type="number" 
                      className="form-input w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" 
                      placeholder={language === 'bn' ? 'কেজিতে' : 'In kg'} 
                      value={eligWeight}
                      onChange={(e) => setEligWeight(e.target.value)}
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label block text-sm font-semibold mb-2" style={{ color: '#3D2314' }}>
                      {language === 'bn' ? 'স্বাস্থ্য অবস্থা' : 'Health Status'}
                    </label>
                    <select 
                      className="form-select w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      value={eligHealth}
                      onChange={(e) => setEligHealth(e.target.value)}
                      style={{ fontSize: '16px' }}
                    >
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select...'}</option>
                      <option value="healthy">{language === 'bn' ? 'সুস্থ আছি' : 'I am healthy'}</option>
                      <option value="ill">{language === 'bn' ? 'সাময়িক অসুস্থ' : 'Temporarily ill'}</option>
                      <option value="chronic">{language === 'bn' ? 'দীর্ঘমেয়াদী রোগ' : 'Chronic condition'}</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isChecking}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    backgroundColor: '#BE1528',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '17px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : "'DM Sans', sans-serif",
                    transition: 'filter 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.88)';
                    const arrowBox = e.currentTarget.querySelector('.arrow-box') as HTMLElement;
                    if (arrowBox) arrowBox.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                    const arrowBox = e.currentTarget.querySelector('.arrow-box') as HTMLElement;
                    if (arrowBox) arrowBox.style.transform = 'translateX(0)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.97)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isChecking ? (
                    <>
                      <span style={{ color: '#ffffff' }}>{language === 'bn' ? 'পরীক্ষা করছে...' : 'Checking...'}</span>
                      <div className="arrow-box" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' }}>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#ffffff' }}>{language === 'bn' ? 'যোগ্যতা যাচাই করুন' : 'Check Eligibility'}</span>
                      <div className="arrow-box" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                      </div>
                    </>
                  )}
                </button>
              </form>
              {eligResult && (
                <div className={`mt-6 p-6 rounded-xl border-2 ${
                  eligResult.eligible 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                }`} style={{
                  boxShadow: eligResult.eligible ? '0 8px 24px rgba(34,197,94,.15)' : '0 8px 24px rgba(220,38,38,.15)'
                }}>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      eligResult.eligible 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                        : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                    }`}>
                      {eligResult.eligible ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-bold ${
                        eligResult.eligible 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {eligResult.message}
                      </h4>
                      {eligResult.eligible && (
                        <p className="text-green-700 mt-2">{language === 'bn' ? 'আপনি রক্তদান করতে পারেন। নিবন্ধন করুন।' : 'You can donate blood. Register now.'}</p>
                      )}
                      {!eligResult.eligible && (
                        <p className="text-red-700 mt-2 text-sm">{language === 'bn' ? 'দয়া করে উপরের মানদণ্ডগুলি পূরণ করুন এবং আবার চেষ্টা করুন।' : 'Please meet the above criteria and try again.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .eligibility {
          min-height: 100vh;
        }
        
        .s-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .s-label-line {
          width: 40px;
          height: 2px;
          background: #dc2626;
        }
        
        .s-label-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #dc2626;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .s-title {
          color: #1A0F0A;
          margin-bottom: 1rem;
        }
        
        .s-title .accent {
          color: #dc2626;
        }
        
        .s-desc {
          color: #5c2a2a;
          line-height: 1.6;
        }
        
        .crit-item {
          border: 1.5px solid #e8d4d4;
          transition: all 0.3s;
        }
        
        .crit-item:hover {
          box-shadow: 0 6px 20px rgba(220,38,38,.15);
          border-color: #dc2626;
        }
        
        .crit-title {
          color: #1A0F0A;
          margin-bottom: 0.25rem;
        }
        
        .crit-desc {
          color: #7a4040;
          font-size: 0.875rem;
        }
        
        .elig-card {
          border: 1.5px solid #e8d4d4;
          box-shadow: 0 20px 70px rgba(220,38,38,.08);
        }
        
        .sc-title {
          color: #1A0F0A;
        }
        
        .form-label {
          color: #3D2314;
          font-weight: 600;
        }
        
        .form-input,
        .form-select {
          border: 1.5px solid #e8d4d4;
          transition: all 0.2s;
          background: #fff;
        }
        
        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220,38,38,.12);
          background: #fff;
        }
        
        .form-input::placeholder {
          color: #a07070;
        }
        
        .elig-result {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @media (max-width: 768px) {
          .eligibility {
            padding-top: 80px !important;
          }
          
          .elig-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          
          .elig-card {
            padding: 24px 20px !important;
          }
          
          .crit-item {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          
          .crit-icon {
            width: 32px !important;
            height: 32px !important;
          }
          
          .sc-title {
            font-size: 20px !important;
          }
          
          .s-title {
            font-size: 24px !important;
          }
          
          button[type="submit"] svg {
            display: none;
          }

          .elig-nav-links {
            display: none !important;
          }
          .elig-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
