'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Info, X } from 'lucide-react';
import { useAdminData } from '@/hooks/use-admin-data';
import { unconnectedSource } from '@/lib/admin/data-source';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { navigation } from './navigation';
import { PermissionDenied } from './states';
import type { AdminDataSource } from '@/lib/admin/types';

type AdminContextValue = ReturnType<typeof useAdminData> & { refreshPartnerStatistics?: () => Promise<void> };
const AdminContext = createContext<AdminContextValue | null>(null);
export function useAdmin() { const value = useContext(AdminContext); if (!value) throw new Error('Admin components require AdminLayout'); return value; }

export function AdminLayout({ children, source = unconnectedSource }: { children: ReactNode; source?: AdminDataSource }) {
  const pathname = usePathname();
  const title = navigation.flatMap(group => group.items).find(item => item.href === pathname)?.label ?? 'Dashboard';
  const data = useAdminData(source);
  const [accountError, setAccountError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);
  const closeMenu = () => { dialog.current?.close(); setMenuOpen(false); };
  return <AdminContext.Provider value={{ ...data, refreshPartnerStatistics: source.refreshPartnerStatistics }}><div className="rr-root">
    <a className="rr-skip" href="#rr-main">Skip to main content</a>
    <aside className="rr-sidebar"><AdminSidebar pathname={pathname} /></aside>
    <dialog ref={dialog} className="rr-mobile-dialog" id="rr-mobile-navigation" aria-label="Admin navigation" onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}><button className="rr-icon-button rr-close-menu" aria-label="Close navigation" onClick={closeMenu}><X size={20} /></button><AdminSidebar pathname={pathname} onNavigate={closeMenu} /></dialog>
    <div className="rr-workspace"><AdminHeader title={title} profile={data.snapshot.profile} onMenu={() => { dialog.current?.showModal(); setMenuOpen(true); }} onSignOut={source.signOut ? () => { void source.signOut!().catch(() => setAccountError('Unable to sign out. Please try again.')); } : undefined} />
      <main id="rr-main" className="rr-main" tabIndex={-1}>{source === unconnectedSource && <div className="rr-connection-note" role="status"><Info size={16} aria-hidden="true" /><span><strong>Design preview.</strong> Live data and account actions are not connected.</span></div>}{accountError && <p role="alert">{accountError}</p>}{data.state === 'forbidden' ? <PermissionDenied /> : children}<footer className="rr-footer"><span>Roktokorbi</span><span>Built around people. Designed for care.</span></footer></main>
    </div>
  </div></AdminContext.Provider>;
}
