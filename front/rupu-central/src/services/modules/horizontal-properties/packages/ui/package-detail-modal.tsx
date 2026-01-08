'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Badge, Spinner } from '@shared/ui';
import { getPackageByIdAction } from '../infrastructure/actions';
import { Package } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { QrCodeIcon, TruckIcon, HomeIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: number;
  businessId: number;
}

export function PackageDetailModal({ isOpen, onClose, packageId, businessId }: PackageDetailModalProps) {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const loadPackage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getBusinessToken();
      const data = await getPackageByIdAction({
        businessId,
        packageId,
        token,
      });
      setPkg(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando detalles del paquete';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [businessId, packageId, getBusinessToken]);

  useEffect(() => {
    if (isOpen && packageId) {
      loadPackage();
    }
  }, [isOpen, packageId, loadPackage]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO');
  };

  const getStatusColor = (statusCode?: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (statusCode) {
      case 'delivered': return 'success';
      case 'received':
      case 'in_storage': return 'info';
      case 'notified': return 'warning';
      case 'returned':
      case 'lost': return 'danger';
      default: return 'info';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Paquete" size="lg">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : pkg ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Badge color={getStatusColor(pkg.statusCode)} size="lg">
                {pkg.statusName || 'Sin estado'}
              </Badge>
              <span className="text-gray-500">#{pkg.id}</span>
            </div>
            {pkg.qrCode && (
              <div className="flex items-center gap-2">
                <QrCodeIcon className="h-5 w-5 text-gray-400" />
                <span className="font-mono text-sm">{pkg.qrCode}</span>
              </div>
            )}
          </div>

          {/* Informacion del paquete */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TruckIcon className="h-5 w-5" />
                Informacion del Envio
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Transportadora</p>
                  <p className="font-medium text-gray-900">{pkg.carrier || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Numero de Tracking</p>
                  <p className="font-mono font-medium text-gray-900">{pkg.trackingNumber || '-'}</p>
                </div>
                {pkg.description && (
                  <div>
                    <p className="text-sm text-gray-500">Descripcion</p>
                    <p className="font-medium text-gray-900">{pkg.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                Destino
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Unidad</p>
                  <p className="font-medium text-gray-900">{pkg.propertyUnitNumber || `#${pkg.propertyUnitId}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Residente</p>
                  <p className="font-medium text-gray-900">{pkg.residentName || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Historial
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Recibido</p>
                  <p className="font-medium text-gray-900">{formatDate(pkg.receivedAt)}</p>
                </div>
                {pkg.receivedByUserId && (
                  <span className="text-sm text-gray-500">Por usuario #{pkg.receivedByUserId}</span>
                )}
              </div>
              {pkg.deliveredAt && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Entregado</p>
                    <p className="font-medium text-gray-900">{formatDate(pkg.deliveredAt)}</p>
                  </div>
                  {pkg.deliveredByUserId && (
                    <span className="text-sm text-gray-500">Por usuario #{pkg.deliveredByUserId}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {pkg.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Notas</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{pkg.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-400 flex justify-between pt-4 border-t border-gray-200">
            <span>Creado: {formatDate(pkg.createdAt)}</span>
            <span>Actualizado: {formatDate(pkg.updatedAt)}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
