/**
 * Modal A2: grupo de votación (nuevo o edición).
 * Campos de siempre: nombre, descripción, periodo, quórum y notas.
 */

'use client';

import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { createVotingGroupAction, updateVotingGroupAction } from '../infrastructure/actions';
import type { VotingGroup } from '../domain/entities';
import { VT, VtDialog, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel, vtMono, vtTextarea } from './design';

/** Fecha local para un <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const nextHour = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
};

export type VotingGroupFormValue = Pick<
  VotingGroup,
  'id' | 'name' | 'description' | 'votingStartDate' | 'votingEndDate' | 'requiresQuorum' | 'quorumPercentage' | 'notes'
>;

interface VotingGroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  /** Si viene, el modal edita ese grupo. */
  group?: VotingGroupFormValue | null;
}

export function VotingGroupFormModal({ isOpen, onClose, onSuccess, businessId, group }: VotingGroupFormModalProps) {
  const isEdit = !!group;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [requiresQuorum, setRequiresQuorum] = useState(true);
  const [quorum, setQuorum] = useState('51');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setStart(toLocalInput(new Date(group.votingStartDate)));
      setEnd(toLocalInput(new Date(group.votingEndDate)));
      setRequiresQuorum(group.requiresQuorum);
      setQuorum(String(group.quorumPercentage || 51));
      setNotes(group.notes || '');
    } else {
      const s = nextHour();
      setName('');
      setDescription('');
      setStart(toLocalInput(new Date(s.getTime() - 3600_000)));
      setEnd(toLocalInput(new Date(s.getTime() + 4 * 3600_000)));
      setRequiresQuorum(true);
      setQuorum('51');
      setNotes('');
    }
  }, [isOpen, group]);

  const quorumNumber = Number(quorum.replace(',', '.'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) return setError('El nombre debe tener al menos 3 caracteres');
    if (!start || !end) return setError('Indica el inicio y el fin del periodo de votación');
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) return setError('El fin debe ser posterior al inicio');
    if (requiresQuorum && (!Number.isFinite(quorumNumber) || quorumNumber <= 0 || quorumNumber > 100)) {
      return setError('El quórum debe estar entre 1 y 100 %');
    }

    const token = TokenStorage.getBusinessToken();
    if (!token) return setError('No se encontró el token de autenticación');
    const effectiveBusinessId =
      Number.isFinite(businessId) && businessId > 0 ? businessId : TokenStorage.getActiveBusiness() ?? undefined;
    if (!effectiveBusinessId) return setError('No se encontró un negocio activo.');

    setSaving(true);
    try {
      const common = {
        name: name.trim(),
        description: description.trim() || undefined,
        votingStartDate: startDate.toISOString(),
        votingEndDate: endDate.toISOString(),
        requiresQuorum,
        quorumPercentage: requiresQuorum ? quorumNumber : undefined,
        notes: notes.trim() || undefined,
      };
      const result = group
        ? await updateVotingGroupAction({ token, businessId: effectiveBusinessId, groupId: group.id, data: common })
        : await createVotingGroupAction({
            token,
            businessId: effectiveBusinessId,
            data: { ...common, createdByUserId: Number(TokenStorage.getUser()?.id) || undefined },
          });
      if (!result.success) {
        setError(result.error || 'No se pudo guardar el grupo');
        return;
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el grupo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog open={isOpen} onClose={onClose} busy={saving} eyebrow="Grupo de votación" title={isEdit ? 'Editar grupo' : 'Nuevo grupo'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <div>
          <label htmlFor="vg-name" className={vtLabel}>Nombre</label>
          <input
            id="vg-name"
            className={vtInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asamblea Ordinaria 2026"
            maxLength={150}
            disabled={saving}
          />
        </div>
        <div>
          <label htmlFor="vg-description" className={vtLabel}>Descripción</label>
          <textarea
            id="vg-description"
            className={vtTextarea}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Asamblea anual de copropietarios…"
            maxLength={1000}
            disabled={saving}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="vg-start" className={vtLabel}>Inicio</label>
            <input
              id="vg-start"
              type="datetime-local"
              className={`${vtInput} ${vtMono} text-[13px]`}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="vg-end" className={vtLabel}>Fin</label>
            <input
              id="vg-end"
              type="datetime-local"
              className={`${vtInput} ${vtMono} text-[13px]`}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="rounded-lg p-3.5 flex flex-col gap-3" style={{ border: `1px solid ${VT.border}`, background: '#faf9f7' }}>
          <div className="flex justify-between items-center gap-4">
            <div>
              <div className="text-[13px] font-semibold">Requiere quórum</div>
              <div className="text-xs" style={{ color: VT.muted }}>
                Las votaciones solo serán válidas al superar el umbral
              </div>
            </div>
            <VtSwitch checked={requiresQuorum} onChange={setRequiresQuorum} label="Requiere quórum" disabled={saving} />
          </div>
          {requiresQuorum && (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={Number.isFinite(quorumNumber) ? quorumNumber : 51}
                onChange={(e) => setQuorum(e.target.value)}
                className="flex-1 accent-[#c8603f]"
                aria-label="Quórum (deslizador)"
                disabled={saving}
              />
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={100}
                  step="0.01"
                  value={quorum}
                  onChange={(e) => setQuorum(e.target.value)}
                  className={`${vtInput} ${vtMono} w-[84px] h-9 text-center font-semibold pr-6`}
                  aria-label="Quórum (%)"
                  disabled={saving}
                />
                <span className={`${vtMono} absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none`}>%</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="vg-notes" className={vtLabel}>
            Notas <span className="font-normal" style={{ color: VT.muted }}>· opcional</span>
          </label>
          <input
            id="vg-notes"
            className={vtInput}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Orden del día, convocatoria…"
            maxLength={2000}
            disabled={saving}
          />
        </div>

        {error && <VtNotice>{error}</VtNotice>}

        <div className="flex justify-end gap-2 pt-4 mt-1" style={{ borderTop: `1px solid ${VT.border}` }}>
          <button type="button" className={vtBtn.ghost} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className={vtBtn.primary} disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear grupo'}
          </button>
        </div>
      </form>
    </VtDialog>
  );
}

/** Compatibilidad con el export anterior ("Nuevo grupo"). */
export function CreateVotingGroupModal(props: Omit<VotingGroupFormModalProps, 'group'>) {
  return <VotingGroupFormModal {...props} />;
}
