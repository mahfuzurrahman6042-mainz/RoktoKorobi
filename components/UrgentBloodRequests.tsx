'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  hospital_name: string;
  hospital_city: string;
  hospital_district: string;
  urgency: string;
  contact: string;
  units_needed: number;
  created_at: string;
}

export default function UrgentBloodRequests() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
    fetchUrgentRequests();
  }, []);

  const fetchUrgentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'pending')
        .in('urgency', ['critical', 'high'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch urgent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: '🩸 Urgent Blood Requests', bn: '🩸 জরুরি রক্তের অনুরোধ' },
      subtitle: { en: 'Critical cases that need immediate attention', bn: 'যেসব মামলায় তাৎক্ষণিক মনোযোগ প্রয়োজন' },
      viewAll: { en: 'View All Requests', bn: 'সব অনুরোধ দেখুন' },
      patientName: { en: 'Patient Name', bn: 'রোগীর নাম' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      hospital: { en: 'Hospital', bn: 'হাসপাতাল' },
      location: { en: 'Location', bn: 'অবস্থান' },
      urgency: { en: 'Urgency', bn: 'জরুরি' },
      units: { en: 'Units Needed', bn: 'প্রয়োজনীয় ইউনিট' },
      contact: { en: 'Contact', bn: 'যোগাযোগ' },
      help: { en: 'Help Now', bn: 'সাহায্য করুন' },
      noRequests: { en: 'No urgent requests at this time', bn: 'বর্তমানে কোন জরুরি অনুরোধ নেই' },
      critical: { en: 'CRITICAL', bn: 'সংকটজনক' },
      high: { en: 'HIGH', bn: 'উচ্চ' },
    };
    return translations[key]?.[language] || key;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      default: return '#757575';
    }
  };

  if (!mounted) return null;

  return (
    <section className="urgent-requests py-16 lg:py-24 bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {language === 'bn' ? '🚨 জরুরি' : '🚨 URGENT'}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600 text-lg">{t('noRequests')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-xl"
              >
                <div
                  className="p-4 text-white text-center font-bold"
                  style={{ backgroundColor: getUrgencyColor(request.urgency) }}
                >
                  {request.urgency === 'critical' ? t('critical') : t('high')}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                      🩸
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{request.patient_name}</h3>
                      <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {request.blood_group}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">🏥</span>
                      <div>
                        <p className="font-medium text-sm">{t('hospital')}</p>
                        <p className="text-gray-600 text-sm">{request.hospital_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">📍</span>
                      <div>
                        <p className="font-medium text-sm">{t('location')}</p>
                        <p className="text-gray-600 text-sm">{request.hospital_city}, {request.hospital_district}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">💉</span>
                      <div>
                        <p className="font-medium text-sm">{t('units')}</p>
                        <p className="text-gray-600 text-sm">{request.units_needed} units</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/blood-requests`}
                      className="flex-1 bg-red-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      {t('help')}
                    </Link>
                    <a
                      href={`tel:${request.contact}`}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      📞
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/blood-requests"
            className="inline-block bg-white border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
          >
            {t('viewAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
