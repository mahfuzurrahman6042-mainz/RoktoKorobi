'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

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

export default function SuperAdminDashboard() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [selfClaimEnabled, setSelfClaimEnabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'super_admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [usersData, messagesData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
      ]);

      setUsers(usersData.data || []);
      setMessages(messagesData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#e53935', fontSize: '2rem' }}>👑 {t('superAdminDashboard')}</h1>
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

      {/* Self-claim Toggle */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #ff9800'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('disableSelfClaim')}</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          When enabled, users can sign up as super admin. When disabled, only you can assign super admin role.
        </p>
        <button
          onClick={toggleSelfClaim}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: selfClaimEnabled ? '#4caf50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {selfClaimEnabled ? '🟢 Enabled - Click to Disable' : '🔴 Disabled - Click to Enable'}
        </button>
      </div>

      {/* Role Assignment */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('assignRoles')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {t('selectUser')}
            </label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value) || null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">{t('selectUser')}</option>
              {users.filter(u => u.role !== 'super_admin').map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {t('selectRole')}
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">{t('selectRole')}</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="org_advocate">Organizational Advocate</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <button
            onClick={handleRoleChange}
            disabled={!selectedUser || !newRole}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !selectedUser || !newRole ? 'not-allowed' : 'pointer',
              opacity: !selectedUser || !newRole ? 0.6 : 1
            }}
          >
            {t('assign')}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('dashboard')} ({users.length})</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map(user => (
            <div
              key={user.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{user.name}</h3>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  <div>📧 {user.email}</div>
                  <div>📍 {user.location}</div>
                  <div>🩸 {user.blood_group || 'N/A'} {user.is_donor ? '(Donor)' : ''}</div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>

              {user.role !== 'super_admin' && user.role !== 'banned' && (
                <button
                  onClick={() => handleBanUser(user.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {t('delete')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Messages from Admins */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>{t('messages')}</h2>
        {messages.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            {t('noMessages')}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#fff3e0',
                  border: '2px solid #ff9800',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  From: {msg.from_user_name}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>{msg.message}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
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
