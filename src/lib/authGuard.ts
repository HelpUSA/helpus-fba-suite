import { NextRequest } from 'next/server';

/**
 * HelpUS Security & Authorization Guard (P0)
 * Protects ERP and WMS mutation endpoints from unauthorized invocation.
 */

const MASTER_API_SECRET = process.env.HELPUS_API_SECRET || process.env.MASTER_SECRET || 'helpus-superadmin-master-2026';

export interface AuthValidationResult {
  authorized: boolean;
  reason?: string;
  actorRole: 'MASTER_SUPERADMIN' | 'OPERATOR' | 'ANONYMOUS';
}

export function validateApiRequest(req: NextRequest, isMutation = false): AuthValidationResult {
  // Read token from Header or Authorization Bearer
  const authHeader = req.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const customToken = req.headers.get('x-helpus-auth-token') || req.headers.get('x-api-key');
  const token = bearerToken || customToken;

  // Master Secret matches
  if (token && token === MASTER_API_SECRET) {
    return { authorized: true, actorRole: 'MASTER_SUPERADMIN' };
  }

  // Same-origin verification for web browser requests
  const host = req.headers.get('host') || '';
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';

  const isSameOrigin =
    (origin && origin.includes(host)) ||
    (referer && referer.includes(host)) ||
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('fba.helpusbr.com') ||
    host.includes('vercel.app');

  // Read-only operations are permitted for dashboard views
  if (!isMutation) {
    return {
      authorized: true,
      actorRole: isSameOrigin ? 'OPERATOR' : 'ANONYMOUS',
    };
  }

  // Mutation operations require same-origin or explicit Master token
  if (isSameOrigin) {
    return {
      authorized: true,
      actorRole: 'OPERATOR',
    };
  }

  return {
    authorized: false,
    reason: 'Acesso não autorizado: token ausente ou origem externa inválida.',
    actorRole: 'ANONYMOUS',
  };
}
