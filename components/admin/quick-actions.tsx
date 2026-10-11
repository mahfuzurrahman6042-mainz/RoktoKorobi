import Link from 'next/link';
import { ArrowUpRight, Users, Droplet, Building, Network, FileText, Activity } from 'lucide-react';
export function QuickActions() {
  const actions = [
    { label: 'Manage users', href: '/super-admin/preview/users', icon: Users },
    { label: 'View blood requests', href: '/super-admin/preview/requests', icon: Droplet },
    { label: 'Manage hospitals', href: '/super-admin/preview/hospitals', icon: Building },
    { label: 'Manage organizations', href: '/super-admin/preview/organizations', icon: Network },
    { label: 'Manage content', href: '/super-admin/preview/blog', icon: FileText },
    { label: 'Open activity logs', href: '/super-admin/preview/activity', icon: Activity },
  ];
  return <section className="rr-panel rr-quick" aria-labelledby="quick-heading"><div className="rr-panel-heading"><div><h2 id="quick-heading">Quick access</h2><p>Frequently used workspaces</p></div></div><div className="rr-quick-links">{actions.map(action => <Link key={action.label} href={action.href}><action.icon size={17} aria-hidden="true" /><span>{action.label}</span><ArrowUpRight size={15} aria-hidden="true" /></Link>)}</div></section>;
}
