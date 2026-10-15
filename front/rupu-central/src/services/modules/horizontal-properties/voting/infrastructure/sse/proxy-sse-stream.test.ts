import { describe, expect, it, vi } from 'vitest';
import { positiveInt, proxySseStream } from './proxy-sse-stream';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Stream del "back" controlable desde el test. */
function upstreamStream() {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c;
    },
    cancel() {
      cancelled = true;
    },
  });
  return {
    stream,
    push: (text: string) => ctrl.enqueue(encoder.encode(text)),
    end: () => ctrl.close(),
    get cancelled() {
      return cancelled;
    },
  };
}

describe('proxySseStream', () => {
  it('llama al back con Authorization y Accept: text/event-stream y reenvía cada evento sin esperar al final', async () => {
    const up = upstreamStream();
    const fetchImpl = vi.fn().mockResolvedValue(new Response(up.stream, { status: 200 }));

    const res = await proxySseStream({
      upstreamUrl: 'http://back/api/v1/x/stream',
      headers: { Authorization: 'Bearer T' },
      fetchImpl,
    });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://back/api/v1/x/stream');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer T', Accept: 'text/event-stream' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/^text\/event-stream/);
    expect(res.headers.get('x-accel-buffering')).toBe('no');
    expect(res.headers.get('cache-control')).toContain('no-transform');

    const reader = res.body!.getReader();
    up.push('event: connected\ndata: {}\n\n');
    expect(decoder.decode((await reader.read()).value)).toBe('event: connected\ndata: {}\n\n');
    up.push('event: new_vote\ndata: {"vote":{"id":1}}\n\n');
    expect(decoder.decode((await reader.read()).value)).toContain('new_vote');
    up.end();
    expect((await reader.read()).done).toBe(true);
  });

  it('cuando el navegador se desconecta (request.signal) aborta la conexión con el back', async () => {
    const up = upstreamStream();
    let upstreamSignal: AbortSignal | undefined;
    const fetchImpl = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
      upstreamSignal = init.signal ?? undefined;
      return new Response(up.stream, { status: 200 });
    });
    const client = new AbortController();

    await proxySseStream({ upstreamUrl: 'http://back/s', signal: client.signal, fetchImpl });
    expect(upstreamSignal?.aborted).toBe(false);
    client.abort();
    expect(upstreamSignal?.aborted).toBe(true);
  });

  it('si el cliente cancela el stream, cancela el del back', async () => {
    const up = upstreamStream();
    let upstreamSignal: AbortSignal | undefined;
    const fetchImpl = vi.fn().mockImplementation(async (_u: string, init: RequestInit) => {
      upstreamSignal = init.signal ?? undefined;
      return new Response(up.stream, { status: 200 });
    });
    const res = await proxySseStream({ upstreamUrl: 'http://back/s', fetchImpl });
    await res.body!.cancel();
    expect(upstreamSignal?.aborted).toBe(true);
  });

  it('propaga el código de error del back (p. ej. 400 con token de grupo en un back viejo)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: 'Este endpoint requiere un token de votación específica' }), { status: 400 })
    );
    const res = await proxySseStream({ upstreamUrl: 'http://back/s', fetchImpl });
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/token de votación específica/);
  });

  it('502 si el back no responde', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const res = await proxySseStream({ upstreamUrl: 'http://back/s', fetchImpl });
    expect(res.status).toBe(502);
  });
});

describe('positiveInt', () => {
  it('acepta solo enteros positivos', () => {
    expect(positiveInt('22')).toBe(22);
    expect(positiveInt('0')).toBeNull();
    expect(positiveInt('-1')).toBeNull();
    expect(positiveInt('1e3')).toBeNull();
    expect(positiveInt(null)).toBeNull();
  });
});
