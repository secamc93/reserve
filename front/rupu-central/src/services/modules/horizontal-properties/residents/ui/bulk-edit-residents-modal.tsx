/**
 * R4 · Edición masiva de residentes por Excel (modal de 560 px): columnas admitidas,
 * selector de archivo y resultado (procesados / actualizados / errores, con detalle por fila).
 */

'use client';

import { useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DsEyebrow, VtDialog, VtNotice, dsMono, vtBtn } from '@shared/ui/ds';
import { bulkUpdateResidentsAction } from '../infrastructure/actions/bulk-update-residents.action';
import { DsFileDrop, validateExcelFile } from '../../units/ui/kit';
import { ExcelErrorList, ExcelFormatExample, ExcelResultStats } from './excel-result';

interface BulkEditResidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

interface BulkResult {
  total_processed: number;
  updated: number;
  errors: number;
  error_details: Array<{ row: number; property_unit_number: string; error: string }>;
}

export function BulkEditResidentsModal({ isOpen, onClose, onSuccess, businessId }: BulkEditResidentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);

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
    const effectiveBusinessId = Number.isFinite(businessId) && businessId > 0 ? businessId : TokenStorage.getActiveBusiness() ?? undefined;
    if (!effectiveBusinessId) {
      setError('No se encontró una propiedad activa para la edición masiva.');
      return;
    }
    const token = TokenStorage.getBusinessToken();
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await bulkUpdateResidentsAction({ token, businessId: effectiveBusinessId, file });
      if (!res.success) {
        setError(res.error || res.message || 'No se pudieron actualizar los residentes');
        return;
      }
      const data = res.data ?? { total_processed: 0, updated: 0, errors: 0, error_details: [] };
      setResult({ ...data, error_details: data.error_details ?? [] });
      if (data.updated > 0) onSuccess();
    } catch {
      setError('Error inesperado al actualizar los residentes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VtDialog
      open={isOpen}
      onClose={handleClose}
      busy={loading}
      eyebrow="Edición masiva"
      title="Actualizar residentes por Excel"
      subtitle="Actualiza el nombre o el documento del residente principal de cada unidad."
      footer={
        result ? (
          <>
            <button type="button" className={vtBtn.secondary} onClick={reset}>Procesar otro archivo</button>
            <button type="button" className={vtBtn.primary} onClick={handleClose}>Listo</button>
          </>
        ) : (
          <>
            <button type="button" className={vtBtn.secondary} onClick={handleClose} disabled={loading}>Cancelar</button>
            <button type="button" className={vtBtn.primary} onClick={submit} disabled={loading || !file}>
              {loading ? 'Procesando…' : 'Procesar Excel'}
            </button>
          </>
        )
      }
    >
      {!result && (
        <>
          <div className="flex flex-col gap-2">
            <DsEyebrow>Columnas admitidas</DsEyebrow>
            <ul className="m-0 pl-4 text-[13px] text-[#4b4a46] flex flex-col gap-0.5 list-disc">
              <li>
                Unidad (obligatoria): <span className={dsMono}>unidad, unit, property_unit, property_unit_number</span>
              </li>
              <li>
                Nombre: <span className={dsMono}>nombre, name, resident_name</span>
              </li>
              <li>
                Documento: <span className={dsMono}>dni, document, documento, cedula</span>
              </li>
              <li>Cada fila necesita al menos el nombre o el documento.</li>
            </ul>
            <ExcelFormatExample headers={['Unidad', 'Nombre', 'Documento']} rows={[['126', 'Juan Pérez', '12345678']]} />
          </div>
          <DsFileDrop file={file} onFile={pickFile} disabled={loading} />
        </>
      )}

      {error && <VtNotice>{error}</VtNotice>}

      {result && (
        <div className="flex flex-col gap-3">
          <ExcelResultStats
            stats={[
              { label: 'Procesados', value: result.total_processed },
              { label: 'Actualizados', value: result.updated },
              { label: 'Errores', value: result.errors },
            ]}
          />
          {result.updated > 0 && <VtNotice tone="ok">Se actualizaron {result.updated} residentes.</VtNotice>}
          {result.error_details.length > 0 && (
            <ExcelErrorList title={`Filas con error · ${result.error_details.length}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={`${dsMono} text-[10px] uppercase tracking-[.06em]`}>
                    <th className="py-1 pr-2 font-medium">Fila</th>
                    <th className="py-1 pr-2 font-medium">Unidad</th>
                    <th className="py-1 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.error_details.map((d, i) => (
                    <tr key={i} className="border-t border-[#f1cfc4]">
                      <td className={`${dsMono} py-1 pr-2`}>{d.row}</td>
                      <td className="py-1 pr-2 font-semibold">{d.property_unit_number}</td>
                      <td className="py-1">{d.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ExcelErrorList>
          )}
        </div>
      )}
    </VtDialog>
  );
}
