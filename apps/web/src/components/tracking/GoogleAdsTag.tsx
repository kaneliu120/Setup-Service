'use client';

// Google Ads tag is now loaded together with GA4 in GoogleAnalytics.tsx
// This file is kept for future conversion event tracking

const GOOGLE_ADS_ID = 'AW-17953051803';

/**
 * Fire a Google Ads conversion event
 * Usage: trackConversion('CONVERSION_LABEL') 
 * You'll get the conversion label when setting up specific conversion actions in Google Ads
 */
export function trackGoogleAdsConversion(conversionLabel: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
      value: value || 5000,
      currency: 'PHP',
    });
  }
}

// No component rendering needed - tag is in GoogleAnalytics.tsx
export default function GoogleAdsTag() {
  return null;
}
