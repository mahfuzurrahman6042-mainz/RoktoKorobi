'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/fetch';

interface Message {
  id: string;
  from_user_id: string;
  from_user_name: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Admin Dashboard', bn: 'অ্যাডমিন ড্যাশবোর্ড' },
      messages: { en: 'Messages', bn: 'বার্তা' },
      reply: { en: 'Reply', bn: 'উত্তর' },
      send: { en: 'Send', bn: 'পাঠান' },
      locationConsent: { en: 'Location Consent', bn: 'অবস্থান সম্মতি' },
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [locationConsent, setLocationConsent] = useState(false);
  const [updatingConsent, setUpdatingConsent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchLocationConsent();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setCurrentUser(result.user);
      
      if (result.user?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchMessages();
    } catch (err) {
      setCurrentUser(null);
      router.push('/');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setMessages(data || []);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationConsent = async () => {
    try {
      const response = await fetch('/api/user/location-consent');
      const result = await response.json();
      setLocationConsent(result.consent || false);
    } catch (err) {
      // Silent fail
    }
  };

  const handleLocationConsentToggle = async () => {
    setUpdatingConsent(true);
    try {
      const response = await fetch('/api/user/location-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: !locationConsent })
      });
      const result = await response.json();
      if (result.success) {
        setLocationConsent(result.consent);
      }
    } catch (err) {
      alert('Failed to update location consent');
    } finally {
      setUpdatingConsent(false);
    }
  };

  const handleReply = async (resolve: boolean) => {
    if (!selectedMessage) return;

    try {
      // Update message status
      await supabase
        .from('messages')
        .update({ 
          status: resolve ? 'resolved' : 'escalated',
          admin_reply: replyMessage
        })
        .eq('id', selectedMessage.id);

      // If escalated, create escalation to super admin
      if (!resolve) {
        await supabase
          .from('escalations')
          .insert({
            original_message_id: selectedMessage.id,
            from_user_name: selectedMessage.from_user_name,
            original_message: selectedMessage.message,
            admin_reply: replyMessage,
            admin_id: currentUser?.id,
          });
      }

      alert(resolve ? 'Message resolved' : 'Escalated to super admin');
      fetchMessages();
      setSelectedMessage(null);
      setReplyMessage('');
    } catch (err) {
      alert('Failed to process message');
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
              🛡️ {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : t('adminDashboard')}
            </h1>
            <p className="dashboard-sub">
              {language === 'bn' ? 'ব্যবহারকারীদের বার্তা পরিচালনা করুন এবং সমস্যা সমাধান করুন' : 'Manage user messages and resolve issues'}
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
            <div className="stat-icon">📨</div>
            <div className="stat-value">{messages.length}</div>
            <div className="stat-label">
              {language === 'bn' ? 'মুলতুবি বার্তা' : 'Pending Messages'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{messages.filter(m => m.status === 'resolved').length}</div>
            <div className="stat-label">
              {language === 'bn' ? 'সমাধান হয়েছে' : 'Resolved'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⬆️</div>
            <div className="stat-value">{messages.filter(m => m.status === 'escalated').length}</div>
            <div className="stat-label">
              {language === 'bn' ? 'উচ্চতর স্তরে পাঠানো হয়েছে' : 'Escalated'}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="info-card admin-info">
          <h2 className="info-title">
            {language === 'bn' ? 'আপনার ভূমিকা' : t('dashboard')}
          </h2>
          <p className="info-desc">
            {language === 'bn'
              ? 'একজন অ্যাডমিন হিসেবে, আপনি ব্যবহারকারীদের কাছ থেকে বার্তা পান এবং তাদের সমস্যা সমাধানে সাহায্য করেন। যদি আপনি কোনো সমস্যা সমাধান করতে না পারেন, তবে এটি সুপার অ্যাডমিনের কাছে উচ্চতর স্তরে পাঠান।'
              : 'As an admin, you receive messages from users and help solve their issues. If you cannot resolve an issue, escalate it to the super admin.'}
          </p>
        </div>

        {/* Location Sharing Consent Card */}
        {currentUser?.is_donor && (
          <div className="card consent-card">
            <div className="consent-content">
              <div>
                <h3 className="consent-title">
                  📍 Location Sharing Consent
                </h3>
                <p className="consent-desc">
                  Allow blood request recipients to see your live location when you accept a donation request
                </p>
                <p className="consent-note">
                  You can disable this at any time. Location sharing is only active during active donation requests.
                </p>
              </div>
              <button
                onClick={handleLocationConsentToggle}
                disabled={updatingConsent}
                className={`btn-toggle ${locationConsent ? 'enabled' : ''}`}
              >
                {updatingConsent ? 'Updating...' : locationConsent ? '✓ Enabled' : 'Enable'}
              </button>
            </div>
          </div>
        )}

        {/* Messages Section */}
        <h2 className="section-title">
          {language === 'bn' ? 'বার্তাসমূহ' : t('messages')} ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">
              {language === 'bn' ? 'কোন বার্তা নেই' : t('noMessages')}
            </h3>
            <p className="empty-desc">
              {language === 'bn' ? 'সব বার্তা পরিচালিত হয়েছে' : 'All messages have been handled'}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(msg => (
              <div key={msg.id} className="message-card">
                <div className="message-header">
                  <div>
                    <div className="message-sender">
                      {language === 'bn' ? 'প্রেরক:' : 'From:'} {msg.from_user_name}
                    </div>
                    <div className="message-date">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className={`badge ${msg.status}`}>
                    {msg.status}
                  </span>
                </div>

                <div className="message-content">
                  {msg.message}
                </div>

                {selectedMessage?.id === msg.id ? (
                  <div className="message-reply">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার উত্তর লিখুন...' : t('messagePlaceholder')}
                      className="form-input"
                      style={{
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                    />
                    <div className="reply-actions">
                      <button
                        onClick={() => handleReply(true)}
                        disabled={!replyMessage}
                        className="btn-resolve"
                      >
                        ✅ {t('markResolved')}
                      </button>
                      <button
                        onClick={() => handleReply(false)}
                        disabled={!replyMessage}
                        className="btn-escalate"
                      >
                        ⬆️ {t('escalate')}
                      </button>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="btn-cancel"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedMessage(msg)}
                    className="btn-respond"
                  >
                    {t('respond')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
