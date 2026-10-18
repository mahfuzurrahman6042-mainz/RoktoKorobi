export const sectionPages: Record<string, Array<{ href: string; label: string }>> = {
  '/super-admin': [
    { href: '/super-admin', label: 'Overview' },
    { href: '/super-admin/overview/activity', label: 'Activity log' },
  ],
  '/super-admin/people': [
    { href: '/super-admin/people', label: 'People overview' },
    { href: '/super-admin/people/users', label: 'User management' },
    { href: '/super-admin/people/admins', label: 'Admins and roles' },
  ],
  '/super-admin/operations': [
    { href: '/super-admin/operations', label: 'Requests overview' },
    { href: '/super-admin/operations/requests', label: 'Blood requests' },
  ],
  '/super-admin/partners': [
    { href: '/super-admin/partners', label: 'Partners overview' },
    { href: '/super-admin/partner-applications', label: 'Applications' },
    { href: '/super-admin/partner-control', label: 'Partner control' },
    { href: '/super-admin/partner-onboard', label: 'Activate partner' },
    { href: '/super-admin/partners/hospitals', label: 'Hospitals' },
  ],
  '/super-admin/content': [
    { href: '/super-admin/content', label: 'Content overview' },
    { href: '/super-admin/content/blog', label: 'Blog posts' },
    { href: '/super-admin/content/testimonials', label: 'Testimonials' },
  ],
  '/super-admin/settings': [
    { href: '/super-admin/settings', label: 'Settings overview' },
    { href: '/super-admin/settings/platform', label: 'Platform settings' },
    { href: '/super-admin/settings/roles', label: 'Roles' },
    { href: '/super-admin/settings/permissions', label: 'Permissions' },
  ],
};

export function activeSection(pathname: string): string | undefined {
  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/overview')) return '/super-admin';
  if (pathname.startsWith('/super-admin/partner-')) return '/super-admin/partners';
  return Object.keys(sectionPages).find(href => href !== '/super-admin' && (pathname === href || pathname.startsWith(href + '/')));
}
