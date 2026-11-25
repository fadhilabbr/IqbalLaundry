import { NextResponse } from 'next/server';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(false),
    maxAge: 0,
  });

  return response;
}
