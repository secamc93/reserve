/**
 * Componente: QR del grupo de votación (rediseño)
 *  - Opción 1j: modal compacto del admin con acciones en una fila.
 *  - Opción 1i: vista "Proyectar en pantalla completa" (QR + URL + 3 pasos).
 * Usa el QR real generado por la app (data URL).
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VT, formatDayTime, votingFontRoot, vtMono } from '../design';

export interface GroupQRData {
  qrDataUrl: string;
  publicUrl: string;
  groupName: string;
  votingsCount: number;
  /** Fecha de vencimiento del enlace (ISO). */
  expiresAt?: string;
}

interface GroupQRModalProps {
  data: GroupQRData;
  /** Horas de validez del enlace (se genera con 24 h). */
  validHours?: number;
  onClose: () => void;
}

const votingsLabel = (count: number) => `${count} ${count === 1 ? 'votación' : 'votaciones'}`;

/** "Da acceso a las 4 votaciones del grupo" */
const accessLabel = (count: number) =>
  count === 1 ? 'Da acceso a la votación del grupo' : `Da acceso a las ${count} votaciones del grupo`;

/** URL legible (sin protocolo) para mostrar; el enlace real se conserva para copiar. */
const displayUrl = (url: string) => url.replace(/^https?:\/\//, '');

/** Host + ruta, sin el token (que es muy largo para leerlo). */
const shortUrl = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return displayUrl(url).split('?')[0];
  }
};

export function GroupQRModal({ data, validHours = 24, onClose }: GroupQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [showFullUrl, setShowFullUrl] = useState(false);
  const validUntil = data.expiresAt ? formatDayTime(new Date(data.expiresAt)).toUpperCase() : null;
  const [projecting, setProjecting] = useState(false);
  const projectorRef = useRef<HTMLDivElement>(null);

  const closeProjector = useCallback(() => {
    setProjecting(false);
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }, []);

  // Escape: cierra la proyección o el modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (projecting) closeProjector();
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [projecting, closeProjector, onClose]);

  // Si el usuario sale del fullscreen del navegador, se cierra la proyección
  useEffect(() => {
    if (!projecting) return;
    const onChange = () => {
      if (!document.fullscreenElement) setProjecting(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [projecting]);

  const handleProject = () => {
    setProjecting(true);
    // Intentar pantalla completa real del navegador (si el navegador lo permite)
    requestAnimationFrame(() => {
      projectorRef.current?.requestFullscreen?.().catch(() => undefined);
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('No se pudo copiar el enlace');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `qr-grupo-${data.groupName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = data.qrDataUrl;
    link.click();
  };

  const secondaryButton =
    'h-9 max-md:h-11 rounded-[7px] bg-white text-[13px] font-medium transition-colors hover:bg-[#f5f5f4]';

  return (
    <>
      {/* 1j · Modal compacto */}
      <div
        className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 overflow-y-auto ${votingFontRoot}`}
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="group-qr-title"
          className="bg-white w-full max-w-[560px] rounded-t-2xl md:rounded-lg p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-7 flex flex-col gap-4 md:gap-[22px] shadow-[0_12px_40px_rgba(0,0,0,.18)] max-md:max-h-[92dvh] max-md:overflow-y-auto"
          style={{ color: VT.ink }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <div className={`${vtMono} text-[11px] font-medium tracking-[.06em] mb-1.5`} style={{ color: VT.muted }}>
                QR DEL GRUPO · {validUntil ? `VÁLIDO HASTA ${validUntil}` : `VÁLIDO ${validHours} H`}
              </div>
              <h2 id="group-qr-title" className="m-0 text-lg md:text-xl font-semibold tracking-[-.015em]">{data.groupName}</h2>
              <div className="text-[13px] mt-0.5" style={{ color: VT.muted }}>
                {accessLabel(data.votingsCount)}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center shrink-0 max-md:w-11 max-md:h-11 max-md:-mr-2 max-md:-mt-2 hover:text-[#1a1a1a] transition-colors"
              style={{ color: VT.muted }}
              aria-label="Cerrar"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-[22px] items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrDataUrl}
              alt={`Código QR para votar en ${data.groupName}`}
              className="w-[200px] h-[200px] block rounded-[10px] justify-self-center"
              style={{ border: `1px solid ${VT.border}` }}
            />
            <div className="flex flex-col gap-2.5 min-w-0">
              <div
                className="px-3 py-2.5 rounded-lg flex flex-col gap-1"
                style={{ border: `1px solid ${VT.border}`, background: VT.paper, color: VT.ink }}
                title={data.publicUrl}
              >
                <span className={`${vtMono} text-[13px] font-medium ${showFullUrl ? 'break-all' : 'truncate'}`}>
                  {showFullUrl ? data.publicUrl : shortUrl(data.publicUrl)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullUrl((v) => !v)}
                  className="self-start text-[11px] max-md:text-xs max-md:min-h-9 underline-offset-2 hover:underline"
                  style={{ color: VT.muted }}
                >
                  {showFullUrl ? 'ocultar enlace completo' : 'ver enlace completo'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleProject}
                className="h-[38px] max-md:h-12 max-md:text-[15px] rounded-[7px] text-white text-[13px] font-semibold transition-colors hover:bg-[#c8603f]"
                style={{ background: VT.ink }}
              >
                Proyectar en pantalla completa
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={secondaryButton}
                  style={{ border: `1px solid ${VT.borderStrong}`, color: copied ? VT.yes : VT.inkSoft }}
                  aria-live="polite"
                >
                  {copied ? 'Enlace copiado' : 'Copiar enlace'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className={secondaryButton}
                  style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
                >
                  Descargar PNG
                </button>
              </div>
              <p className="m-0 text-[11px] leading-snug" style={{ color: VT.muted }}>
                Un solo QR para toda la asamblea. El residente se identifica una vez y vota en cada punto cuando lo abras.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1i · Pantalla completa para proyectar */}
      {projecting && (
        <div
          ref={projectorRef}
          className={`fixed inset-0 z-[80] bg-white overflow-y-auto ${votingFontRoot}`}
          style={{ color: VT.ink }}
        >
          <button
            type="button"
            onClick={closeProjector}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 h-9 max-md:h-11 px-3 rounded-md bg-white text-[13px] font-medium hover:bg-[#f5f5f4]"
            style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
            Salir
          </button>
          <div className="min-h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-10 lg:gap-16 px-5 sm:px-12 lg:px-20 pt-20 pb-10 md:py-16">
            <div className="flex flex-col gap-7 min-w-0">
              <div className={`${vtMono} text-xs font-medium tracking-[.08em]`} style={{ color: VT.muted }}>
                {data.groupName.toUpperCase()} · {votingsLabel(data.votingsCount).toUpperCase()}
              </div>
              <h1 className="m-0 text-3xl sm:text-5xl lg:text-[52px] leading-[1.05] font-semibold tracking-[-.03em]">
                Escanea el código para votar desde tu celular
              </h1>
              <ol className="m-0 p-0 list-none flex flex-col gap-3.5 text-lg" style={{ color: VT.inkSoft }}>
                {[
                  'Abre la cámara y apunta al código',
                  'Confirma tu unidad y tu nombre',
                  'Vota en cada punto cuando se abra',
                ].map((step, i) => (
                  <li key={step} className="flex gap-3.5 items-baseline">
                    <span className={`${vtMono} text-[13px] font-semibold`} style={{ color: VT.accent }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="flex flex-col gap-1 text-[15px]" style={{ color: VT.muted }}>
                Sin cámara, abre este enlace:
                <span className={`${vtMono} text-sm break-all`} style={{ color: VT.ink }}>
                  {displayUrl(data.publicUrl)}
                </span>
              </div>
            </div>
            <div className="justify-self-center p-5 sm:p-7 rounded-[20px] bg-white" style={{ border: `1.5px solid ${VT.border}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.qrDataUrl}
                alt={`Código QR para votar en ${data.groupName}`}
                className="block w-[min(400px,70vw)] h-[min(400px,70vw)]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
