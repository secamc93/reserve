/**
 * Conexión SSE del navegador con reintento (backoff) y estado para el indicador
 * "En vivo / Reconectando".
 *
 * - `url` es relativa al front (route handler del mismo origen), nunca el back directo.
 * - Ante un error se cierra el EventSource (sin el reintento nativo) y se reabre tras
 *   1 s, 2 s, 4 s… (máx. 15 s). Una conexión abierta reinicia la cuenta de fallos.
 * - Con `maxFailures`, tras N fallos seguidos sin abrir queda en 'failed' (el llamador usa
 *   su respaldo, p. ej. consultar cada pocos segundos).
 * - Al desmontar, o si cambia la url, cierra el EventSource y cancela el reintento.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

export type EventStreamStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'failed';

export type EventStreamHandlers = Record<string, (data: unknown) => void>;

export interface UseEventStreamOptions {
  /** Fallos seguidos (sin llegar a abrir) antes de rendirse; sin valor reintenta siempre. */
  maxFailures?: number;
  /** Se llama cada vez que la conexión se abre de nuevo después de un corte. */
  onReconnect?: () => void;
}

/** Espera antes del reintento n (1, 2, 3…): 1 s, 2 s, 4 s, 8 s, 15 s… */
export function eventStreamBackoffMs(attempt: number): number {
  return Math.min(15_000, 1000 * 2 ** Math.max(0, attempt - 1));
}

function parseData(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function useEventStream(
  url: string | null,
  handlers: EventStreamHandlers,
  { maxFailures, onReconnect }: UseEventStreamOptions = {}
): { status: EventStreamStatus; failures: number } {
  const [status, setStatus] = useState<EventStreamStatus>(url ? 'connecting' : 'idle');
  const [failures, setFailures] = useState(0);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;
  // Los nombres de evento se fijan por url (los handlers pueden cambiar en cada render).
  const eventNames = Object.keys(handlers).sort().join('|');

  useEffect(() => {
    if (!url || typeof EventSource === 'undefined') {
      setStatus('idle');
      return;
    }

    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let failed = 0;
    let everOpened = false;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      if (failed === 0) setStatus('connecting');
      else if (!(maxFailures && failed >= maxFailures)) setStatus('reconnecting');
      const es = new EventSource(url);
      source = es;

      es.onopen = () => {
        if (disposed) return;
        const isReconnect = everOpened || failed > 0;
        everOpened = true;
        failed = 0;
        setFailures(0);
        setStatus('live');
        if (isReconnect) onReconnectRef.current?.();
      };

      for (const name of eventNames.split('|').filter(Boolean)) {
        es.addEventListener(name, (event) => {
          if (disposed) return;
          handlersRef.current[name]?.(parseData((event as MessageEvent).data));
        });
      }

      es.onerror = () => {
        if (disposed) return;
        es.close();
        source = null;
        failed += 1;
        setFailures(failed);
        const gaveUp = !!maxFailures && failed >= maxFailures;
        setStatus(gaveUp ? 'failed' : 'reconnecting');
        // Nunca llegó a abrir (p. ej. el back rechaza el token): no se insiste más.
        // Si ya funcionó antes, se sigue intentando en segundo plano mientras el llamador usa su respaldo.
        if (gaveUp && !everOpened) return;
        retryTimer = setTimeout(connect, eventStreamBackoffMs(failed));
      };
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      source?.close();
      source = null;
    };
  }, [url, eventNames, maxFailures]);

  return { status, failures };
}
