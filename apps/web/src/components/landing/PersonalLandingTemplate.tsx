'use client';

import { useState, useEffect } from 'react';
import {
  Check, X, Send, Loader2, Calendar, CalendarCheck,
  MessageSquare, Share2, Heart, CheckCheck, ChevronDown,
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
  trackShareClick,
  trackScrollToContact,
  trackFaqOpen,
} from '@/lib/tracking';

/* ================================================================
   Types
   ================================================================ */

interface AudienceCard {
  icon: string;
  title: string;
  description: string;
  tags: string[];
}

interface BeforeAfterItem {
  icon: string;
  text: string;
}

interface StepItem {
  title: string;
  description: string;
  time: string;
}

interface OfferItem {
  icon: string;
  title: string;
  description: string;
}

interface PriceInclude {
  text: string;
}

interface ReviewItem {
  text: string;
  name: string;
  role: string;
  avatar: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface AboutStat {
  value: string;
  label: string;
}

export interface PersonalPageData {
  slug?: string;

  /* Nav */
  brand_name?: string;
  languages?: string[];
  enterprise_link_text?: string;

  /* Hero */
  hero_label?: string;
  hero_headline: string;
  hero_headline_highlight?: string;
  hero_headline_suffix?: string;
  hero_sub: string;
  hero_price?: string;
  hero_price_detail?: string;
  hero_cta_main?: string;
  hero_cta_secondary?: string;
  hero_cta_secondary_link?: string;
  hero_badges?: string[];

  /* Compare banner */
  compare_text?: string;
  compare_link_text?: string;

  /* Who is this for */
  audience_tag?: string;
  audience_title?: string;
  audience_desc?: string;
  audience_cards?: AudienceCard[];

  /* Before / After */
  ba_tag?: string;
  ba_title?: string;
  ba_desc?: string;
  ba_before_label?: string;
  ba_after_label?: string;
  before_items?: BeforeAfterItem[];
  after_items?: BeforeAfterItem[];

  /* How it works */
  steps_tag?: string;
  steps_title?: string;
  steps_desc?: string;
  steps?: StepItem[];

  /* What you get */
  offer_tag?: string;
  offer_title?: string;
  offer_desc?: string;
  offers?: OfferItem[];

  /* Pricing */
  pricing_tag?: string;
  pricing_title?: string;
  pricing_desc?: string;
  pricing_label?: string;
  pricing_currency?: string;
  pricing_amount?: string;
  pricing_once?: string;
  pricing_includes?: PriceInclude[];
  pricing_vs_line1?: string;
  pricing_vs_line2?: string;
  pricing_guarantee?: string;
  pricing_note?: string;

  /* Enterprise upsell */
  upsell_title?: string;
  upsell_desc?: string;
  upsell_link_text?: string;

  /* Reviews */
  reviews_tag?: string;
  reviews_title?: string;
  reviews_desc?: string;
  reviews?: ReviewItem[];

  /* About */
  about_tag?: string;
  about_title?: string;
  about_photo?: string;
  about_name?: string;
  about_role?: string;
  about_bio?: string;
  about_stats?: AboutStat[];

  /* FAQ */
  faq_tag?: string;
  faq_title?: string;
  faq_items?: FaqItem[];

  /* Contact */
  contact_tag?: string;
  contact_title?: string;
  contact_desc?: string;
  telegram_group?: string;
  telegram_handle?: string;
  telegram_label?: string;
  telegram_sub?: string;
  whatsapp_group?: string;
  whatsapp_number?: string;
  whatsapp_label?: string;
  whatsapp_sub?: string;
  owner_email?: string;
  email_label?: string;
  email_sub?: string;

  /* Referral */
  referral_text?: string;
  referral_link_text?: string;

  /* Footer */
  footer_text?: string;

  /* Sticky */
  sticky_price?: string;
  sticky_sub?: string;
  sticky_cta?: string;
  sticky_tg?: string;

  /* Legacy compat */
  [key: string]: any;
}

/* ================================================================
   Consultation Modal (light theme)
   ================================================================ */
function ConsultationModal({
  open, onClose, slug,
}: {
  open: boolean; onClose: () => void; slug?: string;
}) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/bookings/consultation', {
        message: message.trim(),
        contact: contact.trim() || undefined,
        source_slug: slug,
      });
      setSent(true);
      trackConsultationSubmit();
    } catch {
      alert('Failed to send, please try again');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full sm:w-auto sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sent!</h3>
            <p className="text-slate-500 text-sm">I will contact you shortly</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1 pr-8">Book Free Consultation</h3>
            <p className="text-slate-500 text-xs mb-5">Leave your question, I will reply ASAP</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Your contact (optional)</label>
                <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="Email / Phone / Telegram..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Message *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your needs..." rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm resize-none bg-slate-50" />
              </div>
              <button onClick={handleSubmit} disabled={!message.trim() || sending} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Booking Modal (light theme)
   ================================================================ */
function BookingModal({
  open, onClose, slug,
}: {
  open: boolean; onClose: () => void; slug?: string;
}) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('phone');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
        source_slug: slug,
      });
      setSent(true);
      trackBookingSubmit();
    } catch {
      alert('Booking failed, please try again');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full sm:w-auto sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Booked!</h3>
            <p className="text-slate-500 text-sm">I will confirm with you before the appointment</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1 pr-8">Book Service</h3>
            <p className="text-slate-500 text-xs mb-5">Fill in the details, I will confirm shortly</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Your name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maria" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Contact *</label>
                <div className="flex gap-2">
                  <select value={contactType} onChange={e => setContactType(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 min-w-[120px] bg-slate-50">
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="Enter your contact" className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Appointment time *</label>
                <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 text-sm bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">What do you need? *</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe the service you need..." rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm resize-none bg-slate-50" />
              </div>
              <button onClick={handleSubmit} disabled={!name.trim() || !contact.trim() || !content.trim() || sending} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                {sending ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   FAQ Accordion
   ================================================================ */
function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div>
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="border-b border-slate-200">
            <button
              onClick={() => {
                setOpenIdx(isOpen ? -1 : idx);
                if (!isOpen) trackFaqOpen(idx);
              }}
              className="w-full flex justify-between items-center py-4 text-left gap-3"
            >
              <span className={`text-sm font-semibold ${isOpen ? 'text-slate-900' : 'text-slate-800'}`}>{item.question}</span>
              <span className={`text-lg flex-shrink-0 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="pb-4 text-[13px] text-slate-500 leading-relaxed pr-7">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Main Template
   ================================================================ */
export default function PersonalLandingTemplate({
  data,
  locale,
}: {
  data: PersonalPageData;
  locale: string;
}) {
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  // Sticky bar: show after scrolling past hero
  useEffect(() => {
    const handleScroll = () => setStickyVisible(window.pageYOffset > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-to-contact tracking
  useEffect(() => {
    const el = document.getElementById('contact');
    if (!el) return;
    let tracked = false;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !tracked) { tracked = true; trackScrollToContact(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleConsultClick = () => {
    trackConsultClick();
    setShowConsultForm(true);
  };

  const handleShare = async () => {
    trackShareClick();
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: data.brand_name || 'AI Setup Service', text: data.hero_sub, url });
      } catch { /* cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  const smoothScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const telegramUrl = data.telegram_group
    ? (data.telegram_group.startsWith('http') ? data.telegram_group : `https://t.me/${data.telegram_group.replace('@', '')}`)
    : data.telegram_handle
      ? `https://t.me/${data.telegram_handle.replace('@', '')}`
      : '#';
  const whatsappUrl = data.whatsapp_group
    ? data.whatsapp_group
    : data.whatsapp_number ? `https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, '')}` : '#';
  const emailUrl = data.owner_email ? `mailto:${data.owner_email}` : '#';
  const enterpriseUrl = `/${locale}/enterprise`;

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ═══════ NAV ═══════ */}
      <nav className="sticky top-0 z-[100] flex justify-between items-center px-5 py-2.5 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-bold text-slate-900 no-underline">
          <span className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center text-white text-[11px] font-extrabold">AI</span>
          {data.brand_name || 'AI Setup Service'}
        </Link>
        <div className="flex items-center gap-3">
          <Link href={enterpriseUrl} className="text-xs text-indigo-600 font-semibold no-underline px-2.5 py-1.5 border border-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all">
            {data.enterprise_link_text || 'Enterprise'} →
          </Link>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-[#1a1f3a] text-white py-11 px-5 text-center overflow-hidden">
        <div className="absolute -top-30 -right-20 w-80 h-80 bg-[radial-gradient(circle,rgba(79,70,229,0.2)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-15 w-60 h-60 bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

        {data.hero_label && (
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-[13px] text-white/75 mb-6">
            <span className="w-[7px] h-[7px] bg-emerald-400 rounded-full animate-pulse" />
            {data.hero_label}
          </div>
        )}

        <h1 className="text-[26px] md:text-[38px] font-extrabold leading-[1.25] mb-3.5 tracking-tight relative max-w-[560px] mx-auto">
          {data.hero_headline_highlight ? (
            <>
              {data.hero_headline.split(data.hero_headline_highlight)[0]}
              <span className="bg-gradient-to-br from-indigo-400 to-emerald-300 bg-clip-text text-transparent">{data.hero_headline_highlight}</span>
              {data.hero_headline_suffix || data.hero_headline.split(data.hero_headline_highlight)[1] || ''}
            </>
          ) : (
            data.hero_headline
          )}
        </h1>

        <p className="text-[15px] md:text-[17px] text-white/70 leading-relaxed mb-5 max-w-[400px] mx-auto">
          {data.hero_sub}
        </p>

        {data.hero_price && (
          <div className="inline-flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-[10px] px-5 py-2.5 mb-7">
            <span className="text-[22px] font-extrabold text-emerald-300">{data.hero_price}</span>
            <span className="w-px h-5 bg-white/15" />
            <span className="text-xs text-white/55 text-left leading-snug whitespace-pre-line">{data.hero_price_detail || 'One-time fee\nPay after setup'}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2.5 max-w-[340px] md:max-w-[440px] mx-auto">
          <button
            onClick={handleConsultClick}
            className="flex items-center justify-center gap-2 border-none rounded-xl px-6 py-[15px] text-[15px] font-semibold cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-px transition-all flex-1"
          >
            {data.hero_cta_main || 'Book Free Consultation'}
          </button>
          {data.hero_cta_secondary && (
            <a
              href={data.hero_cta_secondary_link || telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackTelegramClick()}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-[15px] text-[15px] font-semibold bg-white/7 border border-white/15 text-white hover:bg-white/12 transition-all flex-1 no-underline"
            >
              {data.hero_cta_secondary}
            </a>
          )}
        </div>

        {data.hero_badges && data.hero_badges.length > 0 && (
          <div className="flex justify-center gap-4 mt-5.5 flex-wrap">
            {data.hero_badges.map((badge, idx) => (
              <span key={idx} className="text-[11px] text-white/50 flex items-center gap-1">{badge}</span>
            ))}
          </div>
        )}
      </section>

      {/* ═══════ COMPARE BANNER ═══════ */}
      {data.compare_text && (
        <div className="bg-gradient-to-r from-indigo-50 to-green-50 px-5 py-4 text-center border-b border-slate-200">
          <p className="text-[13px] text-slate-600">
            {data.compare_text}{' '}
            <Link href={enterpriseUrl} className="text-indigo-600 font-bold no-underline">{data.compare_link_text || 'See Enterprise Solutions →'}</Link>
          </p>
        </div>
      )}

      {/* ═══════ WHO IS THIS FOR ═══════ */}
      {data.audience_cards && data.audience_cards.length > 0 && (
        <section className="bg-slate-50">
          <div className="max-w-[640px] mx-auto py-13 px-5">
            {data.audience_tag && <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.audience_tag}</span>}
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-1.5 tracking-tight leading-tight">{data.audience_title}</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">{data.audience_desc}</p>

            <div className="space-y-3.5">
              {data.audience_cards.map((card, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-[14px] px-5 py-6 relative overflow-hidden transition-all hover:border-indigo-600 hover:shadow-md group">
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-9 h-9 bg-indigo-50 rounded-[10px] flex items-center justify-center text-lg mb-3.5">{card.icon}</div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-tight">{card.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-3.5">{card.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag, tidx) => (
                      <span key={tidx} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-[5px] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ BEFORE / AFTER ═══════ */}
      {data.before_items && data.after_items && (
        <section>
          <div className="max-w-[640px] mx-auto py-13 px-5 text-center">
            {data.ba_tag && <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.ba_tag}</span>}
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-1.5 tracking-tight">{data.ba_title}</h2>
            <p className="text-sm text-slate-500 mb-8">{data.ba_desc}</p>

            <div className="grid grid-cols-2 gap-0.5 rounded-[14px] overflow-hidden mb-3">
              <div className="bg-red-50 p-4 md:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-red-600 mb-3">{data.ba_before_label || '❌ Before'}</div>
                {data.before_items.map((item, idx) => (
                  <div key={idx} className="text-[13px] text-slate-600 py-1.5 flex items-start gap-1.5 leading-snug text-left">
                    <span className="flex-shrink-0 text-xs mt-0.5">{item.icon}</span>{item.text}
                  </div>
                ))}
              </div>
              <div className="bg-green-50 p-4 md:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-3">{data.ba_after_label || '✅ After'}</div>
                {data.after_items.map((item, idx) => (
                  <div key={idx} className="text-[13px] text-slate-600 py-1.5 flex items-start gap-1.5 leading-snug text-left">
                    <span className="flex-shrink-0 text-xs mt-0.5">{item.icon}</span>{item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ HOW IT WORKS ═══════ */}
      {data.steps && data.steps.length > 0 && (
        <section className="bg-slate-50">
          <div className="max-w-[640px] mx-auto py-13 px-5">
            {data.steps_tag && <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.steps_tag}</span>}
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-1.5 tracking-tight">{data.steps_title}</h2>
            <p className="text-sm text-slate-500 mb-8">{data.steps_desc}</p>

            <div className="relative">
              {data.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 mb-6 last:mb-0 relative">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                    {idx < data.steps!.length - 1 && <div className="w-0.5 flex-grow bg-indigo-100 mt-1" />}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">{step.title}</h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{step.description}</p>
                    <span className="inline-block text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded mt-1.5 font-semibold">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ WHAT YOU GET ═══════ */}
      {data.offers && data.offers.length > 0 && (
        <section>
          <div className="max-w-[640px] mx-auto py-13 px-5">
            {data.offer_tag && <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.offer_tag}</span>}
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-1.5 tracking-tight">{data.offer_title}</h2>
            <p className="text-sm text-slate-500 mb-8">{data.offer_desc}</p>

            <div className="flex flex-col gap-2.5">
              {data.offers.map((offer, idx) => (
                <div key={idx} className="flex items-start gap-3.5 bg-slate-50 rounded-lg p-4">
                  <div className="flex-shrink-0 w-[34px] h-[34px] bg-white rounded-lg flex items-center justify-center text-[17px] shadow-sm">{offer.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">{offer.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{offer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ PRICING ═══════ */}
      <section className="bg-slate-900 text-white" id="pricing">
        <div className="max-w-[640px] mx-auto py-13 px-5 text-center">
          <span className="inline-block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{data.pricing_tag || 'Pricing'}</span>
          <h2 className="text-[22px] font-extrabold text-white mb-1.5 tracking-tight">{data.pricing_title || 'One Price. No Surprises.'}</h2>
          <p className="text-sm text-white/50 mb-8">{data.pricing_desc}</p>

          <div className="bg-white/4 border border-white/8 rounded-[18px] px-6 py-8 relative">
            {data.pricing_label && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wide">{data.pricing_label}</div>
            )}
            <div className="text-[52px] font-extrabold tracking-tighter my-3">
              <span className="text-[22px] font-semibold align-top mr-0.5 text-white/60">{data.pricing_currency || '₱'}</span>
              {data.pricing_amount || '5,000'}
            </div>
            <div className="text-[13px] text-white/45 mb-6">{data.pricing_once || 'One-time flat fee · No subscription'}</div>

            {data.pricing_includes && (
              <div className="text-left mb-6">
                {data.pricing_includes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 py-[7px] text-sm text-white/78">
                    <span className="text-emerald-400 font-bold text-[15px]">✓</span>
                    {item.text}
                  </div>
                ))}
              </div>
            )}

            {(data.pricing_vs_line1 || data.pricing_vs_line2) && (
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-[10px] p-3.5 text-[13px] text-amber-200 mb-5 leading-relaxed">
                {data.pricing_vs_line1 && <>{data.pricing_vs_line1}<br /></>}
                {data.pricing_vs_line2}
              </div>
            )}

            {data.pricing_guarantee && (
              <div className="inline-flex items-center gap-1.5 text-[13px] text-emerald-300 font-semibold">{data.pricing_guarantee}</div>
            )}

            {data.pricing_note && (
              <p className="text-[11px] text-white/30 mt-5 leading-relaxed">{data.pricing_note}</p>
            )}
          </div>

          {/* Enterprise Upsell */}
          {data.upsell_title && (
            <div className="bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-200 rounded-[14px] p-5 text-center mt-7">
              <h4 className="text-[15px] font-bold text-slate-900 mb-1.5">{data.upsell_title}</h4>
              <p className="text-[13px] text-slate-500 mb-3.5 leading-relaxed">{data.upsell_desc}</p>
              <Link href={enterpriseUrl} className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 no-underline hover:underline">
                {data.upsell_link_text || 'Explore Enterprise Solutions →'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ PORTFOLIO & BLOG ═══════ */}
      <section className="max-w-[640px] mx-auto py-10 px-5">
        <div className="flex gap-3">
          <Link href={`/${locale}/portfolio`} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-5 py-4 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all no-underline">
            🎨 Portfolio
          </Link>
          <Link href={`/${locale}/blog`} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-5 py-4 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all no-underline">
            📝 Blog
          </Link>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      {data.reviews && data.reviews.length > 0 && (
        <section className="bg-slate-50">
          <div className="max-w-[640px] mx-auto py-13 px-5">
            <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.reviews_tag || 'Reviews'}</span>
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-1.5 tracking-tight">{data.reviews_title || 'What Clients Say'}</h2>
            <p className="text-sm text-slate-500 mb-8">{data.reviews_desc}</p>

            <div className="space-y-3">
              {data.reviews.map((review, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-[14px] p-5">
                  <div className="text-amber-500 text-[13px] tracking-wider mb-2.5">★★★★★</div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3.5">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[13px] font-bold text-indigo-600">{review.avatar}</div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{review.name}</div>
                      <div className="text-[11px] text-slate-400">{review.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ ABOUT ═══════ */}
      <section>
        <div className="max-w-[640px] mx-auto py-13 px-5" id="about">
          <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.about_tag || 'About'}</span>
          <h2 className="text-[22px] font-extrabold text-slate-900 mb-6 tracking-tight">{data.about_title || "Who's Setting This Up?"}</h2>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-[28px]">{data.about_photo || '👨‍💻'}</div>
            <div>
              <h4 className="text-[17px] font-bold text-slate-900 mb-0.5">{data.about_name || 'Kane'}</h4>
              <div className="text-[13px] text-slate-400 mb-2.5">{data.about_role || 'Tech Manager'}</div>
              <p className="text-[13px] text-slate-500 leading-relaxed">{data.about_bio}</p>
            </div>
          </div>

          {data.about_stats && data.about_stats.length > 0 && (
            <div className="flex gap-6 mt-5">
              {data.about_stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-[22px] font-extrabold text-indigo-600">{stat.value}</div>
                  <div className="text-[11px] text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      {data.faq_items && data.faq_items.length > 0 && (
        <section className="bg-slate-50" id="faq">
          <div className="max-w-[640px] mx-auto py-13 px-5">
            <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.faq_tag || 'FAQ'}</span>
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-6 tracking-tight">{data.faq_title || 'Common Questions'}</h2>
            <FaqAccordion items={data.faq_items} />
          </div>
        </section>
      )}

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact">
        <div className="max-w-[640px] mx-auto py-13 px-5 text-center">
          <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{data.contact_tag || 'Get started'}</span>
          <h2 className="text-[22px] font-extrabold text-slate-900 mb-1.5 tracking-tight">{data.contact_title || "Ready? Let's Talk."}</h2>
          <p className="text-sm text-slate-500 mb-8">{data.contact_desc || 'Free consultation. No commitment.'}</p>

          <div className="flex flex-col gap-2.5 max-w-[380px] mx-auto">
            {(data.telegram_group || data.telegram_handle) && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackTelegramClick()} className="flex items-center gap-3.5 px-[18px] py-4 rounded-[14px] bg-[#0088cc] text-white no-underline text-sm font-medium hover:opacity-90 transition-opacity">
                <span className="text-xl flex-shrink-0">✈️</span>
                <span className="text-left"><span className="block">{data.telegram_label || 'Telegram'}</span><small className="opacity-75 text-[11px] font-normal">{data.telegram_sub || 'Fastest — usually within 1 hour'}</small></span>
              </a>
            )}
            {(data.whatsapp_group || data.whatsapp_number) && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick()} className="flex items-center gap-3.5 px-[18px] py-4 rounded-[14px] bg-[#25D366] text-white no-underline text-sm font-medium hover:opacity-90 transition-opacity">
                <span className="text-xl flex-shrink-0">💬</span>
                <span className="text-left"><span className="block">{data.whatsapp_label || 'WhatsApp'}</span><small className="opacity-75 text-[11px] font-normal">{data.whatsapp_sub || data.whatsapp_number}</small></span>
              </a>
            )}
            {data.owner_email && (
              <a href={emailUrl} onClick={() => trackEmailClick()} className="flex items-center gap-3.5 px-[18px] py-4 rounded-[14px] bg-white text-slate-600 border border-slate-200 no-underline text-sm font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all">
                <span className="text-xl flex-shrink-0">📧</span>
                <span className="text-left"><span className="block">{data.email_label || 'Email'}</span><small className="opacity-75 text-[11px] font-normal">{data.email_sub || data.owner_email}</small></span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Referral */}
      {data.referral_text && (
        <div className="text-center py-7 px-5">
          <p className="text-[13px] text-slate-400">
            {data.referral_text}{' '}
            <button onClick={handleShare} className="text-indigo-600 font-bold bg-transparent border-none cursor-pointer text-[13px]">{data.referral_link_text || 'Share this page ✨'}</button>
          </p>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <div className="text-center py-5 px-5 text-[11px] text-slate-400">
        {data.footer_text || '© 2026 AI Setup Service'} · <Link href={enterpriseUrl} className="text-indigo-600 no-underline font-semibold">Enterprise</Link>
      </div>

      {/* ═══════ STICKY BAR ═══════ */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 z-[999] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 ${stickyVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="leading-tight">
          <strong className="block text-[17px] font-extrabold text-slate-900">{data.sticky_price || data.hero_price || '₱5,000'}</strong>
          <small className="text-[11px] text-slate-400">{data.sticky_sub || 'Pay after setup'}</small>
        </div>
        <div className="flex gap-2">
          <button onClick={handleConsultClick} className="px-4 py-2.5 rounded-[10px] text-[13px] font-bold bg-indigo-600 text-white border-none cursor-pointer whitespace-nowrap">{data.sticky_cta || 'Book Now'}</button>
          {(data.telegram_group || data.telegram_handle) && (
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackTelegramClick()} className="px-4 py-2.5 rounded-[10px] text-[13px] font-bold bg-[#0088cc] text-white no-underline whitespace-nowrap">{data.sticky_tg || 'Telegram'}</a>
          )}
        </div>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="h-[76px]" />

      {/* ═══════ MODALS ═══════ */}
      <ConsultFormModal open={showConsultForm} onClose={() => setShowConsultForm(false)} slug={data.slug} locale={locale} />
      <ConsultationModal open={showConsultModal} onClose={() => setShowConsultModal(false)} slug={data.slug} />
      <BookingModal open={showBookingModal} onClose={() => setShowBookingModal(false)} slug={data.slug} />
    </div>
  );
}
