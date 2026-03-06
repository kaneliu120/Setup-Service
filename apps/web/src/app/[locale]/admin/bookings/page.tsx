'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Boxes, Shield, Loader2, CalendarCheck, Trash2,
  ArrowLeft, MessageSquare, Clock, User, Phone
} from 'lucide-react';

interface BookingItem {
  id: number;
  name: string;
  contact: string;
  contact_type: string;
  appointment_time: string;
  content: string;
  status: string;
  source_slug: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  consultation: 'bg-purple-100 text-purple-700 border-purple-200',
};

const statusLabels: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
  consultation: '咨询',
};

export default function AdminBookings() {
  const locale = useLocale();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
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

        const res = await api.get('/bookings');
        setBookings(res.data);
      } catch {
        window.location.href = `/${locale}/admin/login`;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await api.patch(`/bookings/${id}/status`, { status });
      setBookings(prev =>
        prev.map(b => (b.id === id ? { ...b, status: res.data.status } : b)),
      );
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-purple-600" />
            预约 & 咨询管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            管理来自落地页的预约和咨询请求
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-16 text-center">
              <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无预约和咨询记录</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card
                key={booking.id}
                className="bg-white border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {booking.status === 'consultation' ? (
                          <MessageSquare className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        ) : (
                          <CalendarCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {booking.status === 'consultation'
                            ? `咨询 #${booking.id}`
                            : `${booking.name}`}
                        </h3>
                        <Badge
                          variant="outline"
                          className={statusColors[booking.status] || 'bg-gray-100 text-gray-500'}
                        >
                          {statusLabels[booking.status] || booking.status}
                        </Badge>
                        {booking.source_slug && (
                          <span className="text-xs text-gray-400">
                            来源: /{booking.source_slug}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {booking.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {booking.contact || '未提供'}
                          {booking.contact_type && (
                            <span className="text-gray-400">({booking.contact_type})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.status === 'consultation'
                            ? new Date(booking.created_at).toLocaleString('zh-CN')
                            : new Date(booking.appointment_time).toLocaleString('zh-CN')}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        {booking.content}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {booking.status !== 'consultation' && (
                        <select
                          value={booking.status}
                          onChange={e => handleStatusChange(booking.id, e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="pending">待确认</option>
                          <option value="confirmed">已确认</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(booking.id)}
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
