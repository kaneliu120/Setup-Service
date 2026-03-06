'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Boxes, Shield, Loader2, Plus, Eye, EyeOff, Pencil, Trash2,
  FileText, ExternalLink, ArrowLeft
} from 'lucide-react';

interface LandingPageItem {
  id: number;
  slug: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminLandingPages() {
  const locale = useLocale();
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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

        const res = await api.get('/landing-pages');
        setPages(res.data);
      } catch {
        window.location.href = `/${locale}/admin/login`;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  const handleToggle = async (id: number) => {
    try {
      const res = await api.patch(`/landing-pages/${id}/toggle`);
      setPages(prev => prev.map(p => p.id === id ? { ...p, is_active: res.data.is_active } : p));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return;
    try {
      await api.delete(`/landing-pages/${id}`);
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
          <Link href={`/${locale}/admin`}>
            <Button variant="outline" size="sm" className="rounded-lg gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-purple-600" />
              Landing Pages
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage landing pages with different content variants</p>
          </div>
          <Link href={`/${locale}/admin/landing-pages/editor`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-lg">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Pages List */}
        {pages.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No landing pages yet.</p>
              <Link href={`/${locale}/admin/landing-pages/editor`}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-lg">
                  <Plus className="w-4 h-4" />
                  Create Your First Landing Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pages.map(page => (
              <Card key={page.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{page.title}</h3>
                        <Badge
                          variant="outline"
                          className={page.is_active
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                          }
                        >
                          {page.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/landing/{page.slug}</code></span>
                        <span>Updated: {new Date(page.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg gap-1.5 ${page.is_active
                          ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                        onClick={() => handleToggle(page.id)}
                      >
                        {page.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {page.is_active ? 'Visible' : 'Hidden'}
                      </Button>

                      <Link href={`/${locale}/landing/${page.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
                          <ExternalLink className="w-4 h-4" />
                          Preview
                        </Button>
                      </Link>

                      <Link href={`/${locale}/admin/landing-pages/editor?id=${page.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(page.id)}
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
    </div>
  );
}
