'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  from_user_id: string;
  from_user_name: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchMessages();
  }, [router]);

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
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
            admin_id: JSON.parse(localStorage.getItem('user') || '{}').id,
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#2196f3', fontSize: '2rem' }}>🛡️ Admin Dashboard</h1>
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
          Logout
        </button>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #2196f3'
      }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Your Role</h2>
        <p style={{ color: '#666' }}>
          As an admin, you receive messages from users and help solve their issues. 
          If you cannot resolve an issue, escalate it to the super admin.
        </p>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>User Messages ({messages.length})</h2>

      {messages.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No pending messages from users
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#2196f3' }}>
                From: {msg.from_user_name}
              </div>
              <div style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{msg.message}</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                {new Date(msg.created_at).toLocaleString()}
              </div>

              {selectedMessage?.id === msg.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      minHeight: '100px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleReply(true)}
                      disabled={!replyMessage}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: !replyMessage ? 'not-allowed' : 'pointer',
                        opacity: !replyMessage ? 0.6 : 1
                      }}
                    >
                      ✅ Resolve
                    </button>
                    <button
                      onClick={() => handleReply(false)}
                      disabled={!replyMessage}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: !replyMessage ? 'not-allowed' : 'pointer',
                        opacity: !replyMessage ? 0.6 : 1
                      }}
                    >
                      ⬆️ Escalate to Super Admin
                    </button>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#9e9e9e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedMessage(msg)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Respond
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
