"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, ChevronDown, ArrowRight } from "lucide-react";

// Bangladesh districts data
const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", 
  "Barishal", "Sylhet", "Rangpur", "Mymensingh"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorSearchSection() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBloodGroupSelect = (group: string) => {
    setSelectedBloodGroup(prev => prev === group ? "" : group);
  };

  const handleSearch = async () => {
    if (!selectedBloodGroup && !selectedDistrict) {
      setShowError(true);
      setTimeout(() => setShowError(false), 500);
      return;
    }

    setIsSearching(true);
    // Simulate search API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSearching(false);
  };

  const handleSOS = () => {
    // Navigate to emergency blood request
    window.location.href = "/request";
  };

  const handlePhone = () => {
    window.location.href = "tel:+8801234567890";
  };

  const handleMap = () => {
    // Navigate to map view
    window.location.href = "/map";
  };

  return (
    <>
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap');
        
        /* Force visibility of urgent blood requests section */
        .max-w-\\[1280px\\] {
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }
        
        .max-w-\\[1280px\\] * {
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        .grid {
          visibility: visible !important;
          opacity: 1 !important;
          display: grid !important;
        }
      `}</style>

      <div className="min-h-screen bg-[#F5F0E6]">
        {/* Navigation Bar */}
        <nav className="bg-[#F5F0E6] border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-b from-[#FF1493] to-[#FF69B4] rounded-full mr-3"></div>
              <div>
                <div className="text-lg font-bold text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display' }}>
                  রক্তকরবী
                </div>
                <div className="text-xs font-medium text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
                  ROKTOKOROBI
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              {["HOME", "DONORS", "REQUEST BLOOD", "ELIGIBILITY", "BLOG", "CHITROKOTHON"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium text-[#1A1A1A] hover:text-[#C41E3A] transition-colors"
                  style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Login Button */}
            <button className="bg-[#C41E3A] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#A01830] transition-colors">
              Login
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-[1280px] mx-auto px-10 py-20">
          <div className="flex flex-col lg:flex-row gap-15">
            {/* LEFT COLUMN */}
            <div className="w-full lg:w-[45%]">
              {/* DONOR SEARCH Label */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-0.5 bg-[#C41E3A] mr-3"></div>
                <span 
                  className="text-xs font-semibold uppercase tracking-wider text-[#C41E3A]"
                  style={{ letterSpacing: '0.2em' }}
                >
                  DONOR SEARCH
                </span>
              </div>

              {/* Heading with Parallax Effect */}
              <div 
                className="mt-4 mb-6 overflow-hidden"
                style={{ height: '120px' }}
              >
                <div 
                  style={{ 
                    fontFamily: 'Playfair Display',
                    transform: `translateY(${scrollY * 0.3}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  <div className="text-[48px] font-bold text-[#1A1A1A] leading-tight">
                    Donors <span className="text-[#1B6B6B]">Your</span>
                  </div>
                  <div className="text-[48px] font-bold text-[#1B6B6B] leading-tight -mt-2">
                    Location
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p 
                className="text-[#6B6B6B] leading-relaxed mb-10"
                style={{ fontFamily: 'Inter', maxWidth: '400px' }}
              >
                Find available blood donors in your area and get help in emergency situations.
              </p>

              {/* Need Blood Urgently Card */}
              <div 
                className="relative bg-[#1A0F0A] rounded-[24px] p-10 max-w-[420px] cursor-pointer hover:shadow-2xl transition-shadow"
                onClick={handleSOS}
              >
                <h3 
                  className="text-white text-[32px] font-bold leading-tight"
                  style={{ fontFamily: 'Playfair Display' }}
                >
                  Need Blood<br />Urgently?
                </h3>
                <p 
                  className="text-[#9CA3AF] text-sm mt-3"
                  style={{ fontFamily: 'Inter' }}
                >
                  Submit request now
                </p>
                
              </div>
            </div>

            {/* RIGHT COLUMN - Search Form Card */}
            <div className="w-full lg:w-[55%]">
              <div className="bg-white rounded-[24px] p-10 shadow-lg" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                {/* SEARCH DONORS Label */}
                <div className="flex items-center mb-8">
                  <div className="w-10 h-0.5 bg-[#C41E3A] mr-3"></div>
                  <span 
                    className="text-xs font-semibold uppercase tracking-wider text-[#C41E3A]"
                    style={{ letterSpacing: '0.2em' }}
                  >
                    SEARCH DONORS
                  </span>
                </div>

                {/* BLOOD GROUP Section */}
                <div className="mb-7">
                  <label 
                    className="block text-xs font-semibold uppercase mb-4"
                    style={{ letterSpacing: '0.05em', color: '#1A1A1A' }}
                  >
                    BLOOD GROUP
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {BLOOD_GROUPS.map((group) => (
                      <button
                        key={group}
                        onClick={() => handleBloodGroupSelect(group)}
                        className={`h-14 rounded-[12px] font-semibold text-base transition-all duration-200 ${
                          selectedBloodGroup === group
                            ? 'bg-[#C41E3A] text-white border-[#C41E3A]'
                            : 'bg-[#EDE8DC] border-[#E5E0D5] text-[#1A1A1A] hover:bg-[#C41E3A] hover:text-white hover:border-[#C41E3A]'
                        }`}
                        style={{ fontFamily: 'Inter' }}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DISTRICT Dropdown */}
                <div className="mb-7">
                  <label 
                    className="block text-xs font-semibold uppercase mb-4"
                    style={{ letterSpacing: '0.05em', color: '#1A1A1A' }}
                  >
                    DISTRICT
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full h-14 bg-[#EDE8DC] border border-[#E5E0D5] rounded-[12px] px-4 pr-12 text-[#1A1A1A] focus:outline-none focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A] focus:ring-opacity-20 appearance-none"
                      style={{ fontFamily: 'Inter' }}
                    >
                      <option value="">Select District</option>
                      {BANGLADESH_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                {/* AREA Input */}
                <div className="mb-8">
                  <label 
                    className="block text-xs font-semibold uppercase mb-4"
                    style={{ letterSpacing: '0.05em', color: '#1A1A1A' }}
                  >
                    AREA
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Enter area"
                    className="w-full h-14 bg-[#EDE8DC] border border-[#E5E0D5] rounded-[12px] px-4 text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A] focus:ring-opacity-20"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>

                {/* SEARCH Button */}
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={`w-full h-14 rounded-[12px] font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                    showError ? 'animate-pulse bg-red-600' : 
                    isSearching ? 'bg-gray-500' : 
                    'bg-[#C41E3A] hover:bg-[#A01830] hover:transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0'
                  } text-white`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* URGENT BLOOD REQUESTS SECTION */}
        <div className="max-w-[1280px] mx-auto px-10 py-20 bg-red-50 rounded-lg my-10" style={{ 
          visibility: 'visible' as const, 
          opacity: 1, 
          display: 'block',
          position: 'relative',
          zIndex: 1,
          border: '2px solid red'
        }}>
          {/* Test element */}
          <div className="bg-yellow-300 p-4 mb-4 text-center text-black font-bold">
            URGENT BLOOD REQUESTS SECTION - THIS SHOULD BE VISIBLE
          </div>
          
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <div className="w-10 h-0.5 bg-[#C41E3A] mr-3"></div>
              <span 
                className="text-xs font-semibold uppercase tracking-wider text-[#C41E3A]"
                style={{ letterSpacing: '0.2em' }}
              >
                জরুরি অনুরোধ
              </span>
            </div>
            <h2 
              className="text-4xl font-bold text-[#1A1A1A] mb-4"
              style={{ fontFamily: 'Playfair Display' }}
            >
              জরুরি রক্তের প্রয়োজন
            </h2>
            <p 
              className="text-[#6B6B6B] leading-relaxed max-w-3xl"
              style={{ fontFamily: 'Inter' }}
            >
              এই মুহূর্তে রক্তের প্রয়োজনে থাকা রোগীদের তালিকা। আপনার সাহায্য জীবন বাঁচাতে পারে।
            </p>
          </div>

          {/* Urgent Request Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#C41E3A] text-white px-3 py-1 rounded-full text-lg font-bold">
                  O+
                </div>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                  জরুরি
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
                    জনৈক রোগী
                  </h3>
                  <p className="text-sm text-[#6B6B6B]" style={{ fontFamily: 'Inter' }}>
                    ঢাকা মেডিকেল কলেজ হাসপাতাল
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <MapPin className="w-4 h-4" />
                  <span>ঢাকা</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Phone className="w-4 h-4" />
                  <span>0171-1234567</span>
                </div>

                <div className="text-xs text-gray-500">
                  পোস্ট করা হয়েছে: 2 ঘন্টা আগে
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#A01830] transition-colors">
                  যোগাযোগ করুন
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#C41E3A] text-white px-3 py-1 rounded-full text-lg font-bold">
                  A+
                </div>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                  জরুরি
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
                    জরুরি অস্ত্রোপ্রচার
                  </h3>
                  <p className="text-sm text-[#6B6B6B]" style={{ fontFamily: 'Inter' }}>
                    বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <MapPin className="w-4 h-4" />
                  <span>ঢাকা</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Phone className="w-4 h-4" />
                  <span>0181-2345678</span>
                </div>

                <div className="text-xs text-gray-500">
                  পোস্ট করা হয়েছে: 4 ঘন্টা আগে
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#A01830] transition-colors">
                  যোগাযোগ করুন
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#C41E3A] text-white px-3 py-1 rounded-full text-lg font-bold">
                  B+
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
                  মাঝারি
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
                    নবজাতক
                  </h3>
                  <p className="text-sm text-[#6B6B6B]" style={{ fontFamily: 'Inter' }}>
                    শিশু হাসপাতাল
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <MapPin className="w-4 h-4" />
                  <span>ঢাকা</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Phone className="w-4 h-4" />
                  <span>0191-3456789</span>
                </div>

                <div className="text-xs text-gray-500">
                  পোস্ট করা হয়েছে: 6 ঘন্টা আগে
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-[#C41E3A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#A01830] transition-colors">
                  যোগাযোগ করুন
                </button>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button className="bg-white text-[#C41E3A] border border-[#C41E3A] px-8 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors">
              সব অনুরোধ দেখুন
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .gap-15 {
            gap: 0;
          }
        }
        
        @media (max-width: 640px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .text-\\[48px\\] {
            font-size: 36px;
          }
          
          .p-10 {
            padding: 24px;
          }
          
          .w-14 {
            width: 48px;
            height: 48px;
          }
          
          .h-14 {
            height: 48px;
          }
          
          .fixed.right-6.top-1\\/2 {
            bottom: 24px;
            top: auto;
            right: 24px;
            transform: none;
            flex-direction: row;
          }
        }
      `}</style>
    </>
  );
}
