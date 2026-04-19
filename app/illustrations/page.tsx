'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

interface Illustration {
  id: string;
  title: string;
  title_bn: string | null;
  description: string;
  description_bn: string | null;
  image_url: string;
  section_id: string;
  created_at: string;
}

export default function IllustrationsPage() {
  const { t, language } = useLanguage();
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIllustrations();
  }, []);

  const fetchIllustrations = async () => {
    try {
      const response = await fetch('/api/illustrations');
      if (!response.ok) throw new Error('Failed to fetch illustrations');
      const data = await response.json();
      setIllustrations(data.illustrations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch illustrations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTitle = (illustration: Illustration) => {
    if (language === 'bn' && illustration.title_bn) {
      return illustration.title_bn;
    }
    return illustration.title;
  };

  const getDescription = (illustration: Illustration) => {
    if (language === 'bn' && illustration.description_bn) {
      return illustration.description_bn;
    }
    return illustration.description;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">
            {language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon'}
          </h1>
          <Link
            href="/"
            className="text-red-600 hover:text-red-800 font-medium"
          >
            {t('back')}
          </Link>
        </div>

        <p className="text-gray-600 mb-8">
          {language === 'bn' 
            ? 'রক্তদান সচেতনতা বৃদ্ধির জন্য তৈরি করা চিত্রকল্প দেখুন' 
            : 'View illustrations created to raise blood donation awareness'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {illustrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              {language === 'bn' 
                ? 'এখনো কোনো চিত্র নেই। পরে আবার চেক করুন!' 
                : 'No illustrations yet. Check back later!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {illustrations.map((illustration) => (
              <div
                key={illustration.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200">
                  <img
                    src={illustration.image_url}
                    alt={getTitle(illustration)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {getTitle(illustration)}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {getDescription(illustration)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatDate(illustration.created_at)}
                    </span>
                    <Link
                      href={`/illustrations/${illustration.id}`}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      {language === 'bn' ? 'দেখুন →' : 'View →'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
