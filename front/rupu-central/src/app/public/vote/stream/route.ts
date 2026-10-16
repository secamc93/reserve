/**
 * SSE público del residente (R4 y detalle por unidad), mismo origen que el front.
 *
 *   GET /public/vote/stream?token=<voting_auth_token>[&voting_id=<id>]
 *     -> back: GET {API_BASE_URL}/public/voting-stream?token=…&voting_id=…
 *
 * `voting_id` es obligatorio con el token de un grupo (el residente vota en varios puntos).
 * No vive bajo /api/: en producción nginx manda todo /api/ al back de Go.
 */

import { env } from '@shared/config';
import { positiveInt, proxySseStream } from '@/services/modules/horizontal-properties/voting/infrastructure/sse/proxy-sse-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const token = query.get('token');
  const votingIdParam = query.get('voting_id');
  const votingId = positiveInt(votingIdParam);

  if (!token) {
    return Response.json({ success: false, message: 'Token de votación requerido' }, { status: 401 });
  }
  if (votingIdParam && !votingId) {
    return Response.json({ success: false, message: 'voting_id inválido' }, { status: 400 });
  }

  const upstream = new URLSearchParams({ token });
  if (votingId) upstream.set('voting_id', String(votingId));

  return proxySseStream({
    upstreamUrl: `${env.API_BASE_URL}/public/voting-stream?${upstream.toString()}`,
    headers: { Authorization: `Bearer ${token}` },
    signal: request.signal,
  });
}
