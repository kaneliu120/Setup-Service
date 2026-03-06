import api from '@/lib/api';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';

const BASE_URL = 'https://www.myskillstore.fun';

async function getPortfolioItems() {
  try {
    const res = await api.get('/portfolio/public');
    return res.data;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = 'Portfolio | MySkillStore AI Setup Service';
  const description = 'Browse our portfolio of AI setup projects, automation workflows, and custom AI integrations delivered to clients in Manila, Philippines.';
  const url = `${BASE_URL}/${locale}/portfolio`;

  return {
    title,
    description,
    keywords: [
      'AI Setup Portfolio', 'AI Project Examples Manila', 'AI Automation Portfolio',
      'ChatGPT Integration Examples', 'AI Workflow Showcase', 'Custom AI Projects Philippines',
    ],
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'MySkillStore',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MySkillStore Portfolio' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
    alternates: {
      canonical: url,
      languages: { en: `${BASE_URL}/en/portfolio`, zh: `${BASE_URL}/zh/portfolio` },
    },
  };
}

function buildPortfolioJsonLd(locale: string) {
  const url = `${BASE_URL}/${locale}/portfolio`;

  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portfolio | MySkillStore',
    description: 'AI setup and automation project portfolio showcasing work delivered in Manila, Philippines.',
    url,
    isPartOf: { '@type': 'WebSite', name: 'MySkillStore', url: BASE_URL },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Portfolio', item: url },
    ],
  };

  return [collectionPage, breadcrumb];
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const items = await getPortfolioItems();
  const schemas = buildPortfolioJsonLd(locale);

  return (
    <>
      <JsonLd data={schemas} />
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <a href={`/${locale}`} className="text-slate-900 font-bold text-lg">
              MySkillStore
            </a>
            <nav className="flex gap-4 text-sm">
              <a href={`/${locale}/portfolio`} className="text-indigo-600 font-semibold">Portfolio</a>
              <a href={`/${locale}/blog`} className="text-slate-500 hover:text-slate-900">Blog</a>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Portfolio</h1>
          <p className="text-slate-500 mb-8 text-sm">Our recent AI setup and automation projects</p>
          <PortfolioGrid items={items} />
        </main>

        <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-100">
          &copy; {new Date().getFullYear()} MySkillStore. All rights reserved.
        </footer>
      </div>
    </>
  );
}
