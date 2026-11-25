import { NextRequest, NextResponse } from 'next/server';
import { findUserByCredentials } from '@/lib/auth';
import {
  createSessionToken,
  getSessionCookieOptions,
  isAuthenticatedRole,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SESSION_SHORT_TTL_SECONDS,
  toPublicSessionUser,
} from '@/lib/session';

const INVALID_CREDENTIALS_ERROR = 'Username/nomor WhatsApp atau password salah.';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: INVALID_CREDENTIALS_ERROR },
    { status: 401, headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return unauthorizedResponse();
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return unauthorizedResponse();
  }

  const { identity, password, rememberMe } = body as Record<string, unknown>;

  if (typeof identity !== 'string' || typeof password !== 'string') {
    return unauthorizedResponse();
  }

  const account = findUserByCredentials(identity, password);
  if (!account || !isAuthenticatedRole(account.role)) {
    return unauthorizedResponse();
  }

  const shouldRemember = rememberMe !== false;
  const ttlSeconds = shouldRemember ? SESSION_MAX_AGE_SECONDS : SESSION_SHORT_TTL_SECONDS;

  const token = createSessionToken(
    {
      username: account.username,
      role: account.role,
      name: account.name,
      roleLabel: account.roleLabel,
      phone: account.phone,
    },
    ttlSeconds
  );

  const publicUser = toPublicSessionUser(account);
  const response = NextResponse.json(
    { success: true, user: publicUser },
    { status: 200, headers: NO_STORE_HEADERS }
  );

  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(shouldRemember));

  return response;
}
