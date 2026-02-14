'use client';

import Script from 'next/script';

// TODO: Replace with your Google Ads Conversion ID after creating Google Ads account
const GOOGLE_ADS_ID = ''; // Format: AW-XXXXXXXXX

export default function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
