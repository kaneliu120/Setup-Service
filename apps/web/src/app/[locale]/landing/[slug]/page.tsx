'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import LandingPageTemplate, { LandingPageData } from '@/components/landing/LandingPageTemplate';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<LandingPageData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.get(`/landing-pages/public/${slug}`);
        setData(res.data.content);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p>This page does not exist or is not active.</p>
        </div>
      </div>
    );
  }

  return <LandingPageTemplate data={{ ...data, slug }} />;
}
