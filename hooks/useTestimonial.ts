import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { TestimonialFormData, TestimonialTranslations, Language, RatingOption } from '@/types/testimonial';

const translations: TestimonialTranslations = {
  title: { en: 'Share Your Story', bn: 'আপনার গল্প শেয়ার করুন' },
  subtitle: { en: 'Your experience can inspire others to donate blood', bn: 'আপনার অভিজ্ঞতা অন্যদের রক্তদানে অনুপ্রাণিত করতে পারে' },
  name: { en: 'Your Name', bn: 'আপনার নাম' },
  email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
  phone: { en: 'Phone Number', bn: 'ফোন নম্বর' },
  testimonial: { en: 'Your Testimonial', bn: 'আপনার সাক্ষ্য' },
  rating: { en: 'Rating', bn: 'রেটিং' },
  submit: { en: 'Submit Testimonial', bn: 'সাক্ষ্য জমা দিন' },
  back: { en: 'Back to Home', bn: 'হোমে ফিরে যান' },
  success: { en: 'Thank you for sharing your story! Your testimonial will inspire others.', bn: 'আপনার গল্প শেয়ার করার জন্য ধন্যবাদ! আপনার সাক্ষ্য অন্যদের অনুপ্রাণিত করবে।' },
  submitting: { en: 'Submitting...', bn: 'জমা দিচ্ছে...' },
  placeholder: { en: 'Share your blood donation experience, how it made you feel, and why others should donate...', bn: 'আপনার রক্তদানের অভিজ্ঞতা, এটি আপনাকে কেমন অনুভব করিয়েছে, এবং অন্যরা কেন রক্তদান করবে তা শেয়ার করুন...' },
  shareStory: { en: 'Share Your Story', bn: 'সাক্ষ্য দিন' },
  testimonialsComing: { en: 'Testimonials Coming Soon', bn: 'সাক্ষ্য শীঘ্রই আসছে' },
  beFirst: { en: 'Be the first to share', bn: 'প্রথম সাক্ষ্য দিন' }
};

const ratingOptions: RatingOption[] = [
  { value: '5', label: { en: 'Excellent', bn: 'অসাধারণ' }, stars: '⭐⭐⭐⭐⭐' },
  { value: '4', label: { en: 'Very Good', bn: 'খুব ভালো' }, stars: '⭐⭐⭐⭐' },
  { value: '3', label: { en: 'Good', bn: 'ভালো' }, stars: '⭐⭐⭐' },
  { value: '2', label: { en: 'Fair', bn: 'মাঝারি' }, stars: '⭐⭐' },
  { value: '1', label: { en: 'Poor', bn: 'দুর্বল' }, stars: '⭐' }
];

export const useTestimonial = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: '',
    email: '',
    phone: '',
    testimonial: '',
    rating: '5'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TestimonialFormData, string>>>({});

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') as Language || 'en';
    setLanguage(savedLang);
  }, []);

  const t = useCallback((key: keyof TestimonialTranslations): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof TestimonialFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === 'bn' ? 'নাম প্রয়োজন' : 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = language === 'bn' ? 'ইমেল প্রয়োজন' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'bn' ? 'অবৈধ ইমেল' : 'Invalid email';
    }
    
    if (!formData.testimonial.trim()) {
      newErrors.testimonial = language === 'bn' ? 'সাক্ষ্য প্রয়োজন' : 'Testimonial is required';
    } else if (formData.testimonial.length < 10) {
      newErrors.testimonial = language === 'bn' ? 'সর্বনিম্ন ১০ অক্ষর' : 'Minimum 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, language]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof TestimonialFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      if (!firestore) {
        console.error('Firestore not initialized');
        setSubmitting(false);
        return;
      }

      const testimonialData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        testimonial: formData.testimonial,
        rating: formData.rating,
        createdAt: new Date().toISOString(),
        approved: false // Requires admin approval
      };

      await addDoc(collection(firestore, 'testimonials'), testimonialData);
      
      setSubmitted(true);
      setSubmitting(false);

      // Redirect to testimonials page after 2 seconds
      setTimeout(() => {
        router.push('/testimonials');
      }, 2000);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setSubmitting(false);
    }
  }, [validateForm, router, formData]);

  const memoizedRatingOptions = useMemo(() => ratingOptions, []);

  return {
    mounted,
    language,
    formData,
    submitting,
    submitted,
    errors,
    t,
    handleInputChange,
    handleSubmit,
    ratingOptions: memoizedRatingOptions
  };
};

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }

    const testimonialsCollection = collection(firestore, 'testimonials');
    const unsubscribe = onSnapshot(testimonialsCollection, (snapshot) => {
      const testimonialsArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt, newest first
      testimonialsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTestimonials(testimonialsArray);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching testimonials:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { testimonials, loading };
};

export const useTestimonialActions = () => {
  const deleteTestimonial = useCallback(async (id: string) => {
    if (!firestore) {
      console.error('Firestore not initialized');
      return;
    }

    try {
      const testimonialDoc = doc(firestore, 'testimonials', id);
      await deleteDoc(testimonialDoc);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  }, []);

  const updateTestimonial = useCallback(async (id: string, data: any) => {
    if (!firestore) {
      console.error('Firestore not initialized');
      return;
    }

    try {
      const testimonialDoc = doc(firestore, 'testimonials', id);
      await updateDoc(testimonialDoc, data);
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  }, []);

  return { deleteTestimonial, updateTestimonial };
};
