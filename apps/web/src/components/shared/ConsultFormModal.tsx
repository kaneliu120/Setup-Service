'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { X, Send, Loader2, Check } from 'lucide-react';
import api from '@/lib/api';
import { trackFormSubmit } from '@/lib/tracking';

const texts = {
  en: {
    title: 'Book Free Consultation',
    subtitle: 'Quick form — Kane will reach out to you today',
    nameLabel: 'Your Name *',
    namePlaceholder: 'e.g. Maria',
    contactLabel: 'Viber Number *',
    contactPlaceholder: '+63 9XX XXX XXXX',
    needLabel: 'I mainly need help with: *',
    needDefault: 'Select one...',
    options: [
      { value: 'Automate daily work (Personal)', label: 'Automate daily work (Personal)' },
      { value: 'Manage team efficiency (Enterprise)', label: 'Manage team efficiency (Enterprise)' },
      { value: 'Not sure yet, just exploring', label: 'Not sure yet, just exploring' },
    ],
    submit: 'Get Free Consultation',
    sending: 'Sending...',
    thankYou: 'Thank you!',
    thankYouSub: 'Kane will contact you today',
    errorAlert: 'Failed to send, please try again',
  },
  zh: {
    title: '预约免费咨询',
    subtitle: '简单填写 — Kane 今天会联系您',
    nameLabel: '您的姓名 *',
    namePlaceholder: '例如：小明',
    contactLabel: 'Viber / 微信号 *',
    contactPlaceholder: '+63 9XX XXX XXXX 或微信号',
    needLabel: '我主要需要帮助: *',
    needDefault: '请选择...',
    options: [
      { value: 'Automate daily work (Personal)', label: '自动化日常工作（个人）' },
      { value: 'Manage team efficiency (Enterprise)', label: '管理团队效率（企业）' },
      { value: 'Not sure yet, just exploring', label: '还不确定，先了解一下' },
    ],
    submit: '获取免费咨询',
    sending: '发送中...',
    thankYou: '感谢您！',
    thankYouSub: 'Kane 今天会联系您',
    errorAlert: '发送失败，请重试',
  },
} as const;

export default function ConsultFormModal({
  open,
  onClose,
  slug,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  slug?: string;
  locale?: string;
}) {
  // Read locale from URL as single source of truth — prevents stale
  // cached props from showing the wrong language after navigation.
  const params = useParams();
  const urlLocale = params?.locale as string | undefined;
  const resolvedLocale = urlLocale || locale || 'en';
  const t = resolvedLocale === 'zh' ? texts.zh : texts.en;
  const [name, setName] = useState('');
  const [viber, setViber] = useState('');
  const [need, setNeed] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !viber.trim() || !need) return;
    setSending(true);
    try {
      await api.post('/bookings', {
        name: name.trim(),
        contact: viber.trim(),
        contact_type: 'viber',
        content: need,
        source_slug: slug,
      });
      setSent(true);
      trackFormSubmit('consultation_popup');
    } catch {
      alert(t.errorAlert);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setName('');
      setViber('');
      setNeed('');
    }, 300);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:w-auto sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.thankYou}
            </h3>
            <p className="text-slate-500 text-sm">
              {t.thankYouSub}
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1 pr-8">
              {t.title}
            </h3>
            <p className="text-slate-500 text-xs mb-5">
              {t.subtitle}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {t.contactLabel}
                </label>
                <input
                  type="text"
                  value={viber}
                  onChange={(e) => setViber(e.target.value)}
                  placeholder={t.contactPlaceholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {t.needLabel}
                </label>
                <select
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50 appearance-none"
                >
                  <option value="">{t.needDefault}</option>
                  {t.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !viber.trim() || !need || sending}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? t.sending : t.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
