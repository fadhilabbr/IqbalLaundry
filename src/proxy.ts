import { NextRequest, NextResponse } from 'next/server';
import {
  getRequiredRoleForPath,
  getRouteForRole,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(rawToken);
  const hasInvalidCookie = Boolean(rawToken && !session);

  const finalize = (response: NextResponse): NextResponse => {
    if (hasInvalidCookie) {
      response.cookies.set(SESSION_COOKIE_NAME, '', {
        ...getSessionCookieOptions(false),
        maxAge: 0,
      });
    }
    return response;
  };

  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (session) {
      return finalize(NextResponse.redirect(new URL(getRouteForRole(session.role), request.url)));
    }
    return finalize(NextResponse.next());
  }

  const requiredRole = getRequiredRoleForPath(pathname);
  if (requiredRole) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      loginUrl.searchParams.set('auth_notice', 'login_required');
      return finalize(NextResponse.redirect(loginUrl));
    }

    if (session.role !== requiredRole) {
      const portalUrl = new URL(getRouteForRole(session.role), request.url);
      portalUrl.searchParams.set('auth_notice', 'forbidden');
      portalUrl.searchParams.set('denied', pathname);
      return finalize(NextResponse.redirect(portalUrl));
    }

    return finalize(NextResponse.next());
  }

  return finalize(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
