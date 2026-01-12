'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Alert, Select } from '@shared/ui';
import { createParkingSlotAction } from '../infrastructure/actions/create-parking-slot.action';
import { getParkingTypesAction } from '../infrastructure/actions/get-parking-types.action';
import { getParkingZonesAction } from '../infrastructure/actions/get-parking-zones.action';
import { CreateParkingSlotDTO, ParkingType, ParkingZoneListDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface CreateParkingSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  defaultZoneId?: number;
}

export function CreateParkingSlotModal({
  isOpen,
  onClose,
  onSuccess,
  businessId,
  defaultZoneId,
}: CreateParkingSlotModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parkingTypes, setParkingTypes] = useState<ParkingType[]>([]);
  const [parkingZones, setParkingZones] = useState<ParkingZoneListDTO[]>([]);

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

  const [formData, setFormData] = useState<CreateParkingSlotDTO>({
    parkingZoneId: defaultZoneId || 0,
    parkingTypeId: 0,
    slotNumber: '',
    isCovered: false,
    hasCharger: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultZoneId) {
      setFormData((prev) => ({ ...prev, parkingZoneId: defaultZoneId }));
    }
  }, [defaultZoneId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const token = await getBusinessToken();
      const [types, zones] = await Promise.all([
        getParkingTypesAction(token),
        getParkingZonesAction({ businessId, token, isActive: true }),
      ]);
      setParkingTypes(types);
      setParkingZones(zones.data);

      // Set defaults
      if (types.length > 0 && !formData.parkingTypeId) {
        setFormData((prev) => ({ ...prev, parkingTypeId: types[0].id }));
      }
      if (zones.data.length > 0 && !formData.parkingZoneId) {
        setFormData((prev) => ({ ...prev, parkingZoneId: zones.data[0].id }));
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.parkingZoneId || !formData.parkingTypeId || !formData.slotNumber) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      await createParkingSlotAction(token, {
        parkingZoneId: formData.parkingZoneId,
        parkingTypeId: formData.parkingTypeId,
        slotNumber: formData.slotNumber,
        isCovered: formData.isCovered || false,
        hasCharger: formData.hasCharger || false,
        width: formData.width,
        length: formData.length,
        height: formData.height,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear espacio de parqueo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      parkingZoneId: defaultZoneId || 0,
      parkingTypeId: parkingTypes.length > 0 ? parkingTypes[0].id : 0,
      slotNumber: '',
      isCovered: false,
      hasCharger: false,
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Espacio de Parqueo">
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
              label="Zona de Parqueo *"
              value={formData.parkingZoneId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, parkingZoneId: parseInt(e.target.value) })}
              options={[
                { value: '', label: 'Seleccione una zona' },
                ...parkingZones.map((zone) => ({
                  value: zone.id.toString(),
                  label: zone.name,
                })),
              ]}
              required
            />

            <Select
              label="Tipo de Parqueadero *"
              value={formData.parkingTypeId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, parkingTypeId: parseInt(e.target.value) })}
              options={[
                { value: '', label: 'Seleccione un tipo' },
                ...parkingTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.name,
                })),
              ]}
              required
            />

            <Input
              label="Numero de Espacio *"
              value={formData.slotNumber}
              onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
              placeholder="Ej: A-001"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCovered || false}
                  onChange={(e) => setFormData({ ...formData, isCovered: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Cubierto</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasCharger || false}
                  onChange={(e) => setFormData({ ...formData, hasCharger: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tiene Cargador</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Ancho (m)"
                type="number"
                step="0.1"
                value={formData.width?.toString() || ''}
                onChange={(e) =>
                  setFormData({ ...formData, width: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                placeholder="2.5"
              />

              <Input
                label="Largo (m)"
                type="number"
                step="0.1"
                value={formData.length?.toString() || ''}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                placeholder="5.0"
              />

              <Input
                label="Alto (m)"
                type="number"
                step="0.1"
                value={formData.height?.toString() || ''}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                placeholder="2.2"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingData} className="flex-1">
            {loading ? 'Creando...' : 'Crear Espacio'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
