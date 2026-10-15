/**
 * Modal A3: votación con sus opciones (une "Crear votación" y "Agregar opción").
 * Campos de siempre: título, descripción, tipo, % requerido, secreta, abstención;
 * cada opción: texto + código + color. En edición también se activan/desactivan
 * o quitan opciones existentes (el back no permite editar su texto).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import {
  createVotingAction,
  createVotingOptionAction,
  deleteVotingOptionAction,
  getVotingOptionsAction,
  updateVotingAction,
  updateVotingOptionStatusAction,
} from '../infrastructure/actions';
import { deactivateVotingAction } from '../infrastructure/actions/deactivate-voting.action';
import type { Voting, VotingOption } from '../domain/entities';
import {
  VOTING_TYPE_OPTIONS,
  VT,
  VtDialog,
  VtIcon,
  VtNotice,
  VtSwitch,
  draftFromVoting,
  emptyVotingDraft,
  formatOrder,
  getOptionKind,
  hasDraftErrors,
  makeOptionDraft,
  planOptionChanges,
  suggestOptionCode,
  validateVotingDraft,
  vtBtn,
  vtInput,
  vtLabel,
  vtMono,
  vtTextarea,
  type OptionDraft,
  type VotingDraft,
  type VotingDraftErrors,
  vtDialogFooter,
} from './design';

interface VotingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se llama tras guardar (también si la votación se creó pero falló alguna opción). */
  onSuccess: () => void;
  businessId: number;
  groupId: number;
  groupName: string;
  /** Orden que tendrá una votación nueva (votaciones del grupo + 1). */
  nextOrder: number;
  /** Si viene, el modal edita esa votación. */
  voting?: Voting | null;
}

export function VotingFormModal({ isOpen, onClose, onSuccess, businessId, groupId, groupName, nextOrder, voting }: VotingFormModalProps) {
  const [draft, setDraft] = useState<VotingDraft>(emptyVotingDraft);
  const [editing, setEditing] = useState<Voting | null>(null);
  const [existingOptions, setExistingOptions] = useState<VotingOption[]>([]);
  const [errors, setErrors] = useState<VotingDraftErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadExisting = useCallback(
    async (target: Voting) => {
      const token = TokenStorage.getBusinessToken();
      if (!token) return;
      setLoadingOptions(true);
      try {
        const res = await getVotingOptionsAction({ token, businessId, groupId, votingId: target.id });
        const options = (res.success && res.data ? res.data : []).sort((a, b) => a.displayOrder - b.displayOrder);
        setExistingOptions(options);
        setDraft(draftFromVoting(target, options));
      } finally {
        setLoadingOptions(false);
      }
    },
    [businessId, groupId]
  );

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSubmitError(null);
    setEditing(voting ?? null);
    if (voting) {
      setDraft(draftFromVoting(voting, []));
      loadExisting(voting);
    } else {
      setExistingOptions([]);
      setDraft(emptyVotingDraft());
    }
  }, [isOpen, voting, loadExisting]);

  const patch = (changes: Partial<VotingDraft>) => setDraft((d) => ({ ...d, ...changes }));
  const patchOption = (key: string, changes: Partial<OptionDraft>) =>
    setDraft((d) => ({ ...d, options: d.options.map((o) => (o.key === key ? { ...o, ...changes } : o)) }));

  const toggleAbstention = (allow: boolean) => {
    setDraft((d) => {
      const hasAbstain = d.options.some((o) => getOptionKind(o.text, o.code) === 'abstain');
      let options = d.options;
      // Ajusta la opción de abstención nueva (las existentes se dejan para que el admin decida).
      if (allow && !hasAbstain) options = [...options, makeOptionDraft('Abstención', options.length)];
      if (!allow) options = options.filter((o) => o.id != null || getOptionKind(o.text, o.code) !== 'abstain');
      return { ...d, allowAbstention: allow, options };
    });
  };

  const addOption = () => setDraft((d) => ({ ...d, options: [...d.options, { ...makeOptionDraft('', d.options.length), code: '' }] }));
  const removeOption = (key: string) => setDraft((d) => ({ ...d, options: d.options.filter((o) => o.key !== key) }));

  const order = editing?.displayOrder ?? nextOrder;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const found = validateVotingDraft(draft);
    setErrors(found);
    if (hasDraftErrors(found)) return;

    const token = TokenStorage.getBusinessToken();
    if (!token) return setSubmitError('No se encontró el token de autenticación');

    setSaving(true);
    let target = editing;
    try {
      const base = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        votingType: draft.votingType,
        isSecret: draft.isSecret,
        allowAbstention: draft.allowAbstention,
        requiredPercentage: Number(draft.requiredPercentage.replace(',', '.')),
      };

      if (target) {
        const res = await updateVotingAction({ token, businessId, groupId, votingId: target.id, data: base });
        if (!res.success) throw new Error(res.error || 'No se pudo actualizar la votación');
      } else {
        const res = await createVotingAction({
          token,
          businessId,
          groupId,
          data: { ...base, votingGroupId: groupId, displayOrder: nextOrder },
        });
        if (!res.success || !res.data) throw new Error(res.error || 'No se pudo crear la votación');
        target = res.data;
        setEditing(res.data);
        // El back crea la votación abierta; en el flujo queda "Lista" hasta que el admin la inicie.
        if (res.data.isActive) {
          const closed = await deactivateVotingAction({ token, businessId, groupId, votingId: res.data.id });
          if (closed.success) target = { ...res.data, isActive: false };
        }
      }

      const plan = planOptionChanges(existingOptions, draft.options);
      for (const id of plan.remove) {
        const res = await deleteVotingOptionAction({ token, businessId, groupId, votingId: target.id, optionId: id });
        if (!res.success) throw new Error(res.error || 'No se pudo quitar una opción');
      }
      for (const change of plan.toggle) {
        const res = await updateVotingOptionStatusAction({
          token,
          businessId,
          groupId,
          votingId: target.id,
          optionId: change.id,
          isActive: change.isActive,
        });
        if (!res.success) throw new Error(res.error || 'No se pudo cambiar el estado de una opción');
      }
      for (const option of plan.create) {
        const res = await createVotingOptionAction({
          token,
          businessId,
          groupId,
          votingId: target.id,
          data: {
            votingId: target.id,
            optionText: option.text.trim(),
            optionCode: option.code.trim().toUpperCase(),
            displayOrder: option.displayOrder,
            color: option.color,
          },
        });
        if (!res.success) throw new Error(`La opción "${option.text.trim()}" no se guardó: ${res.error || 'error del servidor'}`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo guardar la votación');
      // Si la votación ya existe, recargar sus opciones para reintentar solo lo que falta.
      if (target) {
        onSuccess();
        await loadExisting(target);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog
      open={isOpen}
      onClose={onClose}
      busy={saving}
      eyebrow={`${groupName} · Votación ${formatOrder(order)}`}
      title={editing ? 'Editar votación' : 'Nueva votación'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <div>
          <label htmlFor="vf-title" className={vtLabel}>Título</label>
          <input
            id="vf-title"
            className={vtInput}
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Reglamento de parqueaderos"
            maxLength={200}
            disabled={saving}
            aria-invalid={!!errors.title}
          />
          {errors.title && <FieldError>{errors.title}</FieldError>}
        </div>
        <div>
          <label htmlFor="vf-description" className={vtLabel}>Descripción</label>
          <textarea
            id="vf-description"
            className={vtTextarea}
            rows={2}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Lo que verán los residentes al votar…"
            maxLength={2000}
            disabled={saving}
            aria-invalid={!!errors.description}
          />
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
          <div>
            <span id="vf-type-label" className={vtLabel}>Tipo</span>
            <div
              role="radiogroup"
              aria-labelledby="vf-type-label"
              className="h-10 max-md:h-11 rounded-[7px] grid grid-cols-3 gap-[3px] p-[3px] text-[13px] max-md:text-sm"
              style={{ border: `1px solid ${VT.borderStrong}` }}
            >
              {VOTING_TYPE_OPTIONS.map((type) => {
                const selected = draft.votingType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={saving}
                    onClick={() => patch({ votingType: type.value })}
                    className="rounded-[5px] flex items-center justify-center transition-colors"
                    style={selected ? { background: VT.ink, color: '#fff', fontWeight: 600 } : { color: VT.inkSoft }}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label htmlFor="vf-required" className={vtLabel}>% requerido</label>
            <div className="relative">
              <input
                id="vf-required"
                type="number"
                min={1}
                max={100}
                step="0.01"
                className={`${vtInput} ${vtMono} text-center font-semibold pr-6`}
                value={draft.requiredPercentage}
                onChange={(e) => patch({ requiredPercentage: e.target.value })}
                disabled={saving}
                aria-invalid={!!errors.requiredPercentage}
              />
              <span className={`${vtMono} absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none`}>%</span>
            </div>
          </div>
        </div>
        {errors.requiredPercentage && <FieldError>{errors.requiredPercentage}</FieldError>}

        <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-[13px]">
          <label className="flex items-center gap-2 cursor-pointer max-md:min-h-11">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#1a1a1a]"
              checked={draft.allowAbstention}
              onChange={(e) => toggleAbstention(e.target.checked)}
              disabled={saving}
            />
            Permitir abstención
          </label>
          <label className="flex items-center gap-2 cursor-pointer max-md:min-h-11">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#1a1a1a]"
              checked={draft.isSecret}
              onChange={(e) => patch({ isSecret: e.target.checked })}
              disabled={saving}
            />
            Votación secreta
          </label>
        </div>

        {/* Opciones */}
        <fieldset className="rounded-lg overflow-hidden" style={{ border: `1px solid ${VT.border}` }}>
          <legend className="sr-only">Opciones</legend>
          <div
            className="px-3.5 py-2.5 flex justify-between items-center text-xs font-semibold"
            style={{ background: '#faf9f7', borderBottom: `1px solid ${VT.border}` }}
            aria-hidden="true"
          >
            <span>
              Opciones <span className="font-normal" style={{ color: VT.muted }}>· texto, código y color</span>
            </span>
            {loadingOptions && <span className="font-normal" style={{ color: VT.muted }}>Cargando…</span>}
          </div>
          {draft.options.map((option, index) => {
            const rowError = errors.optionRows?.[option.key];
            const name = option.text.trim() || `opción ${index + 1}`;
            const existing = option.id != null;
            return (
              <div key={option.key} style={{ borderBottom: `1px solid #efedea` }}>
                <div className="grid grid-cols-[24px_minmax(0,1fr)_64px_auto] md:grid-cols-[28px_1fr_80px_auto] gap-2 md:gap-2.5 items-center px-3 md:px-3.5 py-2 text-[13px]">
                  {existing ? (
                    <span className="w-5 h-5 rounded-[5px]" style={{ background: option.color }} aria-hidden="true" />
                  ) : (
                    <input
                      type="color"
                      value={option.color}
                      onChange={(e) => patchOption(option.key, { color: e.target.value })}
                      className="w-6 h-6 rounded-[5px] cursor-pointer border-0 p-0 bg-transparent"
                      aria-label={`Color de ${name}`}
                      disabled={saving}
                    />
                  )}
                  {existing ? (
                    <span className="truncate" style={{ opacity: option.isActive === false ? 0.5 : 1 }}>{option.text}</span>
                  ) : (
                    <input
                      className="h-8 max-md:h-10 max-md:text-base min-w-0 rounded-md px-2 text-[13px] outline-none border border-transparent focus:border-[#d6d3cd] bg-transparent"
                      value={option.text}
                      onChange={(e) => {
                        const text = e.target.value;
                        const autoCode = !option.code || option.code === suggestOptionCode(option.text);
                        patchOption(option.key, { text, ...(autoCode ? { code: suggestOptionCode(text) } : {}) });
                      }}
                      placeholder="Texto de la opción"
                      aria-label={`Texto de la opción ${index + 1}`}
                      maxLength={100}
                      disabled={saving}
                    />
                  )}
                  {existing ? (
                    <span className={`${vtMono} text-xs font-medium`} style={{ color: VT.muted }}>{option.code}</span>
                  ) : (
                    <input
                      className={`${vtMono} h-8 max-md:h-10 max-md:text-base min-w-0 rounded-md px-2 text-xs font-medium uppercase outline-none border border-transparent focus:border-[#d6d3cd] bg-transparent`}
                      style={{ color: VT.muted }}
                      value={option.code}
                      onChange={(e) => patchOption(option.key, { code: e.target.value.toUpperCase() })}
                      placeholder="CÓDIGO"
                      aria-label={`Código de la opción ${index + 1}`}
                      maxLength={20}
                      disabled={saving}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    {existing && (
                      <VtSwitch
                        checked={option.isActive !== false}
                        onChange={(next) => patchOption(option.key, { isActive: next })}
                        label={`Opción ${option.text} activa`}
                        disabled={saving}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeOption(option.key)}
                      className="flex w-7 h-7 max-md:w-10 max-md:h-10 items-center justify-center rounded hover:bg-[#f5f5f4]"
                      style={{ color: '#b0ada8' }}
                      aria-label={`Quitar opción ${name}`}
                      disabled={saving}
                    >
                      <VtIcon name="close" size={14} />
                    </button>
                  </div>
                </div>
                {rowError && <div className="px-3.5 pb-2 -mt-1"><FieldError>{rowError}</FieldError></div>}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addOption}
            disabled={saving}
            className="w-full grid grid-cols-[28px_1fr] gap-2.5 items-center px-3.5 py-2.5 max-md:py-3.5 text-[13px] text-left hover:bg-[#faf9f7]"
            style={{ color: VT.muted }}
          >
            <span className="w-5 h-5 rounded-[5px]" style={{ border: `1px dashed ${VT.pendingBorder}` }} aria-hidden="true" />
            + Agregar opción
          </button>
        </fieldset>
        {errors.options && !errors.optionRows && <FieldError>{errors.options}</FieldError>}
        {draft.options.length === 0 && (
          <p className="text-xs -mt-1.5" style={{ color: VT.muted }}>
            Sin opciones la votación queda como borrador y no se puede iniciar.
          </p>
        )}

        {submitError && <VtNotice>{submitError}</VtNotice>}

        <div className={`${vtDialogFooter} mt-1`} style={{ borderTop: `1px solid ${VT.border}` }}>
          <button type="button" className={vtBtn.ghost} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className={vtBtn.primary} disabled={saving || loadingOptions}>
            {saving ? 'Guardando…' : 'Guardar votación'}
          </button>
        </div>
      </form>
    </VtDialog>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs mt-1" style={{ color: VT.live }}>
      {children}
    </p>
  );
}
