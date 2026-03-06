import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="text-6xl font-extrabold text-indigo-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/en/landing/manila"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors no-underline"
          >
            Go to Homepage
          </Link>
          <Link
            href="/en/enterprise"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors no-underline"
          >
            Enterprise Solutions
          </Link>
        </div>
      </div>
    </div>
  );
}
