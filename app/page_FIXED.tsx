// @ts-nocheck - Supabase type inference issues with Database types
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import for map to avoid SSR issues
const BangladeshMap = dynamic(() => import('../components/BangladeshMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse rounded-xl">
      <div className="text-gray-400 font-medium">Loading Map...</div>
    </div>
  )
});

// Mock Donor Data
const mockDonors = [
  { id: 1, name: 'রাকিব হাসান', bloodGroup: 'A+', location: 'ঢাকা', lat: 23.8103, lng: 90.4125, available: true, phone: '01712345678' },
  { id: 2, name: 'সুমাইয়া আক্তার', bloodGroup: 'O+', location: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832, available: true, phone: '01812345678' },
  { id: 3, name: 'ফাহিম আহমেদ', bloodGroup: 'B-', location: 'রাজশাহী', lat: 24.3636, lng: 88.6241, available: false, phone: '01912345678' },
  { id: 4, name: 'তানজিলা ইসলাম', bloodGroup: 'AB+', location: 'সিলেট', lat: 24.8949, lng: 91.8687, available: true, phone: '01512345678' },
  { id: 5, name: 'আবদুল্লাহ আল মামুন', bloodGroup: 'A-', location: 'খুলনা', lat: 22.8456, lng: 89.5403, available: true, phone: '01312345678' },
];

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState('bn');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [eligAge, setEligAge] = useState('');
  const [eligWeight, setEligWeight] = useState('');
  const [eligHealth, setEligHealth] = useState('');
  const [eligResult, setEligResult] = useState<{ eligible: boolean; message: string } | null>(null);

  const [stats] = useState({
    registered_donors: 12450,
    blood_requests_fulfilled: 8920,
    partner_organizations: 127
  });

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'bn';
    setLanguage(savedLang);

    const handleScroll = () => setNavSolid(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in');
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleBloodTypeSelect = (type: string) => setSelectedBloodType(type);

  const handleSearch = async () => {
    if (!selectedBloodType) {
      setEligResult({ 
        eligible: false, 
        message: language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন' : 'Please select a blood type' 
      });
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const filtered = mockDonors.filter(d => d.bloodGroup === selectedBloodType);
      setSearchResults(filtered);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEligibilityCheck = () => {
    const ageNum = parseInt(eligAge);
    const weightNum = parseInt(eligWeight);

    if (!eligAge || !eligWeight || !eligHealth) {
      setEligResult({
        eligible: false,
        message: language === 'bn' ? 'সব তথ্য পূরণ করুন' : 'Please fill all fields'
      });
      return;
    }

    if (ageNum >= 18 && ageNum <= 65 && weightNum >= 50 && eligHealth === 'healthy') {
      setEligResult({
        eligible: true,
        message: language === 'bn' ? 'অভিনন্দন! আপনি রক্তদানের জন্য যোগ্য।' : 'Congratulations! You are eligible to donate.'
      });
    } else {
      setEligResult({
        eligible: false,
        message: language === 'bn' ? 'দুঃখিত, আপনি বর্তমানে যোগ্য নন।' : 'Sorry, you are not eligible right now.'
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`nav fixed top-0 w-full z-50 transition-all duration-300 ${navSolid ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <div>
              <div className="font-bold text-red-600 leading-none text-xl">রক্তকরবী</div>
              <div className="text-xs text-gray-500 font-medium">RoktoKorobi</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-gray-700">
            <Link href="/" className="font-medium hover:text-red-600 transition-colors">হোম</Link>
            <Link href="/donors" className="font-medium hover:text-red-600 transition-colors">দাতা</Link>
            <Link href="/request" className="font-medium hover:text-red-600 transition-colors">অনুরোধ</Link>
            <Link href="/eligibility" className="font-medium hover:text-red-600 transition-colors">যোগ্যতা</Link>
            <Link href="/login" className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
              লগইন
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-2xl p-2">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="font-bold text-xl text-red-600">রক্তকরবী</span>
              <button onClick={() => setMobileOpen(false)} className="text-2xl">✕</button>
            </div>
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-xl font-bold border-b py-2">হোম</Link>
            <Link href="/donors" onClick={() => setMobileOpen(false)} className="text-xl font-bold border-b py-2">দাতা</Link>
            <Link href="/request" onClick={() => setMobileOpen(false)} className="text-xl font-bold border-b py-2">অনুরোধ</Link>
            <Link href="/eligibility" onClick={() => setMobileOpen(false)} className="text-xl font-bold border-b py-2">যোগ্যতা</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="bg-red-600 text-white p-4 rounded-xl font-bold text-center mt-auto">লগইন</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 reveal">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-bold w-fit">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              Live Now
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
              রক্ত দিন, <br/>
              <span className="text-red-600">জীবন বাঁচান</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              জরুরি মুহূর্তে আপনার এক ব্যাগ রক্ত হতে পারে কারো বেঁচে থাকার শেষ ভরসা। বাংলাদেশের বৃহত্তম রক্তদাতা নেটওয়ার্কে যোগ দিন।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-center hover:bg-red-700 transition-all transform hover:-translate-y-1 shadow-xl shadow-red-200">
                রক্তদাতা হিসেবে নিবন্ধন করুন
              </Link>
              <Link href="/request" className="bg-white border-2 border-gray-100 px-8 py-4 rounded-xl font-bold text-center hover:border-red-600 hover:text-red-600 transition-all text-gray-700">
                রক্তের অনুরোধ
              </Link>
            </div>
            
            <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.registered_donors.toLocaleString()}</div>
                <div className="text-sm text-gray-500 font-medium">নিবন্ধিত দাতা</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.blood_requests_fulfilled.toLocaleString()}</div>
                <div className="text-sm text-gray-500 font-medium">সফল অনুরোধ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.partner_organizations}+</div>
                <div className="text-sm text-gray-500 font-medium">অংশীদার সংস্থা</div>
              </div>
            </div>
          </div>
          
          <div className="relative reveal delay-1">
            <div className="aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl relative z-10 border border-gray-100">
               <BangladeshMap center={{lat: 23.6850, lng: 90.3563}} zoom={7} donors={mockDonors} />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-red-100 rounded-full blur-[100px] opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-60"></div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">সহজ ৪টি ধাপে শুরু করুন</h2>
            <p className="text-gray-600 text-lg">রক্তদান প্রক্রিয়া এখন আগের চেয়ে অনেক বেশি সহজ এবং দ্রুত।</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', icon: '🩸', title: 'নিবন্ধন', desc: 'আপনার তথ্য দিয়ে সহজেই নিবন্ধন করুন।' },
              { num: '02', icon: '🔍', title: 'দাতা খুঁজুন', desc: 'আপনার এলাকা অনুযায়ী দাতা খুঁজুন।' },
              { num: '03', icon: '📞', title: 'যোগাযোগ', desc: 'সরাসরি দাতার সাথে কথা বলুন।' },
              { num: '04', icon: '❤️', title: 'রক্তদান', desc: 'জীবন বাঁচাতে রক্ত দিন এবং মানবিক হোন।' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="text-red-500 text-5xl font-black opacity-10 mb-4">{step.num}</div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Eligibility Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Search Box */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-50 reveal">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
                <span className="text-red-600 text-4xl">🔍</span> দাতা অনুসন্ধান
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">রক্তের গ্রুপ</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <button 
                        key={type}
                        onClick={() => handleBloodTypeSelect(type)}
                        className={`py-4 rounded-2xl font-bold transition-all text-lg ${selectedBloodType === type ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-50 border-2 border-transparent hover:border-red-100 text-gray-600'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">জেলা</label>
                  <select 
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-700 transition-all cursor-pointer"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-red-100"
                >
                  {loading ? <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span> : 'খুঁজুন'}
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-8 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map((donor, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <div className="font-bold text-gray-900">{donor.name}</div>
                        <div className="text-sm text-gray-500">{donor.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-bold">{donor.bloodGroup}</div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${donor.available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {donor.available ? 'Available' : 'Busy'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Eligibility Check */}
            <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 lg:p-12 text-white reveal delay-1">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <span className="text-4xl">✅</span> যোগ্যতা যাচাই
              </h2>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">আপনার বয়স</label>
                    <input 
                      type="number" 
                      placeholder="যেমন: ২৫"
                      className="w-full p-4 bg-gray-800 rounded-2xl border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold"
                      value={eligAge}
                      onChange={(e) => setEligAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">আপনার ওজন (কেজি)</label>
                    <input 
                      type="number" 
                      placeholder="যেমন: ৬০"
                      className="w-full p-4 bg-gray-800 rounded-2xl border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold"
                      value={eligWeight}
                      onChange={(e) => setEligWeight(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">স্বাস্থ্য অবস্থা</label>
                  <select 
                    className="w-full p-4 bg-gray-800 rounded-2xl border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold cursor-pointer"
                    value={eligHealth}
                    onChange={(e) => setEligHealth(e.target.value)}
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="healthy">আমি সুস্থ আছি</option>
                    <option value="unhealthy">অসুস্থ আছি</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleEligibilityCheck}
                  className="w-full bg-white text-gray-900 py-5 rounded-2xl font-bold text-xl hover:bg-red-50 transition-all shadow-xl"
                >
                  যাচাই করুন
                </button>

                {eligResult && (
                  <div className={`p-5 rounded-2xl border animate-in fade-in zoom-in duration-300 ${eligResult.eligible ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <p className={`font-bold ${eligResult.eligible ? 'text-green-400' : 'text-red-400'}`}>{eligResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🩸</span>
                <span className="text-2xl font-bold text-gray-900">রক্তকরবী</span>
              </div>
              <p className="text-gray-500 max-w-md leading-relaxed text-lg">
                রক্তকরবী একটি অলাভজনক ডিজিটাল প্ল্যাটফর্ম যা রক্তদাতার সাথে গ্রহীতার মেলবন্ধন ঘটিয়ে জীবন বাঁচাতে সাহায্য করে।
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold mb-6 text-xl">লিংক</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link href="/donors" className="hover:text-red-600 transition-colors">দাতা অনুসন্ধান</Link></li>
                <li><Link href="/request" className="hover:text-red-600 transition-colors">রক্তের অনুরোধ</Link></li>
                <li><Link href="/about" className="hover:text-red-600 transition-colors">আমাদের সম্পর্কে</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold mb-6 text-xl">যোগাযোগ</h4>
              <div className="text-gray-500 font-medium space-y-2">
                <p>support@roktokorobi.org</p>
                <p className="text-xl font-bold text-gray-900">+৮৮০ ১৭০০-০০০০০০</p>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-200 text-center text-gray-400 font-medium">
            © ২০২৬ রক্তকরবী. সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
