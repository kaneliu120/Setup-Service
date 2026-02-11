'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Boxes, Shield, Loader2, Save, ArrowLeft, Plus, Trash2, Eye
} from 'lucide-react';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

interface ContactMethod {
  type: string;
  label: string;
  value: string;
}

interface FormData {
  slug: string;
  title: string;
  is_active: boolean;
  content: {
    header_title: string;
    header_subtitle: string;
    languages: string[];
    location_label: string;
    hero_headline: string;
    hero_description: string;
    hero_cta_text: string;
    about_title: string;
    about_text: string;
    services_title: string;
    services: ServiceItem[];
    pricing_title: string;
    pricing_amount: string;
    pricing_details: string[];
    cta_title: string;
    cta_description: string;
    contact_methods: ContactMethod[];
    footer_text: string;
    primary_color: string;
    accent_color: string;
  };
}

const defaultForm: FormData = {
  slug: '',
  title: '',
  is_active: false,
  content: {
    header_title: '',
    header_subtitle: '',
    languages: ['EN'],
    location_label: '',
    hero_headline: '',
    hero_description: '',
    hero_cta_text: 'Get Started',
    about_title: 'About',
    about_text: '',
    services_title: 'What We Offer',
    services: [
      { icon: '\u2705', title: '', description: '' },
      { icon: '\ud83d\ude80', title: '', description: '' },
      { icon: '\u2699\ufe0f', title: '', description: '' },
    ],
    pricing_title: 'Pricing',
    pricing_amount: '',
    pricing_details: [''],
    cta_title: 'Get Started Today',
    cta_description: '',
    contact_methods: [
      { type: 'whatsapp', label: 'WhatsApp', value: '' },
    ],
    footer_text: '',
    primary_color: '#6366f1',
    accent_color: '#8b5cf6',
  },
};

export default function LandingPageEditor() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = `/${locale}/admin/login`;
      return;
    }

    const init = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data.role !== 'admin') {
          window.location.href = `/${locale}/user`;
          return;
        }
        setAuthorized(true);

        if (editId) {
          const res = await api.get(`/landing-pages/${editId}`);
          setForm({
            slug: res.data.slug,
            title: res.data.title,
            is_active: res.data.is_active,
            content: { ...defaultForm.content, ...res.data.content },
          });
        }
      } catch {
        window.location.href = `/${locale}/admin/login`;
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [locale, editId]);

  const updateContent = (key: string, value: unknown) => {
    setForm(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/landing-pages/${editId}`, form);
      } else {
        await api.post('/landing-pages', form);
      }
      router.push(`/${locale}/admin/landing-pages`);
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save. Check that slug is unique.');
    } finally {
      setSaving(false);
    }
  };

  const updateService = (idx: number, key: keyof ServiceItem, value: string) => {
    const services = [...form.content.services];
    services[idx] = { ...services[idx], [key]: value };
    updateContent('services', services);
  };
  const addService = () => {
    updateContent('services', [...form.content.services, { icon: '\ud83d\udccc', title: '', description: '' }]);
  };
  const removeService = (idx: number) => {
    updateContent('services', form.content.services.filter((_: ServiceItem, i: number) => i !== idx));
  };

  const updatePricingDetail = (idx: number, value: string) => {
    const details = [...form.content.pricing_details];
    details[idx] = value;
    updateContent('pricing_details', details);
  };
  const addPricingDetail = () => {
    updateContent('pricing_details', [...form.content.pricing_details, '']);
  };
  const removePricingDetail = (idx: number) => {
    updateContent('pricing_details', form.content.pricing_details.filter((_: string, i: number) => i !== idx));
  };

  const updateContact = (idx: number, key: keyof ContactMethod, value: string) => {
    const methods = [...form.content.contact_methods];
    methods[idx] = { ...methods[idx], [key]: value };
    updateContent('contact_methods', methods);
  };
  const addContact = () => {
    updateContent('contact_methods', [...form.content.contact_methods, { type: 'email', label: 'Email', value: '' }]);
  };
  const removeContact = (idx: number) => {
    updateContent('contact_methods', form.content.contact_methods.filter((_: ContactMethod, i: number) => i !== idx));
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
          <div className="flex items-center gap-2">
            {editId && form.slug && (
              <Link href={`/${locale}/landing/${form.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </Link>
            )}
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Link href={`/${locale}/admin/landing-pages`} className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Landing Pages
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {editId ? 'Edit Landing Page' : 'Create Landing Page'}
        </h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-900">Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Title (admin label)</Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Manila Landing Page"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">URL Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    placeholder="e.g. manila"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">URL: /landing/{form.slug || '...'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <Label className="text-gray-700">Active (publicly visible)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Header */}
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-900">Header</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-700">Header Title</Label>
                <Input value={form.content.header_title} onChange={e => updateContent('header_title', e.target.value)} className="mt-1" placeholder="e.g. OpenClaw Private AI Service - Manila" />
              </div>
              <div>
                <Label className="text-gray-700">Header Subtitle (optional)</Label>
                <Input value={form.content.header_subtitle} onChange={e => updateContent('header_subtitle', e.target.value)} className="mt-1" placeholder="e.g. AI私人助理安装服务" />
              </div>
              <div>
                <Label className="text-gray-700">Location Label (optional)</Label>
                <Input value={form.content.location_label} onChange={e => updateContent('location_label', e.target.value)} className="mt-1" placeholder="e.g. Available in Manila" />
              </div>
              <div>
                <Label className="text-gray-700">Languages (comma separated)</Label>
                <Input
                  value={form.content.languages.join(', ')}
                  onChange={e => updateContent('languages', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  className="mt-1" placeholder="EN, 中文, Tagalog"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero */}
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-900">Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-700">Headline</Label>
                <Input value={form.content.hero_headline} onChange={e => updateContent('hero_headline', e.target.value)} className="mt-1" placeholder="e.g. Turn your PC into a real-life JARVIS." />
              </div>
              <div>
                <Label className="text-gray-700">Description</Label>
                <Textarea value={form.content.hero_description} onChange={e => updateContent('hero_description', e.target.value)} className="mt-1" placeholder="Main description text..." />
              </div>
              <div>
                <Label className="text-gray-700">CTA Button Text</Label>
                <Input value={form.content.hero_cta_text} onChange={e => updateContent('hero_cta_text', e.target.value)} className="mt-1" placeholder="e.g. Book Setup Now" />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-900">About Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-700">About Title</Label>
                <Input value={form.content.about_title} onChange={e => updateContent('about_title', e.target.value)} className="mt-1" placeholder="e.g. Who am I?" />
              </div>
              <div>
                <Label className="text-gray-700">About Text</Label>
                <Textarea value={form.content.about_text} onChange={e => updateContent('about_text', e.target.value)} className="mt-1 min-h-[120px]" placeholder="Personal introduction or about text..." />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Services</CardTitle>
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={addService}>
                  <Plus className="w-4 h-4" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-gray-700 mb-2 block">Services Section Title</Label>
                <Input value={form.content.services_title} onChange={e => updateContent('services_title', e.target.value)} className="mb-4" placeholder="e.g. What I Offer" />
              </div>
              <div className="space-y-4">
                {form.content.services.map((service, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-16">
                      <Label className="text-xs text-gray-500">Icon</Label>
                      <Input value={service.icon} onChange={e => updateService(idx, 'icon', e.target.value)} className="mt-1 text-center" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input value={service.title} onChange={e => updateService(idx, 'title', e.target.value)} placeholder="Service title" />
                      <Textarea value={service.description} onChange={e => updateService(idx, 'description', e.target.value)} placeholder="Service description" className="min-h-[60px]" />
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeService(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-900">Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Pricing Title</Label>
                  <Input value={form.content.pricing_title} onChange={e => updateContent('pricing_title', e.target.value)} className="mt-1" placeholder="e.g. Flat Fee" />
                </div>
                <div>
                  <Label className="text-gray-700">Pricing Amount</Label>
                  <Input value={form.content.pricing_amount} onChange={e => updateContent('pricing_amount', e.target.value)} className="mt-1" placeholder="e.g. 5,000 PHP" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-700">Pricing Details</Label>
                  <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs" onClick={addPricingDetail}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.content.pricing_details.map((detail, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={detail} onChange={e => updatePricingDetail(idx, e.target.value)} placeholder="e.g. On-site Manila setup included" />
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => removePricingDetail(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA / Contact */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">CTA & Contact</CardTitle>
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={addContact}>
                  <Plus className="w-4 h-4" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-700">CTA Title</Label>
                <Input value={form.content.cta_title} onChange={e => updateContent('cta_title', e.target.value)} className="mt-1" placeholder="e.g. Get Automated Today" />
              </div>
              <div>
                <Label className="text-gray-700">CTA Description</Label>
                <Textarea value={form.content.cta_description} onChange={e => updateContent('cta_description', e.target.value)} className="mt-1" placeholder="Motivational text..." />
              </div>
              <div className="space-y-3">
                {form.content.contact_methods.map((method, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-28">
                      <Label className="text-xs text-gray-500">Type</Label>
                      <select
                        value={method.type}
                        onChange={e => updateContact(idx, 'type', e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telegram">Telegram</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input value={method.label} onChange={e => updateContact(idx, 'label', e.target.value)} placeholder="Display label" />
                      <Input value={method.value} onChange={e => updateContact(idx, 'value', e.target.value)} placeholder="Contact value (number, email, etc.)" />
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeContact(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer & Theme */}
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-900">Footer & Theme</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-700">Footer Text</Label>
                <Input value={form.content.footer_text} onChange={e => updateContent('footer_text', e.target.value)} className="mt-1" placeholder="e.g. © 2026 OpenClaw Service Manila" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={form.content.primary_color} onChange={e => updateContent('primary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                    <Input value={form.content.primary_color} onChange={e => updateContent('primary_color', e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={form.content.accent_color} onChange={e => updateContent('accent_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                    <Input value={form.content.accent_color} onChange={e => updateContent('accent_color', e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button (bottom) */}
          <div className="flex justify-end gap-3 pb-12">
            <Link href={`/${locale}/admin/landing-pages`}>
              <Button variant="outline" className="rounded-lg">Cancel</Button>
            </Link>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-lg px-8"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update Landing Page' : 'Create Landing Page'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
