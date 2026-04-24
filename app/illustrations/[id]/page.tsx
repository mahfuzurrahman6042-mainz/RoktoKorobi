'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/fetch';

interface Illustration {
  id: string;
  title: string;
  title_bn: string | null;
  description: string;
  description_bn: string | null;
  image_url: string;
  created_at: string;
}

export default function IllustrationDetailPage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage();
  const [illustration, setIllustration] = useState<Illustration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchIllustration();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setUser(result.user);
    } catch (err) {
      setUser(null);
    }
  };

  const fetchIllustration = async () => {
    try {
      const response = await fetch(`/api/illustrations?sectionId=1&language=${language}`);
      if (!response.ok) throw new Error('Failed to fetch illustration');
      const data = await response.json();
      const found = data.illustrations?.find((ill: Illustration) => ill.id === params.id);
      if (found) {
        setIllustration(found);
        checkFavorite(found.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch illustration');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async (illustrationId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'check',
          illustration_id: illustrationId 
        }),
      });
      const data = await response.json();
      setIsFavorited(data.favorited);
    } catch (err) {
      // Silent fail
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert(language === 'bn' ? 'প্রিয় করতে লগইন করুন' : 'Please login to favorite');
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/illustrations/${params.id}/favorite`, {
        method: 'POST',
      });
      const data = await response.json();
      setIsFavorited(data.favorited);
    } catch (err) {
      // Silent fail
    }
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = illustration ? (language === 'bn' ? illustration.title_bn || illustration.title : illustration.title) : '';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = illustration ? (language === 'bn' ? illustration.title_bn || illustration.title : illustration.title) : '';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTitle = () => {
    if (!illustration) return '';
    if (language === 'bn' && illustration.title_bn) {
      return illustration.title_bn;
    }
    return illustration.title;
  };

  const getDescription = () => {
    if (!illustration) return '';
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

  if (error || !illustration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || (language === 'bn' ? 'চিত্র পাওয়া যায়নি' : 'Illustration not found')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">
            {language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon'}
          </h1>
          <Link
            href="/illustrations"
            className="text-red-600 hover:text-red-800 font-medium"
          >
            {t('back')}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-video md:aspect-[2/1] bg-gray-200">
            <img
              src={illustration.image_url}
              alt={getTitle()}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {getTitle()}
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {getDescription()}
            </p>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500">
                {formatDate(illustration.created_at)}
              </span>
              
              <div className="flex gap-3">
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isFavorited 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isFavorited ? '❤️' : '🤍'}
                  {language === 'bn' ? (isFavorited ? 'প্রিয়' : 'প্রিয় করুন') : (isFavorited ? 'Favorited' : 'Favorite')}
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'bn' ? 'শেয়ার করুন' : 'Share'}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={shareOnFacebook}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Facebook
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
                >
                  Twitter
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
