'use client';

import { useState, useEffect } from 'react';
import { database, ref, get, update, remove, getAllRoles, assignUserRole, getCurrentUser, isSuperAdmin } from '@/lib/firebase';
import { Search, UserPlus, ArrowRight, X, Ban, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  name: string;
  email: string;
  bloodGroup: string;
  phone: string;
  location: string;
  isDonor: boolean;
  isBanned: boolean;
  donations: number;
  role?: string;
  roleAssignedAt?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  hierarchy: number;
  permissions: string[];
}

const ROLE_META = {
  super_admin: { label: 'Super Admin', tone: 'crimson' },
  admin: { label: 'Admin', tone: 'navy' },
  hospital: { label: 'Hospital', tone: 'green' },
  partner: { label: 'Organizational Partner', tone: 'amber' },
  unassigned: { label: 'Unassigned', tone: 'ink' },
};

const TONE = {
  crimson: { bg: 'var(--crimson-tint)', fg: 'var(--crimson)' },
  navy: { bg: 'var(--navy-tint)', fg: 'var(--navy)' },
  amber: { bg: 'var(--amber-tint)', fg: 'var(--amber)' },
  green: { bg: 'var(--green-tint)', fg: 'var(--green)' },
  ink: { bg: '#EEF0F1', fg: 'var(--ink)' },
};

function Badge({ tone = 'ink', children }: { tone?: string; children: React.ReactNode }) {
  const t = TONE[tone as keyof typeof TONE] || TONE.ink;
  return (
    <span
      style={{ background: t.bg, color: t.fg }}
      className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap"
    >
      {children}
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{ background: checked ? 'var(--crimson)' : 'var(--line)' }}
      className="w-9 h-5 rounded-full relative transition-colors flex-shrink-0"
    >
      <span
        style={{
          transform: checked ? 'translateX(16px)' : 'translateX(2px)',
          top: 2,
        }}
        className="absolute w-4 h-4 rounded-full bg-white transition-transform"
      />
    </button>
  );
}

function PageHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="flex items-start gap-3 mb-7">
      {onBack && (
        <button
          onClick={onBack}
          style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <ArrowRight size={16} className="rotate-180" />
        </button>
      )}
      <div>
        <h1 style={{ fontFamily: "'IBM Plex Serif', serif" }} className="text-2xl font-semibold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--ink-muted)' }} className="text-sm mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ role: string; permissions: Record<string, boolean> } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const isAdmin = await isSuperAdmin(currentUser.email || '');
        setIsSuperAdminUser(isAdmin);
      }
    } catch (error) {
      console.error('Error checking super admin:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!database) return;

      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map(key => ({
          uid: key,
          ...data[key],
          isBanned: data[key].isBanned || false
        }));
        // Remove duplicates based on uid
        const uniqueUsers = usersArray.filter((user, index, self) =>
          index === self.findIndex((u) => u.uid === user.uid)
        );
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selected = users.find((u) => u.uid === selectedId);

  function openUser(u: User) {
    setSelectedId(u.uid);
    setDraft({ role: u.role || 'unassigned', permissions: {} });
  }

  function saveDraft() {
    if (!selectedId || !draft) return;
    setUsers((prev) =>
      prev.map((u) => (u.uid === selectedId ? { ...u, role: draft.role } : u))
    );
    setSelectedId(null);
    setDraft(null);
  }

  function removeFromPosition() {
    if (draft) {
      setDraft({ role: 'unassigned', permissions: {} });
    }
  }

  function toggleBan() {
    if (!selectedId) return;
    setUsers((prev) =>
      prev.map((u) => (u.uid === selectedId ? { ...u, isBanned: !u.isBanned } : u))
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--crimson)' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Users & Roles"
        subtitle="Search for a user, assign a role, and control exactly what they can do."
        onBack={() => router.push('/admin')}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg flex-1 min-w-[220px] max-w-sm"
        >
          <Search size={16} style={{ color: 'var(--ink-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'super_admin', 'admin', 'hospital', 'partner', 'unassigned'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                background: roleFilter === r ? 'var(--ink)' : 'var(--surface)',
                color: roleFilter === r ? '#fff' : 'var(--ink-muted)',
                border: '1px solid ' + (roleFilter === r ? 'var(--ink)' : 'var(--line)'),
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition"
            >
              {r === 'all' ? 'All roles' : ROLE_META[r as keyof typeof ROLE_META].label}
            </button>
          ))}
        </div>

        {isSuperAdminUser && (
          <button
            onClick={() => setInviteOpen(true)}
            style={{ background: 'var(--crimson)' }}
            className="ml-auto flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            <UserPlus size={15} />
            Invite user
          </button>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)' }} className="rounded-xl overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
            No users match your search.
          </div>
        )}
        {filtered.map((u, i) => (
          <button
            key={u.uid}
            onClick={() => openUser(u)}
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-black/[0.015] transition"
          >
            <div
              style={{ background: 'var(--navy)', color: '#fff' }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
            >
              {u.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate flex items-center gap-2">
                {u.name}
                {u.isBanned && <Badge tone="amber">Banned</Badge>}
              </div>
              <div style={{ color: 'var(--ink-muted)' }} className="text-xs truncate">
                {u.email}
              </div>
            </div>
            <Badge tone={ROLE_META[u.role as keyof typeof ROLE_META]?.tone || 'ink'}>
              {ROLE_META[u.role as keyof typeof ROLE_META]?.label || 'Unassigned'}
            </Badge>
            <ArrowRight size={15} style={{ color: 'var(--ink-muted)' }} />
          </button>
        ))}
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div style={{ background: 'var(--surface)' }} className="rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold mb-4">Invite a user</h3>
            <label style={{ color: 'var(--ink-muted)' }} className="text-xs font-medium">
              Full name
            </label>
            <input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              style={{ border: '1px solid var(--line)' }}
              className="w-full mt-1.5 mb-3.5 px-3 py-2 rounded-lg text-sm outline-none"
              placeholder="e.g. Farhan Kabir"
            />
            <label style={{ color: 'var(--ink-muted)' }} className="text-xs font-medium">
              Email
            </label>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{ border: '1px solid var(--line)' }}
              className="w-full mt-1.5 mb-5 px-3 py-2 rounded-lg text-sm outline-none"
              placeholder="name@example.com"
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => setInviteOpen(false)}
                style={{ border: '1px solid var(--line)' }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!inviteName.trim() || !inviteEmail.trim()) return;
                  setUsers((prev) => [
                    ...prev,
                    {
                      uid: Date.now().toString(),
                      name: inviteName.trim(),
                      email: inviteEmail.trim(),
                      bloodGroup: 'Unknown',
                      phone: '',
                      location: '',
                      isDonor: false,
                      isBanned: false,
                      donations: 0,
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                  setInviteName('');
                  setInviteEmail('');
                  setInviteOpen(false);
                }}
                style={{ background: 'var(--crimson)' }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
              >
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage drawer */}
      {selected && draft && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedId(null)} />
          <div
            style={{ background: 'var(--surface)' }}
            className="relative w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  style={{ background: 'var(--navy)', color: '#fff' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{selected.name}</div>
                  <div style={{ color: 'var(--ink-muted)' }} className="text-xs">
                    {selected.email}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)}>
                <X size={18} />
              </button>
            </div>

            <label style={{ color: 'var(--ink-muted)' }} className="text-xs font-medium uppercase tracking-wide">
              Role
            </label>
            <div className="relative mt-2 mb-6">
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value, permissions: {} })}
                style={{ border: '1px solid var(--line)' }}
                className="w-full appearance-none px-3.5 py-2.5 rounded-lg text-sm bg-white pr-9"
              >
                {Object.entries(ROLE_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 pointer-events-none" style={{ color: 'var(--ink-muted)' }} />
            </div>

            <div className="flex gap-2.5 mt-7">
              <button
                onClick={removeFromPosition}
                style={{ border: '1px solid var(--line)', color: 'var(--ink-muted)' }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium"
              >
                <RotateCcw size={14} />
                Remove from position
              </button>
              <button
                onClick={saveDraft}
                style={{ background: 'var(--crimson)' }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
              >
                Save changes
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--line)' }} className="mt-7 pt-5">
              <div style={{ color: 'var(--crimson-dark)' }} className="text-xs font-semibold uppercase tracking-wide mb-2">
                Danger zone
              </div>
              <p style={{ color: 'var(--ink-muted)' }} className="text-xs mb-3">
                {selected.isBanned
                  ? 'This account is currently banned and cannot sign in.'
                  : 'Banning immediately blocks this person from signing in.'}
              </p>
              <button
                onClick={toggleBan}
                style={{
                  border: '1px solid ' + (selected.isBanned ? 'var(--line)' : 'var(--crimson)'),
                  color: selected.isBanned ? 'var(--ink)' : 'var(--crimson)',
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium"
              >
                <Ban size={14} />
                {selected.isBanned ? 'Unban this user' : 'Ban this user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
