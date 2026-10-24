'use client';
import { Bell, ChevronRight, LogOut, Menu, Search, User } from 'lucide-react';
import { useState } from 'react';
import type { AdminSnapshot } from '@/lib/admin/types';
export function AdminHeader({ title, profile, onMenu, onSignOut }: { title: string; profile: AdminSnapshot['profile']; onMenu: () => void; onSignOut?: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  return <>
    <header className="rr-header">
      <div className="rr-breadcrumb"><button className="rr-icon-button rr-mobile-menu" onClick={onMenu} aria-label="Open navigation" aria-controls="rr-mobile-navigation"><Menu size={21} /></button><span className="rr-admin-label">Super Admin</span><ChevronRight className="rr-breadcrumb-chevron" size={14} aria-hidden="true" /><span>{title}</span></div>
      <div className="rr-header-actions"><button className="rr-icon-button" onClick={() => setSearchOpen(value => !value)} aria-label="Search" aria-expanded={searchOpen}><Search size={19} /></button><button className="rr-icon-button rr-notification-button" onClick={() => setNoticeOpen(value => !value)} aria-label="Notifications" aria-expanded={noticeOpen}><Bell size={19} /><span className="rr-notification-dot" aria-hidden="true" /></button><button className="rr-language-button" onClick={() => setLanguage(value => value === 'en' ? 'bn' : 'en')} aria-label="Change language">{language === 'en' ? 'বাংলা' : 'English'}</button><div className="rr-profile"><span className="rr-avatar"><User size={18} aria-hidden="true" /></span><div><strong>{profile?.displayName ?? 'Super Admin'}</strong><span>{profile ? 'Super Admin' : 'Checking session'}</span></div></div><button className="rr-icon-button" onClick={onSignOut} disabled={!onSignOut} title="Log out" aria-label="Log out"><LogOut size={18} /></button></div>
    </header>
    {searchOpen && <div className="rr-top-search"><Search size={17} aria-hidden="true" /><input autoFocus type="search" placeholder="Search users, requests, hospitals…" aria-label="Search users, requests, hospitals" /></div>}
    {noticeOpen && <div className="rr-notification-popover" role="status"><strong>Notifications</strong><span>No new notifications.</span></div>}
  </>;
}
