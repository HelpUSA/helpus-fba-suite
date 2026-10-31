import { NextRequest } from 'next/server';

/**
 * HelpUS Security & Authorization Guard (P0 Remediation - Order 013)
 * Strict Fail-Closed Zero-Trust Enforcement.
 *
 * Rules:
 * 1. No hardcoded default secrets allowed.
 * 2. Host header matching (e.g. 'host.includes(fba.helpusbr.com)') NEVER grants mutation permissions.
 * 3. All mutation operations require an authenticated token (Bearer, x-helpus-auth-token, or x-api-key)
 *    matching valid environment-defined secrets.
 * 4. If environment secrets are not set, all mutations fail-closed.
 */

export interface AuthValidationResult {
  authorized: boolean;
  reason?: string;
  actorRole: 'MASTER_SUPERADMIN' | 'OPERATOR' | 'ANONYMOUS';
}

function getMasterSecret(): string | null {
  return process.env.HELPUS_API_SECRET || process.env.MASTER_SECRET || null;
}

function getOperatorSecret(): string | null {
  return process.env.HELPUS_OPERATOR_TOKEN || process.env.OPERATOR_SECRET || null;
}

export function validateApiRequest(
  req: NextRequest,
  isMutation = false,
  sensitiveReadOnly = false
): AuthValidationResult {
  // Read token from Authorization header or custom API headers
  const authHeader = req.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const customToken = req.headers.get('x-helpus-auth-token') || req.headers.get('x-api-key');
  const token = bearerToken || customToken;

  const masterSecret = getMasterSecret();
  const operatorSecret = getOperatorSecret();

  // 1. Verify Master SuperAdmin Token
  if (masterSecret && token && token === masterSecret) {
    return { authorized: true, actorRole: 'MASTER_SUPERADMIN' };
  }

  // 2. Verify Operator Token
  if (operatorSecret && token && token === operatorSecret) {
    return { authorized: true, actorRole: 'OPERATOR' };
  }

  const enforceAuthReads = Boolean(process.env.REQUIRE_AUTH_READS === 'true' || process.env.STRICT_READ_AUTH === 'true');

  // 3. Sensitive read endpoints (e.g. invoices with supplier tax docs, confidential costs) require authentication
  if (!isMutation && (sensitiveReadOnly || enforceAuthReads)) {
    return {
      authorized: false,
      reason: 'Acesso negado: Consulta a dados fiscais e documentos operacionais confidenciais exige autenticação de Operador ou Master.',
      actorRole: 'ANONYMOUS',
    };
  }

  // 4. For general read-only operations (isMutation = false), allow anonymous read access for public dashboard queries
  if (!isMutation) {
    return {
      authorized: true,
      actorRole: 'ANONYMOUS',
    };
  }

  // 5. For mutation operations (isMutation = true): STRICT FAIL-CLOSED
  // No host header spoofing, no automatic same-origin mutation bypass.
  if (!masterSecret && !operatorSecret) {
    return {
      authorized: false,
      reason: 'Segurança Fail-Closed: Nenhuma chave mestra (HELPUS_API_SECRET) configurada no ambiente. Mutações bloqueadas por governança.',
      actorRole: 'ANONYMOUS',
    };
  }

  return {
    authorized: false,
    reason: 'Acesso negado: Mutação requer autenticação válida (Bearer token ou cabeçalho x-helpus-auth-token).',
    actorRole: 'ANONYMOUS',
  };
}
