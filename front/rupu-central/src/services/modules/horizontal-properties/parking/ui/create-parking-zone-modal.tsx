'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Input, Alert } from '@shared/ui';
import { createParkingZoneAction } from '../infrastructure/actions/create-parking-zone.action';
import { CreateParkingZoneDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface CreateParkingZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

export function CreateParkingZoneModal({ isOpen, onClose, onSuccess, businessId }: CreateParkingZoneModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateParkingZoneDTO>({
    name: '',
    code: '',
    description: '',
    location: '',
  });

  const getBusinessToken = useCallback(async (): Promise<string> => {
    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin || false;
    
    // Super admin siempre usa business_id = 0 en el token
    const tokenBusinessId = isSuperAdmin ? 0 : businessId;
    
    const activeBusiness = TokenStorage.getActiveBusiness();
    
    // Si el business activo coincide, intentar usar el token existente
    if (activeBusiness === tokenBusinessId) {
      const businessToken = TokenStorage.getBusinessToken();
      if (businessToken) {
        return businessToken;
      }
    }

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    // Super admin siempre genera token con business_id = 0
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      await createParkingZoneAction(businessId, token, formData);

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear zona de parqueo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      location: '',
    });
    setError(null);
    onClose();
  };

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 20);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Zona de Parqueo">
      <div className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Input
          label="Nombre *"
          value={formData.name}
          onChange={(e) => {
            const name = e.target.value;
            setFormData({
              ...formData,
              name,
              code: formData.code || generateCode(name),
            });
          }}
          placeholder="Ej: Zona de Visitantes"
          required
        />

        <Input
          label="Codigo *"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="Ej: ZONA_VISITANTES"
          required
        />

        <Input
          label="Ubicacion"
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Ej: Nivel -1, Bloque A"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripcion
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripcion de la zona de parqueo..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Zona'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
