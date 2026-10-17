/**
 * Contraseña de voto de una unidad en la lista de asistencia: oculta por defecto; al pedirla
 * se "desbloquea" (candado que se abre) y se muestra unos segundos. Solo para administradores.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { VT, VtIcon, vtMono } from '../design';

type CellState = 'locked' | 'unlocking' | 'shown' | 'missing' | 'error';

interface UnitPasswordCellProps {
  unitLabel: string;
  /** Devuelve la contraseña de la unidad (null si no tiene); lanza si no se pudo consultar. */
  load: () => Promise<string | null>;
  /** Tiempo que queda visible antes de ocultarse sola (ms). */
  revealMs?: number;
  /** Duración del efecto de desbloqueo (ms). */
  unlockMs?: number;
}

export function UnitPasswordCell({ unitLabel, load, revealMs = 15000, unlockMs = 450 }: UnitPasswordCellProps) {
  const [state, setState] = useState<CellState>('locked');
  const [password, setPassword] = useState('');
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const hide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setState('locked');
  };

  const reveal = async () => {
    setState('unlocking');
    try {
      const [value] = await Promise.all([load(), new Promise((r) => setTimeout(r, unlockMs))]);
      if (!value) {
        setState('missing');
        return;
      }
      setPassword(value);
      setState('shown');
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setState('locked'), revealMs);
    } catch {
      setState('error');
    }
  };

  if (state === 'missing') return <span className="text-xs" style={{ color: VT.muted }}>Sin contraseña</span>;

  const shown = state === 'shown';
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${vtMono} text-[13px] tracking-[.12em] select-${shown ? 'all' : 'none'} transition-[filter,opacity] duration-300`}
        style={{ filter: shown ? 'none' : 'blur(3px)', opacity: shown ? 1 : 0.55, color: shown ? VT.ink : VT.muted }}
        aria-live="polite"
      >
        {shown ? password : '••••••'}
      </span>
      <button
        type="button"
        onClick={shown ? hide : reveal}
        disabled={state === 'unlocking'}
        aria-label={shown ? `Ocultar contraseña de ${unitLabel}` : `Ver contraseña de ${unitLabel}`}
        title={state === 'error' ? 'No se pudo consultar. Clic para reintentar.' : shown ? 'Ocultar' : 'Desbloquear y ver'}
        className="inline-flex items-center justify-center w-7 h-7 max-md:w-11 max-md:h-11 rounded-md transition-colors hover:bg-[#f5f5f4] disabled:cursor-wait"
        style={{ color: state === 'error' ? VT.no : shown ? VT.yes : VT.inkSoft }}
      >
        <span className={state === 'unlocking' ? 'animate-pulse' : ''}>
          <VtIcon name={shown ? 'eye' : state === 'unlocking' ? 'unlock' : 'eyeOff'} size={15} />
        </span>
      </button>
    </span>
  );
}
