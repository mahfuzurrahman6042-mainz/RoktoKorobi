'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#757575', fontSize: '1.1rem' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '80px 20px 40px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📰 {language === 'bn' ? 'ব্লগ এবং সংবাদ' : 'Blog & News'}
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
            {language === 'bn'
              ? 'সংস্থা এবং ক্লাব থেকে রক্তদান সংবাদ ও ইভেন্ট দেখুন'
              : 'View blood donation news and events from organizations and clubs'}
          </p>
        </div>

        {error && (
          <div className="card" style={{
            background: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#212121', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {language === 'bn' ? 'কোন পোস্ট নেই' : 'No posts yet'}
            </h3>
            <p style={{ color: '#757575' }}>
              {language === 'bn' ? 'পরে আবার চেক করুন!' : 'Check back later!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                style={{ textDecoration: 'none' }}
              >
                <article className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                    padding: '20px',
                    color: 'white'
                  }}>
                    {post.organization && (
                      <span className="badge" style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        marginBottom: '0.5rem',
                        display: 'inline-block'
                      }}>
                        {post.organization}
                      </span>
                    )}
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0, lineHeight: '1.4' }}>
                      {getTitle(post)}
                    </h2>
                  </div>

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: '#757575', lineHeight: '1.6', marginBottom: '1rem', flex: 1 }}>
                      {getContent(post).substring(0, 150)}
                      {getContent(post).length > 150 ? '...' : ''}
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <span style={{ color: '#757575', fontSize: '0.9rem' }}>
                        {language === 'bn' ? 'লেখক: ' : 'By: '}{post.author_name}
                      </span>
                      <span style={{ color: '#9C27B0', fontSize: '0.85rem', fontWeight: '600' }}>
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
