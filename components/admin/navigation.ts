import { LayoutDashboard, Users, Droplet, HeartHandshake, Building2, UserPlus, Link2, Building, Network, MessageSquare, FileText, ImageIcon, Activity, BarChart3, Settings2, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
export interface NavItem { label: string; href: string; icon: LucideIcon }
// Only routes supplied by the user are treated as known. Other views live in an
// explicit preview namespace and must be mapped to existing routes on integration.
export const navigation: { label: string; items: NavItem[] }[] = [
  { label: 'Platform', items: [
    { label: 'Overview', href: '/super-admin', icon: LayoutDashboard },
    { label: 'Users', href: '/super-admin/preview/users', icon: Users },
    { label: 'Blood requests', href: '/super-admin/preview/requests', icon: Droplet },
    { label: 'Donors', href: '/super-admin/preview/donors', icon: HeartHandshake },
  ] },
  { label: 'Partner operations', items: [
    { label: 'Partner control center', href: '/super-admin/partner-control', icon: SlidersHorizontal },
    { label: 'Partner institutions', href: '/super-admin/partner-institutes', icon: Building2 },
    { label: 'Activate new partner', href: '/super-admin/partner-onboard', icon: UserPlus },
    { label: 'Referral activity', href: '/super-admin/preview/referrals', icon: Link2 },
  ] },
  { label: 'Content & network', items: [
    { label: 'Hospitals', href: '/super-admin/preview/hospitals', icon: Building },
    { label: 'Organizations', href: '/super-admin/preview/organizations', icon: Network },
    { label: 'Testimonials', href: '/super-admin/preview/testimonials', icon: MessageSquare },
    { label: 'Blog', href: '/super-admin/preview/blog', icon: FileText },
    { label: 'Illustrations', href: '/super-admin/preview/illustrations', icon: ImageIcon },
  ] },
  { label: 'Administration', items: [
    { label: 'Activity logs', href: '/super-admin/preview/activity', icon: Activity },
    { label: 'Reports', href: '/super-admin/preview/reports', icon: BarChart3 },
    { label: 'Settings', href: '/super-admin/preview/settings', icon: Settings2 },
  ] },
];
