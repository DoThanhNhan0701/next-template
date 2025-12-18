import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/", "/settings", "/inbox", "/calendar", "/search"];
const authRoutes = ["/auth/login"];

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // If user is authenticated and tries to access auth routes (login), redirect to home
  if (accessToken && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is NOT authenticated and tries to access protected routes, redirect to login
  if (
    !accessToken &&
    (protectedRoutes.includes(pathname) ||
      protectedRoutes.some(
        (route) => route !== "/" && pathname.startsWith(route)
      ))
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    // loginUrl.searchParams.set("from", pathname); // Optional: redirect back after login
    return NextResponse.redirect(loginUrl);
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
