import type { Metadata } from 'next';
import { Tiro_Bangla, DM_Sans, DM_Serif_Display, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Footer from '@/components/Footer';
import EmergencyActions from '@/components/EmergencyActions';
// import Onboarding from '@/components/Onboarding';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OneSignalInit from '@/components/OneSignalInit';
import ErrorBoundary from '@/components/ErrorBoundary';

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${tiroBangla.variable} ${dmSans.variable} ${dmSerif.variable} ${hindSiliguri.variable} overflow-x-hidden`}>
        <LanguageProvider>
          <ErrorBoundary>
            <div id="cursor-ring"></div>
            <div id="cursor-dot"></div>
            <div className="min-h-screen w-full">
              {children}
            </div>
            <Footer />
            <EmergencyActions />
            {/* <Onboarding /> */}
            <PWAInstallPrompt />
            <OneSignalInit />
          </ErrorBoundary>
        </LanguageProvider>
      </body>
    </html>
  );
}
