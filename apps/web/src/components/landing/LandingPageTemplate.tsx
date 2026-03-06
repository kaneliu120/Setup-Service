'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Check, Mail, MessageCircle, Phone, Globe, ChevronDown, ChevronRight,
  X, Calendar, Clock, Send, Loader2, MessageSquare, CalendarCheck,
  Share2, Heart, Copy, CheckCheck
} from 'lucide-react';
import api from '@/lib/api';
import ConsultFormModal from '@/components/shared/ConsultFormModal';
import {
  trackWhatsAppClick,
  trackTelegramClick,
  trackEmailClick,
  trackPhoneClick,
  trackConsultClick,
  trackBookClick,
  trackConsultationSubmit,
  trackBookingSubmit,
  trackShareClick,
  trackScrollToContact,
  trackFaqOpen,
} from '@/lib/tracking';

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

interface FaqItem {
  title: string | string[];
  content: string | string[];
  image?: string;
}

/** A translatable field: either a plain string or an array of strings (one per language). */
type T = string | string[];

export interface LandingPageData {
  header_title: string;
  header_subtitle?: string;
  languages?: string[];
  location_label?: string;
  hero_headline: T;
  hero_description: T;
  hero_cta_text?: T;
  consultation_btn_text?: T;
  consultation_btn_desc?: T;
  booking_btn_text?: T;
  booking_btn_desc?: T;
  faq_title?: T;
  faq_items?: FaqItem[];
  about_title: T;
  about_text: T;
  services_title: T;
  services: ServiceItem[];
  pricing_title: T;
  pricing_amount: T;
  pricing_details: string[];
  pricing_note?: T;
  cta_title: T;
  cta_description: T;
  contact_methods: ContactMethod[];
  footer_text: T;
  primary_color?: string;
  accent_color?: string;
  telegram_group?: string;
  telegram_handle?: string;
  whatsapp_group?: string;
  whatsapp_number?: string;
  owner_email?: string;
  slug?: string;
}

/**
 * Resolve a translatable field to the active language string.
 * If the field is a plain string, return it directly (backward compatible).
 * If it's an array, return the entry at `langIdx`, falling back to index 0.
 */
function t(field: T | undefined, langIdx: number, fallback = ''): string {
  if (field === undefined || field === null) return fallback;
  if (typeof field === 'string') return field;
  return field[langIdx] ?? field[0] ?? fallback;
}

/** Resolve a FaqItem field for the active language */
function tFaq(field: string | string[], langIdx: number): string {
  if (typeof field === 'string') return field;
  return field[langIdx] ?? field[0] ?? '';
}

const contactIcon = (type: string) => {
  switch (type) {
    case 'whatsapp':
    case 'telegram':
      return <MessageCircle className="w-5 h-5" />;
    case 'email':
      return <Mail className="w-5 h-5" />;
    case 'phone':
      return <Phone className="w-5 h-5" />;
    default:
      return <Globe className="w-5 h-5" />;
  }
};

/* ─────────────── Modal i18n strings ─────────────── */
const modalI18n = {
  consultation: {
    title:       ['💬 Consultation', '💬 咨询留言', '💬 Konsultasyon'],
    subtitle:    ['Leave your question or request, I will reply ASAP', '请留下您的问题或需求，我会尽快回复您', 'Iwan ang iyong tanong o kahilingan, sasagutin ko agad'],
    contactLabel:['Your contact info (optional)', '您的联系方式 (可选)', 'Contact info mo (opsyonal)'],
    contactPh:   ['Email / Phone / Telegram...', '邮箱 / 电话 / Telegram...', 'Email / Phone / Telegram...'],
    msgLabel:    ['Message *', '咨询内容 *', 'Mensahe *'],
    msgPh:       ['Describe your needs or question...', '请描述您的需求或问题...', 'Ilarawan ang iyong pangangailangan o tanong...'],
    send:        ['Send', '发送', 'Ipadala'],
    sending:     ['Sending...', '发送中...', 'Ipinapadala...'],
    sentTitle:   ['Sent!', '已发送！', 'Naipadala na!'],
    sentDesc:    ['I will contact you shortly', '我会尽快与您联系', 'Makikipag-ugnayan ako sa iyo sa lalong madaling panahon'],
    failAlert:   ['Failed to send, please try again', '发送失败，请稍后重试', 'Hindi naipadala, subukan ulit'],
  },
  booking: {
    title:       ['📅 Book Service', '📅 预约服务', '📅 Mag-book ng Serbisyo'],
    subtitle:    ['Fill in the details below, I will confirm shortly', '请填写以下信息，提交后我会尽快确认', 'Punan ang detalye sa ibaba, kokontakin kita agad'],
    nameLabel:   ['Your name *', '您的称呼 *', 'Pangalan mo *'],
    namePh:      ['e.g. Mr. Zhang / Maria', '例如：张先生 / Maria', 'hal. Maria / G. Santos'],
    contactLabel:['Contact *', '联系方式 *', 'Contact *'],
    contactPh:   ['Enter your contact', '请输入联系方式', 'Ilagay ang iyong contact'],
    contactTypes:{
      phone:     ['Phone', '电话', 'Telepono'],
      email:     ['Email', '邮箱', 'Email'],
      telegram:  ['Telegram', 'Telegram', 'Telegram'],
      whatsapp:  ['WhatsApp', 'WhatsApp', 'WhatsApp'],
      wechat:    ['WeChat', '微信', 'WeChat'],
      line:      ['LINE', 'LINE', 'LINE'],
      other:     ['Other', '其他', 'Iba pa'],
    },
    timeLabel:   ['Appointment time *', '预约时间 *', 'Oras ng appointment *'],
    contentLabel:['What do you need? *', '预约内容 *', 'Ano ang kailangan mo? *'],
    contentPh:   ['Describe the service you need...', '请描述您需要的服务内容...', 'Ilarawan ang serbisyong kailangan mo...'],
    submit:      ['Confirm Booking', '确认预约', 'Kumpirmahin ang Booking'],
    submitting:  ['Submitting...', '提交中...', 'Isinusumite...'],
    sentTitle:   ['Booked!', '预约成功！', 'Na-book na!'],
    sentDesc:    ['I will confirm with you before the appointment', '我会在预约时间前与您确认', 'Kokontakin kita bago ang appointment'],
    failAlert:   ['Booking failed, please try again', '预约提交失败，请稍后重试', 'Hindi nai-book, subukan ulit'],
  },
  share: {
    btnText:     ['Share Friends ✨', '分享好友 ✨', 'Share Friends ✨'],
    btnDesc:     ['Tell your friend to mention your name', '朋友联系我时，报上您的名字即可', 'Sabihin ang pangalan mo sa friend mo'],
    copiedToast: ['Link copied!', '链接已复制！', 'Na-copy na ang link!'],
    title:       ['❤️ A Heartfelt Thank You', '❤️ 感激您的每一次分享', '❤️ Maraming Salamat sa Tiwala!'],
    body: [
`Thank you so much for sharing this with your friends.
Your kindness and trust mean the world to me. I truly believe that good deeds bring good fortune, and I wish you all the luck in the world! ✨

🎁 A Token of Appreciation:
As a small way to say thanks, if a friend you refer successfully sets up the service, I have a special premium gift waiting for you.

Let's stay in touch:
Please message me so I know who to thank!`,
`非常感谢您愿意将我推荐给您的朋友。
在这个快节奏的时代，您的信任和善意对我来说无比珍贵。
真心祝愿这份善念能为您带来好运和福气！✨

🎁 小小谢礼：
如果您的朋友通过您的介绍成功安装了服务，请一定告诉我。
我为您准备了一份精美的专属礼品（或现金红包），作为我对您支持的感激。

联系我领取：`,
`Salamat sa pag-share nito sa mga friends mo.
Napakalaking bagay ng tulong at kabutihan mo para sa akin. Sana swertehin ka sa lahat ng ginagawa mo dahil sa good vibes na binibigay mo! ✨

🎁 May Gift Ako Para Sa'yo:
Bilang pasasalamat, kapag may nag-avail ng service dahil sa recommendation mo, may special gift akong nakahanda para sa'yo.

Message mo lang ako:
Wag mahiyang magsabi para maipadala ko sa'yo!`,
    ],
    contactCta: [
      '[Your WhatsApp / Mobile Number]',
      '[您的飞机号 / 手机号]',
      '[Your Mobile / GCash Number]',
    ],
  },
};

function ml(arr: string[], langIdx: number): string {
  return arr[langIdx] ?? arr[0] ?? '';
}

/* ─────────────── Consultation Modal ─────────────── */
function ConsultationModal({
  open, onClose, ownerEmail, slug, langIdx,
}: {
  open: boolean; onClose: () => void; ownerEmail?: string; slug?: string; langIdx: number;
}) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const L = modalI18n.consultation;

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
    } catch (err) {
      console.error('Failed to send consultation:', err);
      alert(ml(L.failAlert, langIdx));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 w-full sm:w-auto sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[85vh] overflow-y-auto pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{ml(L.sentTitle, langIdx)}</h3>
            <p className="text-gray-400 text-sm">{ml(L.sentDesc, langIdx)}</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 pr-8">{ml(L.title, langIdx)}</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6">{ml(L.subtitle, langIdx)}</p>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">{ml(L.contactLabel, langIdx)}</label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder={ml(L.contactPh, langIdx)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">{ml(L.msgLabel, langIdx)}</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={ml(L.msgPh, langIdx)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || sending}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? ml(L.sending, langIdx) : ml(L.send, langIdx)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Booking Modal ─────────────── */
function BookingModal({
  open, onClose, slug, langIdx,
}: {
  open: boolean; onClose: () => void; slug?: string; langIdx: number;
}) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('phone');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const L = modalI18n.booking;
  const CT = L.contactTypes;

  // Default to current time rounded to next hour
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
    } catch (err) {
      console.error('Booking failed:', err);
      alert(ml(L.failAlert, langIdx));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 w-full sm:w-auto sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{ml(L.sentTitle, langIdx)}</h3>
            <p className="text-gray-400 text-sm">{ml(L.sentDesc, langIdx)}</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 pr-8">{ml(L.title, langIdx)}</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6">{ml(L.subtitle, langIdx)}</p>

            <div className="space-y-3 sm:space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">{ml(L.nameLabel, langIdx)}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={ml(L.namePh, langIdx)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">{ml(L.contactLabel, langIdx)}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={contactType}
                    onChange={e => setContactType(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 sm:min-w-[120px]"
                  >
                    {Object.entries(CT).map(([key, labels]) => (
                      <option key={key} value={key}>{ml(labels, langIdx)}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder={ml(L.contactPh, langIdx)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* DateTime */}
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {ml(L.timeLabel, langIdx)}
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm [color-scheme:dark]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">{ml(L.contentLabel, langIdx)}</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={ml(L.contentPh, langIdx)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !contact.trim() || !content.trim() || sending}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                {sending ? ml(L.submitting, langIdx) : ml(L.submit, langIdx)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Referral Thank-You Modal ─────────────── */
function ReferralModal({
  open, onClose, langIdx, contactMethods,
}: {
  open: boolean; onClose: () => void; langIdx: number; contactMethods: ContactMethod[];
}) {
  const S = modalI18n.share;

  if (!open) return null;

  // Build the contact line from actual data
  const contactLine = contactMethods
    .filter(m => ['telegram', 'whatsapp', 'phone'].includes(m.type))
    .map(m => m.value)
    .join(' / ') || ml(S.contactCta, langIdx);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 w-full sm:w-auto sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 relative max-h-[85vh] overflow-y-auto pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 fill-rose-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white pr-8">{ml(S.title, langIdx)}</h3>
        </div>

        <div className="text-gray-300 text-[13px] sm:text-sm leading-relaxed whitespace-pre-line mb-4">
          {ml(S.body, langIdx)}
        </div>

        {/* Contact info */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3.5 sm:p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {contactMethods
              .filter(m => ['telegram', 'whatsapp', 'phone'].includes(m.type))
              .map((m, idx) => (
                <a
                  key={idx}
                  href={
                    m.type === 'telegram' ? `https://t.me/${m.value.replace('@', '')}` :
                    m.type === 'whatsapp' ? `https://wa.me/${m.value.replace(/[^0-9]/g, '')}` :
                    `tel:${m.value}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {contactIcon(m.type)}
                  <span>{m.value}</span>
                </a>
              ))
            }
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
          <CheckCheck className="w-4 h-4" />
          <span>{ml(S.copiedToast, langIdx)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── FAQ Grid (2 columns) ─────────────── */
function FaqGrid({ items, primaryColor, langIdx }: { items: FaqItem[]; primaryColor: string; langIdx: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-xl overflow-hidden transition-all duration-300 border ${isOpen ? 'bg-gray-800/40 border-indigo-500/30 shadow-lg' : 'bg-gray-900/40 border-gray-800/40 hover:bg-gray-800/60'}`}
            style={isOpen ? { borderColor: `${primaryColor}60`, boxShadow: `0 4px 20px -5px ${primaryColor}20` } : {}}
          >
            <button
              onClick={() => {
                setOpenIndex(isOpen ? null : idx);
                if (!isOpen) trackFaqOpen(idx);
              }}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors min-h-[56px] group"
            >
              <span className={`font-medium text-[14px] sm:text-[15px] pr-4 leading-snug transition-colors ${isOpen ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                {tFaq(item.title, langIdx)}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-500/20 rotate-180' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}
                style={isOpen ? { backgroundColor: `${primaryColor}20`, color: primaryColor } : {}}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0'}`}
            >
              <div className="overflow-hidden px-5 min-h-0">
                {item.image && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-700/50 shadow-sm relative w-full aspect-video bg-gray-800">
                    <img
                      src={item.image}
                      alt="FAQ Illustration"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="text-gray-400 text-[13px] sm:text-sm leading-relaxed whitespace-pre-line">
                  {(() => {
                    const raw = tFaq(item.content, langIdx);
                    const parts = raw.split(/\*\*(.*?)\*\*/g);
                    if (parts.length === 1) return raw;
                    return parts.map((part, i) =>
                      i % 2 === 1
                        ? <strong key={i} className="text-lg text-white font-bold">{part}</strong>
                        : part
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── Main Template ─────────────── */
export default function LandingPageTemplate({ data }: { data: LandingPageData }) {
  const [activeLang, setActiveLang] = useState(0);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const primaryColor = data.primary_color || '#6366f1';
  const accentColor = data.accent_color || '#8b5cf6';

  // ─── Scroll-to-contact tracking ───
  useEffect(() => {
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;
    let tracked = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked) {
          tracked = true;
          trackScrollToContact();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(contactSection);
    return () => observer.disconnect();
  }, []);

  const handleShareClick = async () => {
    trackShareClick();
    try {
      // Copy current page URL to clipboard
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
    // Always show the thank-you modal
    setShowReferralModal(true);
  };

  const handleConsultClick = () => {
    trackConsultClick();
    setShowConsultForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* ─── Header / Navbar ─── */}
      <header className="border-b border-gray-800/50 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Left: title — truncates gracefully on mobile */}
          <div className="min-w-0 flex-shrink">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">{data.header_title}</h1>
            {data.header_subtitle && (
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{data.header_subtitle}</p>
            )}
          </div>
          {/* Right: language switcher — never wraps */}
          <div className="flex items-center flex-shrink-0">
            {data.languages && data.languages.length > 0 && (
              <div className="flex gap-0.5 sm:gap-1 text-xs">
                {data.languages.map((lang, idx) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(idx)}
                    className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-md transition-all min-h-[32px] min-w-[36px] flex items-center justify-center ${
                      activeLang === idx
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative py-14 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] rounded-full blur-[100px] sm:blur-[120px] opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${primaryColor}, ${accentColor})` }}
        />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          {data.location_label && (
            <span
              className="inline-flex items-center gap-1.5 text-xs px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-6 border"
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}40`,
                background: `${primaryColor}10`,
              }}
            >
              {data.location_label}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight mb-4 sm:mb-6 text-white tracking-tight">
            {t(data.hero_headline, activeLang)}
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            {t(data.hero_description, activeLang)}
          </p>

          {/* ─── Dual CTA Buttons ─── */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 sm:gap-6">
            {/* Consultation Button */}
            <div className="text-center w-full sm:w-auto">
              <button
                onClick={handleConsultClick}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base whitespace-nowrap transition-all hover:scale-105 active:scale-95 border-2 text-white min-h-[48px]"
                style={{ borderColor: primaryColor, background: `${primaryColor}15` }}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                {t(data.consultation_btn_text, activeLang, '我想咨询')}
              </button>
              <p className="text-xs text-gray-500 mt-2 max-w-[240px] sm:max-w-[200px] mx-auto leading-relaxed">
                {t(data.consultation_btn_desc, activeLang, '我不了解我想要什么，但是很感兴趣，我想咨询')}
              </p>
            </div>

            {/* Booking Button */}
            <div className="text-center w-full sm:w-auto">
              <button
                onClick={() => { trackBookClick(); setShowBookingModal(true); }}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-semibold text-sm sm:text-base whitespace-nowrap transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 min-h-[48px]"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                <CalendarCheck className="w-5 h-5 flex-shrink-0" />
                {t(data.booking_btn_text, activeLang, '我要预约')}
              </button>
              <p className="text-xs text-gray-500 mt-2 max-w-[240px] sm:max-w-[200px] mx-auto leading-relaxed">
                {t(data.booking_btn_desc, activeLang, '我很清楚我的要求，我想预约你的服务')}
              </p>
            </div>

            {/* Share / Referral Button */}
            <div className="text-center w-full sm:w-auto">
              <button
                onClick={handleShareClick}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base whitespace-nowrap transition-all hover:scale-105 active:scale-95 border-2 text-white min-h-[48px]"
                style={{ borderColor: accentColor, background: `${accentColor}15` }}
              >
                <Share2 className="w-5 h-5 flex-shrink-0" />
                {ml(modalI18n.share.btnText, activeLang)}
              </button>
              <p className="text-xs text-gray-500 mt-2 max-w-[260px] sm:max-w-[220px] mx-auto leading-relaxed">
                {ml(modalI18n.share.btnDesc, activeLang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section (Accordion) ─── */}
      {data.faq_items && data.faq_items.length > 0 && (
        <section className="py-10 sm:py-16 px-4 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center">
              {t(data.faq_title, activeLang, 'AI私人助理可以帮我解决哪些问题？')}
            </h3>
            <FaqGrid items={data.faq_items} primaryColor={primaryColor} langIdx={activeLang} />
          </div>
        </section>
      )}

      {/* ─── Services Section ─── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 bg-gray-900/30">
        <div className="container mx-auto max-w-3xl">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-8 sm:mb-10 text-center">{t(data.services_title, activeLang)}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {data.services.map((service, idx) => (
              <div
                key={idx}
                className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 sm:p-6 hover:border-gray-700/80 transition-all hover:-translate-y-1"
              >
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                  style={{ background: `${primaryColor}20` }}
                >
                  <span style={{ color: primaryColor }}>
                    <span className="text-xl sm:text-2xl">{service.icon}</span>
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{service.title}</h4>
                <p className="text-[13px] sm:text-sm text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-lg">
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{t(data.pricing_title, activeLang)}</h3>
            <div
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold my-5 sm:my-6"
              style={{ color: primaryColor }}
            >
              {t(data.pricing_amount, activeLang)}
            </div>
            <div className="text-left space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {data.pricing_details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${primaryColor}30` }}
                  >
                    <Check className="w-3 h-3" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-gray-300 text-[13px] sm:text-sm">{detail}</span>
                </div>
              ))}
            </div>
            {data.pricing_note && (
              <p className="text-xs text-gray-500 border-t border-gray-800 pt-3 sm:pt-4">
                {t(data.pricing_note, activeLang)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ─── CTA / Contact Section ─── */}
      <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden bg-gray-900/30">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[200px] sm:h-[300px] rounded-full blur-[100px] sm:blur-[120px] opacity-15 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
        />
        <div className="container mx-auto max-w-lg text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <img
              src="/images/cta-office.png"
              alt="Automated Solutions"
              className="rounded-2xl shadow-2xl max-w-full sm:max-w-md w-full h-auto object-cover"
            />
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">{t(data.cta_title, activeLang)}</h3>
          <p className="text-gray-400 text-sm sm:text-base mb-8 sm:mb-10">{t(data.cta_description, activeLang)}</p>
          <div className="space-y-3 sm:space-y-4">
            {data.contact_methods.map((method, idx) => {
              const href =
                method.type === 'email'
                  ? `mailto:${method.value}`
                  : method.type === 'whatsapp'
                    ? `https://wa.me/${method.value.replace(/[^0-9]/g, '')}`
                    : method.type === 'telegram'
                      ? `https://t.me/${method.value.replace('@', '')}`
                      : method.type === 'phone'
                        ? `tel:${method.value}`
                        : '#';
              return (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (method.type === 'whatsapp') trackWhatsAppClick();
                    else if (method.type === 'telegram') trackTelegramClick();
                    else if (method.type === 'email') trackEmailClick();
                    else if (method.type === 'phone') trackPhoneClick();
                  }}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gray-900/60 border border-gray-800/50 hover:border-gray-700 transition-all group gap-3 min-h-[56px]"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${primaryColor}20`, color: primaryColor }}
                    >
                      {contactIcon(method.type)}
                    </div>
                    <span className="text-gray-300 text-sm hidden sm:inline">{method.label}</span>
                  </div>
                  <span
                    className="font-medium text-[13px] sm:text-sm group-hover:underline truncate min-w-0"
                    style={{ color: primaryColor }}
                  >
                    {method.value}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── About Section (moved below contact) ─── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{t(data.about_title, activeLang)}</h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-line text-[13px] sm:text-sm">{t(data.about_text, activeLang)}</p>
          </div>
        </div>
      </section>

      {/* ═══════ PORTFOLIO & BLOG ═══════ */}
      <section className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex gap-3">
          <a
            href="/en/portfolio"
            className="flex-1 text-center py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold transition-all text-sm"
          >
            🎨 Portfolio
          </a>
          <a
            href="/en/blog"
            className="flex-1 text-center py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold transition-all text-sm"
          >
            📝 Blog
          </a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-800/50">
        <div className="container mx-auto max-w-4xl text-center text-xs sm:text-sm text-gray-500">
          {t(data.footer_text, activeLang)}
        </div>
      </footer>

      {/* ─── Modals ─── */}
      <ConsultationModal
        open={showConsultModal}
        onClose={() => setShowConsultModal(false)}
        ownerEmail={data.owner_email}
        slug={data.slug}
        langIdx={activeLang}
      />
      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        slug={data.slug}
        langIdx={activeLang}
      />
      <ReferralModal
        open={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        langIdx={activeLang}
        contactMethods={data.contact_methods}
      />
      <ConsultFormModal
        open={showConsultForm}
        onClose={() => setShowConsultForm(false)}
        slug={data.slug}
      />
    </div>
  );
}
