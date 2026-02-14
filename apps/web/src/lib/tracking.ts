/**
 * Unified event tracking for GA4 + Google Ads
 * 
 * GA4 Measurement ID: G-J08TY14FSJ
 * Google Ads ID: AW-17953051803
 */

const GOOGLE_ADS_ID = 'AW-17953051803';

// Safely call gtag
function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

// ─── GA4 Custom Events ───

/** WhatsApp link clicked */
export function trackWhatsAppClick() {
  gtag('event', 'whatsapp_click', {
    event_category: 'contact',
    event_label: 'whatsapp',
    value: 2500,
    currency: 'PHP',
  });
}

/** Telegram link clicked */
export function trackTelegramClick() {
  gtag('event', 'telegram_click', {
    event_category: 'contact',
    event_label: 'telegram',
    value: 2500,
    currency: 'PHP',
  });
}

/** Email link clicked */
export function trackEmailClick() {
  gtag('event', 'email_click', {
    event_category: 'contact',
    event_label: 'email',
    value: 1500,
    currency: 'PHP',
  });
}

/** Phone call link clicked */
export function trackPhoneClick() {
  gtag('event', 'phone_click', {
    event_category: 'contact',
    event_label: 'phone',
    value: 2000,
    currency: 'PHP',
  });
}

/** "I want to consult" button clicked */
export function trackConsultClick() {
  gtag('event', 'consult_click', {
    event_category: 'cta',
    event_label: 'consultation',
    value: 1500,
    currency: 'PHP',
  });
}

/** "I want to book" button clicked */
export function trackBookClick() {
  gtag('event', 'book_click', {
    event_category: 'cta',
    event_label: 'booking',
    value: 3000,
    currency: 'PHP',
  });
}

/** Consultation form submitted successfully */
export function trackConsultationSubmit() {
  gtag('event', 'consultation_submit', {
    event_category: 'conversion',
    event_label: 'consultation_form',
    value: 2500,
    currency: 'PHP',
  });
}

/** Booking form submitted successfully */
export function trackBookingSubmit() {
  gtag('event', 'booking_submit', {
    event_category: 'conversion',
    event_label: 'booking_form',
    value: 5000,
    currency: 'PHP',
  });
}

/** Share/Referral button clicked */
export function trackShareClick() {
  gtag('event', 'share_click', {
    event_category: 'engagement',
    event_label: 'referral',
  });
}

/** User scrolled to the contact section */
export function trackScrollToContact() {
  gtag('event', 'scroll_to_contact', {
    event_category: 'engagement',
    event_label: 'contact_section',
    value: 300,
    currency: 'PHP',
  });
}

/** FAQ item expanded */
export function trackFaqOpen(faqIndex: number) {
  gtag('event', 'faq_open', {
    event_category: 'engagement',
    event_label: `faq_item_${faqIndex}`,
  });
}

// ─── Google Ads Conversion Events ───
// Call these when you set up specific conversion actions in Google Ads
// and receive conversion labels

/**
 * Fire a Google Ads conversion event
 * @param conversionLabel - The label from Google Ads conversion setup
 * @param value - Conversion value in PHP
 */
export function trackGoogleAdsConversion(conversionLabel: string, value: number = 5000) {
  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value,
    currency: 'PHP',
  });
}
