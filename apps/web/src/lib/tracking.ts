/**
 * Unified event tracking for GA4 + Google Ads
 *
 * GA4 Measurement ID: G-J08TY14FSJ
 * Google Ads ID: AW-17953051803
 *
 * NOTE: Conversion values are set to 0 for now.
 * Update with real values once you have actual conversion data.
 */

const GOOGLE_ADS_ID = 'AW-17953051803';

// Safely call gtag
function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

// ─── UTM & Attribution Helpers ───

/** Get current page path for source attribution */
function getSourcePage(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

/** Extract UTM parameters from current URL */
function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const result: Record<string, string> = {};
  for (const key of utmKeys) {
    const value = params.get(key);
    if (value) result[key] = value;
  }
  return result;
}

// ─── Page View Tracking ───

/** Track page view with full attribution data (UTM + referrer) */
export function trackPageView() {
  const utmParams = getUtmParams();
  gtag('event', 'page_view', {
    page_path: getSourcePage(),
    page_location: window.location.href,
    page_title: document.title,
    page_referrer: document.referrer,
    ...utmParams,
  });
}

// ─── GA4 Custom Events ───

/** WhatsApp link clicked */
export function trackWhatsAppClick() {
  gtag('event', 'whatsapp_click', {
    event_category: 'contact',
    event_label: 'whatsapp',
    page_path: getSourcePage(),
  });
}

/** Telegram link clicked */
export function trackTelegramClick() {
  gtag('event', 'telegram_click', {
    event_category: 'contact',
    event_label: 'telegram',
    page_path: getSourcePage(),
  });
}

/** Email link clicked */
export function trackEmailClick() {
  gtag('event', 'email_click', {
    event_category: 'contact',
    event_label: 'email',
    page_path: getSourcePage(),
  });
}

/** Phone call link clicked */
export function trackPhoneClick() {
  gtag('event', 'phone_click', {
    event_category: 'contact',
    event_label: 'phone',
    page_path: getSourcePage(),
  });
}

/** "I want to consult" button clicked */
export function trackConsultClick() {
  gtag('event', 'consult_click', {
    event_category: 'cta',
    event_label: 'consultation',
    page_path: getSourcePage(),
  });
}

/** "I want to book" button clicked */
export function trackBookClick() {
  gtag('event', 'book_click', {
    event_category: 'cta',
    event_label: 'booking',
    page_path: getSourcePage(),
  });
}

/** Consultation form submitted successfully */
export function trackConsultationSubmit() {
  gtag('event', 'consultation_submit', {
    event_category: 'conversion',
    event_label: 'consultation_form',
    source_page: getSourcePage(),
    ...getUtmParams(),
  });
}

/** Booking form submitted successfully */
export function trackBookingSubmit() {
  gtag('event', 'booking_submit', {
    event_category: 'conversion',
    event_label: 'booking_form',
    source_page: getSourcePage(),
    ...getUtmParams(),
  });
}

/** Consultation form submitted (new 3-field popup form) */
export function trackFormSubmit(formType: string) {
  gtag('event', 'form_submit', {
    event_category: 'conversion',
    event_label: formType,
    source_page: getSourcePage(),
    ...getUtmParams(),
  });
}

/** Share/Referral button clicked */
export function trackShareClick() {
  gtag('event', 'share_click', {
    event_category: 'engagement',
    event_label: 'referral',
    page_path: getSourcePage(),
  });
}

/** User scrolled to the contact section */
export function trackScrollToContact() {
  gtag('event', 'scroll_to_contact', {
    event_category: 'engagement',
    event_label: 'contact_section',
    page_path: getSourcePage(),
  });
}

/** FAQ item expanded */
export function trackFaqOpen(faqIndex: number) {
  gtag('event', 'faq_open', {
    event_category: 'engagement',
    event_label: `faq_item_${faqIndex}`,
    page_path: getSourcePage(),
  });
}

// ─── Google Ads Conversion Events ───

/**
 * Fire a Google Ads conversion event
 * @param conversionLabel - The label from Google Ads conversion setup
 * @param value - Conversion value in PHP (default 0, update after real data)
 */
export function trackGoogleAdsConversion(conversionLabel: string, value: number = 0) {
  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value,
    currency: 'PHP',
  });
}
