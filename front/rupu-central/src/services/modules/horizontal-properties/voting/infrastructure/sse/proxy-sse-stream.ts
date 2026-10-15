/**
 * Reenvía un stream SSE del back al navegador desde un route handler de Next (mismo origen).
 *
 * Por qué: el navegador abría el SSE contra `NEXT_PUBLIC_API_BASE_URL` (en local
 * `http://localhost:3050`); desde otro dispositivo de la red, `localhost` es el propio
 * dispositivo y no había tiempo real. El route handler habla con el back por `API_BASE_URL`
 * (del servidor) y el navegador solo usa una ruta relativa (`new EventSource('/…/stream')`).
 *
 * - Sin buffering: el cuerpo del back se pasa tal cual (cada chunk sale al llegar) con
 *   `X-Accel-Buffering: no` (nginx) y `Cache-Control: no-transform` (la compresión de Next
 *   no agrupa los eventos).
 * - Cierre: si el cliente se desconecta (`request.signal`) o cancela el stream, se aborta la
 *   conexión con el back.
 * - Si el back responde error, se devuelve el mismo código (JSON) para que el cliente reintente.
 */

export const SSE_RESPONSE_HEADERS: Record<string, string> = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};

export interface ProxySseOptions {
  upstreamUrl: string;
  /** Encabezados para el back (p. ej. Authorization). */
  headers?: Record<string, string>;
  /** `request.signal` del route handler: se aborta cuando el navegador se desconecta. */
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

const jsonError = (status: number, message: string) =>
  new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function proxySseStream({ upstreamUrl, headers = {}, signal, fetchImpl = fetch }: ProxySseOptions): Promise<Response> {
  const upstreamAbort = new AbortController();
  const abortUpstream = () => upstreamAbort.abort();
  if (signal) {
    if (signal.aborted) return jsonError(499, 'Cliente desconectado');
    signal.addEventListener('abort', abortUpstream, { once: true });
  }

  let upstream: Response;
  try {
    upstream = await fetchImpl(upstreamUrl, {
      headers: { ...headers, Accept: 'text/event-stream' },
      signal: upstreamAbort.signal,
      cache: 'no-store',
    });
  } catch {
    signal?.removeEventListener('abort', abortUpstream);
    return jsonError(502, 'No se pudo conectar con el servidor de votaciones');
  }

  if (!upstream.ok || !upstream.body) {
    signal?.removeEventListener('abort', abortUpstream);
    let message = 'El servidor de votaciones rechazó la conexión en vivo';
    try {
      const body = await upstream.json();
      message = body?.error || body?.message || message;
    } catch {
      /* cuerpo no JSON */
    }
    return jsonError(upstream.ok ? 502 : upstream.status, message);
  }

  const reader = upstream.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          signal?.removeEventListener('abort', abortUpstream);
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch {
        // El back cortó o el cliente se fue (abort): se cierra limpio; el cliente reintenta.
        signal?.removeEventListener('abort', abortUpstream);
        try {
          controller.close();
        } catch {
          /* ya cerrado */
        }
      }
    },
    cancel() {
      signal?.removeEventListener('abort', abortUpstream);
      upstreamAbort.abort();
      reader.cancel().catch(() => undefined);
    },
  });

  return new Response(body, { status: 200, headers: SSE_RESPONSE_HEADERS });
}

/** Parámetro numérico positivo de la URL (ids); null si no lo es. */
export function positiveInt(value: string | null | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n > 0 && Number.isSafeInteger(n) ? n : null;
}
