import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Metadata, Viewport } from 'next';
import TrackingScripts from '@/components/tracking';
import '../globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    template: '%s | MySkillStore - Private AI Assistant Setup',
    default: 'MySkillStore | Private AI Assistant Setup Service Manila',
  },
  description: 'Turn your PC into a real-life JARVIS. High-end private AI assistant setup service in Manila. Enterprise AI deployment, custom AI system integration, and business AI automation for tech leaders in the Philippines.',
  keywords: [
    // Personal AI setup
    'AI Assistant', 'Private AI', 'AI Setup Manila', 'ChatGPT Setup', 'AI Installation Manila',
    'AI Secretary', 'Gemini Setup', 'AI Assistant Setup Philippines', 'Private AI Assistant',
    'AI Configuration Service', 'Local AI Setup', 'On-premise AI Installation',
    // Enterprise AI deployment
    'Enterprise AI Deployment', 'AI System Integration', 'Business AI Automation',
    'Corporate AI Setup', 'AI Workflow Automation Philippines', 'Private AI Deployment',
    'Custom AI Solution Manila', 'Enterprise ChatGPT Deployment',
    'Corporate AI Agent Installation', 'Business AI Automation Metro Manila',
    'AI Digital Transformation Philippines', 'AI Infrastructure Setup',
    'Business Process Automation AI', 'On-premise AI Enterprise',
    // Chinese keywords
    'AI助理', '私有化AI', 'AI部署', '企业AI系统', 'AI安装服务',
    '企业AI部署', '定制AI解决方案', 'AI系统集成',
  ],
  authors: [{ name: 'Kane Liu' }],
  verification: {
    google: 'y4clHFnAEKeTeC2rqUnusAWU2_a8mhBzpFlRi_O4ync',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  openGraph: {
    type: 'website',
    url: 'https://www.myskillstore.fun',
    siteName: 'MySkillStore',
    title: 'MySkillStore | Private AI Assistant & Enterprise AI Deployment Service',
    description: 'Transform your idle computer into a high-end private AI assistant. Enterprise AI system deployment and integration available in Manila, Philippines.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MySkillStore AI Assistant & Enterprise Deployment Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MySkillStore | AI Assistant Setup & Enterprise Deployment',
    description: 'Turn your PC into a real-life JARVIS. Enterprise AI deployment for Philippine businesses.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.myskillstore.fun',
    languages: {
      en: 'https://www.myskillstore.fun/en',
      zh: 'https://www.myskillstore.fun/zh',
    },
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
      <body className="antialiased">
        <TrackingScripts />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
