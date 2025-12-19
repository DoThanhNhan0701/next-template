import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, API_URL, REFRESH_TOKEN } from "./config/constants";
import { endpoints } from "./config/endpoints";

const protectedRoutes = ["/", "/settings", "/inbox", "/calendar", "/search"];
const authRoutes = ["/auth/login", "/auth/register"];

interface DecodedToken {
  exp: number;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get tokens
  let accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN)?.value;

  let response = NextResponse.next();
  let isRefreshed = false;

  // 2. Check access token validity and Refresh if needed
  let isAccessTokenValid = false;
  if (accessToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime + 10) {
        isAccessTokenValid = true;
      }
    } catch (error) {
      console.error("Invalid access token:", error);
    }
  }

  // 3. Attempt Refresh if invalid but have refresh token
  if (!isAccessTokenValid && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}${endpoints.REFRESH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        // Update local variable for downstream checks
        accessToken = newAccessToken;
        isAccessTokenValid = true;
        isRefreshed = true;

        // Update request cookies for downstream
        request.cookies.set(ACCESS_TOKEN, newAccessToken);
        if (newRefreshToken) {
          request.cookies.set(REFRESH_TOKEN, newRefreshToken);
        }

        // Prepare response with new cookies
        // We need to recreate the response to ensure we can set cookies on it
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        response.cookies.set(ACCESS_TOKEN, newAccessToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        if (newRefreshToken) {
          response.cookies.set(REFRESH_TOKEN, newRefreshToken, {
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
        }
      }
    } catch (error) {
      console.error("Proxy refresh error:", error);
    }
  }

  // 4. Handle Redirections

  // If user is authenticated (valid or refreshed) and tries to access auth routes
  if (isAccessTokenValid && authRoutes.some((route) => pathname.startsWith(route))) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    // Copy cookies if we refreshed
    if (isRefreshed) {
      const newAccess = response.cookies.get(ACCESS_TOKEN);
      const newRefresh = response.cookies.get(REFRESH_TOKEN);
      if (newAccess) redirectResponse.cookies.set(newAccess);
      if (newRefresh) redirectResponse.cookies.set(newRefresh);
    }
    return redirectResponse;
  }

  // If user is NOT authenticated and tries to access protected routes
  if (
    !isAccessTokenValid &&
    (protectedRoutes.includes(pathname) ||
      protectedRoutes.some(
        (route) => route !== "/" && pathname.startsWith(route)
      ))
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    // loginUrl.searchParams.set("from", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);

    // Clear cookies if they existed but were invalid
    redirectResponse.cookies.delete(ACCESS_TOKEN);
    redirectResponse.cookies.delete(REFRESH_TOKEN);

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
