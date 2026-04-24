'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navigation() {
  const { language } = useLanguage();

  const content = {
    en: {
      donate: 'Donate',
      request: 'Request Blood',
      find: 'Find Donors',
      blogs: 'Blogs',
      chitrokothon: 'Chitrokothon',
      join: 'Join Now'
    },
    bn: {
      donate: 'রক্ত দিন',
      request: 'রক্ত চাই',
      find: 'দাতা খুঁজুন',
      blogs: 'ব্লগ',
      chitrokothon: 'চিত্রকথন',
      join: 'যোগ দিন'
    }
  };

  const c = language === 'bn' ? content.bn : content.en;

  return (
    <nav>
      <a className="nav-logo" href="/">
        <svg viewBox="0 0 32 32" fill="none" style={{ width: '28px', height: '28px' }}>
          <path d="M16 4 C16 4 6 14 6 20 A10 10 0 0 0 26 20 C26 14 16 4 16 4Z" fill="#E02020"/>
        </svg>
        {language === 'bn' ? 'রক্তকরবী' : 'RoktoKorobi'}
      </a>
      <ul className="nav-links">
        <li><Link href="/register">{c.donate}</Link></li>
        <li><Link href="/request">{c.request}</Link></li>
        <li><Link href="/donors">{c.find}</Link></li>
        <li><Link href="/blog">{c.blogs}</Link></li>
        <li><Link href="/illustrations">{c.chitrokothon}</Link></li>
        <li><Link href="/register" className="nav-cta">{c.join}</Link></li>
      </ul>
    </nav>
  );
}
