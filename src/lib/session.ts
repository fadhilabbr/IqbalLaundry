import crypto from 'node:crypto';
import type { Role } from '@/types';
import type { UserAccount } from '@/lib/auth';

export const SESSION_COOKIE_NAME = 'iqbal_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const SESSION_SHORT_TTL_SECONDS = 60 * 60 * 24; // 24 hours for browser-session cookies

export type AuthenticatedRole = Exclude<Role, 'PELANGGAN_TAMU'>;

export interface SessionPayload {
  username: string;
  role: AuthenticatedRole;
  name: string;
  roleLabel: string;
  phone?: string;
  iat: number;
  exp: number;
}

export type PublicSessionUser = Omit<UserAccount, 'password'>;

const VALID_AUTHENTICATED_ROLES: ReadonlySet<string> = new Set<AuthenticatedRole>([
  'ADMIN',
  'KURIR',
  'MEMBER',
]);

function getSessionSecret(): string {
  return process.env.AUTH_SECRET || 'iqbal-laundry-dev-session-secret-change-in-prod';
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function isAuthenticatedRole(value: unknown): value is AuthenticatedRole {
  return typeof value === 'string' && VALID_AUTHENTICATED_ROLES.has(value);
}

export function toPublicSessionUser(account: UserAccount): PublicSessionUser {
  return {
    username: account.username,
    phone: account.phone,
    name: account.name,
    role: account.role,
    roleLabel: account.roleLabel,
    description: account.description,
  };
}

export function createSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  ttlSeconds = SESSION_MAX_AGE_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    username: payload.username,
    role: payload.role,
    name: payload.name,
    roleLabel: payload.roleLabel,
    ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
    iat: now,
    exp: now + ttlSeconds,
  };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const rawJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(rawJson);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const data = parsed as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof data.username !== 'string' ||
      data.username.length === 0 ||
      !isAuthenticatedRole(data.role) ||
      typeof data.name !== 'string' ||
      typeof data.roleLabel !== 'string' ||
      (data.phone !== undefined && typeof data.phone !== 'string') ||
      typeof data.iat !== 'number' ||
      !Number.isFinite(data.iat) ||
      typeof data.exp !== 'number' ||
      !Number.isFinite(data.exp) ||
      data.exp <= now
    ) {
      return null;
    }

    return {
      username: data.username,
      role: data.role,
      name: data.name,
      roleLabel: data.roleLabel,
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      iat: data.iat,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(rememberMe = true) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(rememberMe ? { maxAge: SESSION_MAX_AGE_SECONDS } : {}),
  };
}

export function getRouteForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'KURIR':
      return '/kurir';
    case 'MEMBER':
      return '/member';
    case 'PELANGGAN_TAMU':
    default:
      return '/dashboard';
  }
}

export function getRequiredRoleForPath(pathname: string): AuthenticatedRole | null {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'ADMIN';
  }
  if (pathname === '/kurir' || pathname.startsWith('/kurir/')) {
    return 'KURIR';
  }
  if (pathname === '/member' || pathname.startsWith('/member/')) {
    return 'MEMBER';
  }
  return null;
}
