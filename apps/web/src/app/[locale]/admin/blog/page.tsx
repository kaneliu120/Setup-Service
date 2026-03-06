'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Boxes, Shield, Loader2, PenLine, Trash2,
  ArrowLeft, Plus, Pencil, Eye, EyeOff, X, Globe,
} from 'lucide-react';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author: string;
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

const emptyForm = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: 'Kane',
  tags: '',
  is_published: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminBlog() {
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = `/${locale}/admin/login`;
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data.role !== 'admin') {
          window.location.href = `/${locale}/user`;
          return;
        }
        setAuthorized(true);

        const res = await api.get('/blog');
        setPosts(res.data);
      } catch {
        window.location.href = `/${locale}/admin/login`;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post.id);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image: post.cover_image || '',
      author: post.author,
      tags: post.tags?.join(', ') || '',
      is_published: post.is_published,
    });
    setShowForm(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(f => ({
      ...f,
      title,
      slug: editing ? f.slug : slugify(title),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) return;
    setSaving(true);

    const payload = {
      ...form,
      tags: form.tags
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editing) {
        const res = await api.put(`/blog/${editing}`, payload);
        setPosts(prev => prev.map(p => (p.id === editing ? res.data : p)));
      } else {
        const res = await api.post('/blog', payload);
        setPosts(prev => [...prev, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.patch(`/blog/${id}/toggle`);
      setPosts(prev => prev.map(p => (p.id === id ? res.data : p)));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await api.delete(`/blog/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="text-lg font-bold text-gray-900">
              MySkillStore
            </Link>
            <Badge className="bg-red-100 text-red-700 border-red-200 ml-2">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="rounded-lg gap-2" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              New Post
            </Button>
            <Link href={`/${locale}/admin`}>
              <Button variant="outline" size="sm" className="rounded-lg gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <PenLine className="w-7 h-7 text-amber-600" />
            Blog Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage blog posts for SEO and content marketing
          </p>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-16 text-center">
              <PenLine className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No blog posts yet</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Write First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Card key={post.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                        <Badge
                          variant="outline"
                          className={post.is_published
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                          }
                        >
                          {post.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="font-mono">/{post.slug}</span>
                        <span>{post.author}</span>
                        {post.published_at && (
                          <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {post.is_published && (
                        <Link href={`/${locale}/blog/${post.slug}`} target="_blank">
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Globe className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEdit(post)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => handleToggle(post.id)}
                      >
                        {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Blog Post' : 'New Blog Post'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Blog post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  placeholder="Short summary for SEO and listing cards"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML) *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={12}
                  placeholder="<h2>Introduction</h2><p>Write your blog post here...</p>"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={form.cover_image}
                    onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="AI, Setup, Guide"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg"
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.slug.trim() || !form.content.trim()}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
