'use client';

import { useState, useEffect, useCallback } from 'react';
import { VtDialog, VtNotice, VtBadge, VtIcon, vtBtn, vtInput, vtLabel, DS, dsMono } from '@/shared/ui/ds';
import { getCompanionsAction, createCompanionAction, deleteCompanionAction } from '../infrastructure/actions';
import { VisitCompanion, CreateVisitCompanionDTO } from '../domain';
import { useBusinessToken } from './use-business-token';

interface CompanionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitId: number;
  businessId: number;
  onSuccess?: () => void;
}

interface CompanionForm {
  companionName: string;
  companionDni: string;
  companionPhone: string;
  isMinor: boolean;
  relationship: string;
  notes: string;
}

const emptyCompanion: CompanionForm = {
  companionName: '',
  companionDni: '',
  companionPhone: '',
  isMinor: false,
  relationship: '',
  notes: '',
};

export function CompanionsModal({
  isOpen,
  onClose,
  visitId,
  businessId,
  onSuccess,
}: CompanionsModalProps) {
  const [companions, setCompanions] = useState<VisitCompanion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CompanionForm>({ ...emptyCompanion });

  const getBusinessToken = useBusinessToken(businessId);

  const loadCompanions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getBusinessToken();
      const data = await getCompanionsAction({
        businessId,
        visitId,
        token,
      });
      setCompanions(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando acompañantes');
    } finally {
      setLoading(false);
    }
  }, [businessId, visitId, getBusinessToken]);

  useEffect(() => {
    if (isOpen && visitId) {
      loadCompanions();
    }
  }, [isOpen, visitId, loadCompanions]);

  const handleAddCompanion = async () => {
    if (!formData.companionName.trim() || !formData.companionDni.trim()) {
      setError('Nombre y DNI son requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      const dto: CreateVisitCompanionDTO = {
        companionName: formData.companionName.trim(),
        companionDni: formData.companionDni.trim(),
        companionPhone: formData.companionPhone.trim() || undefined,
        isMinor: formData.isMinor,
        relationship: formData.relationship.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await createCompanionAction({
        businessId,
        visitId,
        data: dto,
        token,
      });

      setFormData({ ...emptyCompanion });
      setShowForm(false);
      loadCompanions();
      onSuccess?.(); // Notificar éxito si hay callback
    } catch (err: any) {
      setError(err.message || 'Error agregando acompañante');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompanion = async (companionId: number) => {
    if (!window.confirm('¿Quitar este acompañante?')) return;

    setSaving(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      await deleteCompanionAction({
        businessId,
        visitId,
        companionId,
        token,
      });
      loadCompanions();
      onSuccess?.(); // Notificar éxito si hay callback
    } catch (err: any) {
      setError(err.message || 'Error eliminando acompañante');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setFormData({ ...emptyCompanion });
    setError(null);
    onClose();
  };

  const field = (key: keyof Omit<CompanionForm, 'isMinor'>, label: string, required = false) => (
    <div>
      <label htmlFor={`companion-${key}`} className={vtLabel}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input id={`companion-${key}`} className={vtInput} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
    </div>
  );

  return (
    <VtDialog
      open={isOpen}
      onClose={handleClose}
      busy={saving}
      layer="over"
      eyebrow="Visita"
      title="Acompañantes"
      subtitle="Quienes entran con el visitante"
      footer={
        <button type="button" className={vtBtn.secondary} onClick={handleClose} disabled={saving}>
          Cerrar
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {error && <VtNotice tone="error">{error}</VtNotice>}
        {loading ? (
          <div className="py-6 text-center text-[13px] text-[#8a8580]">Cargando…</div>
        ) : (
          <>
            {companions.length === 0 ? (
              <div className="py-4 text-center text-[13px] text-[#8a8580]">Sin acompañantes registrados</div>
            ) : (
              <ul className="m-0 p-0 list-none flex flex-col divide-y divide-[#efedea] border border-[#e4e2dd] rounded-lg max-h-64 overflow-y-auto">
                {companions.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-3.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[13px] font-semibold">
                        {c.companionName}
                        {c.isMinor && <VtBadge label="Menor" bg={DS.missingBg} fg={DS.missingFg} size="xs" />}
                      </div>
                      <div className={`${dsMono} text-[11px] text-[#8a8580]`}>
                        {c.companionDni}
                        {c.companionPhone && ` · ${c.companionPhone}`}
                        {c.relationship && ` · ${c.relationship}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={vtBtn.icon}
                      onClick={() => handleDeleteCompanion(c.id)}
                      disabled={saving}
                      aria-label={`Quitar a ${c.companionName}`}
                    >
                      <VtIcon name="trash" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showForm ? (
              <div className="rounded-lg border border-[#e4e2dd] p-3.5 flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {field('companionName', 'Nombre completo', true)}
                  {field('companionDni', 'Documento', true)}
                  {field('companionPhone', 'Teléfono')}
                  {field('relationship', 'Relación')}
                </div>
                <label className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={formData.isMinor} onChange={(e) => setFormData({ ...formData, isMinor: e.target.checked })} className="h-4 w-4 accent-[#1a1a1a]" />
                  Es menor de edad
                </label>
                <div className="flex justify-end gap-2 max-md:[&>*]:flex-1">
                  <button
                    type="button"
                    className={vtBtn.secondary}
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ ...emptyCompanion });
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button type="button" className={vtBtn.primary} onClick={handleAddCompanion} disabled={saving}>
                    {saving ? 'Guardando…' : 'Agregar'}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={vtBtn.secondary} onClick={() => setShowForm(true)}>
                + Agregar acompañante
              </button>
            )}
          </>
        )}
      </div>
    </VtDialog>
  );
}
