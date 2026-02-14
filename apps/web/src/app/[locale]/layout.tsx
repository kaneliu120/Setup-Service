import GoogleAnalytics from '@/components/GoogleAnalytics';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Metadata } from 'next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | MySkillStore - Private AI Assistant Setup',
    default: 'MySkillStore | Private AI Assistant Setup Service Manila',
  },
  description: 'Turn your PC into a real-life JARVIS. High-end private AI assistant setup service in Manila. Productivity weapons for tech leaders.',
  keywords: ['AI Assistant', 'OpenClaw', 'Private AI', 'Manila AI Service', 'AI助理', '私有化AI', 'OpenClaw安装'],
  authors: [{ name: 'Kane Liu' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myskillstore.fun',
    siteName: 'MySkillStore',
    title: 'MySkillStore | Private AI Assistant Setup Service',
    description: 'Transform your idle computer into a high-end private AI assistant. Available in Manila.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MySkillStore AI Assistant Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MySkillStore | Private AI Assistant Setup Service',
    description: 'Turn your PC into a real-life JARVIS.',
    images: ['/og-image.png'],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'zh')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <GoogleAnalytics gaId="G-J08TY14FSJ" />
      </head>
      <body className="antialiased">
        <GoogleAnalytics gaId="G-J08TY14FSJ" />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
