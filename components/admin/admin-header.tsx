'use client';
import { Bell, ChevronRight, LogOut, Menu, User } from 'lucide-react';
import type { AdminSnapshot } from '@/lib/admin/types';
export function AdminHeader({ title, profile, onMenu, onSignOut }: { title: string; profile: AdminSnapshot['profile']; onMenu: () => void; onSignOut?: () => void }) {
  return <header className="rr-header">
    <div className="rr-breadcrumb"><button className="rr-icon-button rr-mobile-menu" onClick={onMenu} aria-label="Open navigation" aria-controls="rr-mobile-navigation"><Menu size={21} /></button><span className="rr-admin-label">Super Admin</span><ChevronRight size={14} aria-hidden="true" /><span>{title}</span></div>
    <div className="rr-header-actions"><button className="rr-icon-button" disabled aria-label="Notifications unavailable"><Bell size={19} /></button><div className="rr-profile"><span className="rr-avatar"><User size={18} aria-hidden="true" /></span><div><strong>{profile?.displayName ?? 'Super Admin'}</strong><span>{profile ? 'Super Admin' : 'Checking session'}</span></div></div><button className="rr-icon-button" onClick={onSignOut} disabled={!onSignOut} title="Log out" aria-label="Log out"><LogOut size={18} /></button></div>
  </header>;
}
