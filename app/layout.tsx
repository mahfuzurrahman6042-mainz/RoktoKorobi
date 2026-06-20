import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { HtmlLang } from '@/components/HtmlLang';

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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="icon" href="/roktokorobi-logo.png" />
      </head>
      <body>
        <LanguageProvider>
          <HtmlLang />
          {children}
        </LanguageProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
