import api from '@/lib/api';
import PersonalLandingTemplate, { PersonalPageData } from '@/components/landing/PersonalLandingTemplate';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://www.myskillstore.fun';

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
  const { locale, slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;
  const description = content.hero_sub || content.subheadline || 'Professional AI assistant setup service in Manila. ChatGPT, Gemini & private AI installation starting at ₱5,000.';
  const title = page.title || 'AI Assistant Setup Manila ₱5,000 | Private AI Installation Service';
  const url = `${BASE_URL}/${locale}/landing/${slug}`;

  return {
    title,
    description,
    keywords: [
      'AI Assistant Setup Manila', 'ChatGPT Installation', 'Private AI Setup',
      'AI Secretary Manila', 'Gemini Setup Philippines', 'AI Installation Service',
      'AI Setup ₱5000', 'AI Configuration Manila', 'Private AI Assistant Setup',
      'Enterprise AI Deployment', 'Custom AI Solution', 'Business AI Automation Manila',
      'Corporate AI Setup Philippines', 'AI System Integration',
      'AI助理安装', '私有化AI设置', '马尼拉AI服务',
    ],
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'MySkillStore',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'MySkillStore AI Assistant Setup Service Manila',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en/landing/${slug}`,
        zh: `${BASE_URL}/zh/landing/${slug}`,
      },
    },
  };
}

function buildPersonalJsonLd(data: PersonalPageData, locale: string, slug: string) {
  const url = `${BASE_URL}/${locale}/landing/${slug}`;

  const professionalService = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'MySkillStore - AI Assistant Setup Service',
    description: 'Professional private AI assistant setup and configuration service in Manila, Philippines. Enterprise AI deployment available.',
    url,
    telephone: data.phone || '+63-XXX-XXX-XXXX',
    email: data.email || 'admin@myskillstore.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manila',
      addressRegion: 'Metro Manila',
      addressCountry: 'PH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '14.5995',
      longitude: '120.9842',
    },
    areaServed: [
      { '@type': 'City', name: 'Manila' },
      { '@type': 'City', name: 'Makati' },
      { '@type': 'City', name: 'BGC' },
      { '@type': 'AdministrativeArea', name: 'Metro Manila' },
    ],
    priceRange: '₱5,000 - ₱50,000',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Private AI Assistant Setup',
    serviceType: 'AI Installation and Configuration',
    provider: { '@type': 'ProfessionalService', name: 'MySkillStore' },
    areaServed: { '@type': 'AdministrativeArea', name: 'Metro Manila, Philippines' },
    description: 'Turn your PC into a high-end private AI assistant. Professional setup of ChatGPT, Gemini, and other AI tools.',
    offers: {
      '@type': 'Offer',
      price: '5000',
      priceCurrency: 'PHP',
      availability: 'https://schema.org/InStock',
      validFrom: '2024-01-01',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'AI Setup Services', item: `${BASE_URL}/${locale}/landing/${slug}` },
    ],
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kane Liu',
    jobTitle: 'AI Solutions Architect',
    description: 'Expert in private AI assistant deployment, enterprise AI system integration, and custom AI solutions for businesses in Manila, Philippines.',
    knowsAbout: [
      'Artificial Intelligence', 'ChatGPT', 'Gemini AI', 'Private AI Deployment',
      'Enterprise AI Systems', 'AI Automation', 'Machine Learning', 'AI Infrastructure',
    ],
    worksFor: { '@type': 'Organization', name: 'MySkillStore' },
  };

  const schemas = [professionalService, service, breadcrumb, person];

  // Add FAQ schema if page has FAQ data
  if (data.faq && data.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map((item: any) => ({
        '@type': 'Question',
        name: item.q || item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a || item.answer,
        },
      })),
    } as any);
  }

  return schemas;
}

export default async function LandingPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  const data: PersonalPageData = typeof page.content === 'string'
    ? JSON.parse(page.content)
    : page.content;

  const schemas = buildPersonalJsonLd(data, locale, slug);

  return (
    <>
      <JsonLd data={schemas} />
      <PersonalLandingTemplate data={{ ...data, slug }} locale={locale} />
    </>
  );
}
