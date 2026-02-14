import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root path → redirect to manila landing page
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/en/landing/manila', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|zh)/:path*'],
};
