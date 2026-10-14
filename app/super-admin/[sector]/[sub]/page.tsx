import { notFound } from 'next/navigation';
import { getSector, getSubpage } from '@/components/admin/navigation';
import { NotBuiltPage } from '@/components/admin/sector-pages';
export default async function Subpage({ params }: { params: Promise<{ sector: string; sub: string }> }) { const { sector: sectorSlug, sub: subSlug } = await params; const sector = getSector(sectorSlug); if (!sector || !getSubpage(sector, subSlug)) notFound(); return <NotBuiltPage sectorSlug={sectorSlug} subSlug={subSlug} />; }
