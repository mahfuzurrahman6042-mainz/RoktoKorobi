import type { Metadata } from 'next';
import { Fraunces, DM_Sans, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguageGuard from '@/components/LanguageGuard';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  variable: '--font-body-bn',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RoktoKorobi - Blood Donation',
  description: 'Connect blood donors with those in need. Save lives by donating blood.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable} ${hindSiliguri.variable}`}>
        <LanguageProvider>
          <LanguageGuard>
            {children}
          </LanguageGuard>
        </LanguageProvider>
      </body>
    </html>
  );
}
