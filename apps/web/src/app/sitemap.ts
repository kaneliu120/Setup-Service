import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.myskillstore.fun';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const locales = ['en', 'zh'];

interface BlogSitemapPost {
  slug: string;
  published_at?: string;
}

async function getPublishedSlugs(): Promise<BlogSitemapPost[]> {
  try {
    const res = await fetch(`${API_URL}/blog/public`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/landing/manila', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/landing/manila-v2', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/enterprise', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/portfolio', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}${page.path}`;
      entries.push({
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
          ),
        },
      });
    }
  }

  // Dynamic blog post entries
  const posts = await getPublishedSlugs();
  for (const post of posts) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.published_at || now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/blog/${post.slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
