'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
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
  const { t, language } = useLanguage();
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#757575', fontSize: '1.1rem' }}>{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '80px 20px 40px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ color: '#212121', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🛡️ {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : t('adminDashboard')}
            </h1>
            <p style={{ color: '#757575', fontSize: '1rem' }}>
              {language === 'bn' ? 'ব্যবহারকারীদের বার্তা পরিচালনা করুন এবং সমস্যা সমাধান করুন' : 'Manage user messages and resolve issues'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              background: '#F44336',
              color: 'white',
              padding: '12px 24px'
            }}
          >
            {t('logout')}
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📨</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#E53935', marginBottom: '0.5rem' }}>
              {messages.length}
            </div>
            <div style={{ color: '#757575' }}>
              {language === 'bn' ? 'মুলতুবি বার্তা' : 'Pending Messages'}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '0.5rem' }}>
              {messages.filter(m => m.status === 'resolved').length}
            </div>
            <div style={{ color: '#757575' }}>
              {language === 'bn' ? 'সমাধান হয়েছে' : 'Resolved'}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⬆️</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FF9800', marginBottom: '0.5rem' }}>
              {messages.filter(m => m.status === 'escalated').length}
            </div>
            <div style={{ color: '#757575' }}>
              {language === 'bn' ? 'উচ্চতর স্তরে পাঠানো হয়েছে' : 'Escalated'}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
          color: 'white',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {language === 'bn' ? 'আপনার ভূমিকা' : t('dashboard')}
          </h2>
          <p style={{ opacity: 0.95, lineHeight: '1.6' }}>
            {language === 'bn'
              ? 'একজন অ্যাডমিন হিসেবে, আপনি ব্যবহারকারীদের কাছ থেকে বার্তা পান এবং তাদের সমস্যা সমাধানে সাহায্য করেন। যদি আপনি কোনো সমস্যা সমাধান করতে না পারেন, তবে এটি সুপার অ্যাডমিনের কাছে উচ্চতর স্তরে পাঠান।'
              : 'As an admin, you receive messages from users and help solve their issues. If you cannot resolve an issue, escalate it to the super admin.'}
          </p>
        </div>

        {/* Location Sharing Consent Card */}
        {currentUser?.is_donor && (
          <div className="card" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#212121', marginBottom: '0.5rem' }}>
                  📍 Location Sharing Consent
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Allow blood request recipients to see your live location when you accept a donation request
                </p>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                  You can disable this at any time. Location sharing is only active during active donation requests.
                </p>
              </div>
              <button
                onClick={handleLocationConsentToggle}
                disabled={updatingConsent}
                style={{
                  padding: '12px 24px',
                  background: locationConsent ? '#4CAF50' : '#9E9E9E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: updatingConsent ? 'not-allowed' : 'pointer',
                  opacity: updatingConsent ? 0.6 : 1
                }}
              >
                {updatingConsent ? 'Updating...' : locationConsent ? '✓ Enabled' : 'Enable'}
              </button>
            </div>
          </div>
        )}

        {/* Messages Section */}
        <h2 style={{ fontSize: '1.8rem', color: '#212121', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {language === 'bn' ? 'বার্তাসমূহ' : t('messages')} ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#212121', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {language === 'bn' ? 'কোন বার্তা নেই' : t('noMessages')}
            </h3>
            <p style={{ color: '#757575' }}>
              {language === 'bn' ? 'সব বার্তা পরিচালিত হয়েছে' : 'All messages have been handled'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {messages.map(msg => (
              <div key={msg.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2196F3', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                      {language === 'bn' ? 'প্রেরক:' : 'From:'} {msg.from_user_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#757575' }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="badge badge-primary">
                    {msg.status}
                  </span>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  background: '#f5f5f5', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  lineHeight: '1.6',
                  color: '#212121'
                }}>
                  {msg.message}
                </div>

                {selectedMessage?.id === msg.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার উত্তর লিখুন...' : t('messagePlaceholder')}
                      className="input"
                      style={{
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleReply(true)}
                        disabled={!replyMessage}
                        className="btn"
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          padding: '12px 24px',
                          opacity: !replyMessage ? 0.6 : 1
                        }}
                      >
                        ✅ {t('markResolved')}
                      </button>
                      <button
                        onClick={() => handleReply(false)}
                        disabled={!replyMessage}
                        className="btn"
                        style={{
                          background: '#FF9800',
                          color: 'white',
                          padding: '12px 24px',
                          opacity: !replyMessage ? 0.6 : 1
                        }}
                      >
                        ⬆️ {t('escalate')}
                      </button>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="btn"
                        style={{
                          background: '#9E9E9E',
                          color: 'white',
                          padding: '12px 24px'
                        }}
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedMessage(msg)}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px' }}
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
