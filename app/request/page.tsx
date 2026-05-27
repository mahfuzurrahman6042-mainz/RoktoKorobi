"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SocialShare from '@/components/SocialShare';
import CalendarIntegration from '@/components/CalendarIntegration';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/firebase';

const bloodGroups = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const urgencyColors = ["#22c55e", "#f59e0b", "#ef4444", "#A32D2D"];
const urgencyEmoji = ["✓", "⏰", "⚠️", "🚨"];
const unitOptions = ["1", "2", "3", "4", "5", "6", "Custom"];

export default function BloodRequest() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [blood, setBlood] = useState("");
  const [urgency, setUrgency] = useState(1);
  const [units, setUnits] = useState("1");
  const [customUnits, setCustomUnits] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [heroVis, setHeroVis] = useState(false);
  const [formVis, setFormVis] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    hospital: '',
    location: '',
    contact: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalRequests: 0,
    fulfilledRequests: 0,
    totalDonations: 0
  });
  const formRef = useRef(null);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  const handleMarkFulfilled = async (requestId: string) => {
    try {
      if (!firestore) {
        console.error('Firestore not initialized');
        return;
      }
      
      const requestDoc = doc(firestore, 'bloodRequests', requestId);
      await updateDoc(requestDoc, { fulfilled: true, status: 'fulfilled' });
    } catch (error) {
      console.error('Error marking request as fulfilled:', error);
    }
  };

  const handleContact = (request: any) => {
    const message = `Hello, I'm interested in donating blood for ${request.patientName} (${request.bloodType}). Please contact me.`;
    const phone = request.contact.replace(/[^0-9]/g, '');
    window.open(`tel:${phone}`, '_blank');
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি এই অনুরোধটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this request?')) {
      try {
        if (!firestore) {
          console.error('Firestore not initialized');
          return;
        }
        
        const requestDoc = doc(firestore, 'bloodRequests', requestId);
        await deleteDoc(requestDoc);
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.urgency === filter);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') as 'en' | 'bn' || 'en';
    setLanguage(savedLang);
    setTimeout(() => setHeroVis(true), 80);
    setTimeout(() => setFormVis(true), 300);
    
    // Fetch blood requests from Firestore
    if (firestore) {
      const requestsCollection = collection(firestore, 'bloodRequests');
      const unsubscribe = onSnapshot(requestsCollection, (snapshot) => {
        const requestsArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by timestamp, newest first
        requestsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRequests(requestsArray);
        
        // Update stats
        const fulfilledCount = requestsArray.filter(req => req.fulfilled).length;
        setStats({
          totalRequests: requestsArray.length,
          fulfilledRequests: fulfilledCount,
          totalDonations: fulfilledCount
        });
      }, (error) => {
        console.error('Error fetching blood requests:', error);
      });

      return () => unsubscribe();
    }
  }, []);

  const T = {
    en: {
      back: "← Back to Home",
      badge: "EMERGENCY REQUEST",
      heroTitle: "Every Second",
      heroRed: "Counts",
      heroSub: "Submit a blood request and we'll connect you with verified donors in your area immediately.",
      formTitle: "Blood Request Form",
      formSub: "Fill in the details below — donors will be notified instantly.",
      patientName: "Patient Name", patientPh: "Enter patient's full name",
      bloodType: "Blood Group",
      hospital: "Hospital / Clinic", hospitalPh: "Enter hospital or clinic name",
      location: "Location / City", locationPh: "Enter city or area",
      contact: "Contact Number", contactPh: "+880 1X XX XXX XXX",
      urgency: "Urgency Level",
      urgencyLvl: ["Low", "Medium", "High", "Critical"],
      units: "Units Needed",
      customUnits: "Custom amount",
      customPh: "Enter units",
      message: "Additional Message", messagePh: "Any extra details (optional)",
      submit: "Submit Emergency Request",
      submitting: "Submitting...",
      successTitle: "Request Submitted!",
      successSub: "Donors near you have been notified. You'll be contacted shortly.",
      backHome: "Back to Home",
      selectBlood: "⚠ Please select a blood group to continue",
    },
    bn: {
      back: "← হোমে ফিরুন",
      badge: "জরুরি অনুরোধ",
      heroTitle: "প্রতিটি মুহূর্ত",
      heroRed: "গুরুত্বপূর্ণ",
      heroSub: "রক্তের অনুরোধ করুন — আমরা আপনার এলাকার যাচাইকৃত দাতাদের সাথে তাৎক্ষণিকভাবে যোগাযোগ করব।",
      formTitle: "রক্তের অনুরোধ ফর্ম",
      formSub: "নিচের তথ্য পূরণ করুন — দাতাদের সঙ্গে সঙ্গে জানানো হবে।",
      patientName: "রোগীর নাম", patientPh: "রোগীর পুরো নাম লিখুন",
      bloodType: "রক্তের গ্রুপ",
      hospital: "হাসপাতাল / ক্লিনিক", hospitalPh: "হাসপাতাল বা ক্লিনিকের নাম লিখুন",
      location: "স্থান / শহর", locationPh: "শহর বা এলাকার নাম লিখুন",
      contact: "যোগাযোগ নম্বর", contactPh: "+৮৮০ ১X XX XXX XXX",
      urgency: "জরুরি মাত্রা",
      urgencyLvl: ["কম", "মাঝারি", "বেশি", "জরুরি"],
      units: "কত ইউনিট প্রয়োজন",
      customUnits: "কাস্টম পরিমাণ",
      customPh: "ইউনিট সংখ্যা লিখুন",
      message: "অতিরিক্ত বার্তা", messagePh: "অতিরিক্ত তথ্য দিন (ঐচ্ছিক)",
      submit: "জরুরি অনুরোধ পাঠান",
      submitting: "পাঠানো হচ্ছে...",
      successTitle: "অনুরোধ পাঠানো হয়েছে!",
      successSub: "আপনার এলাকার দাতাদের জানানো হয়েছে। শীঘ্রই যোগাযোগ করা হবে।",
      backHome: "হোমে ফিরুন",
      selectBlood: "⚠ অনুগ্রহ করে রক্তের গ্রুপ বেছে নিন",
    },
  };

  const t = T[language];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = t.patientName + " is required";
    }
    
    if (!blood) {
      newErrors.bloodType = t.selectBlood;
    }
    
    if (!formData.hospital.trim()) {
      newErrors.hospital = t.hospital + " is required";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = t.location + " is required";
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = t.contact + " is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blood) return;
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (!firestore) {
        console.error('Firestore not initialized');
        setSubmitting(false);
        return;
      }

      const user = getCurrentUser();
      
      const urgencyMap = ['low', 'medium', 'high', 'critical'];
      const unitsValue = units === 'Custom' ? customUnits : units;
      
      const newRequest = {
        patientName: formData.patientName,
        bloodType: blood,
        hospital: formData.hospital,
        location: formData.location,
        contact: formData.contact,
        urgency: urgencyMap[urgency],
        message: formData.message,
        unitsNeeded: unitsValue,
        timestamp: new Date().toISOString(),
        status: 'pending',
        userId: user?.uid || null,
        fulfilled: false
      };

      await addDoc(collection(firestore, 'bloodRequests'), newRequest);
      
      setSubmitted(true);
      setSubmitting(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setBlood("");
        setUrgency(1);
        setUnits("1");
        setCustomUnits("");
        setFormData({
          patientName: '',
          hospital: '',
          location: '',
          contact: '',
          message: ''
        });
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitting(false);
      alert(language === 'bn' ? 'অনুরোধ জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Failed to submit request. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const setLang = (lang: 'en' | 'bn') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#faf5f0 0%,#fef5f5 45%,#fff9f5 100%)", fontFamily: "'Playfair Display',Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        /* Animations */
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(220,38,38,.5)}70%{box-shadow:0 0 0 10px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}
        @keyframes shimmer{0%{left:-100%}100%{left:100%}}
        @keyframes successPop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes spinBtn{to{transform:rotate(360deg)}}
        @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes breathe{0%,100%{opacity:.6}50%{opacity:.9}}
        @keyframes ripple{0%{transform:scale(0.8);opacity:.4}100%{transform:scale(1.4);opacity:0}}
        @keyframes microFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}

        .anim-hero{animation:fadeUp .7s cubic-bezier(.4,0,.2,1) both}
        .d1{animation-delay:.08s}.d2{animation-delay:.2s}.d3{animation-delay:.34s}
        .anim-form{animation:fadeUp .65s cubic-bezier(.4,0,.2,1) both}
        .fd1{animation-delay:.38s}.fd2{animation-delay:.5s}.fd3{animation-delay:.62s}.fd4{animation-delay:.74s}.fd5{animation-delay:.86s}

        .blood-btn{
          padding:12px 4px;border-radius:12px;border:2px solid #e8d4d4;
          background:#fff;cursor:pointer;font-size:15px;font-weight:700;
          font-family:'DM Sans',sans-serif;color:#7a2020;
          transition:all .2s cubic-bezier(.4,0,.2,1);
          position:relative;overflow:hidden;
        }
        .blood-btn:hover{border-color:#dc2626;background:#fff5f5;transform:translateY(-2px);box-shadow:0 6px 20px rgba(220,38,38,.2)}
        .blood-btn.sel{background:linear-gradient(135deg,#dc2626,#b91c1c);border-color:#dc2626;color:#fff;transform:translateY(-3px);box-shadow:0 8px 24px rgba(220,38,38,.4)}

        .inp{
          width:100%;padding:14px 18px;border:1.5px solid #e8d4d4;border-radius:12px;
          background:#fff;font-family:'DM Sans',sans-serif;font-size:15px;color:#2d1515;
          outline:none;transition:all .2s ease;
        }
        .inp::placeholder{color:#a07070}
        .inp:focus{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,.12)}

        .unit-btn{
          padding:0;height:52px;border-radius:12px;border:2px solid #e8d4d4;
          background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;
          font-size:16px;font-weight:700;color:#7a2020;
          transition:all .2s ease;
        }
        .unit-btn:hover{border-color:#dc2626;background:#fff5f5;transform:translateY(-2px)}
        .unit-btn.sel{background:linear-gradient(135deg,#dc2626,#b91c1c);border-color:#dc2626;color:#fff;transform:translateY(-3px);box-shadow:0 6px 20px rgba(220,38,38,.35)}
        .unit-btn.custom-sel{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border-color:#dc2626}

        .submit-btn{
          width:100%;padding:18px;
          background:linear-gradient(270deg,#dc2626,#b91c1c,#ef4444,#dc2626);
          background-size:300% 300%;
          color:#fff;border:none;border-radius:14px;
          font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;
          letter-spacing:.5px;cursor:pointer;transition:all .25s ease;
          position:relative;overflow:hidden;
          animation:gradientShift 4s ease infinite;
        }
        .submit-btn::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:shimmer 2.5s ease-in-out infinite}
        .submit-btn:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(220,38,38,.4)}
        .submit-btn:active{transform:translateY(0)}
        .submit-btn:disabled{opacity:.65;cursor:not-allowed;transform:none;animation:none}

        .pulse{width:9px;height:9px;background:#dc2626;border-radius:50%;display:inline-block;animation:pulseRing 1.8s ease-out infinite}
        .pulse-w{background:rgba(255,255,255,.8)!important}

        .lbl{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.8px;color:#7a4040;display:block;margin-bottom:9px;text-transform:uppercase}

        /* Urgency slider */
        .urg-track{position:relative;height:6px;background:#e8d4d4;border-radius:99px;margin:10px 0 8px}
        .urg-fill{height:100%;border-radius:99px;transition:width .3s ease,background .3s ease}
        input[type=range]{-webkit-appearance:none;width:100%;height:6px;background:transparent;outline:none;cursor:pointer;position:absolute;top:0;left:0;margin:0}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 2px 10px rgba(220,38,38,.4);margin-top:-7px;cursor:pointer;transition:transform .15s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.25)}

        select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:40px;border-color:#e8d4d4}

        /* Responsive */
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:28px}
        .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        .grid-units{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}

        @media(max-width:900px){
          .grid2{grid-template-columns:1fr!important;gap:22px}
        }
        @media(max-width:640px){
          .hero-title{font-size:38px!important}
          .hero-sub{font-size:15px!important}
          .page-pad{padding:0 16px 60px!important}
          .hero-pad{padding:40px 16px 36px!important}
          .top-bar{padding:14px 16px!important}
          .form-card{padding:28px 20px!important;border-radius:20px!important}
          .grid4{grid-template-columns:repeat(4,1fr)!important;gap:6px}
          .blood-btn{font-size:13px!important;padding:10px 2px!important}
          .grid-units{grid-template-columns:repeat(4,1fr)!important}
          .form-title{font-size:24px!important}
          .deco-lg{display:none!important}
        }
        @media(max-width:400px){
          .grid4{grid-template-columns:repeat(4,1fr)!important}
          .grid-units{grid-template-columns:repeat(4,1fr)!important}
          .blood-btn{font-size:12px!important}
        }
      `}</style>

      {/* Top Bar */}
      <div className="top-bar" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 40px", background:"rgba(253,246,238,.98)", backdropFilter:"blur(14px)", borderBottom:"1.5px solid #e8d4d4", position:"sticky", top:0, zIndex:100 }}>

        {/* Left: Back arrow above logo */}
        <Link href="/" style={{ display:"inline-flex", flexDirection:"column", alignItems:"flex-start", gap:3, textDecoration:"none", cursor:"pointer" }}>

          {/* Arrow above */}
          <span className="back-arrow" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, color:"#c4a0a0", letterSpacing:1, display:"flex", alignItems:"center", gap:4, transition:"color .2s ease", paddingLeft:10 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            back
          </span>

          {/* Logo row */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <svg width="26" height="32" viewBox="0 0 32 38" fill="none">
              <path d="M16 2C16 2 2 16 2 24C2 31.2 8.3 36 16 36C23.7 36 30 31.2 30 24C30 16 16 2 16 2Z" fill="#dc2626" opacity=".15"/>
              <path d="M16 6C16 6 5 18 5 25C5 30.5 10 35 16 35C22 35 27 30.5 27 25C27 18 16 6 16 6Z" fill="#dc2626"/>
            </svg>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.25 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:"#dc2626" }}>রক্তকরবী</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, letterSpacing:2.5, color:"#c4a0a0", textTransform:"uppercase" }}>roktokorobi</span>
            </div>
          </div>

        </Link>

        {/* Right: Language Toggle — single unified pill */}
        <div style={{ display:"inline-flex", alignItems:"center", background:"#fff", border:"1.5px solid #f0d9d9", borderRadius:99, padding:"3px" }}>
          {(["en","bn"] as const).map(l => (
            <button key={l} onClick={()=>setLang(l)} style={{
              padding:"7px 20px", borderRadius:99, border:"none",
              fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700,
              cursor:"pointer", transition:"all .2s ease",
              background: language===l ? "#dc2626" : "transparent",
              color: language===l ? "#fff" : "#9b6060",
              boxShadow: language===l ? "0 2px 8px rgba(220,38,38,.25)" : "none",
              letterSpacing: 0.5,
            }}>{l==="en" ? "EN" : "বাং"}</button>
          ))}
        </div>

      </div>

      {/* Hero */}
      <div className="hero-pad" style={{ padding:"60px 40px 48px", position:"relative", overflow:"hidden" }}>
        {/* Deco - Premium organic animation system */}
        {/* Soft ambient background glow */}
        <div className="deco-lg" style={{ position:"absolute", right:"-60px", top:"-80px", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,rgba(220,38,38,.08) 0%,rgba(229,57,53,.04) 40%,transparent 70%)", pointerEvents:"none", animation:"breathe 4s ease-in-out infinite" }}/>

        {/* Refined spinning circle - thinner, softer */}
        <div className="deco-lg" style={{ position:"absolute", right:"95px", top:"8px", width:180, height:180, borderRadius:"50%", border:"1.5px solid rgba(220,38,38,.2)", boxShadow:"0 0 20px rgba(220,38,38,.08)", pointerEvents:"none", animation:"spinSlow 30s linear infinite" }}/>

        {/* Ripple effect layers - soft, organic */}
        <div className="deco-lg" style={{ position:"absolute", right:"130px", top:"33px", width:110, height:130, borderRadius:"50%", border:"1px solid rgba(220,38,38,.15)", pointerEvents:"none", animation:"ripple 3s cubic-bezier(.4,0,.2,1) infinite" }}/>
        <div className="deco-lg" style={{ position:"absolute", right:"130px", top:"33px", width:110, height:130, borderRadius:"50%", border:"1px solid rgba(220,38,38,.1)", pointerEvents:"none", animation:"ripple 3s cubic-bezier(.4,0,.2,1) infinite 1s" }}/>
        <div className="deco-lg" style={{ position:"absolute", right:"130px", top:"33px", width:110, height:130, borderRadius:"50%", border:"1px solid rgba(220,38,38,.08)", pointerEvents:"none", animation:"ripple 3s cubic-bezier(.4,0,.2,1) infinite 2s" }}/>

        {/* Blood drop with heartbeat and micro float */}
        <svg className="deco-lg" style={{ position:"absolute", right:"130px", top:"33px", opacity:.9, filter:"drop-shadow(0 6px 16px rgba(220,38,38,.2))", animation:"microFloat 4s ease-in-out infinite, heartbeat 3s ease-in-out infinite" }} width="110" height="130" viewBox="0 0 32 38" fill="none">
          <defs>
            <linearGradient id="bloodDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626"/>
              <stop offset="50%" stopColor="#e53935"/>
              <stop offset="100%" stopColor="#b91c1c"/>
            </linearGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d="M16 2C16 2 2 16 2 24C2 31.2 8.3 36 16 36C23.7 36 30 31.2 30 24C30 16 16 2 16 2Z" fill="url(#bloodDropGrad)" stroke="#dc2626" strokeWidth="1.5" filter="url(#softGlow)"/>
        </svg>

        {/* Soft radial glow behind drop */}
        <div className="deco-lg" style={{ position:"absolute", right:"115px", top:"58px", width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle,rgba(220,38,38,.06) 0%,transparent 65%)", pointerEvents:"none", animation:"breathe 5s ease-in-out infinite 1.5s" }}/>

        {heroVis && <>
          <div className="anim-hero d1" style={{ marginBottom:14 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#fef2f2,#ffe5e5)", border:"1.5px solid #fca5a5", borderRadius:99, padding:"7px 18px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2.5, color:"#dc2626", boxShadow:"0 2px 8px rgba(220,38,38,.12)" }}>
              <span className="pulse" style={{ width:10, height:10, background:"#dc2626" }}/> {t.badge}
            </span>
          </div>
          <h1 className="anim-hero d2 hero-title" style={{ fontSize:58, fontWeight:700, lineHeight:1.1, color:"#2d1515", marginBottom:18, maxWidth:560 }}>
            {t.heroTitle}<br/>
            <span style={{ color:"#dc2626", fontStyle:"italic" }}>{t.heroRed}</span>
          </h1>
          <p className="anim-hero d3 hero-sub" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, color:"#5c2a2a", maxWidth:500, lineHeight:1.75 }}>{t.heroSub}</p>
        </>}
      </div>

      {/* Form */}
      <div className="page-pad" style={{ padding:"0 40px 80px", background:"linear-gradient(180deg,transparent 0%,#fef9f5 100%)" }}>
        {submitted ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:20 }}>
            <div style={{ background:"#fff", borderRadius:24, padding:"56px 44px", textAlign:"center", maxWidth:440, width:"100%", border:"1.5px solid #f0d9d9", boxShadow:"0 20px 60px rgba(220,38,38,.07)", animation:"successPop .5s cubic-bezier(.4,0,.2,1) forwards" }}>
              <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#dcfce7,#bbf7d0)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", fontSize:32 }}>✓</div>
              <h2 style={{ fontSize:26, fontWeight:700, color:"#2d1515", marginBottom:10 }}>{t.successTitle}</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#7a4040", fontSize:15, lineHeight:1.7, marginBottom:28 }}>{t.successSub}</p>
              <a href="/" style={{ display:"inline-block", padding:"13px 32px", background:"#dc2626", color:"#fff", borderRadius:99, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, textDecoration:"none" }}>{t.backHome}</a>
            </div>
          </div>
        ) : (
          <div ref={formRef} className="form-card" style={{ background:"#fff", borderRadius:26, padding:"44px 48px", border:"1.5px solid #e8d4d4", boxShadow:"0 20px 70px rgba(220,38,38,.08)" }}>

            {/* Form header */}
            {formVis && <div className="anim-form fd1" style={{ marginBottom:36, paddingBottom:28, borderBottom:"1.5px solid #e8d4d4" }}>
              <h2 className="form-title" style={{ fontSize:28, fontWeight:700, color:"#2d1515", marginBottom:7 }}>{t.formTitle}</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#7a4040", fontSize:14, fontWeight:500 }}>{t.formSub}</p>
            </div>}

            <form onSubmit={handleSubmit}>

              {/* Row 1: Patient + Blood */}
              {formVis && <div className="anim-form fd1 grid2" style={{ marginBottom:28 }}>
                <div>
                  <label className="lbl">{t.patientName} <span style={{color:"#dc2626"}}>*</span></label>
                  <input className="inp" type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} placeholder={t.patientPh} required/>
                  {errors.patientName && <div style={{ color:"#dc2626", fontSize:"12px", marginTop:"4px" }}>{errors.patientName}</div>}
                </div>
                <div>
                  <label className="lbl">{t.bloodType} <span style={{color:"#dc2626"}}>*</span></label>
                  <div className="grid4">
                    {bloodGroups.map(bg => (
                      <button key={bg} type="button" className={`blood-btn${blood===bg?" sel":""}`} onClick={()=>setBlood(bg)}>{bg}</button>
                    ))}
                  </div>
                  {errors.bloodType && <div style={{ color:"#dc2626", fontSize:"12px", marginTop:"4px" }}>{errors.bloodType}</div>}
                </div>
              </div>}

              {/* Row 2: Hospital + Location */}
              {formVis && <div className="anim-form fd2 grid2" style={{ marginBottom:28 }}>
                <div>
                  <label className="lbl">{t.hospital} <span style={{color:"#dc2626"}}>*</span></label>
                  <input className="inp" type="text" name="hospital" value={formData.hospital} onChange={handleInputChange} placeholder={t.hospitalPh} required/>
                  {errors.hospital && <div style={{ color:"#dc2626", fontSize:"12px", marginTop:"4px" }}>{errors.hospital}</div>}
                </div>
                <div>
                  <label className="lbl">{t.location} <span style={{color:"#dc2626"}}>*</span></label>
                  <input className="inp" type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder={t.locationPh} required/>
                  {errors.location && <div style={{ color:"#dc2626", fontSize:"12px", marginTop:"4px" }}>{errors.location}</div>}
                </div>
              </div>}

              {/* Row 3: Contact + Urgency */}
              {formVis && <div className="anim-form fd3 grid2" style={{ marginBottom:28 }}>
                <div>
                  <label className="lbl">{t.contact} <span style={{color:"#dc2626"}}>*</span></label>
                  <input className="inp" type="tel" name="contact" value={formData.contact} onChange={handleInputChange} placeholder={t.contactPh} required/>
                  {errors.contact && <div style={{ color:"#dc2626", fontSize:"12px", marginTop:"4px" }}>{errors.contact}</div>}
                </div>
                <div>
                  <label className="lbl">{t.urgency} <span style={{color:"#dc2626"}}>*</span></label>
                  <div style={{ background:"#fff9f9", border:"1.5px solid #f0d9d9", borderRadius:12, padding:"14px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, color:"#2d1515" }}>
                        {t.urgencyLvl[urgency]}
                      </span>
                      <span style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:urgencyColors[urgency], background:urgencyColors[urgency]+"18", padding:"3px 10px", borderRadius:99 }}>
                        {urgencyEmoji[urgency]} {urgency===3?"CRITICAL":urgency===2?"HIGH":urgency===1?"MEDIUM":"LOW"}
                      </span>
                    </div>
                    <div className="urg-track">
                      <div className="urg-fill" style={{ width:`${(urgency/3)*100}%`, background:urgencyColors[urgency] }}/>
                      <input type="range" min="0" max="3" step="1" value={urgency} onChange={e=>setUrgency(+e.target.value)}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                      {t.urgencyLvl.map((l,i)=>(
                        <span key={i} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:i===urgency?urgencyColors[i]:"#c4a0a0", fontWeight:i===urgency?700:400 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>}

              {/* Units Needed */}
              {formVis && <div className="anim-form fd4" style={{ marginBottom:28 }}>
                <label className="lbl">{t.units} <span style={{color:"#dc2626"}}>*</span></label>
                <div className="grid-units" style={{ marginBottom: units==="Custom"?12:0 }}>
                  {unitOptions.map(u => (
                    <button key={u} type="button"
                      className={`unit-btn${units===u?(u==="Custom"?" sel custom-sel":" sel"):""}`}
                      style={{ fontSize: u==="Custom"?11:16 }}
                      onClick={()=>setUnits(u)}>
                      {u==="Custom"?"✏️ "+t.customUnits.split(" ")[0]:u}
                    </button>
                  ))}
                </div>
                {units==="Custom" && (
                  <div style={{ animation:"fadeUp .3s ease both" }}>
                    <input className="inp" type="number" min="1" max="99" placeholder={t.customPh}
                      value={customUnits} onChange={e=>setCustomUnits(e.target.value)}
                      style={{ marginTop:10 }} required/>
                  </div>
                )}
              </div>}

              {/* Message */}
              {formVis && <div className="anim-form fd4" style={{ marginBottom:36 }}>
                <label className="lbl">{t.message}</label>
                <textarea className="inp" name="message" value={formData.message} onChange={handleInputChange} rows={4} placeholder={t.messagePh} style={{ resize:"vertical", minHeight:110 }}/>
              </div>}

              {/* Submit */}
              {formVis && <div className="anim-form fd5">
                <button className="submit-btn" type="submit" disabled={submitting||!blood}>
                  {submitting ? (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spinBtn 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      {t.submitting}
                    </span>
                  ) : (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <span className="pulse pulse-w"/>
                      {t.submit}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  )}
                </button>
                {!blood && (
                  <p style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#dc2626", marginTop:10, opacity:.8 }}>{t.selectBlood}</p>
                )}
              </div>}

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
