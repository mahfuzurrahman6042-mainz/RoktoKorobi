'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, Menu, Search, X } from 'lucide-react';
import { useAdminData } from '@/hooks/use-admin-data';
import { unconnectedSource } from '@/lib/admin/data-source';
import { useLanguage } from '@/contexts/LanguageContext';
import { superAdminNavigation } from './navigation';
import type { AdminDataSource } from '@/lib/admin/types';
import './super-admin.css';

type AdminContextValue = ReturnType<typeof useAdminData> & { refreshPartnerStatistics?: () => Promise<void> };
const AdminContext = createContext<AdminContextValue | null>(null);
export function useSuperAdmin() { const value = useContext(AdminContext); if (!value) throw new Error('Super admin components require the super admin shell'); return value; }
export const useAdmin = useSuperAdmin;
const copy = { en: { brand: 'RoktoKorobi', role: 'Super admin', homepage: 'View homepage', close: 'Close menu', open: 'Open menu', search: 'Search', placeholder: 'Search users, requests, hospitals…', notifications: 'Notifications', noNotifications: 'No new notifications.', loading: 'Checking RoktoKorobi access…', footer: 'RoktoKorobi' }, bn: { brand: 'রক্তকরবী', role: 'সুপার অ্যাডমিন', homepage: 'হোমপেজ দেখুন', close: 'মেনু বন্ধ করুন', open: 'মেনু খুলুন', search: 'খুঁজুন', placeholder: 'ব্যবহারকারী, অনুরোধ, হাসপাতাল খুঁজুন…', notifications: 'নোটিফিকেশন', noNotifications: 'নতুন কোনো নোটিফিকেশন নেই।', loading: 'রক্তকরবীতে প্রবেশাধিকার যাচাই হচ্ছে…', footer: 'রক্তকরবী' } } as const;

export function SuperAdminShell({ children, source = unconnectedSource }: { children: ReactNode; source?: AdminDataSource }) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);
  const data = useAdminData(source);
  const sector = superAdminNavigation.find(item => pathname === '/super-admin' ? item.slug === 'overview' : pathname === `/super-admin/${item.slug}` || pathname.startsWith(`/super-admin/${item.slug}/`));
  const closeMenu = () => { setMenuOpen(false); menuButton.current?.focus(); };
  useEffect(() => { if (previousPath.current !== pathname) { setMenuOpen(false); previousPath.current = pathname; } }, [pathname]);
  useEffect(() => { if (!menuOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [menuOpen]);
  useEffect(() => { if (!menuOpen) return; const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu(); }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); });
  return <AdminContext.Provider value={{ ...data, refreshPartnerStatistics: source.refreshPartnerStatistics }}><div className="sa-root">
    <a className="sa-skip" href="#sa-main">{language === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}</a>
    <header className="sa-header"><button ref={menuButton} className="sa-icon-button" aria-label={t.open} aria-expanded={menuOpen} aria-controls="sa-drawer" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><div className="sa-current-sector">{sector ? sector.title[language] : t.role}</div><div className="sa-header-actions"><button className="sa-icon-button" aria-label={t.search} aria-expanded={searchOpen} aria-controls="sa-search-row" onClick={() => setSearchOpen(value => !value)}><Search size={19} /></button><Link className="sa-icon-button sa-notification" href="/super-admin/overview/alerts" aria-label={t.notifications}><Bell size={19} /><span aria-hidden="true" /></Link><button className="sa-language" onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} aria-label={language === 'en' ? 'বাংলায় বদলান' : 'Switch to English'}>{language === 'en' ? 'বাংলা' : 'EN'}</button></div></header>
    {searchOpen && <div id="sa-search-row" className="sa-search-row"><Search size={17} aria-hidden="true" /><input autoFocus type="search" placeholder={t.placeholder} aria-label={t.placeholder} /></div>}
    <div className={`sa-scrim${menuOpen ? ' is-open' : ''}`} aria-hidden="true" onClick={closeMenu} />
    <aside id="sa-drawer" className={`sa-drawer${menuOpen ? ' is-open' : ''}`} inert={!menuOpen ? true : undefined} aria-hidden={!menuOpen}><div className="sa-drawer-brand"><div><strong>{t.brand}</strong><span>{t.role}</span></div><button className="sa-icon-button" aria-label={t.close} onClick={closeMenu}><X size={21} /></button></div><nav className="sa-drawer-nav" aria-label={language === 'bn' ? 'সেক্টর' : 'Sectors'}>{superAdminNavigation.map(item => { const Icon = item.icon; const active = item.slug === sector?.slug; return <Link key={item.slug} href={`/super-admin/${item.slug}`} className={`sa-sector-link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={closeMenu}><Icon size={18} aria-hidden="true" /><span>{item.title[language]}</span><small>{item.subpages.length}</small></Link>; })}</nav><a className="sa-home-button" href="/" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>{t.homepage}<ChevronRight size={16} /></a><div className="sa-drawer-footer"><span className="sa-avatar">S</span><div><strong>{t.role}</strong><span>{t.brand}</span></div></div></aside>
    <main id="sa-main" className="sa-main" tabIndex={-1}>{data.state === 'forbidden' ? <p role="alert">{language === 'bn' ? 'এই পেজ দেখার অনুমতি নেই।' : 'You do not have permission to view this page.'}</p> : children}<footer className="sa-footer">{t.footer}</footer></main>
  </div></AdminContext.Provider>;
}
