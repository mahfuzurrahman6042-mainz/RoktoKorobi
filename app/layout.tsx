import type { Metadata } from 'next';
import { Tiro_Bangla, DM_Sans, DM_Serif_Display, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Footer from '@/components/Footer';
import EmergencyActions from '@/components/EmergencyActions';
import Onboarding from '@/components/Onboarding';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OneSignalInit from '@/components/OneSignalInit';

const tiroBangla = Tiro_Bangla({
  subsets: ['bengali', 'latin'],
  variable: '--font-display',
  weight: ['400'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400'],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  variable: '--font-body',
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
      <head>
      </head>
      <body className={`${tiroBangla.variable} ${dmSans.variable} ${dmSerif.variable} ${hindSiliguri.variable}`}>
        <LanguageProvider>
          <div id="cursor-ring"></div>
          <div id="cursor-dot"></div>
          {children}
          <Footer />
          <EmergencyActions />
          <Onboarding />
          <PWAInstallPrompt />
          <OneSignalInit />
        </LanguageProvider>
      </body>
    </html>
  );
}
