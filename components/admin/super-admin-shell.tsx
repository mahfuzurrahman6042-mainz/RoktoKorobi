'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Building2, Droplet, FileText, LayoutDashboard, LogOut, Menu, Settings2, Users, X } from 'lucide-react';
import { useAdminData } from '@/hooks/use-admin-data';
import { unconnectedSource } from '@/lib/admin/data-source';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AdminDataSource } from '@/lib/admin/types';
import { activeSection, sectionPages } from './control-center-routes';
import './super-admin.css';
import './control-center.css';

type AdminContextValue = ReturnType<typeof useAdminData> & { refreshPartnerStatistics?: () => Promise<void> };
const AdminContext = createContext<AdminContextValue | null>(null);
export function useSuperAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('Super admin components require the super admin shell');
  return value;
}
export const useAdmin = useSuperAdmin;

const primaryNav = [
  { href: '/super-admin', en: 'Overview', bn: 'সারসংক্ষেপ', icon: LayoutDashboard },
  { href: '/super-admin/people', en: 'People', bn: 'মানুষ', icon: Users },
  { href: '/super-admin/operations', en: 'Requests', bn: 'অনুরোধ', icon: Droplet },
  { href: '/super-admin/partners', en: 'Partners', bn: 'অংশীদার', icon: Building2 },
  { href: '/super-admin/content', en: 'Content', bn: 'কনটেন্ট', icon: FileText },
  { href: '/super-admin/settings', en: 'Settings', bn: 'সেটিংস', icon: Settings2 },
] as const;

function PrimaryNav({ pathname, language, onNavigate, tabs = false }: { pathname: string; language: 'en' | 'bn'; onNavigate?: () => void; tabs?: boolean }) {
  const activeHref = activeSection(pathname);
  return <nav className="cc-nav" aria-label={tabs ? (language === 'bn' ? 'কর্মক্ষেত্র ট্যাব' : 'Workspace tabs') : (language === 'bn' ? 'প্রধান নেভিগেশন' : 'Primary navigation')}>
    {!tabs && <span className="cc-nav-caption">{language === 'bn' ? 'কর্মক্ষেত্র' : 'Workspace'}</span>}
    {primaryNav.map(item => {
      const active = activeHref === item.href;
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} className={'cc-nav-link' + (active ? ' is-active' : '')} aria-current={active ? pathname === item.href ? 'page' : 'location' : undefined} onClick={onNavigate}>
        <Icon size={19} aria-hidden="true" /><span>{item[language]}</span>
      </Link>;
    })}
    {!tabs && activeHref && <div className="cc-subnav"><span className="cc-nav-caption">{language === 'bn' ? 'এই বিভাগে' : 'In this section'}</span>{sectionPages[activeHref].map(page => {
      const selected = pathname === page.href || (page.href === '/super-admin' && pathname === '/super-admin/overview');
      return <Link key={page.href} href={page.href} className={'cc-subnav-link' + (selected ? ' is-active' : '')} aria-current={selected && pathname !== activeHref ? 'page' : undefined} onClick={onNavigate}>{page.label}</Link>;
    })}</div>}
  </nav>;
}

export function SuperAdminShell({ children, source = unconnectedSource }: { children: ReactNode; source?: AdminDataSource }) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const data = useAdminData(source);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const [accountError, setAccountError] = useState('');
  const section = primaryNav.find(item => item.href === activeSection(pathname));
  const currentPage = section ? sectionPages[section.href].find(page => page.href === pathname) : undefined;
  const closeMenu = () => menu.current?.close();

  useEffect(() => { menu.current?.close(); }, [pathname]);

  const signOut = async () => {
    if (!source.signOut) return;
    try { await source.signOut(); } catch { setAccountError(language === 'bn' ? 'সাইন আউট করা যায়নি। আবার চেষ্টা করুন।' : 'Could not sign out. Please try again.'); }
  };

  return <AdminContext.Provider value={{ ...data, refreshPartnerStatistics: source.refreshPartnerStatistics }}>
    <div className="sa-root cc-shell">
      <a className="sa-skip cc-skip" href="#sa-main">{language === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}</a>
      <aside className="cc-sidebar" aria-label={language === 'bn' ? 'সুপার অ্যাডমিন নেভিগেশন' : 'Super admin navigation'}>
        <Link href="/super-admin" className="cc-brand"><span className="cc-brand-mark"><Droplet size={22} aria-hidden="true" /></span><span><strong>RoktoKorobi</strong><small>Super admin</small></span></Link>
        <PrimaryNav pathname={pathname} language={language} />
        <div className="cc-sidebar-bottom">
          <Link href="/" className="cc-site-link" target="_blank" rel="noopener noreferrer">{language === 'bn' ? 'ওয়েবসাইট দেখুন' : 'View website'}<ArrowUpRight size={17} aria-hidden="true" /></Link>
          <div className="cc-account"><span className="cc-account-avatar" aria-hidden="true">R</span><span><strong>{data.snapshot.profile?.displayName || 'Super admin'}</strong><small>{language === 'bn' ? 'প্রশাসক' : 'Administrator'}</small></span></div>
        </div>
      </aside>

      <div className="cc-workspace">
        <header className="cc-topbar">
          <button ref={menuButton} className="cc-icon-button cc-menu-trigger" type="button" aria-label={language === 'bn' ? 'মেনু খুলুন' : 'Open navigation'} onClick={() => menu.current?.showModal()}><Menu size={21} /></button>
          <Link href="/super-admin" className="cc-brand cc-mobile-brand"><span className="cc-brand-mark"><Droplet size={20} aria-hidden="true" /></span><span><strong>RoktoKorobi</strong></span></Link>
          <div className="cc-topbar-title"><span>{language === 'bn' ? 'সুপার অ্যাডমিন' : 'Super admin'}</span><strong>{currentPage?.label || section?.[language] || (language === 'bn' ? 'কর্মক্ষেত্র' : 'Workspace')}</strong></div>
          <div className="cc-topbar-actions">
            <span className={'cc-connection' + (data.state === 'ready' ? ' is-ready' : '')}><i aria-hidden="true" />{data.state === 'ready' ? (language === 'bn' ? 'লাইভ ডাটা' : 'Live data') : data.state === 'loading' ? (language === 'bn' ? 'লোড হচ্ছে' : 'Syncing') : (language === 'bn' ? 'ডাটা পাওয়া যাচ্ছে না' : 'Data unavailable')}</span>
            <button className="cc-language" type="button" onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} aria-label={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}>{language === 'en' ? 'বাংলা' : 'EN'}</button>
            {source.signOut && <button className="cc-icon-button" type="button" onClick={() => void signOut()} aria-label={language === 'bn' ? 'সাইন আউট' : 'Sign out'} title={language === 'bn' ? 'সাইন আউট' : 'Sign out'}><LogOut size={19} /></button>}
          </div>
        </header>

        <dialog ref={menu} className="cc-mobile-dialog" aria-label={language === 'bn' ? 'নেভিগেশন' : 'Navigation'} onClose={() => menuButton.current?.focus()} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
          <div className="cc-mobile-head"><strong>RoktoKorobi</strong><button className="cc-icon-button" type="button" aria-label={language === 'bn' ? 'মেনু বন্ধ করুন' : 'Close navigation'} onClick={closeMenu}><X size={21} /></button></div>
          <PrimaryNav pathname={pathname} language={language} onNavigate={closeMenu} />
          <Link href="/" className="cc-site-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>{language === 'bn' ? 'ওয়েবসাইট দেখুন' : 'View website'}<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </dialog>

        <main id="sa-main" className="sa-main cc-main" tabIndex={-1}>
          {accountError && <p className="cc-alert" role="alert">{accountError}</p>}
          {data.state === 'forbidden' ? <div className="cc-alert" role="alert">{language === 'bn' ? 'এই পৃষ্ঠায় প্রবেশের অনুমতি নেই।' : 'You do not have permission to view this page.'}</div> : children}
          <footer className="cc-footer"><span>RoktoKorobi · Built around people.</span><span>{language === 'bn' ? 'বাংলাদেশ সময়' : 'Bangladesh Standard Time'}</span></footer>
        </main>
        <div className="cc-bottom-tabs"><PrimaryNav pathname={pathname} language={language} tabs /></div>
      </div>
    </div>
  </AdminContext.Provider>;
}
