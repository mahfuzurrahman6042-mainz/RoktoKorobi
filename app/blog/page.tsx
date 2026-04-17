'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

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

export default function BlogPage() {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">
            {language === 'bn' ? 'ব্লগ এবং সংবাদ' : 'Blog & News'}
          </h1>
          <Link
            href="/"
            className="text-red-600 hover:text-red-800 font-medium"
          >
            {t('back')}
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              {language === 'bn' 
                ? 'এখনো কোনো পোস্ট নেই। পরে আবার চেক করুন!' 
                : 'No posts yet. Check back later!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {post.organization && (
                      <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full mb-2">
                        {post.organization}
                      </span>
                    )}
                    <h2 className="text-xl font-semibold text-gray-800">
                      {getTitle(post)}
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {getContent(post).substring(0, 200)}
                  {getContent(post).length > 200 ? '...' : ''}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {language === 'bn' ? 'লেখক: ' : 'By: '}{post.author_name}
                  </span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    {language === 'bn' ? 'আরো পড়ুন →' : 'Read more →'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
