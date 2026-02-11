import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">MySkillStore</h1>
        <p className="text-gray-400">Landing Page Management System</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/en/admin/login"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Admin Login
          </Link>
          <Link
            href="/en/landing/manila"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Demo Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
