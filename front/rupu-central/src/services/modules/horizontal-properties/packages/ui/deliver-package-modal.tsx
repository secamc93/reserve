'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Alert } from '@shared/ui';
import { deliverPackageAction } from '../infrastructure/actions';
import { DeliverPackageDTO, PackageListDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface DeliverPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  packageId: number;
  packageInfo: PackageListDTO;
}

export function DeliverPackageModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  businessId, 
  packageId,
  packageInfo 
}: DeliverPackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const token = await getBusinessToken();
      
      const data: DeliverPackageDTO = {
        notes: notes || undefined,
      };

      await deliverPackageAction({
        businessId,
        packageId,
        data,
        token,
      });

      setNotes('');
      onSuccess();
    } catch (err: any) {
      console.error('Error entregando paquete:', err);
      setError(err?.message || 'Error al entregar el paquete. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entregar Paquete"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-700">Tracking:</span>
            <span className="ml-2 text-sm text-gray-900">{packageInfo.trackingNumber}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Empresa:</span>
            <span className="ml-2 text-sm text-gray-900">{packageInfo.carrier}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Unidad:</span>
            <span className="ml-2 text-sm text-gray-900">{packageInfo.propertyUnitNumber}</span>
          </div>
          {packageInfo.residentName && (
            <div>
              <span className="text-sm font-medium text-gray-700">Residente:</span>
              <span className="ml-2 text-sm text-gray-900">{packageInfo.residentName}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notas adicionales sobre la entrega"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Entregando...' : 'Confirmar Entrega'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
