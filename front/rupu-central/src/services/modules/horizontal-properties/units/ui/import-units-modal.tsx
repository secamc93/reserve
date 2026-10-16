/**
 * U3 · Importar unidades con vista previa (modal de 760 px).
 *  Paso 1: formato y archivo. Paso 2 "Revisa antes de importar": archivo, filas listas, con
 *  errores y coeficiente total resultante; tabla por fila con su estado (vista previa del
 *  back con dry_run, no guarda nada) y la opción de actualizar las existentes. Al final, el
 *  resultado de la carga.
 */

'use client';

import { useState } from 'react';
import { DS, DsEyebrow, VtDialog, VtNotice, dsMono, vtBtn } from '@shared/ui/ds';
import { importUnitsFromExcelAction, previewUnitsImportAction } from '../infrastructure/actions';
import {
  formatCoefficient,
  formatCoefficientPct,
  getCoefficientStatus,
  importCount,
  importRowStatusLabel,
  isImportRowError,
  unitTypeLabel,
  type UnitImportPreview,
} from '../domain';
import { getUnitsBusinessToken } from './business-token';
import { DsFileDrop, validateExcelFile } from './kit';

interface ImportUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

type Step = 'file' | 'review' | 'done';

export function ImportUnitsModal({ isOpen, onClose, onSuccess, businessId }: ImportUnitsModalProps) {
  const [step, setStep] = useState<Step>('file');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UnitImportPreview | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setStep('file');
    setFile(null);
    setPreview(null);
    setUpdateExisting(true);
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const pickFile = (f: File | null) => {
    if (!f) return setFile(null);
    const invalid = validateExcelFile(f);
    setError(invalid);
    setFile(invalid ? null : f);
  };

  const review = async () => {
    if (!file) return setError('Selecciona un archivo Excel');
    setLoading(true);
    setError(null);
    try {
      const token = await getUnitsBusinessToken(businessId);
      const res = await previewUnitsImportAction({ token, businessId, file });
      if (!res.success || !res.data) return setError(res.error ? `${res.message}: ${res.error}` : res.message || 'No se pudo revisar el archivo');
      setPreview(res.data);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al revisar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getUnitsBusinessToken(businessId);
      const res = await importUnitsFromExcelAction({ token, businessId, file, updateExisting });
      if (!res.success) return setError(res.message || 'No se pudieron importar las unidades');
      const data = res.data ?? { total: 0, created: 0, skipped: 0, errors: [] };
      setResult({ total: data.total, created: data.created, updated: data.updated ?? 0, skipped: data.skipped, errors: data.errors ?? [] });
      setStep('done');
      if (data.created > 0 || (data.updated ?? 0) > 0) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al importar las unidades');
    } finally {
      setLoading(false);
    }
  };

  const toImport = preview ? importCount(preview.ready, preview.existing, updateExisting) : 0;
  const coefStatus = preview ? getCoefficientStatus(preview.coefficientTotal) : null;

  const footer =
    step === 'file' ? (
      <>
        <button type="button" className={vtBtn.secondary} onClick={handleClose} disabled={loading}>Cancelar</button>
        <button type="button" className={vtBtn.primary} onClick={review} disabled={loading || !file}>
          {loading ? 'Revisando…' : 'Revisar archivo'}
        </button>
      </>
    ) : step === 'review' ? (
      <>
        <label className="mr-auto flex items-center gap-2 text-[13px] max-md:basis-full max-md:order-first">
          <input type="checkbox" className="w-4 h-4 accent-[#1a1a1a]" checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />
          Actualizar unidades existentes con el mismo número
        </label>
        <button type="button" className={vtBtn.secondary} onClick={() => { setStep('file'); setPreview(null); }} disabled={loading}>← Cambiar archivo</button>
        <button type="button" className={vtBtn.primary} onClick={runImport} disabled={loading || toImport === 0}>
          {loading ? 'Importando…' : `Importar ${toImport} unidad${toImport === 1 ? '' : 'es'}`}
        </button>
      </>
    ) : (
      <>
        <button type="button" className={vtBtn.secondary} onClick={reset}>Importar otro archivo</button>
        <button type="button" className={vtBtn.primary} onClick={handleClose}>Listo</button>
      </>
    );

  return (
    <VtDialog
      open={isOpen}
      onClose={handleClose}
      busy={loading}
      width={760}
      eyebrow={step === 'file' ? 'Importar unidades · paso 1 de 2' : step === 'review' ? 'Importar unidades · paso 2 de 2' : 'Importar unidades'}
      title={step === 'file' ? 'Elige el archivo' : step === 'review' ? 'Revisa antes de importar' : 'Importación terminada'}
      subtitle={step === 'file' ? 'Primero revisamos el archivo; nada se guarda hasta que confirmes.' : undefined}
      footer={footer}
    >
      {error && <VtNotice>{error}</VtNotice>}

      {step === 'file' && (
        <>
          <div className="flex flex-col gap-2">
            <DsEyebrow>Formato del archivo</DsEyebrow>
            <p className="text-[13px] text-[#4b4a46] m-0">
              Excel (.xlsx) con una fila de encabezados: <span className={dsMono}>Número, Torre, Piso, Tipo, Coeficiente</span>. Número y
              coeficiente son obligatorios; sin encabezados reconocibles se toma la columna 1 como número y la 2 como coeficiente.
            </p>
          </div>
          <DsFileDrop file={file} onFile={pickFile} disabled={loading} />
        </>
      )}

      {step === 'review' && preview && (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <ReviewCard label="Archivo" value={<span className="text-[13px] font-semibold break-all">{file?.name}</span>} hint={`${preview.totalRows} filas · ${preview.columns} columnas`} />
            <ReviewCard label="Listas para importar" value={toImport} color={DS.yes} hint={preview.existing > 0 ? `${preview.existing} ya existen` : 'nuevas'} />
            <ReviewCard label="Con errores" value={preview.errors} color={preview.errors > 0 ? DS.accent : undefined} hint="se omiten" />
            <ReviewCard
              label="Coef. total"
              value={formatCoefficientPct(preview.coefficientTotal)}
              color={coefStatus?.ok ? DS.yes : DS.accent}
              hint={coefStatus?.ok ? 'cuadra' : coefStatus?.label}
            />
          </div>
          <div className="rounded-[10px] border border-[#e4e2dd] overflow-hidden">
            <div className="max-h-[320px] overflow-auto">
              <table className="w-full min-w-[620px] text-[13px]" aria-label="Filas del archivo">
                <thead className="sticky top-0 bg-white">
                  <tr className={`${dsMono} text-[10px] uppercase tracking-[.06em] text-[#8a8580] text-left`}>
                    {['#', 'Número', 'Torre', 'Piso', 'Tipo', 'Coef.', 'Estado'].map((h) => (
                      <th key={h} className={`px-3 py-2 font-medium border-b border-[#efedea] ${h === 'Coef.' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r) => {
                    const bad = isImportRowError(r);
                    return (
                      <tr key={r.row} className="border-b border-[#efedea] last:border-b-0" style={bad ? { background: '#fdf4f1' } : undefined}>
                        <td className={`${dsMono} px-3 py-1.5 text-[#8a8580]`}>{r.row}</td>
                        <td className={`${dsMono} px-3 py-1.5 font-semibold`}>{r.number || '—'}</td>
                        <td className="px-3 py-1.5">{r.block || '—'}</td>
                        <td className={`${dsMono} px-3 py-1.5`}>{r.floor ?? '—'}</td>
                        <td className="px-3 py-1.5">{r.unitType ? unitTypeLabel(r.unitType) : '—'}</td>
                        <td className={`${dsMono} px-3 py-1.5 text-right`}>{formatCoefficient(r.coefficient)}</td>
                        <td className="px-3 py-1.5 text-xs font-semibold" style={{ color: bad ? DS.accent : r.status === 'exists' ? DS.inkSoft : DS.yes }}>
                          {importRowStatusLabel(r, updateExisting)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2.5">
            <ReviewCard label="Creadas" value={result.created} color={DS.yes} />
            <ReviewCard label="Actualizadas" value={result.updated} />
            <ReviewCard label="Omitidas" value={result.skipped} color={result.skipped > 0 ? DS.accent : undefined} />
          </div>
          {result.errors.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <DsEyebrow>Filas omitidas · {result.errors.length}</DsEyebrow>
              <ul className="max-h-40 overflow-y-auto rounded-lg border border-[#f1cfc4] bg-[#fbe9e4] px-3.5 py-2 text-xs text-[#9c3a22] flex flex-col gap-1">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </VtDialog>
  );
}

function ReviewCard({ label, value, hint, color }: { label: string; value: React.ReactNode; hint?: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-lg border border-[#e4e2dd] px-3 py-2.5 min-w-0">
      <DsEyebrow>{label}</DsEyebrow>
      <div className={`${dsMono} text-xl font-semibold mt-0.5`} style={color ? { color } : undefined}>{value}</div>
      {hint && <div className="text-[11px] text-[#8a8580] mt-0.5">{hint}</div>}
    </div>
  );
}
