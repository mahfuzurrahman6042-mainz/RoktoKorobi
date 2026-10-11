'use client';

import { useParams } from 'next/navigation';
import { PreviewPage } from '@/components/admin/workspace-pages';

export default function SuperAdminPreview() {
  const params = useParams<{ section: string }>();
  return <PreviewPage section={params.section} />;
}
