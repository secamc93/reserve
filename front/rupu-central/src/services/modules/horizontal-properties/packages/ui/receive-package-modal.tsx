'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Alert, Select } from '@shared/ui';
import { receivePackageAction } from '../infrastructure/actions';
import { CreatePackageDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { getPropertyUnitsAction } from '@/services/modules/horizontal-properties/units/infrastructure/actions';
import { PropertyUnit } from '@/services/modules/horizontal-properties/units/domain';
import { getResidentsAction } from '@/services/modules/horizontal-properties/residents/infrastructure/actions';
import { Resident } from '@/services/modules/horizontal-properties/residents/domain';
import { GetResidentsParams } from '@/services/modules/horizontal-properties/residents/domain/ports';

interface ReceivePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

export function ReceivePackageModal({ isOpen, onClose, onSuccess, businessId }: ReceivePackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyUnits, setPropertyUnits] = useState<PropertyUnit[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(undefined);
  
  const [formData, setFormData] = useState<CreatePackageDTO>({
    propertyUnitId: 0,
    residentId: undefined,
    carrier: '',
    trackingNumber: '',
    description: '',
    notes: '',
    notifyResident: true,
  });

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

  useEffect(() => {
    if (isOpen) {
      loadPropertyUnits();
      setFormData({
        propertyUnitId: 0,
        residentId: undefined,
        carrier: '',
        trackingNumber: '',
        description: '',
        notes: '',
        notifyResident: true,
      });
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUnitId) {
      loadResidents(selectedUnitId);
    } else {
      setResidents([]);
    }
  }, [selectedUnitId]);

  const loadPropertyUnits = async () => {
    try {
      const token = await getBusinessToken();
      const result = await getPropertyUnitsAction({
        businessId,
        token,
        page: 1,
        pageSize: 100,
      });
      setPropertyUnits(result.units || []);
    } catch (err) {
      console.error('Error cargando unidades:', err);
    }
  };

  const loadResidents = async (unitId: number) => {
    try {
      const token = await getBusinessToken();
      const params: GetResidentsParams = {
        businessId,
        token,
        propertyUnitId: unitId,
        page: 1,
        pageSize: 100,
      };
      const result = await getResidentsAction(params);
      setResidents(result.residents || []);
    } catch (err) {
      console.error('Error cargando residentes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyUnitId || !formData.carrier || !formData.trackingNumber) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      
      await receivePackageAction({
        businessId,
        data: formData,
        token,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error recibiendo paquete:', err);
      setError(err?.message || 'Error al recibir el paquete. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recibir Paquete"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad de Propiedad *
          </label>
          <Select
            value={formData.propertyUnitId.toString()}
            onChange={(e) => {
              const unitId = parseInt(e.target.value);
              setSelectedUnitId(unitId);
              setFormData({ ...formData, propertyUnitId: unitId, residentId: undefined });
            }}
            required
          >
            <option value="0">Seleccione una unidad</option>
            {propertyUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.number} {unit.block ? `- Bloque ${unit.block}` : ''}
              </option>
            ))}
          </Select>
        </div>

        {selectedUnitId && residents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Residente
            </label>
            <Select
              value={formData.residentId?.toString() || ''}
              onChange={(e) => {
                const residentId = e.target.value ? parseInt(e.target.value) : undefined;
                setFormData({ ...formData, residentId });
              }}
            >
              <option value="">Seleccione un residente (opcional)</option>
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.fullName}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa de Envío *
          </label>
          <Input
            type="text"
            value={formData.carrier}
            onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
            placeholder="Ej: DHL, FedEx, Servientrega"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tracking *
          </label>
          <Input
            type="text"
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            placeholder="Número de seguimiento"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del paquete"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Notas adicionales"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifyResident"
            checked={formData.notifyResident}
            onChange={(e) => setFormData({ ...formData, notifyResident: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="notifyResident" className="ml-2 block text-sm text-gray-700">
            Notificar al residente
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Recibiendo...' : 'Recibir Paquete'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
