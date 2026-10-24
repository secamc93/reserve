/**
 * R4 · Importar residentes desde Excel (modal de 560 px): formato, selector de archivo y
 * resultado (procesados / creados / con error, con los errores por fila).
 */

'use client';

import { useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DsEyebrow, VtDialog, VtNotice, vtBtn } from '@shared/ui/ds';
import { importResidentsFromExcelAction } from '../infrastructure/actions';
import { DsFileDrop, validateExcelFile } from '@shared/ui/ds';
import { ExcelErrorList, ExcelFormatExample, ExcelResultStats } from './excel-result';

interface ImportResidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

interface ImportResult {
  total: number;
  created: number;
  errors: string[];
}

export function ImportResidentsModal({ isOpen, onClose, onSuccess, businessId }: ImportResidentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setError(null);
    setErrorDetails([]);
    setResult(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const pickFile = (f: File | null) => {
    setResult(null);
    setErrorDetails([]);
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
    const effectiveBusinessId = Number.isFinite(businessId) && businessId > 0 ? businessId : TokenStorage.getActiveBusiness() ?? undefined;
    if (!effectiveBusinessId) {
      setError('No se encontró una propiedad activa para importar residentes.');
      return;
    }
    const token = TokenStorage.getBusinessToken();
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }
    setLoading(true);
    setError(null);
    setErrorDetails([]);
    try {
      const res = await importResidentsFromExcelAction({ token, businessId: effectiveBusinessId, file });
      if (!res.success) {
        setError(res.message || 'No se pudieron importar los residentes');
        setErrorDetails(res.details ?? []);
        return;
      }
      const data = res.data ?? { total: 0, created: 0, errors: [] };
      setResult({ ...data, errors: data.errors ?? [] });
      if (data.created > 0) onSuccess();
    } catch {
      setError('Error inesperado al importar los residentes');
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
      title="Importar residentes desde Excel"
      subtitle="Las unidades deben existir antes de importar sus residentes."
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
              {loading ? 'Importando…' : 'Importar residentes'}
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
              Primera fila con encabezados (se ignora). Columnas: <strong>número de unidad</strong> (exactamente como está en
              Unidades, p. ej. <span className="font-mono">T1-101</span>), nombre completo y documento. Correo y teléfono se completan
              después con Edición masiva. Todos quedan como Propietario; el tipo se cambia editando al residente.
            </p>
            <ExcelFormatExample
              headers={['Unidad', 'Nombre', 'Documento']}
              rows={[
                ['126', 'Juan Pérez', '12345678'],
                ['127', 'María García', '87654321'],
              ]}
            />
            <a href="/plantillas/plantilla-residentes.xlsx" download className={`${vtBtn.secondary} self-start`}>
              <span aria-hidden>⬇</span> Descargar Excel de ejemplo
            </a>
          </div>
          <DsFileDrop file={file} onFile={pickFile} disabled={loading} />
        </>
      )}

      {error && <VtNotice>{error}</VtNotice>}
      {errorDetails.length > 0 && (
        <ExcelErrorList title={`Detalle · ${errorDetails.length}`}>
          <ul className="flex flex-col gap-1">
            {errorDetails.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </ExcelErrorList>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <ExcelResultStats
            stats={[
              { label: 'Procesados', value: result.total },
              { label: 'Creados', value: result.created },
              { label: 'Con error', value: result.errors.length },
            ]}
          />
          {result.created > 0 && <VtNotice tone="ok">Se crearon {result.created} residentes.</VtNotice>}
          {result.errors.length > 0 && (
            <ExcelErrorList title={`Filas con error · ${result.errors.length}`}>
              <ul className="flex flex-col gap-1">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </ExcelErrorList>
          )}
        </div>
      )}
    </VtDialog>
  );
}
