import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { HtmlLang } from '@/components/HtmlLang';
import { localCountryTesting } from '@/lib/countries';

export const metadata = {
  title: 'Roktokorobi - Blood Donation Platform',
  description: 'Connecting donors with recipients to save lives',
  icons: {
    icon: '/roktokorobi-logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: 'yes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body>
        <LanguageProvider>
          <HtmlLang />
          {children}
          {localCountryTesting() && <aside style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 10000, background: '#2A1A14', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 13 }}><a href="/local-testing" style={{ color: '#fff' }}>Local test · Demo data only · Test accounts</a></aside>}
        </LanguageProvider>
      </body>
      {!localCountryTesting() && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      {!localCountryTesting() && <Analytics />}
    </html>
  );
}
