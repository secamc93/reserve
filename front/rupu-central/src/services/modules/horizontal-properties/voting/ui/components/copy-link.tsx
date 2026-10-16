/**
 * "Copiar enlace" que funciona por HTTP en la red local (ver `copyText`):
 *  - `useCopyLink()` copia y recuerda el resultado ('copied' muestra "Enlace copiado" 2 s);
 *  - `ManualCopyField` es el último recurso: el enlace seleccionado en un campo de solo lectura.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VT, copyText, vtMono, type CopyResult } from '../design';

export type CopyLinkState = 'idle' | CopyResult;

export function useCopyLink(resetMs = 2000) {
  const [state, setState] = useState<CopyLinkState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      const result = await copyText(text);
      setState(result);
      if (timer.current) clearTimeout(timer.current);
      if (result === 'copied') timer.current = setTimeout(() => setState('idle'), resetMs);
      return result;
    },
    [resetMs]
  );

  const reset = useCallback(() => setState('idle'), []);
  return { state, copy, reset };
}

/** Campo de solo lectura con el enlace ya seleccionado y el aviso para copiarlo a mano. */
export function ManualCopyField({ value }: { value: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, [value]);
  return (
    <div className="flex flex-col gap-1" role="group" aria-label="Copiar el enlace a mano">
      <input
        ref={ref}
        readOnly
        value={value}
        aria-label="Enlace de votación"
        onFocus={(e) => e.currentTarget.select()}
        className={`${vtMono} w-full h-9 max-md:h-11 rounded-md bg-white px-2.5 text-[12px] outline-none`}
        style={{ border: `1px solid ${VT.ink}` }}
      />
      <span className="text-[11px]" style={{ color: VT.muted }} role="status">
        Selecciona y copia el enlace
      </span>
    </div>
  );
}
