'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('roktokorobi-language');
    // Allow register and login pages without language selection
    const publicPaths = ['/language', '/register', '/login'];
    if (!savedLanguage && !publicPaths.includes(window.location.pathname)) {
      router.push('/language');
    }
  }, [router]);

  return <>{children}</>;
}
