'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, BarChart3, Building2, ClipboardCheck, Droplet, FileText, HeartHandshake, ImageIcon, Link2, MessageSquare, Network, Settings2, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { PageHeading } from './workspace-pages';

type SectionKey = 'people' | 'operations' | 'partners' | 'content' | 'settings';
type SectionCard = { label: string; description: string; href: string; icon: typeof Users };

const sections: Record<SectionKey, { eyebrow: string; title: string; description: string; cards: SectionCard[] }> = {
  people: { eyebrow: 'People & access', title: 'People', description: 'Manage the people who make the Roktokorobi network work.', cards: [
    { label: 'Users', description: 'Search users and review verification status.', href: '/super-admin/preview/users', icon: Users },
    { label: 'Donors', description: 'View the active donor network.', href: '/super-admin/preview/donors', icon: HeartHandshake },
    { label: 'Roles & permissions', description: 'Control administrative access.', href: '/admin/roles', icon: ShieldCheck },
  ] },
  operations: { eyebrow: 'Platform operations', title: 'Operations', description: 'Keep requests, activity, and reporting in one focused workspace.', cards: [
    { label: 'Blood requests', description: 'Review open, pending, and fulfilled requests.', href: '/super-admin/preview/requests', icon: Droplet },
    { label: 'Activity logs', description: 'Review recorded administrative activity.', href: '/super-admin/preview/activity', icon: Activity },
    { label: 'Reports', description: 'Review operational summaries.', href: '/super-admin/preview/reports', icon: BarChart3 },
  ] },
  partners: { eyebrow: 'Partner network', title: 'Partners', description: 'Coordinate institutions, applications, and referral activity.', cards: [
    { label: 'Partner control center', description: 'Manage institution status and referrals.', href: '/super-admin/partner-control', icon: ClipboardCheck },
    { label: 'Partner institutions', description: 'Review and manage partner applications.', href: '/super-admin/partner-institutes', icon: Building2 },
    { label: 'Activate new partner', description: 'Onboard an institution and generate a referral link.', href: '/super-admin/partner-onboard', icon: UserPlus },
    { label: 'Referral activity', description: 'Review partner referral records.', href: '/super-admin/preview/referrals', icon: Link2 },
  ] },
  content: { eyebrow: 'Content & network', title: 'Content', description: 'Manage the public-facing information that supports the network.', cards: [
    { label: 'Hospitals', description: 'Add, edit, search, and remove hospitals.', href: '/admin/hospitals', icon: Building2 },
    { label: 'Organizations', description: 'Manage registered organizations.', href: '/admin/organizations', icon: Network },
    { label: 'Testimonials', description: 'Review and manage public testimonials.', href: '/admin/testimonials', icon: MessageSquare },
    { label: 'Blog', description: 'Create, edit, publish, and unpublish posts.', href: '/admin/blogs', icon: FileText },
    { label: 'Illustrations', description: 'Organize illustration assets and decks.', href: '/admin/illustrations', icon: ImageIcon },
  ] },
  settings: { eyebrow: 'Administration', title: 'Administration', description: 'Configure access and review the system behind the platform.', cards: [
    { label: 'Settings', description: 'Manage platform configuration.', href: '/admin/settings', icon: Settings2 },
    { label: 'Roles', description: 'Create and manage admin roles.', href: '/admin/roles', icon: ShieldCheck },
    { label: 'Permissions', description: 'Review role permissions and page access.', href: '/admin/permissions', icon: ShieldCheck },
    { label: 'System health', description: 'Review Firebase and database status.', href: '/super-admin/preview/settings', icon: Activity },
  ] },
};

export function SuperAdminSection({ section }: { section: SectionKey }) {
  const content = sections[section];
  return <>
    <PageHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
    <section className="rr-feature-grid" aria-label={`${content.title} features`}>
      {content.cards.map(card => { const Icon = card.icon; return <Link className="rr-feature-card" href={card.href} key={card.href}><span className="rr-icon-tile"><Icon size={20} aria-hidden="true" /></span><span><strong>{card.label}</strong><small>{card.description}</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link>; })}
    </section>
  </>;
}
