'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, MapPin, Users, Heart, Phone, Menu, X, Globe, User, LogOut, Plus, Star, Droplet, Shield, Award, ChevronRight, CheckCircle, Map, Check, ArrowRight, Clock, Calendar, MessageSquare } from 'lucide-react';

// Dynamically import LeafletMap to avoid server-side rendering issues
const LeafletMap = dynamic(() => import('../components/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div><p className="text-gray-600">Loading map...</p></div></div>
});

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [stats, setStats] = useState({
    registered_donors: 1,
    blood_requests_fulfilled: 0,
    partner_organizations: 0
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [area, setArea] = useState('');
  const [eligAge, setEligAge] = useState('');
  const [eligWeight, setEligWeight] = useState('');
  const [eligHealth, setEligHealth] = useState('');
  const [mapZoom, setMapZoom] = useState(8);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = (enText, bnText) => language === 'bn' ? bnText : enText;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handleSearch = () => {
    // Simple search functionality
    console.log('Searching for donors...');
  };

  const checkEligibility = () => {
    const age = parseInt(eligAge);
    const weight = parseInt(eligWeight);
    
    if (!age || !weight) {
      alert('Please fill in all fields');
      return;
    }

    if (age >= 18 && age <= 65 && weight >= 50) {
      alert('Congratulations! You are eligible to donate blood');
    } else {
      alert('Not eligible to donate blood');
    }
  };

  const navigate = (page) => {
    setCurrentPage(page);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#F5F2EA', fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>
      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300" style={{ backgroundColor: 'rgba(245, 242, 234, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(140, 134, 125, 0.4)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <Heart className="w-9 h-9 text-red-600 group-hover:scale-110 transition-transform" fill="currentColor" />
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-gray-900 leading-tight">রক্তকরবী</span>
                <span className="text-[9px] tracking-[0.25em] text-gray-600 uppercase font-medium">RoktoKorobi</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">HOME</Link>
              <Link href="/donors" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">DONORS</Link>
              <Link href="/request" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">REQUEST BLOOD</Link>
              <Link href="/eligibility" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">ELIGIBILITY</Link>
              <Link href="/blog" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">BLOG</Link>
              <Link href="/chitrokothon" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">CHITROKOTHON</Link>
            </div>

            <div className="hidden md:block">
              <button className="text-white px-7 py-2.5 rounded-full text-[13px] font-medium transition-all tracking-wide" style={{ backgroundColor: '#C0392B' }}>
                LOGIN
              </button>
            </div>

            <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu className="text-xl" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden" style={{ backgroundColor: '#F5F2EA', borderTop: '1px solid rgba(140, 134, 125, 0.4)' }}>
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Home</Link>
              <Link href="/donors" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Donors</Link>
              <Link href="/request" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Request Blood</Link>
              <Link href="/eligibility" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Eligibility</Link>
              <Link href="/blog" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Blog</Link>
              <Link href="/chitrokothon" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Chitrokothon</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="pt-20 min-h-screen">
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden" style={{ background: 'rgba(26, 26, 26, 0.96)', backdropFilter: 'blur(10px)' }}>
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -mr-24 -mt-24" style={{ backgroundColor: 'rgba(192, 57, 43, 0.2)' }}></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ backgroundColor: 'rgba(192, 57, 43, 0.2)', border: '1px solid rgba(192, 57, 43, 0.3)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#E74C3C' }}></span>
                    <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: '#E74C3C' }}>Live Now</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.15] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Donate Blood, Save Lives <span className="italic" style={{ color: '#E74C3C' }}>Today</span>
                  </h1>
                  <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
                    Join Bangladesh's largest blood donor network and help save lives in critical moments.
                  </p>
                  <button className="w-full md:w-auto text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg text-center text-sm tracking-wide" style={{ backgroundColor: '#C0392B' }}>
                    Register as Donor
                  </button>
                  <div className="mt-6">
                    <Link href="/request" className="text-gray-500 hover:text-white text-sm underline underline-offset-4 transition-colors">Need Blood?</Link>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex justify-center items-center relative">
                <div className="absolute w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(192, 57, 43, 0.05)' }}></div>
                <Heart className="w-72 h-72 relative z-10 animate-pulse" style={{ color: 'rgba(192, 57, 43, 0.7)', filter: 'drop-shadow(0 20px 40px rgba(192,57,43,0.15))' }} fill="currentColor" />
                <div className="absolute top-10 right-10 bg-white rounded-2xl p-4 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-600">Verified Donor</p>
                      <p className="text-xs font-semibold text-gray-900">Ready to Help</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="text-gray-500 py-3 overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
          <div className="flex animate-marquee" style={{ animation: 'marquee 25s linear infinite' }}>
            <div className="flex text-[11px] tracking-[0.2em] uppercase font-medium whitespace-nowrap">
              <span className="mx-8">• GPS Tracking</span>
              <span className="mx-8">• Verified Donors</span>
              <span className="mx-8">• Free Blood Donation</span>
              <span className="mx-8">• Emergency Services</span>
              <span className="mx-8">• Live Map</span>
              <span className="mx-8">• 24/7 Support</span>
              <span className="mx-8">• GPS Tracking</span>
              <span className="mx-8">• Verified Donors</span>
              <span className="mx-8">• Free Blood Donation</span>
              <span className="mx-8">• Emergency Services</span>
              <span className="mx-8">• Live Map</span>
              <span className="mx-8">• 24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Four Steps Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F2EA' }}>
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-[2.5rem] text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Simple Four Steps To Get Started</h2>
            <p className="text-gray-600 text-sm">Our blood donation process is quick, easy, and safe.</p>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
            {[
              {title: 'Register', desc: 'Sign up with your details easily'},
              {title: 'Find Donors', desc: 'Search donors near your location'},
              {title: 'Connect', desc: 'Contact donors directly'},
              {title: 'Donate', desc: 'Save lives together'}
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 rounded-full mx-auto mb-5 text-red-600 border-2 border-gray-300 flex items-center justify-center group-hover:border-red-600 group-hover:-translate-y-1 transition-all" style={{ borderColor: '#D4CFC5' }}>
                  <Heart className="w-5 h-5" fill="currentColor" />
                </div>
                <h3 className="text-base text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 pt-12" style={{ borderTop: '1px solid rgba(140, 134, 125, 0.5)' }}>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-gray-600" style={{ backgroundColor: '#EDE9DF' }}>
                <Heart className="w-3 h-3" />
              </div>
              <div className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{stats.registered_donors}</div>
              <div className="text-[10px] tracking-[0.2em] text-gray-600 uppercase font-medium">Donor</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-gray-600" style={{ backgroundColor: '#EDE9DF' }}>
                <Droplet className="w-3 h-3" />
              </div>
              <div className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{stats.blood_requests_fulfilled}</div>
              <div className="text-[10px] tracking-[0.2em] text-gray-600 uppercase font-medium">Requests</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-gray-600" style={{ backgroundColor: '#EDE9DF' }}>
                <Users className="w-3 h-3" />
              </div>
              <div className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{stats.partner_organizations}</div>
              <div className="text-[10px] tracking-[0.2em] text-gray-600 uppercase font-medium">Partners</div>
            </div>
          </div>
        </section>

        {/* Donors Near You - Full Map Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(237, 233, 223, 0.5)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="rounded-3xl h-[400px] relative overflow-hidden" style={{ backgroundColor: '#E5E1D6' }}>
              <div className="absolute bottom-4 left-4 bg-white rounded-xl px-3 py-2 shadow-md">
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C0392B' }}></div>
                  <span>Live Map</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Request Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F2EA' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="rounded-[2rem] p-4 md:p-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[200px]" style={{ background: 'rgba(0, 0, 0, 0.98)', backdropFilter: 'blur(10px)' }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16" style={{ backgroundColor: 'rgba(192, 57, 43, 0.3)' }}></div>
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl mb-2 leading-tight font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Need Blood<br/>Urgently?</h3>
                  <p className="text-gray-400 text-sm mb-6 font-medium">Submit request now</p>
                  <Heart className="w-12 h-12 absolute bottom-4 right-4 opacity-90" style={{ color: '#C0392B' }} fill="currentColor" />
                </div>
              </div>
              <div className="rounded-[2rem] p-6 md:p-8 shadow-sm border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(5px)', borderColor: 'rgba(140, 134, 125, 0.5)' }}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.15em] text-gray-600 uppercase mb-2">District</label>
                    <select className="w-full rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-red-600/20 outline-none" style={{ backgroundColor: 'rgba(237, 233, 223, 0.5)' }}>
                      <option>Select District</option>
                      <option>Dhaka</option>
                      <option>Chittagong</option>
                      <option>Khulna</option>
                      <option>Rajshahi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.15em] text-gray-600 uppercase mb-2">Area</label>
                    <input type="text" placeholder="Enter area" className="w-full rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-red-600/20 outline-none placeholder-gray-600/60" style={{ backgroundColor: 'rgba(237, 233, 223, 0.5)' }} />
                  </div>
                  <button className="w-full text-white py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 group text-sm" style={{ backgroundColor: '#C0392B' }}>
                    Search
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(237, 233, 223, 0.5)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-[2.75rem] text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Blood Donation Eligibility</h2>
                <p className="text-gray-600 mb-10 text-base">Are you eligible to donate blood? Check the detailed information here</p>
                <div className="space-y-5">
                  {[
                    {title: 'Age: 18-65 years', desc: 'Healthy adults can be donors'},
                    {title: 'Weight: 50kg or more', desc: 'Minimum weight required'},
                    {title: 'Must be in good health', desc: 'No serious illness or conditions'}
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }}>
                        <Check className="w-2.5 h-2.5" style={{ color: '#C0392B' }} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border" style={{ borderColor: 'rgba(140, 134, 125, 0.5)' }}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.15em] text-gray-600 uppercase mb-2">Your Age</label>
                    <input type="number" placeholder="In years" className="w-full rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-red-600/20 outline-none" style={{ backgroundColor: 'rgba(237, 233, 223, 0.3)', borderColor: 'rgba(140, 134, 125, 0.6)' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.15em] text-gray-600 uppercase mb-2">Your Weight</label>
                    <input type="number" placeholder="In KG" className="w-full rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-red-600/20 outline-none" style={{ backgroundColor: 'rgba(237, 233, 223, 0.3)', borderColor: 'rgba(140, 134, 125, 0.6)' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.15em] text-gray-600 uppercase mb-2">Health Status</label>
                    <select className="w-full rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-red-600/20 outline-none" style={{ backgroundColor: 'rgba(237, 233, 223, 0.3)', borderColor: 'rgba(140, 134, 125, 0.6)' }}>
                      <option>Select</option>
                      <option>Good</option>
                      <option>Average</option>
                      <option>Poor</option>
                    </select>
                  </div>
                  <button className="w-full text-white py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 group text-sm" style={{ backgroundColor: '#C0392B' }}>
                    Check
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F2EA' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-3xl md:text-[2.5rem] text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Donors & Hospitals On Map</h2>
              <Link href="/map" className="text-xs text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1 uppercase tracking-wide">
                View All <ArrowRight className="w-[10px] h-[10px]" />
              </Link>
            </div>
            <div className="rounded-[2rem] h-[380px] relative overflow-hidden" style={{ backgroundColor: '#E5E1D6' }}>
              <div className="absolute bottom-4 left-4 bg-white rounded-xl px-3 py-2 shadow-md">
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C0392B' }}></div>
                  <span>Live Map</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Illustrations */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(237, 233, 223, 0.5)' }}>
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block mb-4">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-gray-600 uppercase">Chitrokothon</span>
            </div>
            <h2 className="text-4xl md:text-[2.75rem] text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Educational Illustrations Coming Soon</h2>
            <Link href="/chitrokothon" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-xs mt-4 uppercase tracking-wide">
              View Gallery <ArrowRight className="w-[10px] h-[10px]" />
            </Link>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F2EA' }}>
          <div className="max-w-7xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EDE9DF', color: '#8C867D' }}>
              <Map className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Blog Coming Soon</h2>
            <p className="text-gray-600 text-sm">Super admin will post news soon</p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(237, 233, 223, 0.5)' }}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Testimonials Coming Soon</h2>
            <p className="text-gray-600 text-sm mb-8">Be the first to share your experience</p>
            <button className="text-white px-8 py-3 rounded-full font-medium transition-all hover:shadow-lg text-sm" style={{ backgroundColor: 'rgba(192, 57, 43, 0.8)' }}>
              Share Your Story
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-gray-400 py-16" style={{ backgroundColor: '#0F3D3E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-7 h-7" style={{ color: '#C0392B' }} fill="currentColor" />
                <span className="font-bengali text-lg text-white">রক্তকরবী</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#8C867D' }}>
                Bangladesh's largest blood donor network. We connect blood donors with those in need.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#8C867D' }}>Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/donors" className="hover:text-white transition-colors">Donors</Link></li>
                <li><Link href="/request" className="hover:text-white transition-colors">Request</Link></li>
                <li><Link href="/eligibility" className="hover:text-white transition-colors">Eligibility</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#8C867D' }}>Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/chitrokothon" className="hover:text-white transition-colors">Chitrokothon</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#8C867D' }}>Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors text-white">
                  <span className="text-xs">f</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors text-white">
                  <span className="text-xs">in</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors text-white">
                  <span className="text-xs">t</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs" style={{ color: '#8C867D' }}>
            © 2024 RoktoKorobi. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <button className="w-9 h-9 rounded-full text-white shadow-md hover:scale-105 transition-transform flex items-center justify-center" style={{ backgroundColor: '#C0392B' }} title="Emergency SOS">
          <span className="text-[8px] font-bold tracking-wider">SOS</span>
        </button>
        <button className="w-9 h-9 rounded-full text-white shadow-md hover:scale-105 transition-transform flex items-center justify-center" style={{ backgroundColor: '#4A90D9' }}>
          <Phone className="w-3 h-3" />
        </button>
        <button className="w-9 h-9 rounded-full text-white shadow-md hover:scale-105 transition-transform flex items-center justify-center" style={{ backgroundColor: '#4CAF50' }}>
          <MessageSquare className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}