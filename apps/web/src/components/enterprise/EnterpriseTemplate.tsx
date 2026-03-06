'use client';

import { useState, useEffect } from 'react';
import {
  Check, X, Send, Loader2, Calendar, CalendarCheck,
  MessageSquare, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import ConsultFormModal from '@/components/shared/ConsultFormModal';
import {
  trackWhatsAppClick,
  trackTelegramClick,
  trackEmailClick,
  trackConsultClick,
  trackBookClick,
  trackConsultationSubmit,
  trackBookingSubmit,
  trackFaqOpen,
  trackScrollToContact,
} from '@/lib/tracking';

/* ─── Data interface (kept for page.tsx compatibility) ─── */
export interface EnterprisePageData {
  slug?: string;
  telegram_group?: string;
  whatsapp_group?: string;
  telegram_handle?: string;
  whatsapp_number?: string;
  owner_email?: string;
  // legacy fields kept so page.tsx doesn't break
  header_title?: string | string[];
  why_deploy_title?: string | string[];
  why_deploy_description?: string | string[];
  [key: string]: unknown;
}

/* ─── Modal i18n ─── */
const modalI18n = {
  consult: {
    title: '💬 Quick Consultation',
    subtitle: "Tell us about your needs, we'll get back to you ASAP",
    contactLabel: 'Your contact info *',
    contactPh: 'Email / Phone / Telegram...',
    msgLabel: 'Your needs *',
    msgPh: 'Describe your enterprise deployment needs...',
    send: 'Submit',
    sending: 'Submitting...',
    sentTitle: 'Submitted!',
    sentDesc: 'Our team will contact you within 24 hours',
    failAlert: 'Failed to submit, please try again',
  },
  booking: {
    title: '📅 Book a Meeting',
    subtitle: 'Schedule a time to discuss your project',
    nameLabel: 'Your name *',
    namePh: 'e.g. John',
    contactLabel: 'Contact *',
    contactPh: 'Enter your contact',
    timeLabel: 'Preferred meeting time *',
    contentLabel: 'Project brief *',
    contentPh: 'Describe your project requirements briefly...',
    submit: 'Confirm Booking',
    submitting: 'Submitting...',
    sentTitle: 'Booked!',
    sentDesc: 'We will confirm the meeting time with you shortly',
    failAlert: 'Booking failed, please try again',
  },
};

/* ─── Consult Modal ─── */
function ConsultModal({ open, onClose, slug }: { open: boolean; onClose: () => void; slug?: string }) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const L = modalI18n.consult;

  const handleSubmit = async () => {
    if (!message.trim() || !contact.trim()) return;
    setSending(true);
    try {
      await api.post('/bookings/consultation', {
        message: message.trim(),
        contact: contact.trim(),
        source_slug: slug || 'enterprise-deploy',
      });
      setSent(true);
      trackConsultationSubmit();
    } catch {
      alert(L.failAlert);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full sm:w-auto sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-emerald-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{L.sentTitle}</h3>
            <p className="text-gray-500 text-sm">{L.sentDesc}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1 pr-8">{L.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{L.subtitle}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{L.contactLabel}</label>
                <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder={L.contactPh} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{L.msgLabel}</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={L.msgPh} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={!message.trim() || !contact.trim() || sending} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? L.sending : L.send}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Booking Modal ─── */
function BookingModal({ open, onClose, slug }: { open: boolean; onClose: () => void; slug?: string }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('phone');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const L = modalI18n.booking;

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };
  const [dateTime, setDateTime] = useState(getDefaultDateTime);

  const handleSubmit = async () => {
    if (!name.trim() || !contact.trim() || !content.trim()) return;
    setSending(true);
    try {
      await api.post('/bookings', {
        name: name.trim(),
        contact: contact.trim(),
        contact_type: contactType,
        appointment_time: new Date(dateTime).toISOString(),
        content: content.trim(),
        source_slug: slug || 'enterprise-deploy',
      });
      setSent(true);
      trackBookingSubmit();
    } catch {
      alert(L.failAlert);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full sm:w-auto sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><CalendarCheck className="w-8 h-8 text-emerald-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{L.sentTitle}</h3>
            <p className="text-gray-500 text-sm">{L.sentDesc}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1 pr-8">{L.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{L.subtitle}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{L.nameLabel}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={L.namePh} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{L.contactLabel}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={contactType} onChange={e => setContactType(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:min-w-[120px]">
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder={L.contactPh} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />{L.timeLabel}
                </label>
                <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{L.contentLabel}</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={L.contentPh} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={!name.trim() || !contact.trim() || !content.trim() || sending} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                {sending ? L.submitting : L.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── FAQ data ─── */
const faqData = [
  {
    q: 'How is this different from just using ChatGPT?',
    a: "ChatGPT alone is a conversation tool — it gives advice but you do all the work. Our deployment connects AI directly to your business systems so it executes tasks automatically: building pages, sending campaigns, responding to customers, generating reports. It's the difference between asking someone for directions vs. having a driver take you there.",
  },
  {
    q: 'How is Enterprise different from Personal Setup?',
    a: 'Personal Setup (₱5,000) installs AI tools on one computer for individual use. Enterprise deployment builds automated AI workflows for your team — connected to your systems, executing tasks across departments, supporting multiple users 24/7.',
  },
  {
    q: 'Can AI really build a website in 2 hours?',
    a: 'Yes. AI generates the design, writes all the code, tests across devices, and deploys to production. What takes a traditional team 10+ days of coordination between designer, developer, and QA — AI completes in a single workflow. The human reviews and approves, but the AI does the heavy lifting.',
  },
  {
    q: 'What ongoing costs should I expect?',
    a: 'Deployment fee is one-time. Ongoing costs are primarily AI API usage — typically ₱5,000–20,000/month depending on volume. We provide a clear breakdown during consultation so there are no surprises.',
  },
  {
    q: 'Is my data safe?',
    a: 'We offer private deployment where your data never leaves your network. For cloud solutions, we use encrypted connections and enterprise-grade security. You maintain full control at all times.',
  },
  {
    q: 'Do you support after launch?',
    a: 'Starter includes 30-day support. Standard includes 90-day support with 24/7 coverage. Premium includes ongoing dedicated support. We also offer maintenance packages for long-term optimization.',
  },
];

/* ═══════════════════════════════════════════════════
   Main Enterprise Template
   ═══════════════════════════════════════════════════ */
export default function EnterpriseTemplate({ data, locale }: { data: EnterprisePageData; locale?: string }) {
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showSticky, setShowSticky] = useState(false);

  // Sticky bar on scroll
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track scroll to contact
  useEffect(() => {
    const el = document.getElementById('contact');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { trackScrollToContact(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ─── Contact URL helpers ─── */
  const telegramUrl = data.telegram_group
    ? (data.telegram_group.startsWith('http') ? data.telegram_group : `https://t.me/${data.telegram_group.replace('@', '')}`)
    : data.telegram_handle
      ? `https://t.me/${data.telegram_handle.replace('@', '')}`
      : null;

  const whatsappUrl = data.whatsapp_group
    ? data.whatsapp_group
    : data.whatsapp_number
      ? `https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, '')}`
      : null;

  const emailUrl = data.owner_email ? `mailto:${data.owner_email}` : 'mailto:kaneliu10@gmail.com';

  /* ─── Consultation click: always show form popup ─── */
  const handleConsultClick = () => {
    trackConsultClick();
    setShowConsultForm(true);
  };

  const handleTelegramClick = () => {
    trackTelegramClick();
    if (telegramUrl) window.open(telegramUrl, '_blank');
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppClick();
    if (whatsappUrl) window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    trackEmailClick();
    window.open(emailUrl, '_blank');
  };

  const handleBookClick = () => {
    trackBookClick();
    setShowBookingModal(true);
  };

  const smoothScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const personalUrl = `/${locale || 'en'}/landing/manila`;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: '76px' }}>

      {/* ═══════ NAV ═══════ */}
      <nav className="flex justify-between items-center px-5 py-2.5 border-b border-gray-200 sticky top-0 z-[100] backdrop-blur-xl bg-white/[0.92]">
        <Link href="/" className="text-[15px] font-bold text-slate-900 no-underline flex items-center gap-1.5">
          <span className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center text-white text-[11px] font-extrabold">AI</span>
          AI Setup Service
        </Link>
        <div className="flex items-center gap-3">
          <Link href={personalUrl} className="text-xs text-emerald-600 no-underline font-semibold px-2.5 py-1.5 border border-emerald-500 rounded-md">
            Personal ₱5K →
          </Link>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="bg-gradient-to-br from-slate-900 via-[#1a1f3a] to-slate-800 text-white py-12 px-5 md:py-16 md:px-10 text-center relative overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(79,70,229,0.12)_0%,transparent_65%)] rounded-full" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/[0.15] rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/80 tracking-wider uppercase">
            Enterprise AI Deployment
          </div>
          <h1 className="text-[26px] md:text-[38px] font-extrabold leading-[1.25] mt-5 mb-4 max-w-[640px] mx-auto">
            AI That{' '}
            <span className="bg-gradient-to-br from-indigo-400 to-emerald-300 bg-clip-text text-transparent">
              Actually Executes Work
            </span>
            {' '}— Not Just Conversations
          </h1>
          <p className="text-[15px] text-white/70 leading-relaxed mb-6 max-w-[520px] mx-auto">
            Most AI tools just answer questions. We deploy AI that{' '}
            <strong className="text-white/95">does the actual work</strong> — builds websites in 2 hours, runs marketing campaigns 24/7, handles 1000 customer inquiries simultaneously.{' '}
            <strong className="text-white/95">20–100× faster</strong> than traditional teams.
          </p>

          {/* Hero diff box */}
          <div
            onClick={() => smoothScroll('scenarios')}
            className="bg-indigo-600/[0.15] border border-indigo-600/25 rounded-xl py-3.5 px-5 mx-auto mb-6 max-w-[480px] text-left cursor-pointer hover:bg-indigo-600/[0.25] transition-all"
          >
            <div className="text-[13px] font-bold text-indigo-300 mb-1.5">🔥 This is NOT a chatbot</div>
            <div className="flex items-start gap-2 text-[13px] mb-1 leading-relaxed text-white/45 line-through">
              ❌ Regular AI: &ldquo;Here&rsquo;s how to build a website…&rdquo; (gives advice only)
            </div>
            <div className="flex items-start gap-2 text-[13px] leading-relaxed text-emerald-300 font-semibold">
              ✅ Our AI: Designs it, codes it, tests it, deploys it live — 2 hours
            </div>
            <div className="text-[11px] text-indigo-300/70 mt-2 text-center">↓ See real speed comparisons</div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col md:flex-row gap-2.5 max-w-[320px] md:max-w-[460px] mx-auto">
            <button
              onClick={handleConsultClick}
              className="flex items-center justify-center gap-2 py-[15px] px-6 rounded-xl text-[15px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex-1 cursor-pointer border-none"
              style={{ fontFamily: 'inherit' }}
            >
              📅 Book Free Consultation
            </button>
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackTelegramClick()}
                className="flex items-center justify-center gap-2 py-[15px] px-6 rounded-xl text-[15px] font-bold bg-white/[0.08] border border-white/[0.15] text-white hover:bg-white/[0.12] transition-all flex-1 no-underline"
              >
                ✈️ Message on Telegram
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ BANNER ═══════ */}
      <div className="bg-emerald-100 py-3 px-5 text-center text-[13px] text-emerald-900 border-b border-emerald-300">
        Just need AI on 1 computer? →{' '}
        <Link href={personalUrl} className="text-emerald-900 font-bold underline">
          Personal Setup ₱5,000
        </Link>
      </div>

      {/* ═══════ CORE DIFFERENCE ═══════ */}
      <section className="bg-slate-900 text-white">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">The Core Difference</div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Regular AI Talks. Our AI Executes.</h2>
          <p className="text-[15px] text-white/60 mb-8 leading-relaxed">
            ChatGPT alone gives you advice. Our deployment turns AI into a full-time employee that actually completes tasks — from code to content to customer service.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/[0.08] border border-red-500/[0.15] rounded-[14px] p-6 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-300 mb-3.5">❌ ChatGPT Alone</div>
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-base font-bold mb-2">Gives Advice</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">Suggests ideas, writes drafts. You still copy, paste, configure, debug, and deploy everything yourself.</p>
            </div>
            <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-[14px] p-6 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-3.5">✅ Enterprise AI</div>
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-base font-bold mb-2">Does The Work</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">Writes code, builds pages, deploys campaigns, answers customers, generates reports — automatically, 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SCENARIO COMPARISONS ═══════ */}
      <section id="scenarios" className="bg-slate-50">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Real Business Scenarios</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">See The Exact Speed Difference</h2>
          <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
            Traditional teams vs. AI-powered execution. Real time and cost comparisons for every scenario.
          </p>

          {[
            {
              icon: '🌐', title: 'Website & Mobile App Development', desc: 'UI design, features, testing, app store deployment',
              old: { time: '2–4 months', team: '5–8 people', teamNote: 'iOS+Android+Backend+Design+QA+PM', cost: '₱500K–2M', costLabel: 'Project cost' },
              newD: { time: '3–5 days', team: '1 person', teamNote: 'AI generates UI, code, tests & deploys', cost: '₱50K–100K', costLabel: 'Project cost' },
              speed: '30×', save: '90%',
            },
            {
              icon: '🏢', title: 'Enterprise Business Systems', desc: 'CRM, ERP, BI dashboards, data platforms & internal management tools',
              old: { time: '6–12 months', team: '10–20 people', teamNote: 'Architects+Backend+Frontend+DBA+QA+PM', cost: '₱2M–10M', costLabel: 'Project cost' },
              newD: { time: '2–4 weeks', team: '1–2 people', teamNote: 'AI builds modules, integrations & workflows', cost: '₱200K–500K', costLabel: 'Project cost' },
              speed: '12×', save: '90%',
            },
            {
              icon: '📢', title: 'Automated Marketing Campaigns', desc: 'Content creation, ad copy, social media, SEO, email campaigns — all automated',
              old: { time: '20 posts', team: '3–4 people', teamNote: 'Copywriter+Designer+Social+SEO', cost: '₱120K+', costLabel: 'Monthly cost' },
              newD: { time: '500+ posts', team: '1 person', teamNote: 'AI creates, schedules & optimizes', cost: '₱8K–15K', costLabel: 'Monthly cost' },
              speed: '25×', save: '92%', speedLabel: 'more output',
            },
            {
              icon: '🎧', title: '24/7 Customer Service', desc: 'Handle inquiries, resolve issues, escalate complex cases — around the clock',
              old: { time: '4–24 hours', team: '8 hrs/day', teamNote: 'Office hours, weekdays only', cost: '₱200K/mo', costLabel: '10-agent cost' },
              newD: { time: 'Under 10 sec', team: '24/7/365', teamNote: 'Never sleeps, never calls in sick', cost: '₱5K–20K', costLabel: 'Monthly cost' },
              speed: '100×', save: '90%',
            },
          ].map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl mb-5 overflow-hidden border border-gray-200 shadow-sm">
              <div className="px-5 pt-5 pb-3.5 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="text-[28px] shrink-0">{s.icon}</div>
                  <h3 className="text-lg font-extrabold text-slate-900">{s.title}</h3>
                </div>
                <p className="text-[13px] text-slate-500">{s.desc}</p>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-3.5 bg-red-50/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2.5">Traditional Team</div>
                  <div className="mb-3"><div className="text-[11px] text-slate-500 mb-0.5">{s.old.costLabel === s.newD.costLabel ? 'Time' : (idx === 2 ? 'Monthly output' : idx === 3 ? 'Response time' : 'Time')}</div><div className="text-[17px] font-extrabold text-red-500">{s.old.time}</div></div>
                  <div className="mb-3"><div className="text-[11px] text-slate-500 mb-0.5">{idx === 3 ? 'Availability' : 'Team'}</div><div className="text-[17px] font-extrabold text-red-500">{s.old.team}</div><div className="text-[11px] text-slate-400 mt-0.5">{s.old.teamNote}</div></div>
                  <div><div className="text-[11px] text-slate-500 mb-0.5">{s.old.costLabel}</div><div className="text-[17px] font-extrabold text-red-500">{s.old.cost}</div></div>
                </div>
                <div className="p-3.5 bg-emerald-50/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2.5">With AI Deployment</div>
                  <div className="mb-3"><div className="text-[11px] text-slate-500 mb-0.5">{s.old.costLabel === s.newD.costLabel ? 'Time' : (idx === 2 ? 'Monthly output' : idx === 3 ? 'Response time' : 'Time')}</div><div className="text-[17px] font-extrabold text-emerald-500">{s.newD.time}</div></div>
                  <div className="mb-3"><div className="text-[11px] text-slate-500 mb-0.5">{idx === 3 ? 'Availability' : 'Team'}</div><div className="text-[17px] font-extrabold text-emerald-500">{s.newD.team}</div><div className="text-[11px] text-slate-400 mt-0.5">{s.newD.teamNote}</div></div>
                  <div><div className="text-[11px] text-slate-500 mb-0.5">{s.newD.costLabel}</div><div className="text-[17px] font-extrabold text-emerald-500">{s.newD.cost}</div></div>
                </div>
              </div>
              <div className="flex items-center justify-center py-2.5 bg-slate-900 text-white text-sm font-extrabold text-center">
                ⚡{' '}
                <span className="bg-gradient-to-br from-indigo-400 to-emerald-300 bg-clip-text text-transparent text-xl mx-1">{s.speed}</span>
                {' '}{s.speedLabel || 'faster'} ·{' '}
                <span className="bg-gradient-to-br from-indigo-400 to-emerald-300 bg-clip-text text-transparent text-xl mx-1">{s.save}</span>
                {' '}cost reduction
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ COST TABLE ═══════ */}
      <section>
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Cost Comparison</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">100-Person Team → 1 Person + AI</h2>
          <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
            What used to require entire departments can now be handled by one person with AI. Here&rsquo;s the real math.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="bg-slate-50 p-2.5 text-left text-[11px] font-bold text-slate-500 uppercase border-b-2 border-gray-200">Department</th>
                  <th className="bg-slate-50 p-2.5 text-left text-[11px] font-bold text-slate-500 uppercase border-b-2 border-gray-200">Before</th>
                  <th className="bg-slate-50 p-2.5 text-left text-[11px] font-bold text-slate-500 uppercase border-b-2 border-gray-200">After AI</th>
                  <th className="bg-slate-50 p-2.5 text-left text-[11px] font-bold text-slate-500 uppercase border-b-2 border-gray-200">Save</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dept: 'Development', sub: 'Web + App + Backend', before: '10 devs\n₱600K/mo', after: '1 person\n₱60K/mo', save: '-90%' },
                  { dept: 'Marketing', sub: 'Content + Ads + SEO', before: '5 people\n₱200K/mo', after: '1 person\n₱20K/mo', save: '-90%' },
                  { dept: 'Customer Service', sub: 'Support + Chat + Email', before: '10 agents\n₱200K/mo', after: '1 person\n₱25K/mo', save: '-87%' },
                  { dept: 'Data & Reports', sub: 'Analytics + BI', before: '3 analysts\n₱150K/mo', after: '1 person\n₱15K/mo', save: '-90%' },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 border-b border-gray-200 align-top"><strong>{row.dept}</strong><br /><small className="text-slate-400">{row.sub}</small></td>
                    <td className="p-2.5 border-b border-gray-200 align-top text-red-500 font-semibold whitespace-pre-line">{row.before}</td>
                    <td className="p-2.5 border-b border-gray-200 align-top text-emerald-500 font-bold whitespace-pre-line">{row.after}</td>
                    <td className="p-2.5 border-b border-gray-200 align-top"><span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold py-0.5 px-2 rounded">{row.save}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[13px] text-slate-500 text-center leading-relaxed p-4 bg-indigo-50 rounded-xl">
            💡 <strong className="text-indigo-600">Traditional: 28 employees = ₱1.15M/month</strong><br />
            With AI: 4 people = ₱120K/month — <strong className="text-indigo-600">saving ₱1M+ per month</strong>
          </div>
        </div>
      </section>

      {/* ═══════ SOLUTIONS ═══════ */}
      <section className="bg-slate-50">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">What We Deploy</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">AI Systems That Execute Work</h2>
          <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">Not generic tools. Custom AI workflows that do the actual work for your business.</p>

          {[
            { icon: '🌐', title: 'Website & App AI Development', desc: 'AI designs, codes, tests, and deploys websites and mobile apps. New features in hours, not weeks. Full-stack AI that handles everything from UI design to backend logic to production deployment.', tags: ['Landing pages', 'E-commerce', 'Mobile apps', 'Web apps'] },
            { icon: '📢', title: 'Marketing Automation System', desc: 'AI creates ad copy, generates social media content, writes blog posts, manages email campaigns, optimizes SEO — all automatically. Produces 25× more content than a human team at a fraction of the cost.', tags: ['Ad campaigns', 'Social media', 'Email marketing', 'SEO'] },
            { icon: '🎧', title: 'Customer Service AI', desc: 'AI responds to customers in under 10 seconds, 24/7/365. Handles FAQs, order tracking, complaints, and escalates complex issues to your team. Replaces 10+ support agents.', tags: ['Live chat', 'Email support', 'Ticket routing', 'Multilingual'] },
            { icon: '🔒', title: 'Private AI Deployment', desc: 'All AI systems deployed on your own infrastructure. Your data never leaves your network. Full control, full compliance, full privacy.', tags: ['On-premise', 'Data privacy', 'Compliance'] },
          ].map((sol, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-[14px] p-6 mb-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-[22px] shrink-0">{sol.icon}</div>
                <h3 className="text-[17px] font-bold text-slate-900">{sol.title}</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{sol.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {sol.tags.map((tag, ti) => (
                  <span key={ti} className="text-[11px] bg-slate-100 text-slate-700 py-0.5 px-2.5 rounded">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="bg-gradient-to-br from-slate-900 via-[#1a1f3a] to-slate-900 text-white" id="pricing">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">Pricing</div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Transparent Pricing. No Hidden Fees.</h2>
          <p className="text-[15px] text-white/60 mb-8 leading-relaxed">One-time deployment fee. Start small and scale.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter */}
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl py-7 px-6 relative">
              <div className="text-lg font-bold mb-1">Starter</div>
              <div className="text-[13px] text-white/50 mb-3.5">For startups & small teams</div>
              <div className="text-[28px] font-extrabold mb-1"><span className="text-base font-medium text-white/60">From ₱</span>50,000 <span className="text-[13px] font-normal text-white/40">/ project</span></div>
              <ul className="list-none my-4 space-y-1.5">
                {['1 AI system deployment', 'Basic data integration', 'Standard tech support', 'Training & documentation', '30-day post-launch support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-white/75"><span className="text-emerald-400 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <button onClick={handleConsultClick} className="block w-full text-center py-3 rounded-xl text-sm font-bold bg-white/[0.08] border border-white/[0.15] text-white hover:bg-white/[0.12] transition-all cursor-pointer" style={{ fontFamily: 'inherit' }}>Get Started</button>
            </div>

            {/* Standard (featured) */}
            <div className="bg-indigo-600/[0.08] border border-indigo-500 rounded-2xl py-7 px-6 relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold py-0.5 px-3 rounded-full">MOST POPULAR</div>
              <div className="text-lg font-bold mb-1">Standard</div>
              <div className="text-[13px] text-white/50 mb-3.5">For mid-size enterprises</div>
              <div className="text-[28px] font-extrabold mb-1"><span className="text-base font-medium text-white/60">From ₱</span>100,000 <span className="text-[13px] font-normal text-white/40">/ project</span></div>
              <ul className="list-none my-4 space-y-1.5">
                {['Multi-system AI deployment', 'Multi-source data integration', 'Custom model fine-tuning', '24/7 tech support', 'Performance monitoring', '90-day post-launch support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-white/75"><span className="text-emerald-400 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <button onClick={handleConsultClick} className="block w-full text-center py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer border-none" style={{ fontFamily: 'inherit' }}>Get Started</button>
            </div>

            {/* Premium */}
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl py-7 px-6 relative">
              <div className="text-lg font-bold mb-1">Premium</div>
              <div className="text-[13px] text-white/50 mb-3.5">For large enterprises</div>
              <div className="text-[28px] font-extrabold mb-1">Custom Quote</div>
              <ul className="list-none my-4 space-y-1.5">
                {['Full AI strategy consulting', 'End-to-end development', 'Deep customization', 'Dedicated team support', 'Continuous upgrades & SLA', 'Ongoing maintenance'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-white/75"><span className="text-emerald-400 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <button onClick={handleConsultClick} className="block w-full text-center py-3 rounded-xl text-sm font-bold bg-white/[0.08] border border-white/[0.15] text-white hover:bg-white/[0.12] transition-all cursor-pointer" style={{ fontFamily: 'inherit' }}>Contact Us</button>
            </div>
          </div>

          {/* Personal upsell */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center mt-5">
            <p className="text-sm text-white/70 mb-2.5">Just need AI for yourself? Not the whole team?</p>
            <Link href={personalUrl} className="text-emerald-300 font-bold no-underline text-[15px]">
              → Personal Setup · ₱5,000 one-time · 1 computer
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ PROCESS ═══════ */}
      <section>
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">How It Works</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">From Zero to Live in 5 Business Days</h2>
          <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">Clear process. No surprises. Fixed quote before we start.</p>

          {[
            { step: 1, title: 'Free Discovery Call', time: 'Day 1 · Free', desc: 'Understand your business, identify high-impact AI opportunities, define scope.' },
            { step: 2, title: 'Assessment & Fixed Quote', time: 'Day 1–2', desc: 'Technical evaluation, tool selection, detailed plan with fixed price — no surprises.' },
            { step: 3, title: 'AI Build & Deploy', time: 'Day 2–4', desc: 'System development, testing, deployment. We build it, test it, make sure it works.' },
            { step: 4, title: 'Demo & Acceptance', time: 'Day 4–5', desc: 'Live demo. Your team tests it. We adjust based on feedback.' },
            { step: 5, title: 'Launch & Training', time: 'Day 5', desc: 'System goes live. Full documentation, team training, ongoing support begins.' },
          ].map((p, idx, arr) => (
            <div key={idx} className="flex gap-4 mb-6 relative last:mb-0">
              {idx < arr.length - 1 && (
                <div className="absolute left-[19px] top-[44px] w-0.5 bg-indigo-100" style={{ height: 'calc(100% - 16px)' }} />
              )}
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-extrabold text-[15px] relative z-10">{p.step}</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-0.5">{p.title}</h4>
                <div className="text-xs text-indigo-600 font-semibold mb-1">{p.time}</div>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ PORTFOLIO & BLOG ═══════ */}
      <section className="max-w-[680px] mx-auto py-10 px-5">
        <div className="flex gap-3">
          <Link href={`/${locale || 'en'}/portfolio`} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-5 py-4 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all no-underline">
            🎨 Portfolio
          </Link>
          <Link href={`/${locale || 'en'}/blog`} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-5 py-4 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all no-underline">
            📝 Blog
          </Link>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="bg-slate-50">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Client Feedback</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">What Clients Say</h2>
          <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">Real results from businesses in the Philippines.</p>

          {[
            { text: 'We used to have 5 people building landing pages. Now 1 person with the AI system pushes out new pages in 2 hours. We saved ₱180K/month on development alone.', name: 'Marco R.', role: 'CEO · E-commerce Company, Makati' },
            { text: 'The marketing AI generates 300+ social media posts per month and manages all our ad campaigns. Our marketing team went from 4 people to 1 — and output tripled.', name: 'Angela T.', role: 'COO · BPO Services, BGC' },
            { text: 'Customer service AI handles 90% of inquiries instantly. Response time dropped from 12 hours to 8 seconds. We reassigned 8 agents to higher-value work.', name: 'Michael C.', role: 'VP Technology · Trading Company, Ortigas' },
          ].map((t, idx) => (
            <div key={idx} className="bg-white rounded-[14px] p-5 mb-3 border border-gray-200">
              <div className="text-[13px] tracking-wider text-amber-400 mb-2">★★★★★</div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="text-sm font-bold text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ ABOUT ═══════ */}
      <section className="text-center">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="w-20 h-20 rounded-full bg-indigo-50 mx-auto mb-3.5 flex items-center justify-center text-[32px]">👨‍💻</div>
          <div className="text-xl font-extrabold text-slate-900">Kane</div>
          <div className="text-sm text-slate-500 mb-3.5">Tech Manager · 16 Years Experience · Manila</div>
          <p className="text-sm text-slate-700 leading-relaxed max-w-[500px] mx-auto">
            16 years building systems and leading engineering teams. I deploy AI that executes real work — not chatbots that give advice. On-site, face-to-face, with full technical support. Manila-based, not remote.
          </p>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="bg-slate-50">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">FAQ</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Common Questions</h2>
          <p className="text-[15px] text-slate-500 mb-6 leading-relaxed">Everything you need to know.</p>

          {faqData.map((faq, idx) => (
            <div key={idx} className="border-b border-gray-200 py-4">
              <button
                onClick={() => {
                  setOpenFaq(openFaq === idx ? -1 : idx);
                  if (openFaq !== idx) trackFaqOpen(idx);
                }}
                className="flex justify-between items-center w-full text-left text-[15px] font-semibold text-slate-900 gap-3 cursor-pointer bg-transparent border-none p-0"
                style={{ fontFamily: 'inherit' }}
              >
                <span>{faq.q}</span>
                <span className="text-xl text-slate-400 flex-shrink-0">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <p className="text-sm text-slate-500 leading-relaxed mt-2.5">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section className="text-center" id="contact">
        <div className="py-12 px-5 max-w-[680px] mx-auto">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Get Started</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Ready to Deploy AI That Works?</h2>
          <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
            Free consultation. No commitment. We&rsquo;ll show you exactly how AI can execute work for your business.
          </p>
          <div className="flex flex-col gap-2.5 max-w-[360px] mx-auto">
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTelegramClick}
                className="flex items-center gap-3 py-[15px] px-5 rounded-xl bg-[#0088cc] text-white no-underline text-[15px] font-semibold"
              >
                <span className="text-xl">✈️</span>
                <span className="text-left"><span>Telegram</span><small className="block text-xs opacity-80 font-normal">Fastest — usually within 1 hour</small></span>
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="flex items-center gap-3 py-[15px] px-5 rounded-xl bg-[#25D366] text-white no-underline text-[15px] font-semibold"
              >
                <span className="text-xl">💬</span>
                <span className="text-left"><span>WhatsApp</span><small className="block text-xs opacity-80 font-normal">{data.whatsapp_number || 'Chat with us'}</small></span>
              </a>
            )}
            <a
              href={emailUrl}
              onClick={handleEmailClick}
              className="flex items-center gap-3 py-[15px] px-5 rounded-xl bg-white text-slate-700 no-underline text-[15px] font-semibold border border-gray-200"
            >
              <span className="text-xl">📧</span>
              <span className="text-left"><span>Email</span><small className="block text-xs opacity-80 font-normal">{data.owner_email || 'kaneliu10@gmail.com'}</small></span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <div className="text-center py-6 px-5 text-xs text-slate-400">
        © 2026 AI智能安装服务 ·{' '}
        <Link href={personalUrl} className="text-slate-500 no-underline">Personal Setup</Link>
        {' '}· Manila, Philippines
      </div>

      {/* ═══════ STICKY BAR ═══════ */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex items-center justify-between gap-3 z-[1000] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="text-xs text-slate-500">
          <strong className="block text-[15px] text-slate-900 font-bold">From ₱50,000</strong>
          Free consultation
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConsultClick}
            className="py-2.5 px-4 rounded-xl text-[13px] font-bold bg-indigo-600 text-white whitespace-nowrap cursor-pointer border-none hover:bg-indigo-700 transition-all"
            style={{ fontFamily: 'inherit' }}
          >
            Contact Us
          </button>
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackTelegramClick()}
              className="py-2.5 px-4 rounded-xl text-[13px] font-bold bg-[#0088cc] text-white whitespace-nowrap no-underline"
            >
              Telegram
            </a>
          )}
        </div>
      </div>

      {/* ═══════ MODALS ═══════ */}
      <ConsultFormModal open={showConsultForm} onClose={() => setShowConsultForm(false)} slug={data.slug} locale={locale} />
      <ConsultModal open={showConsultModal} onClose={() => setShowConsultModal(false)} slug={data.slug} />
      <BookingModal open={showBookingModal} onClose={() => setShowBookingModal(false)} slug={data.slug} />
    </div>
  );
}
