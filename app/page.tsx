"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TestimonialButton } from "@/components/TestimonialButton";
import { MapErrorBoundary } from "@/components/MapErrorBoundary";
import { BlogSection } from "@/components/BlogSection";
import { GallerySection } from "@/components/GallerySection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import TickerBanner from "@/components/TickerBanner";

/* ═══════════════════════════════════════════════════════════════════
   ROKTOKOROBI — রক্তকরবী  |  Complete PWA Preview
   Bangladesh Blood Donor Network
   Design: Organic warmth meets editorial precision
   Palette: Deep ink (#1A0F0A), blood crimson (#dc2626), parchment (#F5EDD8)
═══════════════════════════════════════════════════════════════════ */

/* Bilingual data for new sections */
const SECTION_DATA = {
  blog: {
    en: {
      lbl: 'BLOG',
      t1: 'Latest',
      t2: 'Posts',
      desc: 'Discover articles, guides, and stories about blood donation.',
      more: 'Read More →',
      all: 'See All Posts',
      posts: [
        { date: 'October 20, 2024', title: 'Importance of Blood Donation', ex: 'Every blood donation can save up to three lives. Understanding why this matters is the first step toward becoming a hero.', tag: 'Health' },
        { date: 'October 18, 2024', title: 'Hospital Blood Needs', ex: 'Blood demand is increasing in Bangladesh hospitals. Learn how you can help bridge the critical gap.', tag: 'News' },
        { date: 'October 15, 2024', title: 'As a Volunteer', ex: 'How to volunteer for blood donation campaigns and make a real difference in your community.', tag: 'Community' },
        { date: 'October 10, 2024', title: 'Understanding Blood Types', ex: 'A complete guide to blood type compatibility and why it matters for safe transfusions.', tag: 'Education' },
      ],
    },
    bn: {
      lbl: 'ব্লগ',
      t1: 'সর্বশেষ',
      t2: 'পোস্ট',
      desc: 'রক্তদান সম্পর্কে নিবন্ধ, গাইড এবং গল্প আবিষ্কার করুন।',
      more: 'আরও পড়ুন →',
      all: 'সব পোস্ট দেখুন',
      posts: [
        { date: 'অক্টোবর ২০, ২০২৪', title: 'রক্তদানের গুরুত্ব', ex: 'প্রতিটি রক্তদান তিনটি জীবন বাঁচাতে পারে। এর গুরুত্ব বোঝা হিরো হওয়ার প্রথম ধাপ।', tag: 'স্বাস্থ্য' },
        { date: 'অক্টোবর ১৮, ২০২৪', title: 'হাসপাতালে রক্তের প্রয়োজন', ex: 'বাংলাদেশের হাসপাতালগুলিতে রক্তের চাহিদা বাড়ছে। আপনি কীভাবে সাহায্য করতে পারেন জানুন।', tag: 'সংবাদ' },
        { date: 'অক্টোবর ১৫, ২০২৪', title: 'স্বেচ্ছাসেবক হিসেবে', ex: 'রক্তদান ক্যাম্পেইনে স্বেচ্ছাসেবক হয়ে আপনার সম্প্রদায়ে প্রভাব ফেলুন।', tag: 'সম্প্রদায়' },
        { date: 'অক্টোবর ১০, ২০২৪', title: 'রক্তের গ্রুপ বোঝা', ex: 'রক্তের গ্রুপ সামঞ্জস্যতা এবং নিরাপদ ট্রান্সফিউশনের জন্য এর গুরুত্বের সম্পূর্ণ গাইড।', tag: 'শিক্ষা' },
      ],
    },
  },
  gallery: {
    en: {
      lbl: 'CHITROKOTHON',
      t1: 'Artwork',
      t2: 'Gallery',
      desc: 'Artwork by our community, created in the spirit of saving lives.',
      all: 'View Full Gallery',
      arts: [
        { id: 1, num: "01", numEn: "01", title: "Blood Bond", titleBn: "রক্তের বন্ধন", author: "Rahim", authorBn: "রহিম", quote: "Blood donation creates lasting bonds between people.", quoteEn: "রক্তদান মানুষের মধ্যে\nচিরস্থায়ী বন্ধন তৈরি করে।", c1: "#7a0e1c", c2: "#2a0407", c3: "#b01a2a" },
        { id: 2, num: "02", numEn: "02", title: "Gift of Life", titleBn: "জীবনের উপহার", author: "Sara", authorBn: "সারা", quote: "Blood donation is the most profound way to give life.", quoteEn: "রক্তদান জীবন দেওয়ার\nসবচেয়ে গভীর উপায়।", c1: "#5c0f20", c2: "#150208", c3: "#8b1535" },
        { id: 3, num: "03", numEn: "03", title: "Light of Hope", titleBn: "আশার আলো", author: "Kamal", authorBn: "কামাল", quote: "Every donor is a light of hope for someone in the dark.", quoteEn: "প্রতিটি দাতা অন্ধকারে\nকারো আশার আলো।", c1: "#8b1010", c2: "#1d0505", c3: "#c01818" },
        { id: 4, num: "04", numEn: "04", title: "River of Life", titleBn: "জীবনের নদী", author: "Nadia", authorBn: "নাদিয়া", quote: "Like a river, generosity keeps life going.", quoteEn: "উদারতা জীবনকে\nপ্রবহমান রাখে।", c1: "#6b1018", c2: "#100205", c3: "#9b1525" },
      ],
    },
    bn: {
      lbl: 'চিত্রকথন',
      t1: 'শিল্পকর্ম',
      t2: 'গ্যালারি',
      desc: 'জীবন বাঁচানোর আত্মায় তৈরি আমাদের সম্প্রদায়ের শিল্পকর্ম।',
      all: 'সম্পূর্ণ গ্যালারি দেখুন',
      arts: [
        { id: 1, num: "০১", numEn: "01", title: "রক্তের বন্ধন", titleBn: "Blood Bond", author: "রহিম", authorBn: "Rahim", quote: "রক্তদান মানুষের মধ্যে\nচিরস্থায়ী বন্ধন তৈরি করে।", quoteEn: "Blood donation creates lasting bonds between people.", c1: "#7a0e1c", c2: "#2a0407", c3: "#b01a2a" },
        { id: 2, num: "০২", numEn: "02", title: "জীবনের উপহার", titleBn: "Gift of Life", author: "সারা", authorBn: "Sara", quote: "রক্তদান জীবন দেওয়ার\nসবচেয়ে গভীর উপায়।", quoteEn: "Blood donation is the most profound way to give life.", c1: "#5c0f20", c2: "#150208", c3: "#8b1535" },
        { id: 3, num: "০৩", numEn: "03", title: "আশার আলো", titleBn: "Light of Hope", author: "কামাল", authorBn: "Kamal", quote: "প্রতিটি দাতা অন্ধকারে\nকারো আশার আলো।", quoteEn: "Every donor is a light of hope for someone in the dark.", c1: "#8b1010", c2: "#1d0505", c3: "#c01818" },
        { id: 4, num: "০৪", numEn: "04", title: "জীবনের নদী", titleBn: "River of Life", author: "নাদিয়া", authorBn: "Nadia", quote: "উদারতা জীবনকে\nপ্রবহমান রাখে।", quoteEn: "Like a river, generosity keeps life going.", c1: "#6b1018", c2: "#100205", c3: "#9b1525" },
      ],
    },
  },
  testimonials: {
    en: {
      lbl: 'TESTIMONIALS',
      t1: 'RoktoKorobi',
      t2: 'Experience',
      desc: 'Real, moving stories from donors and patients touched by the gift of blood.',
      seeAll: 'See All Stories →',
      shareCta: 'Share Your Story',
      stats: [
        { n: '500+', l: 'Donors' },
        { n: '200+', l: 'Lives Saved' },
        { n: '50+', l: 'Stories' },
      ],
      stories: [
        { ini: 'A', name: 'Aminul Islam', role: 'Regular Donor', q: 'I feel proud after donating blood. It is the easiest way to save lives. RoktoKorobi made it incredibly simple to find where I am needed.', badge: '12 Donations', c: '#8B1A1A' },
        { ini: 'S', name: 'Salma Begum', role: 'Patient Family', q: 'My mother needed blood during surgery. We found a donor within hours through RoktoKorobi. This platform is a true lifesaver.', badge: 'Grateful', c: '#C41E3A' },
      ],
    },
    bn: {
      lbl: 'সাক্ষ্য',
      t1: 'রক্তকরবী',
      t2: 'অভিজ্ঞতা',
      desc: 'রক্তের উপহারে স্পর্শিত দাতা এবং রোগীদের বাস্তব, আন্দোলিত গল্প।',
      seeAll: 'সব গল্প দেখুন →',
      shareCta: 'আপনার গল্প শেয়ার করুন',
      stats: [
        { n: '৫০০+', l: 'দাতা' },
        { n: '২০০+', l: 'জীবন বাঁচানো হয়েছে' },
        { n: '৫০+', l: 'গল্প' },
      ],
      stories: [
        { ini: 'আ', name: 'আমিনুল ইসলাম', role: 'নিয়মিত রক্তদাতা', q: 'রক্তদান করে আমি অনেক গর্বিক বোধ করি। এটি জীবন বাঁচানোর সবচেয়ে সহজ উপায়। রক্তকরবী আমাকে যেখানে প্রয়োজন সেখানে খুঁজে পেতে অবিশ্বাস্যভাবে সহজ করেছে।', badge: '১২ বার দান', c: '#8B1A1A' },
        { ini: 'স', name: 'সালমা বেগম', role: 'রোগীর স্বজন', q: 'আমার মায়ের অপারেশনের সময় রক্তের প্রয়োজন ছিল। আমরা রক্তকরবীর মাধ্যমে কয়েক ঘণ্টার মধ্যে দাতা পেয়েছি। এই প্ল্যাটফর্ম সত্যিই জীবনরক্ষক।', badge: 'কৃতজ্ঞ', c: '#C41E3A' },
      ],
    },
  },
};

const BangladeshMap = dynamic(() => import('@/components/BangladeshMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      borderRadius: '16px',
      gap: '12px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #dc2626',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading map...</span>
    </div>
  )
});

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [area, setArea] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [eligAge, setEligAge] = useState('');
  const [eligWeight, setEligWeight] = useState('');
  const [eligHealth, setEligHealth] = useState('');
  const [eligResult, setEligResult] = useState<{ eligible: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // Mock donor data with Bangladesh locations
  const mockDonors = [
    { id: 1, name: 'মোঃ রহিম', bloodGroup: 'A+', location: 'ঢাকা মেডিকেল', lat: 23.7104, lng: 90.4074, available: true, phone: '0171-1234567' },
    { id: 2, name: 'সারা আক্তার', bloodGroup: 'O+', location: 'বঙ্গবন্ধু হাসপাতাল', lat: 23.7104, lng: 90.4074, available: true, phone: '0181-2345678' },
    { id: 3, name: 'কামাল হোসেন', bloodGroup: 'B+', location: 'শিশু হাসপাতাল', lat: 23.7104, lng: 90.4074, available: false, phone: '0191-3456789' },
    { id: 4, name: 'ফারজানা', bloodGroup: 'AB+', location: 'স্যার সলিমুল্লাহ', lat: 23.7104, lng: 90.4074, available: true, phone: '0151-4567890' },
    { id: 5, name: 'জামিল', bloodGroup: 'A-', location: 'ঢাকা মেডিকেল', lat: 23.7104, lng: 90.4074, available: true, phone: '0161-5678901' },
    { id: 6, name: 'আনিসুর', bloodGroup: 'O-', location: 'চট্টগ্রাম মেডিকেল', lat: 22.3569, lng: 91.7832, available: true, phone: '0171-2345671' },
    { id: 7, name: 'নাজমা', bloodGroup: 'B-', location: 'রাজশাহী মেডিকেল', lat: 24.3636, lng: 88.6241, available: false, phone: '0181-3456721' },
    { id: 8, name: 'সোহেল', bloodGroup: 'AB-', location: 'খুলনা মেডিকেল', lat: 22.8456, lng: 89.5403, available: true, phone: '0191-4567123' }
  ];

  // Mock hospital data
  const mockHospitals = [
    { id: 1, name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', lat: 23.7104, lng: 90.4074, emergency: true, bloodNeeded: 'A+' },
    { id: 2, name: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়', lat: 23.7104, lng: 90.4074, emergency: true, bloodNeeded: 'O+' },
    { id: 3, name: 'শিশু হাসপাতাল', lat: 23.7104, lng: 90.4074, emergency: false, bloodNeeded: 'B+' },
    { id: 4, name: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', lat: 22.3569, lng: 91.7832, emergency: false, bloodNeeded: null },
    { id: 5, name: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল', lat: 24.3636, lng: 88.6241, emergency: false, bloodNeeded: null }
  ];

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    
    // Check authentication status
    const loginStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loginStatus === 'true');
  }, []);

  const handleBloodTypeSelect = (type: string) => {
    setSelectedBloodType(type);
  };

  const handleEligibilityCheck = () => {
    setIsCheckingEligibility(true);
    setEligResult(null);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const ageNum = parseInt(eligAge);
      const weightNum = parseFloat(eligWeight);
      
      if (!eligAge || !eligWeight || !eligHealth) {
        setEligResult({ eligible: false, message: language === 'bn' ? 'সব ক্ষেত্র পূরণ করুন' : 'Please fill in all fields' });
        setIsCheckingEligibility(false);
        return;
      }

      if (isNaN(ageNum) || isNaN(weightNum)) {
        setEligResult({ eligible: false, message: language === 'bn' ? 'সঠিক সংখ্যা দিন' : 'Please enter valid numbers' });
        setIsCheckingEligibility(false);
        return;
      }

      if (ageNum < 18 || ageNum > 65) {
        setEligResult({ eligible: false, message: language === 'bn' ? 'বয়স ১৮-৬৫ বছরের মধ্যে হতে হবে' : 'Age must be between 18 and 65' });
        setIsCheckingEligibility(false);
        return;
      }

      if (weightNum < 50) {
        setEligResult({ eligible: false, message: language === 'bn' ? 'ওজন কমপক্ষে ৫০ কেজি হতে হবে' : 'Weight must be at least 50 kg' });
        setIsCheckingEligibility(false);
        return;
      }

      if (eligHealth !== 'healthy') {
        setEligResult({ eligible: false, message: language === 'bn' ? 'সুস্থ থাকতে হবে' : 'Must be in good health' });
        setIsCheckingEligibility(false);
        return;
      }

      setEligResult({ eligible: true, message: language === 'bn' ? 'আপনি যোগ্য!' : 'You are eligible!' });
      setIsCheckingEligibility(false);
    }, 500);
  };

  const handleSearch = async () => {
    if (!selectedBloodType) {
      setEligResult({ eligible: false, message: language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন' : 'Please select a blood type' });
      return;
    }

    setLoading(true);
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter donors based on blood type and location
      const filteredDonors = mockDonors.filter(donor => {
        const bloodMatch = selectedBloodType === 'all' || donor.bloodGroup === selectedBloodType;
        const locationMatch = !selectedDistrict || donor.location.toLowerCase().includes(selectedDistrict.toLowerCase());
        return bloodMatch && locationMatch;
      });
      
      setSearchResults(filteredDonors);
      setEligResult({ eligible: true, message: language === 'bn' ? `${filteredDonors.length} জন দাতা পাওয়া গেছে` : `Found ${filteredDonors.length} donors` });
    } catch (error) {
      setEligResult({ eligible: false, message: language === 'bn' ? 'অনুসন্ধান ব্যর্থ হয়েছে' : 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string) => {
    const translations: Record<string, any> = {
      home: { en: 'Home', bn: 'হোম' },
      donors: { en: 'Donors', bn: 'রক্তদাতা' },
      request: { en: 'Request Blood', bn: 'রক্তের প্রয়োজন' },
      eligibilityLink: { en: 'Eligibility', bn: 'যোগ্যতা' },
      blog: { en: 'Blog', bn: 'ব্লগ' },
      chitrokothon: { en: 'Chitrokothon', bn: 'চিত্রকথন' },
      testimonials: { en: 'Testimonials', bn: 'অভিজ্ঞতা' },
      login: { en: 'Log In', bn: 'লগ ইন' },
      register: { en: 'Register', bn: 'রেজিস্টার' },
      nav: {
        home: { en: 'Home', bn: 'হোম' },
        donors: { en: 'Donors', bn: 'রক্তদাতা' },
        request: { en: 'Request Blood', bn: 'রক্তের প্রয়োজন' },
        blog: { en: 'Blog', bn: 'ব্লগ' },
        illustrations: { en: 'Chitrokothon', bn: 'চিত্রকথন' },
        about: { en: 'About', bn: 'সম্পর্কে' },
        login: { en: 'Log In', bn: 'লগ ইন' },
        register: { en: 'Register', bn: 'রেজিস্টার' },
      },
      hero: {
        title: { en: 'Every Drop', bn: 'প্রতিটি ফোঁটা' },
        titleAccent: { en: 'Matters', bn: 'রক্ত' },
        titleOutline: { en: 'Lives', bn: 'জীবন' },
        subtitle: { en: 'Connecting donors, saving lives', bn: 'সংযোগ স্থাপন করুন, জীবন বাঁচান' },
        cta: { en: 'Find A Donor', bn: 'রক্তদাতা খুঁজুন' },
        cta2: { en: 'Become A Donor', bn: 'রক্তদাতা হন' },
        eyebrow: { en: 'Our Mission', bn: 'আমাদের মিশন' },
      },
      ticker: {
        title: { en: 'Features', bn: 'বৈশিষ্ট্যসমূহ' },
        item1: { en: 'Real-time donor matching', bn: 'রিয়েল-টাইম রক্তদাতা মিলান' },
        item2: { en: 'Emergency blood requests', bn: 'জরুরি রক্তের প্রয়োজন' },
        item3: { en: 'Location-based search', bn: 'অবস্থান ভিত্তিক অনুসন্ধান' },
        item4: { en: 'Secure & verified donors', bn: 'নিরাপদ ও যাচাইকৃত রক্তদাতা' },
      },
      howItWorks: {
        title: { en: 'How It Works', bn: 'কিভাবে কাজ করে' },
        step1: { en: 'Register', bn: 'রেজিস্টার করুন' },
        step1Desc: { en: 'Create your profile as a donor or recipient', bn: 'রক্তদাতা বা প্রাপক হিসেবে আপনার প্রোফাইল তৈরি করুন' },
        step2: { en: 'Search', bn: 'অনুসন্ধান করুন' },
        step2Desc: { en: 'Find donors by blood type and location', bn: 'রক্তের গ্রুপ এবং অবস্থান অনুযায়ী রক্তদাতা খুঁজুন' },
        step3: { en: 'Connect', bn: 'সংযোগ করুন' },
        step3Desc: { en: 'Contact donors and save lives', bn: 'রক্তদাতাদের সাথে যোগাযোগ করুন এবং জীবন বাঁচান' },
      },
      donorSearch: {
        title: { en: 'Find a Blood Donor', bn: 'রক্তদাতা খুঁজুন' },
        subtitle: { en: 'Search by blood type and location', bn: 'রক্তের গ্রুপ এবং অবস্থান অনুযায়ী অনুসন্ধান করুন' },
        bloodType: { en: 'Blood Type', bn: 'রক্তের গ্রুপ' },
        location: { en: 'Location', bn: 'অবস্থান' },
        search: { en: 'Search', bn: 'অনুসন্ধান' },
        noDonors: { en: 'No donors found', bn: 'কোন রক্তদাতা পাওয়া যায়নি' },
        emergency: { en: 'Need Blood?', bn: 'রক্তের প্রয়োজন?' },
        submit: { en: 'Submit request now', bn: 'এখনই অনুরোধ জমা দিন' },
      },
      eligibility: {
        title: { en: 'Eligibility Criteria', bn: 'যোগ্যতার মানদণ্ড' },
        item1: { en: 'Age 18-65 years', bn: 'বয়স ১৮-৬৫ বছর' },
        item2: { en: 'Weight 50kg or more', bn: 'ওজন ৫০ কেজি বা তার বেশি' },
        item3: { en: 'No recent tattoos or piercings', bn: 'সাম্প্রতিক ট্যাটু বা পিয়ার্সিং নেই' },
        item4: { en: 'Good general health', bn: 'সুস্থ সাধারণ স্বাস্থ্য' },
        check: { en: 'Check Your Eligibility', bn: 'আপনার যোগ্যতা যাচাই করুন' },
      },
      registerCTA: {
        title: { en: 'Ready to Save Lives?', bn: 'জীবন বাঁচাতে প্রস্তুত?' },
        subtitle: { en: 'Join our community of blood donors today', bn: 'আজই আমাদের রক্তদাতা সম্প্রদায়ে যোগ দিন' },
        cta: { en: 'Register Now', bn: 'এখনই রেজিস্টার করুন' },
      },
      footer: {
        about: { en: 'About RoktoKorobi', bn: 'রক্তকরবী সম্পর্কে' },
        aboutDesc: { en: 'Connecting blood donors with those in need across Bangladesh', bn: 'বাংলাদেশের বৃহত্তম রক্তদাতাদের প্রয়োজনবানদের সাথে সংযুক্ত করা' },
        quickLinks: { en: 'Quick Links', bn: 'দ্রুত লিঙ্ক' },
        contact: { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
        rights: { en: 'All rights reserved', bn: 'সর্বস্বত্ব সংরক্ষিত' },
      },
    };

    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    if (typeof value === 'object' && language in value) {
      return value[language];
    }
    return key;
  };

  useEffect(() => {
    // Nav scroll effect
    const handleScroll = () => {
      setNavSolid(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
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
        .fcard:hover .c-num  { color: rgba(255,255,255,0.07)!important; }
        .fcard:hover .c-lbl  { color: rgba(255,200,200,0.66)!important; }
        .fcard:hover .c-div  { background: rgba(255,255,255,0.16)!important; }
        .fcard:hover .c-head { color: white!important; }
        .fcard:hover .c-ital { color: #FFBBBB!important; }
        .fcard:hover .c-desc { color: rgba(255,215,215,0.72)!important; }
        .fcard:hover .c-iwr  { border-color: rgba(255,255,255,0.22)!important; }
        .fcard:hover .c-bar  { opacity:0; }
        .fcard:hover .c-cta  { color:white!important; border-color:rgba(255,255,255,0.28)!important; }
        .fcard:hover .c-arr  { transform: translateX(5px); }

        /* ═══════════════════════════════════════
           NEW HERO SECTION STYLES
        ══════════════════════════════════════ */
        :root {
          --cream: #F2E8DC;
          --maroon: #1C0508;
          --red: #CC1A2D;
          --red2: #A81424;
          --white: #FFFCF8;
          --text-dark: #1C0508;
          --text-muted: #5a3a3a;
        }

        .hero-new {
          display: flex;
          align-items: center;
          min-height: 100vh;
          padding: 48px 80px;
          gap: 72px;
          position: relative;
          overflow: hidden;
          background: var(--cream);
        }

        .hero-card {
          width: 420px;
          min-height: 420px;
          flex-shrink: 0;
          background: linear-gradient(160deg,#160204 0%,#1C0508 32%,#220608 68%,#170304 100%);
          border-radius: 36px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 8px 24px rgba(28,5,8,0.22), 0 24px 64px rgba(28,5,8,0.18), 0 48px 96px rgba(28,5,8,0.10);
          padding: 34px 38px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, var(--red2), var(--red), var(--red2));
          z-index: 3;
        }

        .hero-card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse 75% 50% at 90% 5%, rgba(204,26,45,0.28) 0%,transparent 55%), radial-gradient(ellipse 50% 45% at 8% 95%,rgba(110,0,12,0.20) 0%,transparent 50%);
        }

        .hero-card-bg-text {
          position: absolute;
          bottom: -0.28em;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 11rem;
          font-weight: 700;
          color: rgba(255,252,248,0.7);
          opacity: 0.07;
          pointer-events: none;
          user-select: none;
          line-height: 1;
          white-space: nowrap;
          z-index: 1;
          letter-spacing: -0.01em;
          animation: bgTextPulse 6s ease-in-out infinite;
        }

        @keyframes bgTextPulse {
          0%,100% { opacity: 0.05; }
          50% { opacity: 0.11; }
        }

        .hero-card-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");
        }

        .live-badge, .hero-h1, .hero-sub, .hero-ctas {
          position: relative;
          z-index: 2;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(204,26,45,0.15);
          border: 1px solid rgba(204,26,45,0.32);
          border-radius: 100px;
          padding: 6px 14px;
          width: fit-content;
          margin-bottom: 18px;
          opacity: 0;
          animation: fadeUp .5s .1s ease forwards;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--red);
          animation: blink 1.3s ease-in-out infinite;
        }

        @keyframes blink {
          0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(204,26,45,0.7); }
          50% { opacity: 0.55; box-shadow: 0 0 0 4px rgba(204,26,45,0); }
        }

        .live-badge span {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--red);
        }

        .hero-h1 {
          font-family: 'DM Serif Display', 'Hind Siliguri', serif;
          font-size: clamp(1.75rem, 2.5vw, 2.6rem);
          line-height: 1.18;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 14px;
        }

        .hero-h1 .line {
          display: block;
          overflow: hidden;
        }

        .hero-h1 .line span {
          display: block;
          opacity: 0;
          transform: translateY(110%);
        }

        .hero-h1 .line:nth-child(1) span {
          animation: slideUp .65s .25s cubic-bezier(.22,1,.36,1) forwards;
        }

        .hero-h1 .line:nth-child(2) span {
          animation: slideUp .65s .42s cubic-bezier(.22,1,.36,1) forwards;
        }

        .hero-h1 .accent {
          font-style: italic;
          color: var(--red);
        }

        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-sub {
          font-size: 0.84rem;
          font-weight: 300;
          line-height: 1.82;
          color: rgba(255,252,248,0.55);
          margin-bottom: 22px;
          opacity: 0;
          animation: fadeUp .55s .68s ease forwards;
        }

        .hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          animation: fadeUp .55s .85s ease forwards;
        }

        .btn-register {
          width: 100%;
          padding: 14px 24px;
          background: var(--red);
          color: var(--white);
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          border: none;
          border-radius: 22px;
          cursor: pointer;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 18px rgba(204,26,45,0.38);
        }

        .btn-register:hover {
          background: var(--red2);
          transform: translateY(-1px);
        }

        .btn-need {
          width: 100%;
          padding: 14px 24px;
          background: transparent;
          color: rgba(255,252,248,0.82);
          font-size: 0.88rem;
          font-weight: 400;
          border: 1px solid rgba(255,252,248,0.18);
          border-radius: 22px;
          cursor: pointer;
          transition: border-color .2s, color .2s, transform .15s;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .btn-need:hover {
          border-color: rgba(255,252,248,0.4);
          color: var(--white);
          transform: translateY(-1px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-right {
          flex: 1;
          position: relative;
          min-height: 540px;
          overflow: hidden;
        }

        .map-card-anchor {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }

        .map-card {
          background: var(--white);
          border-radius: 22px;
          width: 290px;
          height: 290px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 8px 40px rgba(28,5,8,0.1);
          opacity: 0;
          animation: scaleIn .7s .5s cubic-bezier(.22,1,.36,1) forwards, floatCard 5.2s 1.2s ease-in-out infinite;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes floatCard {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1) translateY(-8px); }
        }

        .radar {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(204,26,45,0.15);
          background: rgba(204,26,45,0.05);
        }

        .radar-ring:nth-child(1) {
          width: 220px;
          height: 220px;
          background: rgba(204,26,45,0.04);
        }

        .radar-ring:nth-child(2) {
          width: 154px;
          height: 154px;
          background: rgba(204,26,45,0.07);
          border-color: rgba(204,26,45,0.2);
        }

        .radar-ring:nth-child(3) {
          width: 90px;
          height: 90px;
          background: rgba(204,26,45,0.12);
          border-color: rgba(204,26,45,0.3);
        }

        .radar-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--red);
          box-shadow: 0 0 0 5px rgba(204,26,45,0.25), 0 0 0 10px rgba(204,26,45,0.1);
          position: relative;
          z-index: 2;
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 0 5px rgba(204,26,45,0.25), 0 0 0 10px rgba(204,26,45,0.1); }
          50% { box-shadow: 0 0 0 9px rgba(204,26,45,0.15), 0 0 0 20px rgba(204,26,45,0.05); }
        }

        .radar::after {
          content: '';
          position: absolute;
          width: 50%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(204,26,45,0.5));
          top: 50%;
          left: 50%;
          transform-origin: 0% 50%;
          animation: sweep 4s linear infinite;
        }

        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .map-bar {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 9px;
          background: #e5ddd5;
          border-radius: 6px;
          overflow: hidden;
        }

        .map-bar::after {
          content: '';
          display: block;
          height: 100%;
          width: 55%;
          background: #ccc;
          border-radius: 6px;
        }

        .badge {
          position: absolute;
          background: var(--white);
          border-radius: 12px;
          padding: 11px 16px;
          display: flex;
          align-items: center;
          gap: 11px;
          box-shadow: 0 4px 20px rgba(28,5,8,0.11);
          white-space: nowrap;
          opacity: 0;
          z-index: 2;
        }

        .badge-emergency {
          top: 52px;
          right: 36px;
          animation: fadeInOnly .55s .8s ease forwards, slideUpOnce .55s .8s ease forwards, floatA 4s 1.35s ease-in-out infinite;
        }

        .badge-map {
          top: 18%;
          left: 8px;
          animation: fadeInOnly .55s 1s ease forwards, slideUpOnce .55s 1s ease forwards, floatB 3.5s 1.55s ease-in-out infinite;
        }

        .badge-verified {
          bottom: 90px;
          right: 36px;
          animation: fadeInOnly .55s 1.15s ease forwards, slideUpOnce .55s 1.15s ease forwards, floatC 4.5s 1.7s ease-in-out infinite;
        }

        @keyframes fadeInOnly {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUpOnce {
          from { transform: translateY(18px); }
          to { transform: translateY(0); }
        }

        @keyframes floatA {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        @keyframes floatB {
          0%,100% { transform: translateY(-3px); }
          50% { transform: translateY(5px); }
        }

        @keyframes floatC {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        .badge-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.95rem;
        }

        .badge-emergency .badge-icon, .badge-map .badge-icon {
          background: rgba(204,26,45,0.1);
        }

        .badge-verified .badge-icon {
          background: #f0f9f0;
          color: #2a8a3e;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .badge-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-dark);
          display: block;
          line-height: 1.2;
        }

        .badge-sub {
          font-size: 0.65rem;
          font-weight: 400;
          color: var(--text-muted);
          display: block;
          margin-top: 2px;
        }

        .fabs {
          position: fixed;
          right: 24px;
          bottom: 36px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 300;
          align-items: center;
        }

        .fab-sos {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: radial-gradient(circle at 38% 32%, #e0192c 0%, #900010 100%);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: sosGlow 2s ease-in-out infinite;
          transition: transform .2s;
        }

        .fab-sos:hover {
          transform: scale(1.1);
        }

        .fab-sos::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.22) 0%, transparent 60%);
          pointer-events: none;
        }

        .fab-sos::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(204,26,45,0.5);
          animation: sosRing 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes sosGlow {
          0% { box-shadow: 0 0 0 0 rgba(204,26,45,0.8), 0 4px 18px rgba(204,26,45,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(204,26,45,0), 0 6px 28px rgba(204,26,45,0.65), 0 0 40px rgba(204,26,45,0.2); }
          100% { box-shadow: 0 0 0 0 rgba(204,26,45,0), 0 4px 18px rgba(204,26,45,0.4); }
        }

        @keyframes sosRing {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .fab-share {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          border: 1.5px solid rgba(28,5,8,0.1);
          background: var(--white);
          color: var(--text-dark);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(28,5,8,0.1);
          transition: transform .2s, box-shadow .2s;
        }

        .fab-share:hover {
          transform: scale(1.06) translateY(-2px);
          box-shadow: 0 8px 22px rgba(28,5,8,0.15);
        }

        .stats-dashboard {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          padding: 52px 80px;
          background: var(--cream);
          border-top: 1px solid rgba(28,5,8,0.08);
          border-bottom: 1px solid rgba(28,5,8,0.08);
        }

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 40px;
        }

        .stat-number {
          font-family: 'DM Serif Display', 'Hind Siliguri', serif;
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          font-weight: 400;
          color: var(--text-dark);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-family: 'DM Sans', 'Hind Siliguri', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
        }

        .stat-divider {
          width: 1px;
          height: 64px;
          background: rgba(28,5,8,0.1);
          flex-shrink: 0;
        }

        .mission-section {
          display: grid;
          grid-template-columns: 46% 54%;
          min-height: 90vh;
          align-items: center;
        }

        .mission-left {
          padding: 72px 52px 72px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mission-label {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 36px;
        }

        .mission-label-line {
          width: 40px;
          height: 2px;
          background: var(--red);
        }

        .mission-label-text {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dark);
          opacity: 0.5;
        }

        .mission-h2 {
          font-family: 'DM Serif Display', 'Hind Siliguri', serif;
          font-size: clamp(3rem, 6vw, 6rem);
          line-height: 1.0;
          color: var(--text-dark);
          margin-bottom: 22px;
          font-weight: 400;
        }

        .mission-h2 .italic-red {
          font-style: italic;
          color: var(--red);
          display: block;
        }

        .mission-h2 .normal {
          display: block;
        }

        .mission-sub {
          font-family: 'DM Serif Display', 'Hind Siliguri', serif;
          font-size: 1.05rem;
          font-weight: 400;
          color: var(--red);
          margin-bottom: 18px;
        }

        .mission-body {
          font-size: 0.9rem;
          font-weight: 300;
          line-height: 1.82;
          color: var(--text-muted);
          max-width: 420px;
          margin-bottom: 40px;
        }

        .mission-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn-become {
          padding: 13px 26px;
          background: var(--red);
          color: var(--white);
          font-size: 0.88rem;
          font-weight: 600;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background .2s, transform .15s;
          box-shadow: 0 4px 18px rgba(204,26,45,0.35);
        }

        .btn-become:hover {
          background: var(--red2);
          transform: translateY(-1px);
        }

        .btn-find {
          padding: 13px 26px;
          background: transparent;
          color: var(--text-dark);
          font-size: 0.88rem;
          font-weight: 500;
          border: 2px solid rgba(28,5,8,0.18);
          border-radius: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: border-color .2s, color .2s, transform .15s;
        }

        .btn-find:hover {
          border-color: var(--red);
          color: var(--red);
          transform: translateY(-1px);
        }

        .mission-right {
          position: relative;
          min-height: 500px;
        }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .7s ease, transform .7s ease;
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media(max-width: 1050px) {
          .hero-new { padding: 40px 48px; gap: 48px; }
          .hero-card { width: 340px; }
        }

        @media(max-width: 820px) {
          .hero-new {
            flex-direction: column;
            align-items: stretch;
            padding: 32px 24px;
            gap: 28px;
            min-height: auto;
          }
          .hero-card { width: 100%; }
          .hero-right { min-height: 380px; }
          .mission-section { grid-template-columns: 1fr; }
          .mission-left { padding: 56px 24px; }
          .map-card-anchor { left: 50%; transform: translate(-50%, -50%); }
          .badge-emergency { top: 16px; right: 16px; }
          .badge-map { top: auto; bottom: 100px; left: 16px; }
          .badge-verified { bottom: 36px; right: 16px; }
          .stats-dashboard { padding: 40px 24px; gap: 0; }
          .stat-item { padding: 0 20px; }
          .stat-label { font-size: 0.6rem; letter-spacing: 0.12em; }
        }

        @media(prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}}/>
      
      {/* Navigation with Mobile Responsive */}
      <nav className={`nav ${navSolid ? 'solid' : ''} ${mobileOpen ? 'mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
        <Link href="/" className="nav-logo" aria-label="RoktoKorobi - Home">
          <span className="nav-logo-emoji">🩸</span>
          <div>
            <span className="nav-logo-text">রক্তকরবী</span>
            <span className="nav-logo-sub">RoktoKorobi</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="nav-links desktop-only" role="menubar">
          <li role="none"><Link href="/" role="menuitem" aria-label={t('home')}>{t('home')}</Link></li>
          <li role="none"><Link href="/donors" role="menuitem" aria-label={t('donors')}>{t('donors')}</Link></li>
          <li role="none"><Link href="/request" role="menuitem" aria-label={t('request')}>{t('request')}</Link></li>
          <li role="none"><Link href="/eligibility" role="menuitem" aria-label={t('eligibilityLink')}>{t('eligibilityLink')}</Link></li>
          <li role="none"><Link href="/blog" role="menuitem" aria-label={t('blog')}>{t('blog')}</Link></li>
          <li role="none"><Link href="/illustrations" role="menuitem" aria-label={t('chitrokothon')}>{t('chitrokothon')}</Link></li>
          <li role="none"><Link href="/testimonials" role="menuitem" aria-label={t('testimonials')}>{t('testimonials')}</Link></li>
          <li role="none">
            <button
              onClick={() => {
                const newLang = language === 'en' ? 'bn' : 'en';
                setLanguage(newLang);
                localStorage.setItem('language', newLang);
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(26,15,10,0.2)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '20px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>
          </li>
          {isLoggedIn ? (
          <>
            <li role="none"><Link href="/dashboard" role="menuitem" aria-label="Dashboard">Dashboard</Link></li>
            <li role="none"><Link href="/profile" role="menuitem" aria-label="Profile">Profile</Link></li>
            <li role="none">
              <button 
                onClick={() => {
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('userEmail');
                  setIsLoggedIn(false);
                  router.push('/');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '8px 16px'
                }}
              >
                Log Out
              </button>
            </li>
          </>
        ) : (
          <li role="none"><Link href="/login" className="nav-cta" role="menuitem" aria-label={t('login')}>{t('login')}</Link></li>
        )}
        </ul>
        
        {/* Mobile Menu Toggle */}
        <button 
          className={`hamburger ${mobileOpen ? 'open' : ''}`} 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu - Improved */}
      <div id="mobile-menu" className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile navigation">
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>
        <div className="mobile-menu-content">
          <button
            onClick={() => {
              const newLang = language === 'en' ? 'bn' : 'en';
              setLanguage(newLang);
              localStorage.setItem('language', newLang);
            }}
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid #dc2626',
              color: '#dc2626',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} aria-label="Dashboard">Dashboard</Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} aria-label="Profile">Profile</Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('userEmail');
                  setIsLoggedIn(false);
                  router.push('/');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '8px 16px'
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="mm-cta" aria-label={t('login')}>{t('login')}</Link>
          )}
          <Link href="/donors" onClick={() => setMobileOpen(false)} aria-label={t('donors')}>{t('donors')}</Link>
          <Link href="/request" onClick={() => setMobileOpen(false)} aria-label={t('request')}>{t('request')}</Link>
          <Link href="/eligibility" onClick={() => setMobileOpen(false)} aria-label={t('eligibilityLink')}>{t('eligibilityLink')}</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} aria-label={t('blog')}>{t('blog')}</Link>
          <Link href="/illustrations" onClick={() => setMobileOpen(false)} aria-label={t('chitrokothon')}>{t('chitrokothon')}</Link>
          <Link href="/testimonials" onClick={() => setMobileOpen(false)} aria-label={t('testimonials')}>{t('testimonials')}</Link>
        </div>
      </div>

      {/* New Hero Section */}
      <section className="hero-new" aria-labelledby="hero-title">
        {/* Dark Content Card */}
        <div className="hero-card">
          <div className="hero-card-bg-text" aria-hidden="true">রক্ত</div>
          <div className="hero-card-glow" aria-hidden="true"></div>
          <div className="hero-card-grain" aria-hidden="true"></div>

          <div className="live-badge">
            <div className="live-dot"></div>
            <span>{language === 'bn' ? 'এখন সরাসরি' : 'Live Now'}</span>
          </div>

          <h1 className="hero-h1">
            <span className="line"><span>{language === 'bn' ? 'রক্ত দিন, জীবন বাঁচান' : 'Donate Blood, Save'}</span></span>
            <span className="line"><span>{language === 'bn' ? 'আজই' : 'Lives'} <span className="accent">{language === 'bn' ? '' : 'Today'}</span></span></span>
          </h1>

          <p className="hero-sub">
            {language === 'bn'
              ? 'বাংলাদেশের সবচেয়ে বড় রক্তদাতা নেটওয়ার্কে যোগ দিন এবং সংকটের মুহূর্তে জীবন বাঁচাতে সাহায্য করুন।'
              : 'Join Bangladesh\'s largest blood donor network and help save lives in critical moments.'}
          </p>

          <div className="hero-ctas">
            <button type="button" className="btn-register" onClick={() => router.push('/register')}>
              {language === 'bn' ? 'দাতা হিসেবে নিবন্ধন করুন' : 'Register as Donor'}
            </button>
            <button type="button" className="btn-need" onClick={() => router.push('/request')}>
              {language === 'bn' ? 'রক্ত দরকার?' : 'Need Blood?'}
            </button>
          </div>
        </div>

        {/* GPS + Badges */}
        <div className="hero-right">
          <div className="map-card-anchor">
            <div className="map-card">
              <div className="radar">
                <div className="radar-ring"></div>
                <div className="radar-ring"></div>
                <div className="radar-ring"></div>
                <div className="radar-dot"></div>
              </div>
              <div className="map-bar"></div>
            </div>
          </div>

          <div className="badge badge-emergency">
            <div className="badge-icon" aria-hidden="true">🩸</div>
            <div>
              <span className="badge-title">{language === 'bn' ? 'জরুরি সহায়তা' : 'Emergency'}</span>
              <span className="badge-sub">{language === 'bn' ? '২৪/৭ সার্ভিস' : '24/7 Support'}</span>
            </div>
          </div>

          <div className="badge badge-map">
            <div className="badge-icon" aria-hidden="true">📍</div>
            <div>
              <span className="badge-title">{language === 'bn' ? 'লাইভ ম্যাপ' : 'Live Map'}</span>
              <span className="badge-sub">{language === 'bn' ? 'জিপিএস ট্র্যাকিং' : 'GPS Tracking'}</span>
            </div>
          </div>

          <div className="badge badge-verified">
            <div className="badge-icon" aria-hidden="true">✓</div>
            <div>
              <span className="badge-title">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
              <span className="badge-sub">{language === 'bn' ? 'সকল দাতা' : 'All Donors'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="stats-dashboard">
        <div className="stat-item reveal">
          <span className="stat-number">0</span>
          <span className="stat-label">{language === 'bn' ? 'নিবন্ধিত দাতা' : 'Registered Donors'}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item reveal">
          <span className="stat-number">0</span>
          <span className="stat-label">{language === 'bn' ? 'পূরণকৃত অনুরোধ' : 'Requests Fulfilled'}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item reveal">
          <span className="stat-number">0</span>
          <span className="stat-label">{language === 'bn' ? 'অংশীদার প্রতিষ্ঠান' : 'Partner Organizations'}</span>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-left">
          <div className="mission-label reveal">
            <div className="mission-label-line"></div>
            <span className="mission-label-text">{language === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}</span>
          </div>
          <h2 className="mission-h2 reveal">
            <span className="normal">{language === 'bn' ? 'প্রতিটি ফোঁটা' : 'Every Drop'}</span>
            <span className="italic-red">{language === 'bn' ? 'গুরুত্বপূর্ণ' : 'Matters'}</span>
            <span className="normal">{language === 'bn' ? 'জীবন' : 'Lives'}</span>
          </h2>
          <p className="mission-sub reveal">{language === 'bn' ? 'দাতাদের সংযুক্ত করা, জীবন বাঁচানো' : 'Connecting donors, saving lives'}</p>
          <p className="mission-body reveal">
            {language === 'bn'
              ? 'রক্তকরবী একটি ডিজিটাল প্ল্যাটফর্ম যা রক্তদাতাদের সাথে প্রয়োজনগ্রস্তদের সংযুক্ত করে। আমাদের লক্ষ্য বাংলাদেশে রক্তের ঘাটতি কমানো এবং প্রতিটি জরুরি পরিস্থিতিতে সহায়তা প্রদান করা।'
              : 'RoktoKorobi is a digital platform connecting blood donors with those in need. Our mission is to reduce blood shortages in Bangladesh and provide assistance in every emergency.'}
          </p>
          <div className="mission-ctas reveal">
            <button type="button" className="btn-become" onClick={() => router.push('/register')}>
              {language === 'bn' ? 'দাতা হোন →' : 'Become a Donor →'}
            </button>
            <button type="button" className="btn-find" onClick={() => router.push('/donors')}>
              {language === 'bn' ? 'দাতা খুঁজুন →' : 'Find Donors →'}
            </button>
          </div>
        </div>
        <div className="mission-right"></div>
      </section>

      {/* FABs */}
      <div className="fabs">
        <button type="button" className="fab-sos" aria-label={language === 'bn' ? 'জরুরি রক্ত সহায়তা — SOS' : 'Emergency Blood Assistance — SOS'} onClick={() => router.push('/request')}>
          <span aria-hidden="true">SOS</span>
        </button>
        <button type="button" className="fab-share" aria-label={language === 'bn' ? 'শেয়ার' : 'Share'} onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: language === 'bn' ? 'রক্তকরবী - রক্ত দান' : 'RoktoKorobi - Blood Donation',
              url: window.location.href
            });
          }
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      </div>

      <TickerBanner />
    
      {/* How It Works */}
      <section className="how py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="how-header reveal text-center mb-12 lg:mb-16">
            <div className="s-label inline-block">
              <div className="s-label-line"></div>
              <span className="s-label-text">{language === 'bn' ? 'কিভাবে কাজ করে' : 'How It Works'}</span>
            </div>
            <h2 className="s-title text-3xl lg:text-4xl font-bold mb-4">
              {language === 'bn' ? 'সহজ চার চার ধাপে' : 'Simple Four Steps To'} <span className="accent">{language === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
            </h2>
            <p className="s-desc text-lg max-w-3xl mx-auto">
              {language === 'bn'
                ? 'রক্তদান প্রক্রিয়া এখন আরমাভ সহজ। নিবন্ধন করুন, জীবন বাঁচান।'
                : 'The blood donation process is now easier than ever. Register in minutes and start saving lives.'}
            </p>
          </div>
          <div className="steps reveal delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/register')}
            >
              <span className="step-num">01</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'রেজিস্টার করুন' : 'Register'}</h3>
              <p className="step-desc">{language === 'bn' ? 'আপনার তথ্য দিয়ে নিবন্ধন করুন' : 'Sign up with your details easily'}</p>
              <span className="step-arrow">→</span>
            </div>
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/donors')}
            >
              <span className="step-num">02</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'দাতা খুঁজুন' : 'Find Donors'}</h3>
              <p className="step-desc">{language === 'bn' ? 'আপনার এলাকায় উপলব্ধ রক্তদাতা খুঁজুন' : 'Search donors near your location'}</p>
              <span className="step-arrow">→</span>
            </div>
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/request')}
            >
              <span className="step-num">03</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'রক্ত চাই' : 'Request Blood'}</h3>
              <p className="step-desc">{language === 'bn' ? 'রক্তের প্রয়োজন পোস্ট করুন' : 'Post your blood request'}</p>
              <span className="step-arrow">→</span>
            </div>
            <div 
              className="step group cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-2 hover:shadow-xl" 
              onClick={() => router.push('/register')}
            >
              <span className="step-num">04</span>
              <span className="step-icon">🩸</span>
              <h3 className="step-title">{language === 'bn' ? 'রক্তদান করুন' : 'Donate'}</h3>
              <p className="step-desc">{language === 'bn' ? 'জীবন বাঁচান' : 'Save a life today'}</p>
              <span className="step-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Search Section */}
      <section className="search-sec py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="search-layout grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="search-left reveal space-y-6">
              <div className="s-label">
                <div className="s-label-line"></div>
                <span className="s-label-text">{language === 'bn' ? 'দাতা অনুসন্ধান' : 'Donor Search'}</span>
              </div>
              <h2 className="s-title text-2xl lg:text-3xl font-bold">
                {language === 'bn' ? 'আপনার কাছাকাছি' : 'Donors Near'}
                <span className="teal">{language === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Your Location'}</span>
              </h2>
              <p className="s-desc text-lg">
                {language === 'bn'
                  ? 'আপনার এলাকায় উপলব্ধ রক্তদাতাদের খুঁজুন এবং জরুরি মুহূর্তে সহায়তা পান।'
                  : 'Find available blood donors in your area and get help in emergency situations.'}
              </p>
              {searchResults && searchResults.length > 0 ? (
                <div className="donor-list space-y-3">
                  {searchResults.map((donor: any, index: number) => (
                    <div key={index} className="donor-row flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                      <div className="d-avatar w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background: '#dc2626'}}>{donor.name?.[0] || 'D'}</div>
                      <div className="flex-1">
                        <span className="d-name font-semibold">{donor.name}</span>
                        <span className="d-info block text-sm text-gray-600">{donor.bloodGroup} • {donor.location}</span>
                      </div>
                      <span className="d-badge bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{language === 'bn' ? 'উপলব্ধ' : 'Available'}<span className="d-avail"></span></span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="search-card reveal delay-1 bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="sc-title text-xl font-bold mb-6">{language === 'bn' ? 'দাতা অনুসন্ধান করুন' : 'Search Donors'}</div>
              <div className="form-row space-y-4">
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</label>
                  <div className="bt-grid grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <button 
                        key={type}
                        className={`bt-btn px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedBloodType === type 
                            ? 'border-red-500 bg-red-500 text-white' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                        onClick={() => handleBloodTypeSelect(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'জেলা' : 'District'}</label>
                  <select 
                    className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                    <option value="Dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                    <option value="Faridpur">{language === 'bn' ? 'ফরিদপুর' : 'Faridpur'}</option>
                    <option value="Gazipur">{language === 'bn' ? 'গাজীপুর' : 'Gazipur'}</option>
                    <option value="Gopalganj">{language === 'bn' ? 'গোপালগঞ্জ' : 'Gopalganj'}</option>
                    <option value="Kishoreganj">{language === 'bn' ? 'কিশোরগঞ্জ' : 'Kishoreganj'}</option>
                    <option value="Madaripur">{language === 'bn' ? 'মাদারীপুর' : 'Madaripur'}</option>
                    <option value="Manikganj">{language === 'bn' ? 'মানিকগঞ্জ' : 'Manikganj'}</option>
                    <option value="Munshiganj">{language === 'bn' ? 'মুন্সিগঞ্জ' : 'Munshiganj'}</option>
                    <option value="Narayanganj">{language === 'bn' ? 'নারায়গঞ্জ' : 'Narayanganj'}</option>
                    <option value="Narsingdi">{language === 'bn' ? 'নরসিংদী' : 'Narsingdi'}</option>
                    <option value="Rajbari">{language === 'bn' ? 'রাজবাডী' : 'Rajbari'}</option>
                    <option value="Shariatpur">{language === 'bn' ? 'শরীয়তপুর' : 'Shariatpur'}</option>
                    <option value="Tangail">{language === 'bn' ? 'টাঙ্গাইল' : 'Tangail'}</option>
                    <option value="Bogra">{language === 'bn' ? 'বগুড়া' : 'Bogra'}</option>
                    <option value="Dinajpur">{language === 'bn' ? 'দিনাজপুর' : 'Dinajpur'}</option>
                    <option value="Gaibandha">{language === 'bn' ? 'গাইবান্ধা' : 'Gaibandha'}</option>
                    <option value="Jaipurhat">{language === 'bn' ? 'জয়পুরহাট' : 'Jaipurhat'}</option>
                    <option value="Kurigram">{language === 'bn' ? 'কুরিগ্রাম' : 'Kurigram'}</option>
                    <option value="Lalmonirhat">{language === 'bn' ? 'লালমনিরহাট' : 'Lalmonirhat'}</option>
                    <option value="Naogaon">{language === 'bn' ? 'নওগাঁ' : 'Naogaon'}</option>
                    <option value="Natore">{language === 'bn' ? 'নাটোর' : 'Natore'}</option>
                    <option value="Nawabganj">{language === 'bn' ? 'নওয়াবগঞ্জ' : 'Nawabganj'}</option>
                    <option value="Pabna">{language === 'bn' ? 'পাবনা' : 'Pabna'}</option>
                    <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                    <option value="Sirajganj">{language === 'bn' ? 'সিরাজগঞ্জ' : 'Sirajganj'}</option>
                    <option value="Thakurgaon">{language === 'bn' ? 'ঠাকুরগাঁও' : 'Thakurgaon'}</option>
                    <option value="Barguna">{language === 'bn' ? 'বরগুনা' : 'Barguna'}</option>
                    <option value="Barisal">{language === 'bn' ? 'বরিশাল' : 'Barisal'}</option>
                    <option value="Bhola">{language === 'bn' ? 'ভোলা' : 'Bhola'}</option>
                    <option value="Jhalokati">{language === 'bn' ? 'ঝালকাঠি' : 'Jhalokati'}</option>
                    <option value="Patuakhali">{language === 'bn' ? 'পটুয়াখালী' : 'Patuakhali'}</option>
                    <option value="Pirojpur">{language === 'bn' ? 'পিরোজপুর' : 'Pirojpur'}</option>
                    <option value="Bandarban">{language === 'bn' ? 'বান্দরবান' : 'Bandarban'}</option>
                    <option value="Brahmanbaria">{language === 'bn' ? 'ব্রাহ্মণবাড়িয়়' : 'Brahmanbaria'}</option>
                    <option value="Chandpur">{language === 'bn' ? 'চাঁদপুর' : 'Chandpur'}</option>
                    <option value="Chittagong">{language === 'bn' ? 'চিট্টগ্রাম' : 'Chittagong'}</option>
                    <option value="CoxsBazar">{language === 'bn' ? "ক্ষ'বাজার" : "Cox's Bazar"}</option>
                    <option value="Feni">{language === 'bn' ? 'ফেনী' : 'Feni'}</option>
                    <option value="Khagrachari">{language === 'bn' ? 'খাগড়াছড়ি' : 'Khagrachari'}</option>
                    <option value="Lakshmipur">{language === 'bn' ? 'লক্ষ্মীপুর' : 'Lakshmipur'}</option>
                    <option value="Noakhali">{language === 'bn' ? 'নোয়াখালী' : 'Noakhali'}</option>
                    <option value="Rangamati">{language === 'bn' ? 'রাঙ্গামাটি' : 'Rangamati'}</option>
                    <option value="Sunamganj">{language === 'bn' ? 'সুনামগঞ্জ' : 'Sunamganj'}</option>
                    <option value="Sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                    <option value="Bagerhat">{language === 'bn' ? 'বাগেরহাট' : 'Bagerhat'}</option>
                    <option value="Chuadanga">{language === 'bn' ? 'চুয়াডাঙ্গ' : 'Chuadanga'}</option>
                    <option value="Jessore">{language === 'bn' ? 'যশোর' : 'Jessore'}</option>
                    <option value="Jhenaidah">{language === 'bn' ? 'ঝেনাইদাহ' : 'Jhenaidah'}</option>
                    <option value="Khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                    <option value="Kushtia">{language === 'bn' ? 'কুষ্টিয়া' : 'Kushtia'}</option>
                    <option value="Magura">{language === 'bn' ? 'মাগুরা' : 'Magura'}</option>
                    <option value="Meherpur">{language === 'bn' ? 'মেহেরপুর' : 'Meherpur'}</option>
                    <option value="Narail">{language === 'bn' ? 'নড়াই' : 'Narail'}</option>
                    <option value="Satkhira">{language === 'bn' ? 'সাতক্ষীরা' : 'Satkhira'}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'এলাকা' : 'Area'}</label>
                  <input 
                    type="text" 
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder={language === 'bn' ? 'এলাকা লিখুন' : 'Enter area'}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="search-submit w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none'
                }}
              >
                {loading ? (language === 'bn' ? 'অনুসন্ধান করছে...' : 'Searching...') : (language === 'bn' ? 'অনুসন্ধান করুন' : 'Search')} <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="eligibility py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="elig-layout grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="elig-left reveal space-y-6">
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
                  : 'Are you eligible to donate blood? Check detailed information here.'}
              </p>
              <div className="criteria-list space-y-4">
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg">
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'বয়স: ১৮-৬৫ বছর' : 'Age: 18-65 years'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'সুস্থ প্রাপ্তবয়স্করা দাতা হতে পারেন' : 'Healthy adults can be donors'}</p>
                  </div>
                </div>
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg">
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'ওজন: ৫০ কেজি বা তার বেশি' : 'Weight: 50kg or more'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'ন্যূনতম ওজন প্রয়োজন' : 'Minimum weight required'}</p>
                  </div>
                </div>
                <div className="crit-item flex gap-4 p-4 bg-white rounded-lg">
                  <div className="crit-icon w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                  <div>
                    <h4 className="crit-title font-semibold">{language === 'bn' ? 'স্বাস্থ্য ভালো থাকতে হবে' : 'Must be in good health'}</h4>
                    <p className="crit-desc text-gray-600">{language === 'bn' ? 'কোনো গুরুতর রোগ নেই' : 'No serious illnesses'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="elig-card reveal delay-1 bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="sc-title text-xl font-bold mb-6">{language === 'bn' ? 'যোগ্যতা পরীক্ষা করুন' : 'Check Eligibility'}</div>
              <div className="form-row space-y-4">
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'আপনার বয়স' : 'Your Age'}</label>
                  <input 
                    type="number" 
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder={language === 'bn' ? 'বছরে' : 'In years'} 
                    value={eligAge}
                    onChange={(e) => setEligAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'আপনার ওজন' : 'Your Weight'}</label>
                  <input 
                    type="number" 
                    className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder={language === 'bn' ? 'কেজিতে' : 'In kg'} 
                    value={eligWeight}
                    onChange={(e) => setEligWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label block text-sm font-medium mb-2">{language === 'bn' ? 'স্বাস্থ্য অবস্থা' : 'Health Status'}</label>
                  <select 
                    className="form-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={eligHealth}
                    onChange={(e) => setEligHealth(e.target.value)}
                  >
                    <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select...'}</option>
                    <option value="healthy">{language === 'bn' ? 'সুস্থ আছি' : 'I am healthy'}</option>
                    <option value="unhealthy">{language === 'bn' ? 'অসুস্থ আছি' : 'I am unhealthy'}</option>
                  </select>
                </div>
                <button 
                  type="button"
                  onClick={handleEligibilityCheck}
                  disabled={isCheckingEligibility}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-3 mt-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                  style={{
                    background: isCheckingEligibility ? 'linear-gradient(to right, #991B1B, #8B0E1E)' : 'linear-gradient(to right, #dc2626, #991B1B)'
                  }}
                >
                  {isCheckingEligibility ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'bn' ? 'পরীক্ষা করছে...' : 'Checking...'}
                    </>
                  ) : (
                    <>
                      {language === 'bn' ? 'যোগ্যতা যাচাই করুন' : 'Check Eligibility'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
                {eligResult && (
                  <div className={`mt-6 p-6 rounded-xl border-2 ${
                    eligResult.eligible 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                      : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        eligResult.eligible 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
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
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="map-header reveal text-center mb-12 lg:mb-16">
            <div className="s-label inline-block">
              <div className="s-label-line"></div>
              <span className="s-label-text">{language === 'bn' ? 'লাইভ মানচিত্র' : 'Live Map'}</span>
            </div>
            <h2 className="s-title text-3xl lg:text-4xl font-bold mb-4">
              {language === 'bn' ? 'রক্তদাতা ও হাসপাতাল' : 'Donors & Hospitals'}{" "}
              <span className="accent">{language === 'bn' ? 'মানচিত্রে' : 'on Map'}</span>
            </h2>
            <p className="s-desc text-lg max-w-3xl mx-auto">
              {language === 'bn'
                ? 'বাংলাদেশের সব জেলায় রক্তদাতা এবং হাসপাতালের অবস্থান দেখুন।'
                : 'View blood donors and hospital locations across all districts of Bangladesh.'}
            </p>
          </div>
          <div className="map-container reveal delay-1">
            <MapErrorBoundary>
              <BangladeshMap
                center={{ lat: 23.6850, lng: 90.3563 }}
                zoom={7}
                donors={[
                  { id: 1, name: 'মোঃ রহিম', bloodGroup: 'A+', location: 'ঢাকা মেডিকেল', lat: 23.7104, lng: 90.4074, available: true, phone: '0171-1234567' },
                  { id: 2, name: 'সারা আক্তার', bloodGroup: 'O+', location: 'বঙ্গবন্ধু হাসপাতাল', lat: 23.7104, lng: 90.4074, available: true, phone: '0181-2345678' },
                  { id: 3, name: 'কামাল হোসেন', bloodGroup: 'B+', location: 'শিশু হাসপাতাল', lat: 23.7104, lng: 90.4074, available: false, phone: '0191-3456789' }
                ]}
                hospitals={[
                  { id: 1, name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', lat: 23.7104, lng: 90.4074, emergency: true, bloodNeeded: 'A+' },
                  { id: 2, name: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়', lat: 23.7104, lng: 90.4074, emergency: true, bloodNeeded: 'O+' },
                  { id: 3, name: 'শিশু হাসপাতাল', lat: 23.7104, lng: 90.4074, emergency: false, bloodNeeded: 'B+' }
                ]}
              />
            </MapErrorBoundary>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection data={SECTION_DATA.blog[language]} onSeeAll={() => router.push('/blog')} />

      {/* Chitrokothon Section */}
      <GallerySection data={SECTION_DATA.gallery[language]} onSeeAll={() => router.push('/illustrations')} language={language} />

      {/* Testimonials Section */}
      <TestimonialsSection data={SECTION_DATA.testimonials[language]} onSeeAll={() => router.push('/testimonials')} />

      {/* Footer Section */}
      <footer className="footer bg-gray-900 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="footer-brand space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🩸</span>
                <span className="text-xl font-bold">রক্তকরবী</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {language === 'bn' ? 'বাংলাদেশের বৃহত্তম রক্তদাতা নেটওয়ার্ক। আমরা রক্তদাতাদের সাথে রক্তের প্রয়োজনে থাকা মানুষদের সংযোগ করি।' : 'Bangladesh\'s largest blood donor network. We connect blood donors with those in need.'}
              </p>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title font-bold mb-4">{language === 'bn' ? 'দ্রুত লিঙ্ক' : 'Quick Links'}</h4>
              <ul className="footer-links space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'হোম' : 'Home'}</Link></li>
                <li><Link href="/donors" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'দাতা' : 'Donors'}</Link></li>
                <li><Link href="/request" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'অনুরোধ' : 'Request'}</Link></li>
                <li><Link href="/eligibility" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'যোগ্যতা' : 'Eligibility'}</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title font-bold mb-4">{language === 'bn' ? 'সম্পদ' : 'Resources'}</h4>
              <ul className="footer-links space-y-2">
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'ব্লগ' : 'Blog'}</Link></li>
                <li><Link href="/illustrations" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'চিত্রকথন' : 'Chitrokothon'}</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title font-bold mb-4">{language === 'bn' ? 'আইনি' : 'Legal'}</h4>
              <ul className="footer-links space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">{language === 'bn' ? 'শর্তাবলী' : 'Terms of Service'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            &copy; 2026 রক্তকরবী. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved.'}
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button 
        id="totop" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-red-600 text-white rounded-full shadow-lg items-center justify-center hidden lg:flex hover:bg-red-700 transition-colors z-50"
      >
        ↑
      </button>
    </div>
  );
}
