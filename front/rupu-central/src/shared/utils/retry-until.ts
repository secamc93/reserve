/**
 * Reintenta `attempt` hasta que devuelva true, con espera creciente (delayMs * n) entre intentos.
 * Se detiene antes si `isCancelled()` devuelve true (p. ej. el componente se desmontó).
 * Devuelve true si algún intento tuvo éxito.
 */
export async function retryUntil(
  attempt: () => Promise<boolean>,
  options: { attempts?: number; delayMs?: number; isCancelled?: () => boolean; sleep?: (ms: number) => Promise<void> } = {},
): Promise<boolean> {
  const attempts = Math.max(1, options.attempts ?? 8);
  const delayMs = Math.max(0, options.delayMs ?? 400);
  const isCancelled = options.isCancelled ?? (() => false);
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  for (let n = 1; n <= attempts; n++) {
    if (isCancelled()) return false;
    try {
      if (await attempt()) return true;
    } catch {
      // un intento fallido no corta los reintentos
    }
    if (n < attempts && !isCancelled()) await sleep(delayMs * n);
  }
  return false;
}
