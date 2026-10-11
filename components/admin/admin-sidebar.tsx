'use client';
import Link from 'next/link';
import { navigation } from './navigation';
import { ShieldCheck } from 'lucide-react';
export function AdminSidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <>
    <Link href="/super-admin" className="rr-brand" onClick={onNavigate} aria-label="Roktokorbi overview"><span className="rr-wordmark">Roktokorbi<span className="rr-brand-period">.</span></span><span className="rr-brand-sub">SUPER ADMIN</span></Link>
    <nav aria-label="Admin navigation" className="rr-navigation">{navigation.map(group => <div className="rr-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={pathname === item.href ? 'rr-nav-link rr-active' : 'rr-nav-link'} onClick={onNavigate}><item.icon aria-hidden="true" size={17} strokeWidth={1.65} /><span>{item.label}</span></Link>)}</div>)}</nav>
    <div className="rr-sidebar-foot"><ShieldCheck size={17} aria-hidden="true" /><div><strong>Super Admin workspace</strong><span>Local design preview</span></div></div>
  </>;
}
