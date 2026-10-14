import { notFound } from 'next/navigation';
import { getSector } from '@/components/admin/navigation';
import { SectorLanding } from '@/components/admin/sector-pages';
export default async function SectorPage({ params }: { params: Promise<{ sector: string }> }) { const { sector } = await params; if (!getSector(sector) || sector === 'overview') notFound(); return <SectorLanding slug={sector} />; }
