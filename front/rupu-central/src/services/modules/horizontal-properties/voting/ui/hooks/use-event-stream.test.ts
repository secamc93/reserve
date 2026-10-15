import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { eventStreamBackoffMs, useEventStream } from './use-event-stream';

/** EventSource simulado: el test decide cuándo abre, falla o emite. */
class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  listeners = new Map<string, ((e: MessageEvent) => void)[]>();
  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
  addEventListener(name: string, fn: (e: MessageEvent) => void) {
    this.listeners.set(name, [...(this.listeners.get(name) || []), fn]);
  }
  close() {
    this.closed = true;
  }
  open() {
    this.onopen?.();
  }
  fail() {
    this.onerror?.();
  }
  emit(name: string, data: unknown) {
    for (const fn of this.listeners.get(name) || []) fn(new MessageEvent(name, { data: JSON.stringify(data) }));
  }
}

const last = () => FakeEventSource.instances[FakeEventSource.instances.length - 1];

describe('useEventStream', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeEventSource.instances = [];
    vi.stubGlobal('EventSource', FakeEventSource);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('abre la url relativa, pasa a "live" y entrega los eventos con nombre ya parseados', () => {
    const onVote = vi.fn();
    const { result } = renderHook(() => useEventStream('/public/vote/stream?token=t', { new_vote: onVote }));
    expect(result.current.status).toBe('connecting');
    expect(last().url).toBe('/public/vote/stream?token=t');

    act(() => last().open());
    expect(result.current.status).toBe('live');
    act(() => last().emit('new_vote', { vote: { id: 7 } }));
    expect(onVote).toHaveBeenCalledWith({ vote: { id: 7 } });
  });

  it('si se corta: "reconnecting", reintenta con backoff y avisa al reconectar', () => {
    const onReconnect = vi.fn();
    const { result } = renderHook(() => useEventStream('/s', { new_vote: () => {} }, { onReconnect }));
    act(() => last().open());
    const first = last();
    act(() => first.fail());
    expect(first.closed).toBe(true);
    expect(result.current.status).toBe('reconnecting');
    expect(FakeEventSource.instances).toHaveLength(1);

    act(() => vi.advanceTimersByTime(eventStreamBackoffMs(1)));
    expect(FakeEventSource.instances).toHaveLength(2);
    act(() => last().open());
    expect(result.current.status).toBe('live');
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('con maxFailures=3: tras 3 fallos sin abrir queda en "failed" y deja de intentar', () => {
    const { result } = renderHook(() => useEventStream('/s', { new_vote: () => {} }, { maxFailures: 3 }));
    act(() => last().fail());
    act(() => vi.advanceTimersByTime(eventStreamBackoffMs(1)));
    act(() => last().fail());
    expect(result.current.status).toBe('reconnecting');
    act(() => vi.advanceTimersByTime(eventStreamBackoffMs(2)));
    act(() => last().fail());
    expect(result.current.status).toBe('failed');
    expect(result.current.failures).toBe(3);
    act(() => vi.advanceTimersByTime(60_000));
    expect(FakeEventSource.instances).toHaveLength(3);
  });

  it('al desmontar cierra el EventSource y cancela el reintento pendiente', () => {
    const { unmount } = renderHook(() => useEventStream('/s', { new_vote: () => {} }));
    act(() => last().open());
    const es = last();
    unmount();
    expect(es.closed).toBe(true);

    const second = renderHook(() => useEventStream('/s2', { new_vote: () => {} }));
    act(() => last().fail());
    second.unmount();
    act(() => vi.advanceTimersByTime(60_000));
    expect(FakeEventSource.instances.filter((x) => x.url === '/s2')).toHaveLength(1);
  });

  it('sin url no abre nada', () => {
    const { result } = renderHook(() => useEventStream(null, { new_vote: () => {} }));
    expect(result.current.status).toBe('idle');
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it('backoff: 1 s, 2 s, 4 s… con tope de 15 s', () => {
    expect([1, 2, 3, 4, 5, 9].map(eventStreamBackoffMs)).toEqual([1000, 2000, 4000, 8000, 15000, 15000]);
  });
});
