"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

const CR = '#C0353A';
const CR_DARK = '#A32D2D';
const CR_PALE = 'rgba(192,53,58,0.09)';
const BG = '#f9f7f4';
const SURFACE = '#ffffff';
const BORDER = 'rgba(0,0,0,0.1)';
const TEXT = '#1a1a1a';
const MUTED = '#6b6b6b';
const HINT = '#999999';
const INPUT_BG = '#f3f1ee';

export default function ShareTestimonial() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    story: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const enLabels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  const bnLabels = ['', 'খারাপ', 'মোটামুটি', 'ভালো', 'খুব ভালো', 'অসাধারণ'];

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    // Optional: Add hover effect logic
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === 'bn' ? 'নাম আবশ্যক' : 'Name is required';
    }
    
    if (!formData.story.trim()) {
      newErrors.story = language === 'bn' ? 'গল্প আবশ্যক' : 'Story is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!firestore) {
        console.error('Firestore not initialized');
        setIsSubmitting(false);
        return;
      }

      const testimonialData = {
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone || '',
        rating: rating,
        story: formData.story,
        language: language,
        createdAt: new Date().toISOString(),
        approved: false // Requires admin approval
      };

      await addDoc(collection(firestore, 'testimonials'), testimonialData);
      
      setIsSuccess(true);
      
      // Redirect to testimonials page after 3 seconds
      setTimeout(() => {
        router.push('/testimonials');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setErrors({ 
        submit: language === 'bn' ? 'জমা দিতে সমস্যা হয়েছে' : 'Error submitting testimonial' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '620px' }}>
        
        {/* Language Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2rem' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              fontWeight: '500',
              color: language === 'en' ? CR : MUTED,
              padding: '4px 2px',
              borderBottom: language === 'en' ? `1.5px solid ${CR}` : '1.5px solid transparent',
              transition: 'color 0.15s, border-color 0.15s'
            }}
          >
            English
          </button>
          <span style={{ color: MUTED, fontSize: '12px', opacity: 0.4, userSelect: 'none' }}>/</span>
          <button
            onClick={() => setLanguage('bn')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              fontWeight: '500',
              color: language === 'bn' ? CR : MUTED,
              padding: '4px 2px',
              borderBottom: language === 'bn' ? `1.5px solid ${CR}` : '1.5px solid transparent',
              transition: 'color 0.15s, border-color 0.15s'
            }}
          >
            বাংলা
          </button>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px' }}>
            <div style={{ fontSize: '42px', color: CR, marginBottom: '1rem' }}>✓</div>
            <p style={{ fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'Playfair Display, serif', fontSize: '22px', fontWeight: language === 'bn' ? '500' : '400', marginBottom: '0.5rem', color: TEXT }}>
              {language === 'bn' ? 'ধন্যবাদ আপনাকে!' : 'Thank you for sharing!'}
            </p>
            <p style={{ fontSize: '13px', color: MUTED, fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
              {language === 'bn' ? 'আপনার গল্প আরও অনেককে রক্তদানে অনুপ্রাণিত করবে।' : 'Your story will inspire more people to donate and save lives.'}
            </p>
            <p style={{ fontSize: '12px', color: MUTED, marginTop: '1rem' }}>
              {language === 'bn' ? 'টেস্টিমোনিয়াল পেজে রিডাইরেক্ট হচ্ছে...' : 'Redirecting to testimonials page...'}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', color: CR_DARK, marginBottom: '0.75rem' }}>
                <span style={{ width: '24px', height: '1px', background: CR_DARK, display: 'inline-block' }}></span>
                রক্তকরবী · RoktoKorobi
                <span style={{ width: '24px', height: '1px', background: CR_DARK, display: 'inline-block' }}></span>
              </div>
              <h1 style={{ fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'Playfair Display, serif', fontSize: language === 'bn' ? '27px' : '30px', fontWeight: '400', margin: '0 0 0.4rem', lineHeight: language === 'bn' ? '1.4' : '1.25', color: TEXT }}>
                {language === 'bn' ? 'আপনার ' : 'Share your '}
                <span style={{ fontStyle: language === 'bn' ? 'normal' : 'italic', color: CR }}>
                  {language === 'bn' ? 'গল্প' : 'story'}
                </span>
                {language === 'bn' ? ' শেয়ার করুন' : ''}
              </h1>
              <p style={{ fontSize: language === 'bn' ? '14px' : '13.5px', color: MUTED, lineHeight: language === 'bn' ? '1.75' : '1.65', fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                {language === 'bn' 
                  ? 'আপনার অভিজ্ঞতা অন্যদের জীবন বাঁচাতে অনুপ্রাণিত করে।আমাদের বলুন, রক্তদান আপনাকে কেমন অনুভব করিয়েছে।'
                  : 'Your experience inspires others to give the gift of life.Tell us how it felt to make a difference.'
                }
              </p>
            </div>

            {/* Impact Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ background: SURFACE, borderRadius: '8px', padding: '14px 12px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '22px', color: CR, marginBottom: '5px', display: 'block' }}>💧</span>
                <span style={{ fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'Playfair Display, serif', fontSize: language === 'bn' ? '15px' : '18px', fontWeight: '500', display: 'block', lineHeight: language === 'bn' ? '1.35' : '1.2', color: TEXT }}>
                  {language === 'bn' ? '১ ব্যাগ রক্ত' : '1 donation'}
                </span>
                <span style={{ fontSize: '11px', color: MUTED, marginTop: '3px', display: 'block', fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? '৩টি জীবন বাঁচাতে পারে' : 'saves up to 3 lives'}
                </span>
              </div>
              <div style={{ background: SURFACE, borderRadius: '8px', padding: '14px 12px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '22px', color: CR, marginBottom: '5px', display: 'block' }}>❤️</span>
                <span style={{ fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'Playfair Display, serif', fontSize: language === 'bn' ? '15px' : '18px', fontWeight: '500', display: 'block', lineHeight: language === 'bn' ? '1.35' : '1.2', color: TEXT }}>
                  {language === 'bn' ? 'প্রতি ২ সেকেন্ডে' : 'Every 2 sec'}
                </span>
                <span style={{ fontSize: '11px', color: MUTED, marginTop: '3px', display: 'block', fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? 'কেউ রক্তের জন্য অপেক্ষা করছে' : 'someone needs blood'}
                </span>
              </div>
              <div style={{ background: SURFACE, borderRadius: '8px', padding: '14px 12px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '22px', color: CR, marginBottom: '5px', display: 'block' }}>👥</span>
                <span style={{ fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'Playfair Display, serif', fontSize: language === 'bn' ? '15px' : '18px', fontWeight: '500', display: 'block', lineHeight: language === 'bn' ? '1.35' : '1.2', color: TEXT }}>
                  {language === 'bn' ? 'মাত্র ১০ মিনিট' : '10 min'}
                </span>
                <span style={{ fontSize: '11px', color: MUTED, marginTop: '3px', display: 'block', fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? 'একটি জীবন বাঁচাতে যথেষ্ট' : 'all it takes to donate'}
                </span>
              </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '1.75rem' }}>
              
              {/* Name and Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: language === 'bn' ? '13px' : '11px', fontWeight: '500', letterSpacing: language === 'bn' ? '0' : '0.06em', textTransform: language === 'bn' ? 'none' : 'uppercase', color: MUTED, fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                    {language === 'bn' ? 'পূর্ণ নাম' : 'Full name'} <span style={{ color: CR, marginLeft: '2px' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                    style={{
                      background: INPUT_BG,
                      border: errors.name ? `1px solid ${CR}` : `1px solid ${BORDER}`,
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif',
                      color: TEXT,
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      width: '100%',
                      height: '40px'
                    }}
                  />
                  {errors.name && <span style={{ fontSize: '11px', color: CR }}>{errors.name}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: language === 'bn' ? '13px' : '11px', fontWeight: '500', letterSpacing: language === 'bn' ? '0' : '0.06em', textTransform: language === 'bn' ? 'none' : 'uppercase', color: MUTED, fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                    {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email address'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    style={{
                      background: INPUT_BG,
                      border: `1px solid ${BORDER}`,
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontFamily: 'DM Sans, sans-serif',
                      color: TEXT,
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      width: '100%',
                      height: '40px'
                    }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label style={{ fontSize: language === 'bn' ? '13px' : '11px', fontWeight: '500', letterSpacing: language === 'bn' ? '0' : '0.06em', textTransform: language === 'bn' ? 'none' : 'uppercase', color: MUTED, fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={language === 'bn' ? '+৮৮০ ...' : '+880 ...'}
                  style={{
                    background: INPUT_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: TEXT,
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    width: '100%',
                    height: '40px'
                  }}
                />
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label style={{ fontSize: language === 'bn' ? '13px' : '11px', fontWeight: '500', letterSpacing: language === 'bn' ? '0' : '0.06em', textTransform: language === 'bn' ? 'none' : 'uppercase', color: MUTED, fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? 'আপনার অভিজ্ঞতা' : 'Your experience'} <span style={{ color: CR, marginLeft: '2px' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        style={{
                          fontSize: '22px',
                          cursor: 'pointer',
                          color: star <= rating ? '#E8A020' : '#ddd',
                          transition: 'color 0.1s, transform 0.1s',
                          userSelect: 'none',
                          lineHeight: '1'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: MUTED, minWidth: '64px', fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                    {language === 'bn' ? bnLabels[rating] : enLabels[rating]}
                  </span>
                </div>
              </div>

              {/* Story */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label style={{ fontSize: language === 'bn' ? '13px' : '11px', fontWeight: '500', letterSpacing: language === 'bn' ? '0' : '0.06em', textTransform: language === 'bn' ? 'none' : 'uppercase', color: MUTED, fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? 'আপনার অভিমত' : 'Your testimonial'} <span style={{ color: CR, marginLeft: '2px' }}>*</span>
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleChange}
                  placeholder={language === 'bn' ? 'রক্তদানের অভিজ্ঞতা শেয়ার করুন — কেমন লেগেছিল, কেন অন্যদেরও রক্তদান করা উচিত...' : 'Share your blood donation experience — how it made you feel, why others should donate...'}
                  style={{
                    background: INPUT_BG,
                    border: errors.story ? `1px solid ${CR}` : `1px solid ${BORDER}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif',
                    color: TEXT,
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    width: '100%',
                    minHeight: '120px',
                    lineHeight: '1.65',
                    resize: 'vertical'
                  }}
                />
                {errors.story && <span style={{ fontSize: '11px', color: CR }}>{errors.story}</span>}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: BORDER, margin: '1.5rem 0' }}></div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <p style={{ fontSize: '12px', color: HINT, lineHeight: '1.5', maxWidth: '220px', fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif' }}>
                  {language === 'bn' ? 'আপনার গল্প হয়তো কাউকে প্রথমবার রক্তদানে অনুপ্রাণিত করবে।' : 'Your story may inspire someone to donate for the very first time.'}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: CR,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px 22px',
                    fontSize: language === 'bn' ? '15px' : '13.5px',
                    fontWeight: '500',
                    fontFamily: language === 'bn' ? 'Hind Siliguri, sans-serif' : 'DM Sans, sans-serif',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s, transform 0.1s',
                    whiteSpace: 'nowrap',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = CR_DARK;
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = CR;
                  }}
                >
                  {isSubmitting ? (
                    <>{language === 'bn' ? 'জমা দিচ্ছে...' : 'Submitting...'}</>
                  ) : (
                    <>
                      <span>❤️</span>
                      {language === 'bn' ? 'অভিমত জমা দিন' : 'Submit testimonial'}
                    </>
                  )}
                </button>
              </div>

              {errors.submit && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(192,53,58,0.1)', border: `1px solid ${CR}`, borderRadius: '8px', color: CR, fontSize: '13px', textAlign: 'center' }}>
                  {errors.submit}
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
