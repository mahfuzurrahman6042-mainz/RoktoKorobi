'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Circle, Clock3 } from 'lucide-react';
import { getSector } from './navigation';
import { useAdmin } from './admin-layout';
import { formatCount } from '@/lib/admin/helpers';
import type { Language } from './navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const statusText: Record<Language, Record<string, string>> = { en: { live: 'Live', building: 'In progress', planned: 'Planned' }, bn: { live: 'চালু', building: 'নির্মাণাধীন', planned: 'পরিকল্পিত' } };

export function SectorLanding({ slug }: { slug: string }) {
  const { language } = useLanguage();
  const { snapshot, state } = useAdmin();
  const sector = getSector(slug);
  if (!sector) return null;
  return <div className="sa-sector-page"><div className="sa-page-heading"><p className="sa-eyebrow">{language === 'bn' ? 'সেক্টর' : 'Sector'}</p><h1>{sector.title[language]}</h1><p>{sector.summary[language]}</p></div><div className="sa-stats">{sector.stats.map(key => <div className="sa-stat" key={key}><strong>{state === 'loading' ? '–' : formatCount(snapshot.metrics[key])}</strong><span>{key === 'users' ? (language === 'bn' ? 'ব্যবহারকারী' : 'Users') : key === 'requests' ? (language === 'bn' ? 'অনুরোধ' : 'Requests') : key === 'partners' ? (language === 'bn' ? 'অংশীদার' : 'Partners') : key === 'donors' ? (language === 'bn' ? 'রক্তদাতা' : 'Donors') : key === 'hospitals' ? (language === 'bn' ? 'হাসপাতাল' : 'Hospitals') : key === 'blogs' ? (language === 'bn' ? 'ব্লগ পোস্ট' : 'Blog posts') : key === 'testimonials' ? (language === 'bn' ? 'অভিজ্ঞতা' : 'Testimonials') : key === 'pendingRequests' ? (language === 'bn' ? 'অপেক্ষমাণ অনুরোধ' : 'Pending requests') : key === 'fulfilledRequests' ? (language === 'bn' ? 'সম্পন্ন অনুরোধ' : 'Fulfilled requests') : (language === 'bn' ? 'যাচাইকৃত' : 'Verified')}</span></div>)}</div><section className="sa-subpages" aria-label={language === 'bn' ? 'সাবপেজ' : 'Sub-pages'}>{sector.subpages.map(page => { const Icon = page.status === 'live' ? CheckCircle2 : page.status === 'building' ? Clock3 : Circle; return <Link key={page.slug} className="sa-subpage" href={`/super-admin/${sector.slug}/${page.slug}`}><span className="sa-icon-tile"><Icon size={18} aria-hidden="true" /></span><span className="sa-subpage-text"><strong>{page.title[language]}</strong><small>{page.description[language]}</small></span><span className={`sa-status sa-status-${page.status}`}><i />{statusText[language][page.status]}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>; })}</section></div>;
}

export function NotBuiltPage({ sectorSlug, subSlug }: { sectorSlug: string; subSlug: string }) {
  const { language } = useLanguage();
  const sector = getSector(sectorSlug);
  const subpage = sector?.subpages.find(item => item.slug === subSlug);
  if (!sector || !subpage) return null;
  return <div className="sa-page-heading"><p className="sa-eyebrow"><Link href={`/super-admin/${sector.slug}`}>{sector.title[language]}</Link> / {subpage.title[language]}</p><h1>{subpage.title[language]}</h1><p>{language === 'bn' ? 'এই পেজটি এখনও তৈরি হয়নি।' : 'This page is not built yet.'}</p><Link className="sa-button" href={`/super-admin/${sector.slug}`}>{language === 'bn' ? 'সেক্টরে ফিরে যান' : 'Back to sector'}</Link></div>;
}
