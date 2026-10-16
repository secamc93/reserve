/**
 * Copiar texto al portapapeles también fuera de un contexto seguro.
 *
 * `navigator.clipboard` solo existe con HTTPS o en localhost: abierto por la IP de la red
 * local (`http://192.168.3.11:3000`) no está, y "Copiar enlace" no hacía nada. Orden:
 *  1. `navigator.clipboard.writeText` si el contexto es seguro;
 *  2. `<textarea>` temporal + `document.execCommand('copy')` (síncrono: conserva el gesto del clic);
 *  3. si nada funciona, `'manual'`: la UI deja el enlace seleccionado en un campo de solo
 *     lectura y pide "Selecciona y copia el enlace".
 */

export type CopyResult = 'copied' | 'manual';

function copyWithTextarea(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;
  const active = document.activeElement as HTMLElement | null;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  // Fuera de la vista pero dentro del documento (iOS no copia elementos ocultos con display:none).
  Object.assign(textarea.style, { position: 'fixed', top: '0', left: '0', width: '1px', height: '1px', opacity: '0', fontSize: '16px' });
  document.body.appendChild(textarea);
  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return typeof document.execCommand === 'function' && document.execCommand('copy') === true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    active?.focus?.();
  }
}

export async function copyText(text: string): Promise<CopyResult> {
  const secure = typeof window !== 'undefined' && window.isSecureContext === true;
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (secure && clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return 'copied';
    } catch {
      /* permiso denegado u otro fallo: se intenta el respaldo */
    }
  }
  return copyWithTextarea(text) ? 'copied' : 'manual';
}
