import GoogleAnalytics from './GoogleAnalytics';
import GoogleAdsTag from './GoogleAdsTag';
import MetaPixel from './MetaPixel';

export default function TrackingScripts() {
  return (
    <>
      <GoogleAnalytics />
      <GoogleAdsTag />
      <MetaPixel />
    </>
  );
}
