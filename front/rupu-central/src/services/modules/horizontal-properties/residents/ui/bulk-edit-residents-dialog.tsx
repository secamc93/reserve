/**
 * R3 · Edición masiva (modal de 820 px): tabla editable de los residentes de una torre/bloque
 * (unidad, nombre, documento, correo, teléfono, principal por unidad y activo). Las celdas
 * cambiadas se marcan con borde negro y la fila en #faf9f7; un correo inválido en rojo.
 * Guarda solo lo cambiado, residente por residente (PUT del residente). La carga por Excel
 * sigue disponible desde "Actualizar por Excel".
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DS, VtDialog, VtNotice, VtSwitch, dsMono, vtBtn } from '@shared/ui/ds';
import { getResidentsAction, updateResidentAction } from '../infrastructure/actions';
import {
  bulkRowFromResident,
  bulkRowToUpdate,
  changedFields,
  isValidOptionalEmail,
  setMainInUnit,
  type BulkField,
  type BulkRow,
} from '../domain';
import { formatUnitLabel } from '../../units/domain';
import { dsSelect } from '@shared/ui/ds';

const PAGE_SIZE = 200;

interface BulkEditResidentsDialogProps {
  businessId: number;
  /** Torres/bloques de la propiedad (selector). */
  blocks: string[];
  initialBlock?: string;
  onClose: () => void;
  /** Se llama después de guardar cambios. */
  onSuccess: () => void;
  /** Abrir la edición masiva por Excel. */
  onOpenExcel?: () => void;
}

export function BulkEditResidentsDialog({ businessId, blocks, initialBlock, onClose, onSuccess, onOpenExcel }: BulkEditResidentsDialogProps) {
  const [block, setBlock] = useState(initialBlock ?? blocks[0] ?? '');
  const [original, setOriginal] = useState<BulkRow[]>([]);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('token');
      const data = await getResidentsAction({ businessId, token, page: 1, pageSize: PAGE_SIZE, block: block || undefined });
      const list = [...data.residents]
        .sort((a, b) => a.propertyUnitNumber.localeCompare(b.propertyUnitNumber, 'es', { numeric: true }) || a.name.localeCompare(b.name, 'es'))
        .map((r) => bulkRowFromResident(r, formatUnitLabel(r.propertyUnitNumber, r.propertyUnitBlock)));
      setOriginal(list);
      setRows(list);
      setTotal(data.total);
    } catch {
      setError('No se pudieron cargar los residentes');
    } finally {
      setLoading(false);
    }
  }, [businessId, block]);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(original.map((r) => [r.id, r])), [original]);
  const changes = rows.reduce((acc, r) => acc + changedFields(byId.get(r.id) ?? r, r).length, 0);
  const invalidEmails = rows.filter((r) => !isValidOptionalEmail(r.email)).length;
  const units = new Set(rows.map((r) => r.unitKey)).size;

  const edit = (id: number, field: Exclude<BulkField, 'isMain'>, value: string | boolean) => {
    setSaved(null);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const token = TokenStorage.getBusinessToken();
    const failed: string[] = [];
    let ok = 0;
    for (const r of rows) {
      const orig = byId.get(r.id);
      const dto = orig ? bulkRowToUpdate(orig, r) : null;
      if (!dto || !token) continue;
      try {
        await updateResidentAction({ businessId, residentId: r.id, data: dto, token });
        ok++;
      } catch {
        failed.push(r.name || r.unitLabel);
      }
    }
    setSaving(false);
    if (ok > 0) onSuccess();
    if (failed.length > 0) setError(`No se pudieron guardar: ${failed.join(', ')}`);
    else setSaved(`Se guardaron los cambios de ${ok} residente${ok === 1 ? '' : 's'}`);
    await load();
  };

  const cell = (r: BulkRow, field: 'name' | 'dni' | 'email' | 'phone', mono = false) => {
    const orig = byId.get(r.id);
    const changed = orig ? changedFields(orig, r).includes(field) : false;
    const invalid = field === 'email' && !isValidOptionalEmail(r.email);
    return (
      <input
        aria-label={`${field === 'name' ? 'Nombre' : field === 'dni' ? 'Documento' : field === 'email' ? 'Correo' : 'Teléfono'} de ${r.name || r.unitLabel}`}
        aria-invalid={invalid || undefined}
        value={r[field]}
        onChange={(e) => edit(r.id, field, e.target.value)}
        className={`w-full h-8 max-md:h-10 rounded-xl border bg-white px-2 text-xs outline-none ${mono ? dsMono : ''} ${
          invalid ? 'border-[#c8382d] text-[#c8382d]' : changed ? 'border-[#1a1a1a]' : 'border-[#e4e2dd] focus:border-[#1a1a1a]'
        }`}
      />
    );
  };

  return (
    <VtDialog
      open
      onClose={onClose}
      busy={saving}
      width={820}
      eyebrow={`Edición masiva · ${block || 'todas las torres'}`}
      title={loading ? 'Cargando…' : `${units} unidad${units === 1 ? '' : 'es'} · ${rows.length} residente${rows.length === 1 ? '' : 's'}`}
      footer={
        <>
          <span className={`mr-auto text-xs max-md:basis-full max-md:order-first ${invalidEmails ? 'text-[#c8382d]' : 'text-[#8a8580]'}`} aria-live="polite">
            {changes} cambio{changes === 1 ? '' : 's'} sin guardar{invalidEmails ? ` · ${invalidEmails} correo${invalidEmails === 1 ? '' : 's'} inválido${invalidEmails === 1 ? '' : 's'}` : ''}
          </span>
          <button type="button" className={vtBtn.secondary} onClick={() => setRows(original)} disabled={saving || changes === 0}>Descartar</button>
          <button type="button" className={vtBtn.primary} onClick={save} disabled={saving || changes === 0 || invalidEmails > 0}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {onOpenExcel ? (
          <button type="button" className={vtBtn.small} onClick={onOpenExcel}>Actualizar por Excel</button>
        ) : (
          <span />
        )}
        <select aria-label="Torre" className={dsSelect} value={block} onChange={(e) => setBlock(e.target.value)} disabled={saving}>
          <option value="">Torre: todas</option>
          {blocks.map((b) => (
            <option key={b} value={b}>{`Torre: ${b}`}</option>
          ))}
        </select>
      </div>

      {error && <VtNotice>{error}</VtNotice>}
      {saved && <VtNotice tone="ok">{saved}</VtNotice>}
      {total > rows.length && !loading && (
        <VtNotice tone="info">Se muestran los primeros {rows.length} de {total}. Elige una torre para editar el resto.</VtNotice>
      )}

      <div className="rounded-2xl border border-[#e4e2dd] overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[760px] text-[13px]" aria-label="Residentes a editar">
            <thead className="sticky top-0 bg-white z-[1]">
              <tr className={`${dsMono} text-[10px] uppercase tracking-[.06em] text-[#8a8580] text-left`}>
                {['Unidad', 'Nombre', 'Documento', 'Correo', 'Teléfono', 'Principal', 'Activo'].map((h) => (
                  <th key={h} className="px-2.5 py-2 font-medium border-b border-[#efedea]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-[#8a8580]">Cargando…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-[#8a8580]">No hay residentes en esta torre</td>
                </tr>
              ) : (
                rows.map((r) => {
                  const orig = byId.get(r.id);
                  const changedRow = orig ? changedFields(orig, r).length > 0 : false;
                  return (
                    <tr key={r.id} className="border-b border-[#efedea] last:border-b-0" style={changedRow ? { background: '#faf9f7' } : undefined}>
                      <td className={`${dsMono} px-2.5 py-1.5 font-semibold whitespace-nowrap`}>{r.unitLabel}</td>
                      <td className="px-2.5 py-1.5 min-w-[220px]">{cell(r, 'name')}</td>
                      <td className="px-2.5 py-1.5 w-[120px]">{cell(r, 'dni', true)}</td>
                      <td className="px-2.5 py-1.5 min-w-[160px]">{cell(r, 'email')}</td>
                      <td className="px-2.5 py-1.5 w-[120px]">{cell(r, 'phone', true)}</td>
                      <td className="px-2.5 py-1.5 text-center">
                        <input
                          type="radio"
                          name={`principal-${r.unitKey}`}
                          aria-label={`Principal de ${r.unitLabel}: ${r.name}`}
                          className="w-4 h-4 accent-[#1a1a1a]"
                          checked={r.isMain}
                          onChange={() => {
                            setSaved(null);
                            setRows((rs) => setMainInUnit(rs, r.id));
                          }}
                          style={orig && orig.isMain !== r.isMain ? { outline: `2px solid ${DS.ink}`, outlineOffset: 2 } : undefined}
                        />
                      </td>
                      <td className="px-2.5 py-1.5">
                        <VtSwitch checked={r.isActive} onChange={(v) => edit(r.id, 'isActive', v)} label={`Activo: ${r.name}`} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </VtDialog>
  );
}
