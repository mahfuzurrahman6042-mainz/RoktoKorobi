import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { HtmlLang } from '@/components/HtmlLang';

export const metadata = {
  title: 'Roktokorobi - Blood Donation Platform',
  description: 'Connecting donors with recipients to save lives',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
