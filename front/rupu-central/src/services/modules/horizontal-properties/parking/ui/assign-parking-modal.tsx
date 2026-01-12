'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Alert, Select } from '@shared/ui';
import { assignParkingAction } from '../infrastructure/actions/assign-parking.action';
import { getParkingSlotsAction } from '../infrastructure/actions/get-parking-slots.action';
import { AssignParkingDTO, ParkingSlotListDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface AssignParkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  defaultSlotId?: number;
}

export function AssignParkingModal({
  isOpen,
  onClose,
  onSuccess,
  businessId,
  defaultSlotId,
}: AssignParkingModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlotListDTO[]>([]);

  const getBusinessToken = useCallback(async (): Promise<string> => {
    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin || false;
    
    // Super admin siempre usa business_id = 0 en el token
    const tokenBusinessId = isSuperAdmin ? 0 : businessId;
    
    const activeBusiness = TokenStorage.getActiveBusiness();
    
    if (activeBusiness === tokenBusinessId) {
      const businessToken = TokenStorage.getBusinessToken();
      if (businessToken) {
        return businessToken;
      }
    }

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    const result = await generateBusinessTokenAction({
      business_id: tokenBusinessId,
      session_token: sessionToken,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar business token');
    }

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(tokenBusinessId);
    return result.data.token;
  }, [businessId]);

  const [formData, setFormData] = useState<AssignParkingDTO>({
    parkingSlotId: defaultSlotId || 0,
    vehiclePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultSlotId) {
      setFormData((prev) => ({ ...prev, parkingSlotId: defaultSlotId }));
    }
  }, [defaultSlotId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const token = await getBusinessToken();
      const slots = await getParkingSlotsAction({
        businessId,
        token,
        isActive: true,
        isAvailable: true,
      });
      setAvailableSlots(slots.data);

      if (slots.data.length > 0 && !formData.parkingSlotId) {
        setFormData((prev) => ({ ...prev, parkingSlotId: slots.data[0].id }));
      }
    } catch (err) {
      setError('Error al cargar espacios disponibles');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.parkingSlotId || !formData.vehiclePlate || !formData.startDate) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      await assignParkingAction(businessId, token, {
        parkingSlotId: formData.parkingSlotId,
        propertyUnitId: formData.propertyUnitId,
        residentId: formData.residentId,
        vehiclePlate: formData.vehiclePlate.toUpperCase(),
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        vehicleColor: formData.vehicleColor,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar parqueadero');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      parkingSlotId: defaultSlotId || 0,
      vehiclePlate: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleColor: '',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Asignacion de Parqueadero">
      <div className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loadingData ? (
          <div className="text-center py-4">Cargando datos...</div>
        ) : (
          <>
            <Select
              label="Espacio de Parqueo *"
              value={formData.parkingSlotId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, parkingSlotId: parseInt(e.target.value) })}
              options={[
                { value: '', label: 'Seleccione un espacio' },
                ...availableSlots.map((slot) => ({
                  value: slot.id.toString(),
                  label: `${slot.slotNumber} - ${slot.parkingZoneName} (${slot.parkingTypeName})`,
                })),
              ]}
              required
            />

            <Input
              label="Placa del Vehiculo *"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
              placeholder="Ej: ABC123"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Marca"
                value={formData.vehicleBrand || ''}
                onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                placeholder="Ej: Toyota"
              />

              <Input
                label="Modelo"
                value={formData.vehicleModel || ''}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="Ej: Corolla"
              />
            </div>

            <Input
              label="Color"
              value={formData.vehicleColor || ''}
              onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
              placeholder="Ej: Blanco"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha Inicio *"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />

              <Input
                label="Fecha Fin"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
                placeholder="Dejar vacio para permanente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingData} className="flex-1">
            {loading ? 'Asignando...' : 'Asignar Parqueadero'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
