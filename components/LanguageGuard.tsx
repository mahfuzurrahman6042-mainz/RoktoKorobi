'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('roktokorobi-language');
    if (!savedLanguage && window.location.pathname !== '/language') {
      router.push('/language');
    }
  }, [router]);

  return <>{children}</>;
}
