/**
 * Pantalla de asistencia en vivo: para proyectar en la asamblea. Muestra en grande el
 * % presente por coeficiente contra el quórum, los conteos y la hora local, y refresca
 * los registros cada pocos segundos.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  VT,
  formatClock,
  formatClockDate,
  formatPct,
  getQuorumStatus,
  vtMono,
  type AttendanceSummary,
} from './design';

interface AttendanceLiveScreenProps {
  groupName?: string;
  summary: AttendanceSummary;
  quorum: number;
  /** Vuelve a traer los registros; si falla, la pantalla avisa que los datos pueden estar desactualizados. */
  onRefresh: () => Promise<void>;
  onClose: () => void;
  /** Cada cuánto se refresca la asistencia (ms). */
  refreshMs?: number;
}

export function AttendanceLiveScreen({ groupName, summary, quorum, onRefresh, onClose, refreshMs = 5000 }: AttendanceLiveScreenProps) {
  const [now, setNow] = useState(() => new Date());
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [stale, setStale] = useState(false);
  const busy = useRef(false);
  const refresh = useRef(onRefresh);
  refresh.current = onRefresh;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        await refresh.current();
        setUpdatedAt(new Date());
        setStale(false);
      } catch {
        setStale(true);
      } finally {
        busy.current = false;
      }
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const status = getQuorumStatus(summary.presentCoefPct, quorum);
  const clock = formatClock(now);
  const updated = formatClock(updatedAt);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Asistencia en tiempo real"
      className="fixed inset-0 z-[70] flex flex-col overflow-auto"
      style={{ background: VT.paper, color: VT.ink }}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 px-6 sm:px-10 pt-6 sm:pt-8">
        <div className="min-w-0">
          <div className={`${vtMono} flex items-center gap-2 text-[12px] sm:text-[13px] tracking-[.12em] uppercase`} style={{ color: VT.live }}>
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: VT.live }} />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full" style={{ background: VT.live }} />
            </span>
            Asistencia en vivo
          </div>
          {groupName && <h1 className="m-0 mt-1.5 text-[20px] sm:text-[28px] font-semibold leading-tight">{groupName}</h1>}
        </div>
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="text-right" aria-label={`Hora local ${clock.time} ${clock.period}`}>
            <div className={`${vtMono} text-[34px] sm:text-[56px] leading-none font-semibold tracking-[-.03em] tabular-nums`}>
              {clock.time}
              <span className="text-[16px] sm:text-[22px] ml-2 font-normal" style={{ color: VT.muted }}>{clock.period}</span>
            </div>
            <div className="mt-1.5 text-[13px] sm:text-[15px] first-letter:uppercase" style={{ color: VT.inkSoft }}>{formatClockDate(now)}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistencia en vivo"
            title="Cerrar (Esc)"
            className="inline-flex items-center justify-center w-11 h-11 rounded-md text-[18px] hover:bg-white"
            style={{ color: VT.inkSoft }}
          >
            ✕
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-8 gap-8 sm:gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[15px] sm:text-[20px]" style={{ color: VT.inkSoft }}>Presentes por coeficiente</div>
            <div className={`${vtMono} leading-[.9] font-semibold tracking-[-.05em] tabular-nums text-[96px] sm:text-[160px] lg:text-[200px]`}>
              {formatPct(summary.presentCoefPct)}
              <span className="text-[40px] sm:text-[64px]" style={{ color: VT.muted }}>%</span>
            </div>
          </div>
          <div
            role="status"
            className="px-5 sm:px-7 py-3 sm:py-4 rounded-xl text-[20px] sm:text-[30px] font-semibold"
            style={{ background: status.bg, color: status.fg }}
          >
            {status.label}
          </div>
        </div>

        <div>
          <div
            className="relative h-8 sm:h-12"
            role="img"
            aria-label={`Presentes ${formatPct(summary.presentCoefPct)}% del coeficiente. Quórum ${quorum}%`}
          >
            <div className="h-full rounded-lg bg-white overflow-hidden" style={{ border: `1px solid ${VT.borderStrong}` }}>
              <div
                className="h-full transition-[width] duration-700"
                style={{ width: `${Math.min(summary.presentCoefPct, 100)}%`, background: status.reached ? VT.yes : VT.ink }}
              />
            </div>
            <div className="absolute w-1" style={{ top: -10, bottom: -10, left: `${quorum}%`, background: VT.accent }} />
          </div>
          <div className={`${vtMono} relative h-6 mt-2 text-[13px] sm:text-[16px]`}>
            <span style={{ color: VT.muted }}>0</span>
            <span className="absolute -translate-x-1/2 font-semibold" style={{ left: `${quorum}%`, color: VT.accent }}>quórum {quorum}%</span>
            <span className="absolute right-0" style={{ color: VT.muted }}>100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LiveStat label="Unidades presentes" value={summary.present} suffix={`de ${summary.total}`} />
          <LiveStat label="Ausentes" value={summary.absent} />
          <LiveStat label="Con poder (apoderado)" value={summary.proxy} />
        </div>
      </main>

      <footer className={`${vtMono} px-6 sm:px-10 pb-6 text-[12px] sm:text-[13px]`} style={{ color: stale ? VT.missingFg : VT.muted }}>
        {stale
          ? `Sin conexión: los datos son de las ${updated.time} ${updated.period}. Reintentando…`
          : `Actualizado ${updated.time} ${updated.period} · se actualiza cada ${Math.round(refreshMs / 1000)} s`}
      </footer>
    </div>
  );
}

function LiveStat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-white rounded-xl px-6 py-5" style={{ border: `1px solid ${VT.border}` }}>
      <div className="text-[14px] sm:text-[17px]" style={{ color: VT.inkSoft }}>{label}</div>
      <div className={`${vtMono} mt-1 text-[44px] sm:text-[64px] leading-none font-semibold tracking-[-.03em] tabular-nums`}>
        {value}
        {suffix && <span className="text-[18px] sm:text-[24px] ml-2 font-normal" style={{ color: VT.muted }}>{suffix}</span>}
      </div>
    </div>
  );
}
