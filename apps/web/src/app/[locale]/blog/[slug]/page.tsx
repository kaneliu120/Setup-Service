import api from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const BASE_URL = 'https://www.myskillstore.fun';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author: string;
  tags?: string[];
  published_at: string;
  created_at: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await api.get(`/blog/public/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const url = `${BASE_URL}/${locale}/blog/${slug}`;
  const title = `${post.title} | MySkillStore Blog`;
  const description = post.excerpt || post.title;

  return {
    title,
    description,
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'MySkillStore',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      publishedTime: post.published_at,
      authors: [post.author],
      images: post.cover_image
        ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.cover_image || '/og-image.png'],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en/blog/${slug}`,
        zh: `${BASE_URL}/zh/blog/${slug}`,
      },
    },
  };
}

function buildArticleJsonLd(post: BlogPost, locale: string) {
  const url = `${BASE_URL}/${locale}/blog/${post.slug}`;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_image || `${BASE_URL}/og-image.png`,
    datePublished: post.published_at,
    dateCreated: post.created_at,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'MySkillStore', url: BASE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return [article, breadcrumb];
}

/**
 * Blog post content renderer with XSS sanitization.
 * Content is admin-authored HTML from our own CMS, sanitized as defense-in-depth.
 */
function BlogContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const schemas = buildArticleJsonLd(post, locale);

  return (
    <>
      <JsonLd data={schemas} />
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <a href={`/${locale}`} className="text-slate-900 font-bold text-lg">
              MySkillStore
            </a>
            <nav className="flex gap-4 text-sm">
              <a href={`/${locale}/portfolio`} className="text-slate-500 hover:text-slate-900">Portfolio</a>
              <Link href={`/${locale}/blog`} className="text-indigo-600 font-semibold">Blog</Link>
            </nav>
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-5 py-10">
          {/* Back link */}
          <Link href={`/${locale}/blog`} className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
            &larr; Back to Blog
          </Link>

          {/* Cover image */}
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full rounded-2xl mb-6 object-cover max-h-[400px]"
            />
          )}

          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{post.title}</h1>

          <div className="flex items-center gap-3 text-sm text-slate-400 mb-6">
            <span>{post.author}</span>
            <span>&middot;</span>
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5 mb-8 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content — admin-authored HTML from our CMS database */}
          <BlogContent html={post.content} />
        </article>

        <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-100">
          &copy; {new Date().getFullYear()} MySkillStore. All rights reserved.
        </footer>
      </div>
    </>
  );
}
