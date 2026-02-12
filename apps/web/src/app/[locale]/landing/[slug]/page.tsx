import api from '@/lib/api';
import LandingPageTemplate, { LandingPageData } from '@/components/landing/LandingPageTemplate';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getPageData(slug: string) {
  try {
    const res = await api.get(`/landing-pages/public/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;

  return {
    title: page.title,
    description: content.subheadline || 'Private AI Assistant Setup Service',
    openGraph: {
      title: page.title,
      description: content.subheadline,
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  const data = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;

  return <LandingPageTemplate data={{ ...data, slug }} />;
}
