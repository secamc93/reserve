'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Alert, Badge, Spinner } from '@shared/ui';
import { getCompanionsAction, createCompanionAction, deleteCompanionAction } from '../infrastructure/actions';
import { VisitCompanion, CreateVisitCompanionDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { PlusIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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

  const getBusinessToken = useCallback(async (): Promise<string> => {
    let businessToken = TokenStorage.getBusinessToken();
    if (businessToken) return businessToken;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin;
    const business_id = isSuperAdmin ? 0 : businessId;

    const result = await generateBusinessTokenAction({
      business_id,
      session_token: sessionToken,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar business token');
    }

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(business_id);
    return result.data.token;
  }, [businessId]);

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
    if (!confirm('¿Está seguro de eliminar este acompañante?')) return;

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Acompañantes de la Visita" size="lg">
      <div className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Lista de acompañantes */}
            {companions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No hay acompañantes registrados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {companions.map((companion) => (
                  <div
                    key={companion.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{companion.companionName}</span>
                        {companion.isMinor && (
                          <Badge type="warning">Menor</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        DNI: {companion.companionDni}
                        {companion.companionPhone && ` | Tel: ${companion.companionPhone}`}
                        {companion.relationship && ` | ${companion.relationship}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCompanion(companion.id)}
                      disabled={saving}
                      title="Eliminar acompañante"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar */}
            {showForm ? (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
                <h4 className="font-medium text-blue-800">Nuevo Acompañante</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nombre completo *"
                    value={formData.companionName}
                    onChange={(e) => setFormData({ ...formData, companionName: e.target.value })}
                    placeholder="Nombre del acompañante"
                  />
                  <Input
                    label="DNI / Documento *"
                    value={formData.companionDni}
                    onChange={(e) => setFormData({ ...formData, companionDni: e.target.value })}
                    placeholder="Número de documento"
                  />
                  <Input
                    label="Teléfono"
                    value={formData.companionPhone}
                    onChange={(e) => setFormData({ ...formData, companionPhone: e.target.value })}
                    placeholder="Teléfono de contacto"
                  />
                  <Input
                    label="Relación"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Ej: Familiar, Asistente"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isMinor"
                    checked={formData.isMinor}
                    onChange={(e) => setFormData({ ...formData, isMinor: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isMinor" className="text-sm text-gray-700">
                    Es menor de edad
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ ...emptyCompanion });
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCompanion} disabled={saving}>
                    {saving ? 'Guardando...' : 'Agregar'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Acompañante
              </Button>
            )}
          </>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
