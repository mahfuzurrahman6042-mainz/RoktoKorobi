'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/fetch';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_donor: boolean;
  location: string;
  blood_group: string;
}

interface Message {
  id: string;
  from_user_id: string;
  from_user_name: string;
  message: string;
  status: string;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  title_bn: string | null;
  content: string;
  content_bn: string | null;
  author_name: string;
  organization: string | null;
  is_published: boolean;
  created_at: string;
}

interface Illustration {
  id: string;
  title: string;
  title_bn: string | null;
  description: string;
  description_bn: string | null;
  image_url: string;
  section_id: number;
  status: string;
  language: string;
  created_at: string;
}

interface UserComment {
  id: string;
  user_name: string;
  user_email: string | null;
  comment: string;
  rating: number | null;
  is_approved: boolean;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Super Admin Dashboard', bn: 'সুপার অ্যাডমিন ড্যাশবোর্ড' },
      users: { en: 'Users', bn: 'ব্যবহারকারী' },
      messages: { en: 'Messages', bn: 'বার্তা' },
      blogs: { en: 'Blogs', bn: 'ব্লগ' },
      illustrations: { en: 'Illustrations', bn: 'চিত্রকথন' },
      comments: { en: 'Comments', bn: 'মন্তব্য' },
      selfClaim: { en: 'Self-Claim Signup', bn: 'স্ব-দাবি সাইনআপ' },
      enable: { en: 'Enable', bn: 'সক্রিয় করুন' },
      disable: { en: 'Disable', bn: 'নিষ্ক্রিয় করুন' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [selfClaimEnabled, setSelfClaimEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    title_bn: '',
    content: '',
    content_bn: '',
    organization: '',
    is_published: false
  });
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setCurrentUser(result.user);
      
      if (result.user?.role !== 'super_admin') {
        router.push('/');
        return;
      }
      fetchData();
    } catch (err) {
      router.push('/');
    }
  };

  const fetchData = async () => {
    try {
      const [usersData, messagesData, blogsData, illustrationsData, commentsData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('illustrations').select('*').order('created_at', { ascending: false }),
        supabase.from('user_comments').select('*').order('created_at', { ascending: false }),
      ]);

      setUsers(usersData.data || []);
      setMessages(messagesData.data || []);
      setBlogs(blogsData.data || []);
      setIllustrations(illustrationsData.data || []);
      setComments(commentsData.data || []);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert(`Role changed to ${newRole} for ${selectedUser.name}`);
      fetchData();
      setSelectedUser(null);
      setNewRole('');
    } catch (err) {
      alert('Failed to change role');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' })
        .eq('id', userId);

      if (error) throw error;

      alert('User banned successfully');
      fetchData();
    } catch (err) {
      alert('Failed to ban user');
    }
  };

  const toggleSelfClaim = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'self_claim_super_admin', value: !selfClaimEnabled });

      if (error) throw error;

      setSelfClaimEnabled(!selfClaimEnabled);
      alert(`Self-claim super admin ${!selfClaimEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      alert('Failed to toggle setting');
    }
  };

  const handleLogout = async () => {
    try {
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      router.push('/');
    }
  };

  const handleAddBlog = () => {
    setBlogForm({
      title: '',
      title_bn: '',
      content: '',
      content_bn: '',
      organization: '',
      is_published: false
    });
    setEditingBlog(null);
    setShowBlogForm(true);
  };

  const handleEditBlog = (blog: BlogPost) => {
    setBlogForm({
      title: blog.title,
      title_bn: blog.title_bn || '',
      content: blog.content,
      content_bn: blog.content_bn || '',
      organization: blog.organization || '',
      is_published: blog.is_published
    });
    setEditingBlog(blog);
    setShowBlogForm(true);
  };

  const handleSaveBlog = async () => {
    try {
      const blogData = {
        ...blogForm,
        author_name: currentUser?.name || 'Super Admin',
        author_id: currentUser?.id
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingBlog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([blogData]);
        if (error) throw error;
      }

      alert(editingBlog ? 'Blog updated successfully' : 'Blog created successfully');
      setShowBlogForm(false);
      setEditingBlog(null);
      fetchData();
    } catch (err) {
      alert('Failed to save blog');
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      alert('Blog deleted successfully');
      fetchData();
    } catch (err) {
      alert('Failed to delete blog');
    }
  };

  const handleTogglePublish = async (blog: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_published: !blog.is_published })
        .eq('id', blog.id);

      if (error) throw error;

      alert(`Blog ${blog.is_published ? 'unpublished' : 'published'} successfully`);
      fetchData();
    } catch (err) {
      alert('Failed to update blog status');
    }
  };

  const handleApproveIllustration = async (illustrationId: string) => {
    try {
      const { error } = await supabase
        .from('illustrations')
        .update({ status: 'approved' })
        .eq('id', illustrationId);

      if (error) throw error;

      alert('Illustration approved successfully');
      fetchData();
    } catch (err) {
      alert('Failed to approve illustration');
    }
  };

  const handleRejectIllustration = async (illustrationId: string) => {
    try {
      const { error } = await supabase
        .from('illustrations')
        .update({ status: 'rejected' })
        .eq('id', illustrationId);

      if (error) throw error;

      alert('Illustration rejected successfully');
      fetchData();
    } catch (err) {
      alert('Failed to reject illustration');
    }
  };

  const handleDeleteIllustration = async (illustrationId: string) => {
    if (!confirm('Are you sure you want to delete this illustration?')) return;

    try {
      const { error } = await supabase
        .from('illustrations')
        .delete()
        .eq('id', illustrationId);

      if (error) throw error;

      alert('Illustration deleted successfully');
      fetchData();
    } catch (err) {
      alert('Failed to delete illustration');
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('user_comments')
        .update({ is_approved: true })
        .eq('id', commentId);

      if (error) throw error;

      alert('Comment approved successfully');
      fetchData();
    } catch (err) {
      alert('Failed to approve comment');
    }
  };

  const handleRejectComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('user_comments')
        .update({ is_approved: false })
        .eq('id', commentId);

      if (error) throw error;

      alert('Comment rejected successfully');
      fetchData();
    } catch (err) {
      alert('Failed to reject comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('user_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      alert('Comment deleted successfully');
      fetchData();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  if (loading) return (
    <div className="loading-wrapper">
      <div className="loading-inner">
        <svg className="loading-drop" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 8.954 20 20 20s20-8.954 20-20C40 8.954 31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="#C0152A"/>
          <path d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#E8324A"/>
          <circle cx="20" cy="20" r="4" fill="#FDFAF4"/>
        </svg>
        <span className="loading-text">{t('loading')}</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              👑 {language === 'bn' ? 'সুপার অ্যাডমিন ড্যাশবোর্ড' : t('superAdminDashboard')}
            </h1>
            <p className="dashboard-sub">
              {language === 'bn' ? 'সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ এবং ব্যবহারকারী ব্যবস্থাপনা' : 'Full system control and user management'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-logout"
          >
            {t('logout')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">
              {language === 'bn' ? 'মোট ব্যবহারকারী' : 'Total Users'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🩸</div>
            <div className="stat-value">{users.filter(u => u.is_donor).length}</div>
            <div className="stat-label">
              {language === 'bn' ? 'রক্তদাতা' : 'Donors'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📨</div>
            <div className="stat-value">{messages.length}</div>
            <div className="stat-label">
              {language === 'bn' ? 'বার্তা' : 'Messages'}
            </div>
          </div>
        </div>

        {/* Self-claim Toggle */}
        <div className="info-card super-admin-toggle">
          <h2 className="info-title">
            {language === 'bn' ? 'স্ব-দাবি সুপার অ্যাডমিন' : t('disableSelfClaim')}
          </h2>
          <p className="info-desc">
            {language === 'bn'
              ? 'যখন সক্ষম থাকে, ব্যবহারকারীরা সুপার অ্যাডমিন হিসেবে সাইন আপ করতে পারেন। যখন অক্ষম থাকে, শুধুমাত্র আপনি সুপার অ্যাডমিন ভূমিকা নির্ধারণ করতে পারেন।'
              : 'When enabled, users can sign up as super admin. When disabled, only you can assign super admin role.'}
          </p>
          <button
            onClick={toggleSelfClaim}
            className="btn-toggle"
            style={{ background: 'white', color: '#FF9800' }}
          >
            {selfClaimEnabled 
              ? (language === 'bn' ? '🟢 সক্ষম - অক্ষম করতে ক্লিক করুন' : '🟢 Enabled - Click to Disable')
              : (language === 'bn' ? '🔴 অক্ষম - সক্ষম করতে ক্লিক করুন' : '🔴 Disabled - Click to Enable')
            }
          </button>
        </div>

        {/* Role Assignment */}
        <div className="info-card">
          <h2 className="section-title">
            {language === 'bn' ? 'ভূমিকা নির্ধারণ করুন' : t('assignRoles')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            <div>
              <label className="form-label">{t('selectUser')}</label>
              <select
                value={selectedUser?.id || ''}
                onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value) || null)}
                className="form-select"
              >
                <option value="">{language === 'bn' ? 'ব্যবহারকারী নির্বাচন করুন' : t('selectUser')}</option>
                {users.filter(u => u.role !== 'super_admin').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">{t('selectRole')}</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="form-select"
              >
                <option value="">{language === 'bn' ? 'ভূমিকা নির্বাচন করুন' : t('selectRole')}</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="org_advocate">Organizational Advocate</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <button
              onClick={handleRoleChange}
              disabled={!selectedUser || !newRole}
              className="auth-submit"
              style={{ opacity: !selectedUser || !newRole ? 0.6 : 1 }}
            >
              {t('assign')}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div>
          <h2 className="section-title">
            {language === 'bn' ? 'ব্যবহারকারী তালিকা' : t('dashboard')} ({users.length})
          </h2>
          <div className="messages-list">
            {users.map(user => (
              <div key={user.id} className="message-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.5rem', fontWeight: 700 }}>{user.name}</h3>
                  <div style={{ color: 'var(--ink-mid)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '0.25rem' }}>📧 {user.email}</div>
                    <div style={{ marginBottom: '0.25rem' }}>📍 {user.location}</div>
                    <div>🩸 {user.blood_group || 'N/A'} {user.is_donor ? `(${language === 'bn' ? 'রক্তদাতা' : 'Donor'})` : ''}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="badge" style={{
                    background: getRoleColor(user.role),
                    color: 'white',
                    padding: '6px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {user.role.toUpperCase()}
                  </span>

                  {user.role !== 'super_admin' && user.role !== 'banned' && (
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="btn-cancel"
                      style={{ background: '#F44336', padding: '10px 20px' }}
                    >
                      {t('delete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages from Admins */}
        <div>
          <h2 className="section-title">
            {language === 'bn' ? 'উচ্চতর স্তরে পাঠানো বার্তা' : t('messages')}
          </h2>
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3 className="empty-title">
                {language === 'bn' ? 'কোন বার্তা নেই' : t('noMessages')}
              </h3>
              <p className="empty-desc">
                {language === 'bn' ? 'কোন উচ্চতর স্তরে পাঠানো বার্তা নেই' : 'No escalated messages'}
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className="message-card" style={{
                  background: '#FFF3E0',
                  border: '2px solid #FF9800'
                }}>
                  <div style={{ fontWeight: 700, color: '#E65100', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                    {language === 'bn' ? 'প্রেরক:' : 'From:'} {msg.from_user_name}
                  </div>
                  <div style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'var(--ink)' }}>{msg.message}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-mid)' }}>
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blog Management */}
        <div>
          <div className="blog-header">
            <h2 className="section-title">
              {language === 'bn' ? 'ব্লগ ব্যবস্থাপনা' : 'Blog Management'} ({blogs.length})
            </h2>
            <button
              onClick={handleAddBlog}
              className="btn-respond"
            >
              {language === 'bn' ? '+ নতুন ব্লগ যোগ করুন' : '+ Add New Blog'}
            </button>
          </div>

          {showBlogForm && (
            <div className="info-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
              <h3 className="section-title" style={{ fontSize: '1.3rem' }}>
                {editingBlog ? (language === 'bn' ? 'ব্লগ সম্পাদনা করুন' : 'Edit Blog') : (language === 'bn' ? 'নতুন ব্লগ তৈরি করুন' : 'Create New Blog')}
              </h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label className="form-label">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="form-input"
                    placeholder={language === 'bn' ? 'শিরোনাম লিখুন' : 'Enter title'}
                  />
                </div>
                <div>
                  <label className="form-label">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={blogForm.title_bn}
                    onChange={(e) => setBlogForm({ ...blogForm, title_bn: e.target.value })}
                    className="form-input"
                    placeholder={language === 'bn' ? 'শিরোনাম লিখুন (বাংলা)' : 'Enter title (Bangla)'}
                  />
                </div>
                <div>
                  <label className="form-label">{language === 'bn' ? 'সংস্থা/ক্লাব' : 'Organization/Club'}</label>
                  <input
                    type="text"
                    value={blogForm.organization}
                    onChange={(e) => setBlogForm({ ...blogForm, organization: e.target.value })}
                    className="form-input"
                    placeholder={language === 'bn' ? 'সংস্থার নাম' : 'Organization name'}
                  />
                </div>
                <div>
                  <label className="form-label">{language === 'bn' ? 'বিষয়বস্তু (ইংরেজি)' : 'Content (English)'}</label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="form-input"
                    rows={6}
                    placeholder={language === 'bn' ? 'বিষয়বস্তু লিখুন' : 'Enter content'}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label className="form-label">{language === 'bn' ? 'বিষয়বস্তু (বাংলা)' : 'Content (Bangla)'}</label>
                  <textarea
                    value={blogForm.content_bn}
                    onChange={(e) => setBlogForm({ ...blogForm, content_bn: e.target.value })}
                    className="form-input"
                    rows={6}
                    placeholder={language === 'bn' ? 'বিষয়বস্তু লিখুন (বাংলা)' : 'Enter content (Bangla)'}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={blogForm.is_published}
                    onChange={(e) => setBlogForm({ ...blogForm, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="is_published" style={{ color: 'var(--ink)', fontSize: '0.95rem' }}>
                    {language === 'bn' ? 'প্রকাশিত (জনসাধারণের জন্য দৃশ্যমান)' : 'Published (Visible to public)'}
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleSaveBlog}
                    className="auth-submit"
                  >
                    {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setShowBlogForm(false); setEditingBlog(null); }}
                    className="btn-cancel"
                  >
                    {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {blogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3 className="empty-title">
                {language === 'bn' ? 'কোন ব্লগ নেই' : 'No blogs yet'}
              </h3>
              <p className="empty-desc">
                {language === 'bn' ? 'প্রথম ব্লগ তৈরি করতে "+ নতুন ব্লগ যোগ করুন" এ ক্লিক করুন' : 'Click "+ Add New Blog" to create the first blog'}
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {blogs.map(blog => (
                <div key={blog.id} className="message-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.5rem', fontWeight: 700 }}>
                      {blog.title}
                      {blog.title_bn && <span style={{ marginLeft: '0.5rem', color: 'var(--ink-mid)', fontSize: '0.9rem' }}>({blog.title_bn})</span>}
                    </h3>
                    {blog.organization && (
                      <span className="badge" style={{
                        background: '#9C27B0',
                        color: 'white',
                        marginBottom: '0.5rem',
                        display: 'inline-block',
                        fontSize: '0.8rem'
                      }}>
                        {blog.organization}
                      </span>
                    )}
                    <p style={{ color: 'var(--ink-mid)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      {blog.content.substring(0, 150)}...
                    </p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span className="badge" style={{
                        background: blog.is_published ? '#4CAF50' : '#FF9800',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}>
                        {blog.is_published ? (language === 'bn' ? 'প্রকাশিত' : 'Published') : (language === 'bn' ? 'অপ্রকাশিত' : 'Draft')}
                      </span>
                      <span style={{ color: 'var(--ink-mid)', fontSize: '0.85rem' }}>
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleTogglePublish(blog)}
                      className="btn-toggle"
                      style={{
                        background: blog.is_published ? '#FF9800' : '#4CAF50',
                        padding: '8px 16px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {blog.is_published ? (language === 'bn' ? 'অপ্রকাশিত' : 'Unpublish') : (language === 'bn' ? 'প্রকাশ করুন' : 'Publish')}
                    </button>
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="btn-respond"
                      style={{ background: '#2196F3', padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="btn-cancel"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Illustration Management */}
        <div>
          <h2 className="section-title">
            {language === 'bn' ? 'চিত্রকথন ব্যবস্থাপনা' : 'Illustration Management'} ({illustrations.length})
          </h2>
          {illustrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3 className="empty-title">
                {language === 'bn' ? 'কোন চিত্র নেই' : 'No illustrations yet'}
              </h3>
              <p className="empty-desc">
                {language === 'bn' ? 'চিত্র আপলোড করতে /illustrations/upload পেজে যান' : 'Go to /illustrations/upload to upload illustrations'}
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {illustrations.map(illustration => (
                <div key={illustration.id} className="message-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '250px', display: 'flex', gap: '1rem' }}>
                    <div style={{
                      width: '120px',
                      height: '90px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img
                        src={illustration.image_url}
                        alt={illustration.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.5rem', fontWeight: 700 }}>
                        {illustration.title}
                        {illustration.title_bn && <span style={{ marginLeft: '0.5rem', color: 'var(--ink-mid)', fontSize: '0.9rem' }}>({illustration.title_bn})</span>}
                      </h3>
                      <p style={{ color: 'var(--ink-mid)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                        {illustration.description.substring(0, 100)}...
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="badge" style={{
                          background: illustration.status === 'approved' ? '#4CAF50' : illustration.status === 'rejected' ? '#F44336' : '#FF9800',
                          color: 'white',
                          fontSize: '0.8rem'
                        }}>
                          {illustration.status.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--ink-mid)', fontSize: '0.8rem' }}>
                          {illustration.language.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--ink-mid)', fontSize: '0.8rem' }}>
                          {new Date(illustration.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {illustration.status !== 'approved' && (
                      <button
                        onClick={() => handleApproveIllustration(illustration.id)}
                        className="btn-resolve"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        {language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                      </button>
                    )}
                    {illustration.status !== 'rejected' && (
                      <button
                        onClick={() => handleRejectIllustration(illustration.id)}
                        className="btn-cancel"
                        style={{ background: '#F44336', padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        {language === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments Management */}
        <div>
          <h2 className="section-title">
            {language === 'bn' ? 'মন্তব্য ব্যবস্থাপনা' : 'Comments Management'} ({comments.length})
          </h2>
          {comments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3 className="empty-title">
                {language === 'bn' ? 'কোন মন্তব্য নেই' : 'No comments yet'}
              </h3>
              <p className="empty-desc">
                {language === 'bn' ? 'কোন মন্তব্য পাওয়া যায়নি' : 'No comments to manage'}
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {comments.map(comment => (
                <div key={comment.id} className="message-card">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem', fontSize: '1rem' }}>
                      {comment.user_name}
                    </div>
                    <div style={{ color: 'var(--ink-mid)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--cream)', borderRadius: '12px', marginBottom: '1rem', lineHeight: '1.6', color: 'var(--ink)' }}>
                    {comment.comment}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!comment.is_approved && (
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="btn-resolve"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        {language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn-cancel"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
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

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: '#e53935',
    admin: '#2196f3',
    org_advocate: '#9c27b0',
    user: '#4caf50',
    banned: '#9e9e9e',
  };
  return colors[role] || '#666';
}
