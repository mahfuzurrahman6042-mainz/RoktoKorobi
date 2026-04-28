'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/fetch';

interface BlogPost {
  id: string;
  title: string;
  title_bn: string | null;
  is_published: boolean;
  created_at: string;
}

export default function OrgAdvocateDashboard() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      dashboardTitle: { en: 'Organization Advocate Dashboard', bn: 'সংস্থা অ্যাডভোকেট ড্যাশবোর্ড' },
      createPost: { en: 'Create Post', bn: 'পোস্ট তৈরি করুন' },
      title: { en: 'Title', bn: 'শিরোনাম' },
      content: { en: 'Content', bn: 'বিষয়বস্তু' },
      organization: { en: 'Organization', bn: 'সংস্থা' },
      publish: { en: 'Publish', bn: 'প্রকাশ করুন' },
      cancel: { en: 'Cancel', bn: 'বাতিল' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_bn: '',
    content: '',
    content_bn: '',
    organization: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setCurrentUser(result.user);
    } catch (err) {
      setCurrentUser(null);
      router.push('/');
    }
  };

  const fetchMyPosts = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, title_bn, is_published, created_at')
      .eq('author_id', currentUser.id)
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const handleLogout = async () => {
    try {
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      router.push('/');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!currentUser) return;

    try {
      const { error } = await supabase.from('blog_posts').insert({
        title: formData.title,
        title_bn: formData.title_bn || null,
        content: formData.content,
        content_bn: formData.content_bn || null,
        author_id: currentUser.id,
        author_name: currentUser.name,
        organization: formData.organization || null,
        is_published: true,
      });

      if (error) throw error;

      setMessage(language === 'bn' ? 'পোস্ট সফলভাবে তৈরি হয়েছে!' : 'Post created successfully!');
      setFormData({ title: '', title_bn: '', content: '', content_bn: '', organization: '' });
      setShowCreateForm(false);
      fetchMyPosts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই পোস্টটি মুছতে চান?' : 'Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) throw error;
      fetchMyPosts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="dashboard-header">
          <h1 className="dashboard-title" style={{ color: '#9C27B0' }}>
            🏢 {t('orgAdvocateDashboard')}
          </h1>
          <button
            onClick={handleLogout}
            className="btn-logout"
            style={{ background: '#9C27B0' }}
          >
            {t('logout')}
          </button>
        </div>

        {message && (
          <div className={`auth-alert ${message.includes('success') || message.includes('সফল') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Blog Management Section */}
        <div className="info-card org-blog-card">
          <div className="blog-header">
            <h2 className="info-title">
              {language === 'bn' ? '📝 ব্লগ ব্যবস্থাপনা' : '📝 Blog Management'}
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-toggle"
              style={{ background: '#9C27B0' }}
            >
              {showCreateForm 
                ? (language === 'bn' ? 'বাতিল' : 'Cancel')
                : (language === 'bn' ? '+ নতুন পোস্ট' : '+ New Post')
            }
          </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreatePost} className="blog-form">
              <div className="form-row">
                <label className="form-label">
                  {language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <label className="form-label">
                  {language === 'bn' ? 'শিরোনাম (বাংলা) - ঐচ্ছিক' : 'Title (Bengali) - Optional'}
                </label>
                <input
                  type="text"
                  value={formData.title_bn}
                  onChange={(e) => setFormData({...formData, title_bn: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <label className="form-label">
                  {language === 'bn' ? 'সংগঠনের নাম (ঐচ্ছিক)' : 'Organization Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  placeholder={language === 'bn' ? 'যেমন: রক্তদান ক্লাব, রোটারি ক্লাব' : 'e.g., Blood Donation Club, Rotary Club'}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <label className="form-label">
                  {language === 'bn' ? 'বিষয়বস্তু (ইংরেজি)' : 'Content (English)'} *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows={6}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <label className="form-label">
                  {language === 'bn' ? 'বিষয়বস্তু (বাংলা) - ঐচ্ছিক' : 'Content (Bengali) - Optional'}
                </label>
                <textarea
                  value={formData.content_bn}
                  onChange={(e) => setFormData({...formData, content_bn: e.target.value})}
                  rows={6}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
                style={{ background: loading ? '#ccc' : '#9C27B0' }}
              >
                {loading 
                  ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Publishing...')
                  : (language === 'bn' ? 'পোস্ট প্রকাশ করুন' : 'Publish Post')
              }
            </button>
          </form>
        )}
      </div>

        {/* My Posts List */}
        <div className="info-card posts-list-card">
          <h3 className="section-title">
            {language === 'bn' ? '📄 আমার পোস্টসমূহ' : '📄 My Posts'}
          </h3>

          {posts.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="empty-desc">
                {language === 'bn' 
                  ? 'এখনো কোনো পোস্ট নেই। উপরের "নতুন পোস্ট" বোতামে ক্লিক করে একটি তৈরি করুন!'
                  : 'No posts yet. Click the "New Post" button above to create one!'
                }
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {posts.map((post) => (
                <div key={post.id} className="message-card">
                  <div>
                    <h4 style={{ margin: 0, marginBottom: '0.5rem', fontWeight: 700, color: 'var(--ink)' }}>
                      {language === 'bn' && post.title_bn ? post.title_bn : post.title}
                    </h4>
                    <small style={{ color: 'var(--ink-mid)' }}>
                      {formatDate(post.created_at)} • {post.is_published 
                        ? (language === 'bn' ? 'প্রকাশিত' : 'Published')
                        : (language === 'bn' ? 'খসড়া' : 'Draft')
                      }
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      href={`/blog/${post.id}`}
                      className="btn-respond"
                      style={{ background: '#2196F3', padding: '8px 16px', fontSize: '14px' }}
                    >
                      {language === 'bn' ? 'দেখুন' : 'View'}
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="btn-cancel"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      {language === 'bn' ? 'মুছুন' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
