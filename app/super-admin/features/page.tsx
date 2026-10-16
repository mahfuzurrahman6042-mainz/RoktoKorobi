'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, BarChart3, Building2, Droplet, FileText, HeartHandshake, ImageIcon, Link2, MessageSquare, Network, Settings2, ShieldCheck, Users } from 'lucide-react';

const features = [
  { label: 'Overview', description: 'Platform metrics, partner health, and recent activity.', href: '/super-admin', icon: BarChart3 },
  { label: 'Users', description: 'Search users and review verification status.', href: '/super-admin/preview/users', icon: Users },
  { label: 'Donors', description: 'View the active donor network.', href: '/super-admin/preview/donors', icon: HeartHandshake },
  { label: 'Blood requests', description: 'Review open, pending, and fulfilled requests.', href: '/super-admin/preview/requests', icon: Droplet },
  { label: 'Partner control center', description: 'Manage institution status and referrals.', href: '/super-admin/partner-control', icon: ShieldCheck },
  { label: 'Partner institutions', description: 'Review and manage partner applications.', href: '/super-admin/partner-institutes', icon: Building2 },
  { label: 'Activate new partner', description: 'Onboard an institution and generate a referral link.', href: '/super-admin/partner-onboard', icon: Network },
  { label: 'Referral activity', description: 'Review partner referral records.', href: '/super-admin/preview/referrals', icon: Link2 },
  { label: 'Hospitals', description: 'Add, edit, search, and remove hospitals.', href: '/admin/hospitals', icon: Building2 },
  { label: 'Organizations', description: 'Manage registered organizations.', href: '/admin/organizations', icon: Network },
  { label: 'Testimonials', description: 'Review and manage public testimonials.', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'Blog', description: 'Create, edit, publish, and unpublish posts.', href: '/admin/blogs', icon: FileText },
  { label: 'Illustrations', description: 'Organize illustration assets and decks.', href: '/admin/illustrations', icon: ImageIcon },
  { label: 'Activity logs', description: 'Review recorded administrative activity.', href: '/super-admin/preview/activity', icon: Activity },
  { label: 'Reports', description: 'Review operational summaries.', href: '/super-admin/preview/reports', icon: BarChart3 },
  { label: 'Settings', description: 'Open connected admin settings.', href: '/admin/settings', icon: Settings2 },
];

export default function SuperAdminFeaturesPage() {
  return <>
    <div className="rr-page-heading"><div><div className="rr-eyebrow">Super Admin workspace</div><h1>Feature center</h1><p>Every administration tool in one place. Choose a workspace to continue.</p></div></div>
    <section className="rr-feature-grid" aria-label="Super Admin features">
      {features.map(feature => { const Icon = feature.icon; return <Link className="rr-feature-card" href={feature.href} key={feature.href}><span className="rr-icon-tile"><Icon size={20} aria-hidden="true" /></span><span><strong>{feature.label}</strong><small>{feature.description}</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link>; })}
    </section>
  </>;
}
