/**
 * SSE del panel en vivo (A6), mismo origen que el front.
 *
 *   GET /properties/:businessId/voting-groups/:groupId/votings/:votingId/live/stream?token=<business_token>
 *     -> back: GET {API_BASE_URL}/horizontal-properties/voting-groups/:groupId/votings/:votingId/stream?business_id=…
 *        con `Authorization: Bearer <token>`.
 *
 * No vive bajo /api/: en producción nginx manda todo /api/ al back de Go.
 * EventSource no envía encabezados: el token viaja en la query solo hasta este handler.
 */

import { env } from '@shared/config';
import { positiveInt, proxySseStream } from '@/services/modules/horizontal-properties/voting/infrastructure/sse/proxy-sse-stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { id: string; groupId: string; votingId: string };

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { id, groupId, votingId } = await params;
  const businessId = positiveInt(id);
  const group = positiveInt(groupId);
  const voting = positiveInt(votingId);
  const token = new URL(request.url).searchParams.get('token');

  if (!businessId || !group || !voting) {
    return Response.json({ success: false, message: 'Parámetros inválidos' }, { status: 400 });
  }
  if (!token) {
    return Response.json({ success: false, message: 'Token de autenticación requerido' }, { status: 401 });
  }

  return proxySseStream({
    upstreamUrl: `${env.API_BASE_URL}/horizontal-properties/voting-groups/${group}/votings/${voting}/stream?business_id=${businessId}`,
    headers: { Authorization: `Bearer ${token}` },
    signal: request.signal,
  });
}
