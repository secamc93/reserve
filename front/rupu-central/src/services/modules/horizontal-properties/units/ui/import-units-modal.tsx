/**
 * U3 · Importar unidades desde Excel (modal de 560 px): formato esperado, selector de
 * archivo y resultado (procesadas / creadas / omitidas, con los errores por fila).
 */

'use client';

import { useState } from 'react';
import { DsEyebrow, VtDialog, VtNotice, dsMono, vtBtn } from '@shared/ui/ds';
import { importUnitsFromExcelAction } from '../infrastructure/actions';
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
  skipped: number;
  errors: string[];
}

export function ImportUnitsModal({ isOpen, onClose, onSuccess, businessId }: ImportUnitsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const pickFile = (f: File | null) => {
    setResult(null);
    if (!f) return setFile(null);
    const invalid = validateExcelFile(f);
    setError(invalid);
    setFile(invalid ? null : f);
  };

  const submit = async () => {
    if (!file) {
      setError('Selecciona un archivo Excel');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getUnitsBusinessToken(businessId);
      const res = await importUnitsFromExcelAction({ token, businessId, file });
      if (!res.success) {
        setError(res.message || 'No se pudieron importar las unidades');
        return;
      }
      const data = res.data ?? { total: 0, created: 0, skipped: 0, errors: [] };
      setResult({ ...data, errors: data.errors ?? [] });
      if (data.created > 0) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al importar las unidades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VtDialog
      open={isOpen}
      onClose={handleClose}
      busy={loading}
      eyebrow="Importar"
      title="Importar unidades desde Excel"
      subtitle="Crea en bloque las unidades con su coeficiente. Las que ya existen se omiten."
      footer={
        result ? (
          <>
            <button type="button" className={vtBtn.secondary} onClick={reset}>Importar otro archivo</button>
            <button type="button" className={vtBtn.primary} onClick={handleClose}>Listo</button>
          </>
        ) : (
          <>
            <button type="button" className={vtBtn.secondary} onClick={handleClose} disabled={loading}>Cancelar</button>
            <button type="button" className={vtBtn.primary} onClick={submit} disabled={loading || !file}>
              {loading ? 'Importando…' : 'Importar unidades'}
            </button>
          </>
        )
      }
    >
      {!result && (
        <>
          <div className="flex flex-col gap-2">
            <DsEyebrow>Formato del archivo</DsEyebrow>
            <p className="text-[13px] text-[#4b4a46] m-0">
              Primera fila con encabezados (se ignora). Columna 1: número de la unidad (único). Columna 2: coeficiente (mayor que 0).
            </p>
            <div className="rounded-lg border border-[#e4e2dd] overflow-hidden" aria-label="Ejemplo del archivo">
              <div className={`${dsMono} grid grid-cols-2 gap-3 px-3.5 py-2 bg-[#f5f5f4] text-[10px] uppercase tracking-[.06em] text-[#8a8580]`}>
                <span>Número</span>
                <span>Coeficiente</span>
              </div>
              {[['126', '0,503'], ['127', '0,498']].map(([n, c]) => (
                <div key={n} className={`${dsMono} grid grid-cols-2 gap-3 px-3.5 py-1.5 text-xs border-t border-[#efedea]`}>
                  <span>{n}</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <DsFileDrop file={file} onFile={pickFile} disabled={loading} />
        </>
      )}

      {error && <VtNotice>{error}</VtNotice>}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Procesadas', value: result.total },
              { label: 'Creadas', value: result.created },
              { label: 'Omitidas', value: result.skipped },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-[#e4e2dd] px-3 py-2.5">
                <DsEyebrow>{s.label}</DsEyebrow>
                <div className={`${dsMono} text-xl font-semibold mt-0.5`}>{s.value}</div>
              </div>
            ))}
          </div>
          {result.created > 0 && <VtNotice tone="ok">Se crearon {result.created} unidades.</VtNotice>}
          {result.errors.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <DsEyebrow>Filas con error · {result.errors.length}</DsEyebrow>
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
