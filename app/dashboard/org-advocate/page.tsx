'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
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
  const { t, language } = useLanguage();
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
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#9c27b0', fontSize: '2rem' }}>🏢 {t('orgAdvocateDashboard')}</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {t('logout')}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          backgroundColor: message.includes('success') || message.includes('সফল') ? '#e8f5e9' : '#ffebee',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: message.includes('success') || message.includes('সফল') ? '#2e7d32' : '#c62828'
        }}>
          {message}
        </div>
      )}

      {/* Blog Management Section */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f3e5f5',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #9c27b0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>
            {language === 'bn' ? '📝 ব্লগ ব্যবস্থাপনা' : '📝 Blog Management'}
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {showCreateForm 
              ? (language === 'bn' ? 'বাতিল' : 'Cancel')
              : (language === 'bn' ? '+ নতুন পোস্ট' : '+ New Post')
            }
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreatePost} style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {language === 'bn' ? 'শিরোনাম (বাংলা) - ঐচ্ছিক' : 'Title (Bengali) - Optional'}
              </label>
              <input
                type="text"
                value={formData.title_bn}
                onChange={(e) => setFormData({...formData, title_bn: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {language === 'bn' ? 'সংগঠনের নাম (ঐচ্ছিক)' : 'Organization Name (Optional)'}
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                placeholder={language === 'bn' ? 'যেমন: রক্তদান ক্লাব, রোটারি ক্লাব' : 'e.g., Blood Donation Club, Rotary Club'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {language === 'bn' ? 'বিষয়বস্তু (ইংরেজি)' : 'Content (English)'} *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {language === 'bn' ? 'বিষয়বস্তু (বাংলা) - ঐচ্ছিক' : 'Content (Bengali) - Optional'}
              </label>
              <textarea
                value={formData.content_bn}
                onChange={(e) => setFormData({...formData, content_bn: e.target.value})}
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
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
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>
          {language === 'bn' ? '📄 আমার পোস্টসমূহ' : '📄 My Posts'}
        </h3>

        {posts.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            {language === 'bn' 
              ? 'এখনো কোনো পোস্ট নেই। উপরের "নতুন পোস্ট" বোতামে ক্লিক করে একটি তৈরি করুন!'
              : 'No posts yet. Click the "New Post" button above to create one!'
            }
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>
                    {language === 'bn' && post.title_bn ? post.title_bn : post.title}
                  </h4>
                  <small style={{ color: '#666' }}>
                    {formatDate(post.created_at)} • {post.is_published 
                      ? (language === 'bn' ? 'প্রকাশিত' : 'Published')
                      : (language === 'bn' ? 'খসড়া' : 'Draft')
                    }
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/blog/${post.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {language === 'bn' ? 'দেখুন' : 'View'}
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
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
  );
}
