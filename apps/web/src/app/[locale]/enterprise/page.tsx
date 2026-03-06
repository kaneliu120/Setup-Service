import api from '@/lib/api';
import EnterpriseTemplate, { EnterprisePageData } from '@/components/enterprise/EnterpriseTemplate';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const ENTERPRISE_SLUG = 'enterprise-deploy';
const BASE_URL = 'https://www.myskillstore.fun';

async function getPageData() {
  try {
    const res = await api.get(`/landing-pages/public/${ENTERPRISE_SLUG}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageData();

  const fallbackTitle = 'Enterprise AI Deployment Manila | Custom AI System Integration';
  const fallbackDescription = 'Professional enterprise AI deployment and system integration service in Manila, Philippines. Custom AI solutions, private AI infrastructure, and business process automation for corporations.';

  if (!page) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;
  const title = page.title || (Array.isArray(content.header_title) ? content.header_title[0] : content.header_title) || fallbackTitle;
  const description = (Array.isArray(content.why_deploy_description)
    ? content.why_deploy_description[0]
    : content.why_deploy_description) || fallbackDescription;
  const url = `${BASE_URL}/${locale}/enterprise`;

  return {
    title,
    description,
    keywords: [
      'Enterprise AI Deployment', 'AI System Integration Manila', 'Corporate AI Setup Philippines',
      'Business AI Automation', 'Private AI Infrastructure', 'On-premise AI Installation',
      'Custom AI Workflow', 'AI Digital Transformation Philippines',
      'Enterprise ChatGPT Deployment Manila', 'Corporate AI Agent Installation',
      'Business AI Automation Metro Manila', 'AI System Deployment Philippine Companies',
      'AI Deployment Service', 'Enterprise AI Solutions', 'Business Process Automation AI',
      'Custom AI Solution Manila', 'AI Infrastructure Setup', 'Private AI Deployment',
      'AI Workflow Automation', 'Corporate AI Integration',
      '企业AI部署', 'AI系统集成', '企业AI解决方案', '商业AI自动化',
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
          alt: 'MySkillStore Enterprise AI Deployment Service',
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
        en: `${BASE_URL}/en/enterprise`,
        zh: `${BASE_URL}/zh/enterprise`,
      },
    },
  };
}

function buildEnterpriseJsonLd(locale: string) {
  const url = `${BASE_URL}/${locale}/enterprise`;

  const professionalService = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'MySkillStore - Enterprise AI Deployment',
    description: 'Enterprise-grade AI deployment, system integration, and custom AI solutions for businesses in Manila, Philippines.',
    url,
    email: 'admin@myskillstore.com',
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
      { '@type': 'Country', name: 'Philippines' },
    ],
    priceRange: '₱15,000 - ₱200,000+',
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Enterprise AI Deployment Service',
    serviceType: 'Enterprise AI System Integration and Deployment',
    provider: { '@type': 'ProfessionalService', name: 'MySkillStore' },
    areaServed: { '@type': 'Country', name: 'Philippines' },
    description: 'End-to-end enterprise AI deployment including private AI infrastructure setup, custom workflow automation, and corporate AI agent installation.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Enterprise AI Deployment Plans',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Starter',
          description: 'Basic enterprise AI setup for small teams',
          price: '15000',
          priceCurrency: 'PHP',
        },
        {
          '@type': 'Offer',
          name: 'Standard',
          description: 'Full enterprise AI deployment with custom integrations',
          price: '50000',
          priceCurrency: 'PHP',
        },
        {
          '@type': 'Offer',
          name: 'Premium',
          description: 'Complete enterprise AI transformation with dedicated support',
          price: '200000',
          priceCurrency: 'PHP',
        },
      ],
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Enterprise AI Deployment', item: url },
    ],
  };

  return [professionalService, service, breadcrumb];
}

export default async function EnterprisePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getPageData();

  if (!page) {
    notFound();
  }

  const data: EnterprisePageData = typeof page.content === 'string'
    ? JSON.parse(page.content)
    : page.content;

  const schemas = buildEnterpriseJsonLd(locale);

  return (
    <>
      <JsonLd data={schemas} />
      <EnterpriseTemplate data={{ ...data, slug: ENTERPRISE_SLUG }} locale={locale} />
    </>
  );
}
