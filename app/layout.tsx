import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguageGuard from '@/components/LanguageGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoktoKorobi - Blood Donation',
  description: 'Connect blood donors with those in need. Save lives by donating blood.',
  manifest: '/manifest.json',
  themeColor: '#e53935',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RoktoKorobi',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e53935" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RoktoKorobi" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <LanguageGuard>
            {children}
          </LanguageGuard>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').then((registration) => console.log('Service Worker registered'), (error) => console.log('Service Worker registration failed', error)); }`,
          }}
        />
      </body>
    </html>
  );
}
