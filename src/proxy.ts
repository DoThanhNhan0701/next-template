import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/config/constants';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for files with extensions (images, fonts, etc.) and Next.js internals
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN);
  const refreshToken = request.cookies.get(REFRESH_TOKEN);
  
  // User is authenticated if they have either an access token or a refresh token
  const isAuthenticated = !!accessToken || !!refreshToken;
  
  // Check if current page is the login page
  const isAuthPage = pathname.includes('/auth/login');

  // Case 1: Unauthenticated user trying to access private routes
  if (!isAuthenticated && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Case 2: Authenticated user trying to access login page
  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next internals
     * - static files (dots in path)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
