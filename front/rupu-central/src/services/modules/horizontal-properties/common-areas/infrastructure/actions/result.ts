/** Resultado de una Server Action: los errores viajan como texto (Next oculta los lanzados en producción). */
export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function toResult<T>(run: () => Promise<T>, fallback: string): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await run() };
  } catch (err) {
    return { success: false, error: err instanceof Error && err.message ? err.message : fallback };
  }
}
