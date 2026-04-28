'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  title_bn: string | null;
  content: string;
  content_bn: string | null;
  author_name: string;
  organization: string | null;
  created_at: string;
}

export default function BlogPostPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Blog Post', bn: 'ব্লগ পোস্ট' },
      loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
      error: { en: 'Failed to load blog post', bn: 'ব্লগ পোস্ট লোড করতে ব্যর্থ' },
      back: { en: 'Back to Blog', bn: 'ব্লগে ফিরে যান' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
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

  const getTitle = (post: BlogPost) => {
    if (language === 'bn' && post.title_bn) {
      return post.title_bn;
    }
    return post.title;
  };

  const getContent = (post: BlogPost) => {
    if (language === 'bn' && post.content_bn) {
      return post.content_bn;
    }
    return post.content;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || (language === 'bn' ? 'পোস্ট পাওয়া যায়নি' : 'Post not found')}
          </div>
          <Link href="/blog" className="text-red-600 hover:text-red-800">
            {language === 'bn' ? '← ব্লগে ফিরে যান' : '← Back to Blog'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="text-red-600 hover:text-red-800 mb-4 inline-block">
          {language === 'bn' ? '← ব্লগে ফিরে যান' : '← Back to Blog'}
        </Link>

        <article className="bg-white rounded-lg shadow-md p-8">
          {post.organization && (
            <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full mb-4">
              {post.organization}
            </span>
          )}
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {getTitle(post)}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>{post.author_name}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {getContent(post)}
          </div>
        </article>
      </div>
    </div>
  );
}
