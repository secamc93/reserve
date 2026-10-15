import { describe, expect, it, vi } from 'vitest';
import { retryUntil } from './retry-until';

const noSleep = () => Promise.resolve();

describe('retryUntil', () => {
  it('termina en el primer intento exitoso', async () => {
    const attempt = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(retryUntil(attempt, { sleep: noSleep })).resolves.toBe(true);
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it('se rinde tras el máximo de intentos', async () => {
    const attempt = vi.fn().mockResolvedValue(false);
    await expect(retryUntil(attempt, { attempts: 4, sleep: noSleep })).resolves.toBe(false);
    expect(attempt).toHaveBeenCalledTimes(4);
  });

  it('un error en un intento no corta los reintentos', async () => {
    const attempt = vi.fn().mockRejectedValueOnce(new Error('red')).mockResolvedValueOnce(true);
    await expect(retryUntil(attempt, { sleep: noSleep })).resolves.toBe(true);
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it('espera de forma creciente entre intentos', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    await retryUntil(vi.fn().mockResolvedValue(false), { attempts: 3, delayMs: 100, sleep });
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([100, 200]);
  });

  it('no sigue si se cancela (componente desmontado)', async () => {
    let cancelled = false;
    const attempt = vi.fn().mockImplementation(async () => {
      cancelled = true;
      return false;
    });
    await expect(retryUntil(attempt, { isCancelled: () => cancelled, sleep: noSleep })).resolves.toBe(false);
    expect(attempt).toHaveBeenCalledTimes(1);
  });
});
