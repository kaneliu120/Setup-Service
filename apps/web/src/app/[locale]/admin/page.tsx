'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Boxes, Shield, Loader2, FileText, LogOut, CalendarCheck } from 'lucide-react';

export default function AdminDashboard() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = `/${locale}/admin/login`;
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data.role !== 'admin') {
          window.location.href = `/${locale}/admin/login`;
          return;
        }
        setUserEmail(res.data.email);
        setAuthorized(true);
      } catch {
        window.location.href = `/${locale}/admin/login`;
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [locale]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = `/${locale}/admin/login`;
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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MySkillStore</span>
            <Badge className="bg-red-100 text-red-700 border-red-200 ml-2">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{userEmail}</span>
            <Button variant="outline" size="sm" className="rounded-lg gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Manage your MySkillStore system</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href={`/${locale}/admin/landing-pages`}>
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Landing Pages</h3>
                <p className="text-sm text-gray-500">Create and manage multi-variant landing pages</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${locale}/admin/bookings`}>
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                  <CalendarCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">预约 & 咨询</h3>
                <p className="text-sm text-gray-500">管理来自落地页的预约和咨询请求</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
