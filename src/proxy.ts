import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN } from '@/config/constants';

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN);
  const { pathname } = request.nextUrl;

  // Define private and public routes
  const isAuthPage = pathname.startsWith('/auth');
  
  // If no token and trying to access private routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If token exists and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
