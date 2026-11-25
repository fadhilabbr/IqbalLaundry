import { NextRequest, NextResponse } from 'next/server';
import { DUMMY_ACCOUNTS } from '@/lib/auth';
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  toPublicSessionUser,
  verifySessionToken,
} from '@/lib/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

function unauthenticatedResponse(shouldClearCookie: boolean) {
  const response = NextResponse.json(
    {
      authenticated: false,
      role: 'PELANGGAN_TAMU' as const,
      user: null,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );

  if (shouldClearCookie) {
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      ...getSessionCookieOptions(false),
      maxAge: 0,
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(rawToken);

  if (!session) {
    return unauthenticatedResponse(Boolean(rawToken));
  }

  const matchedAccount = DUMMY_ACCOUNTS.find(
    (account) => account.username === session.username && account.role === session.role
  );

  if (!matchedAccount) {
    return unauthenticatedResponse(true);
  }

  return NextResponse.json(
    {
      authenticated: true,
      role: session.role,
      user: toPublicSessionUser(matchedAccount),
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
