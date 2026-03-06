import api from '@/lib/api';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://www.myskillstore.fun';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  author: string;
  tags?: string[];
  published_at: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await api.get('/blog/public');
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
  const title = 'Blog | MySkillStore AI Setup Service';
  const description = 'Tips, guides, and insights about AI setup, ChatGPT deployment, and automation for personal and enterprise use in the Philippines.';
  const url = `${BASE_URL}/${locale}/blog`;

  return {
    title,
    description,
    keywords: [
      'AI Setup Guide Philippines', 'ChatGPT Tips', 'AI Automation Blog',
      'Enterprise AI Guide', 'AI Installation Tutorial', 'AI for Business Philippines',
    ],
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'MySkillStore',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MySkillStore Blog' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
    alternates: {
      canonical: url,
      languages: { en: `${BASE_URL}/en/blog`, zh: `${BASE_URL}/zh/blog` },
    },
  };
}

function buildBlogJsonLd(locale: string) {
  const url = `${BASE_URL}/${locale}/blog`;

  const blog = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MySkillStore Blog',
    description: 'AI setup tips, guides, and enterprise automation insights.',
    url,
    publisher: { '@type': 'Organization', name: 'MySkillStore', url: BASE_URL },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: url },
    ],
  };

  return [blog, breadcrumb];
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getBlogPosts();
  const schemas = buildBlogJsonLd(locale);

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
              <a href={`/${locale}/portfolio`} className="text-slate-500 hover:text-slate-900">Portfolio</a>
              <a href={`/${locale}/blog`} className="text-indigo-600 font-semibold">Blog</a>
            </nav>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-5 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Blog</h1>
          <p className="text-slate-500 mb-8 text-sm">AI tips, guides, and insights</p>

          {!posts.length ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">Blog posts coming soon</p>
              <p className="text-sm mt-2">Stay tuned for AI tips and guides</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    {post.cover_image && (
                      <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1">
                      <h2 className="font-semibold text-slate-900 text-base mb-1">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{post.author}</span>
                        <span>&middot;</span>
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-100">
          &copy; {new Date().getFullYear()} MySkillStore. All rights reserved.
        </footer>
      </div>
    </>
  );
}
