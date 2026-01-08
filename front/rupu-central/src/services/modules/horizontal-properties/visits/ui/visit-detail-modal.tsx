'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Badge, Spinner, Button } from '@shared/ui';
import { getVisitByIdAction } from '../infrastructure/actions';
import { Visit } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { RegisterAssetsModal } from './register-assets-modal';
import { CompanionsModal } from './companions-modal';
import { CubeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface VisitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitId: number;
  businessId: number;
}

export function VisitDetailModal({ isOpen, onClose, visitId, businessId }: VisitDetailModalProps) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isCompanionsModalOpen, setIsCompanionsModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && visitId) {
      loadVisit();
    }
  }, [isOpen, visitId]);

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

  const loadVisit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getBusinessToken();
      const data = await getVisitByIdAction({
        businessId,
        visitId,
        token,
      });
      setVisit(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando detalles de la visita');
    } finally {
      setLoading(false);
    }
  }, [businessId, visitId, getBusinessToken]);

  const handleAssetsSuccess = useCallback(() => {
    setIsAssetsModalOpen(false);
    loadVisit(); // Recargar la visita para actualizar los datos
  }, [loadVisit]);

  const handleCompanionsSuccess = useCallback(() => {
    setIsCompanionsModalOpen(false);
    loadVisit(); // Recargar la visita para actualizar los datos
  }, [loadVisit]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO');
  };

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO');
  };

  const getStatusColor = (statusId: number): 'success' | 'warning' | 'danger' | 'info' => {
    // Status IDs: 1=pending, 2=authorized, 3=in_progress, 4=completed, 5=cancelled, 6=expired, 7=rejected
    switch (statusId) {
      case 4: return 'success'; // completed
      case 2: return 'success'; // authorized
      case 3: return 'info';    // in_progress
      case 1: return 'warning'; // pending
      case 5:
      case 6:
      case 7: return 'danger';  // cancelled, expired, rejected
      default: return 'info';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Visita" size="2xl" className="!max-w-6xl !w-[95vw]">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : visit ? (
        <div className="space-y-6">
          {/* Header - Estado y QR */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div>
              <Badge color={getStatusColor(visit.visitStatusId)} size="lg">
                ID: #{visit.id}
              </Badge>
            </div>
            {visit.qrCode && (
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Código QR</p>
                <p className="font-mono text-sm font-medium text-gray-900">{visit.qrCode}</p>
              </div>
            )}
          </div>

          {/* Contenido principal en dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Informacion del visitante */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Visitante</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Visitante</p>
                    <p className="font-medium text-gray-900">{visit.visitorId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Unidad</p>
                    <p className="font-medium text-gray-900">#{visit.propertyUnitId}</p>
                  </div>
                </div>
              </div>

              {/* Fechas programadas */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Programación</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha</p>
                    <p className="font-medium text-gray-900">{formatDateOnly(visit.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hora Inicio</p>
                    <p className="font-medium text-gray-900">{visit.scheduledStartTime ? new Date(visit.scheduledStartTime).toLocaleTimeString('es-CO') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hora Fin</p>
                    <p className="font-medium text-gray-900">{visit.scheduledEndTime ? new Date(visit.scheduledEndTime).toLocaleTimeString('es-CO') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Número de Visitantes</p>
                    <p className="font-medium text-gray-900">{visit.numberOfVisitors}</p>
                  </div>
                </div>
              </div>

              {/* Proposito y notas */}
              {(visit.purpose || visit.notes) && (
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">Información Adicional</h3>
                  <div className="space-y-3">
                    {visit.purpose && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Propósito</p>
                        <p className="font-medium text-gray-900">{visit.purpose}</p>
                      </div>
                    )}
                    {visit.notes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Notas</p>
                        <p className="font-medium text-gray-900 whitespace-pre-wrap">{visit.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              {/* Tiempos reales */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Registro Real</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Entrada</p>
                    <p className="font-medium text-gray-900">{formatDate(visit.actualEntryTime)}</p>
                    {visit.entryGate && <p className="text-xs text-gray-500 mt-1">Puerta: {visit.entryGate}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Salida</p>
                    <p className="font-medium text-gray-900">{formatDate(visit.actualExitTime)}</p>
                    {visit.exitGate && <p className="text-xs text-gray-500 mt-1">Puerta: {visit.exitGate}</p>}
                  </div>
                  {visit.durationMinutes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duración</p>
                      <p className="font-medium text-gray-900">{visit.durationMinutes} minutos</p>
                    </div>
                  )}
                  {visit.entryMethod && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Método de Entrada</p>
                      <p className="font-medium text-gray-900">{visit.entryMethod}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Autorizacion */}
              {visit.authorizationCode && (
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">Autorización</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Código</p>
                      <p className="font-mono font-medium text-gray-900">{visit.authorizationCode}</p>
                    </div>
                    {visit.authorizationDate && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Fecha</p>
                        <p className="font-medium text-gray-900">{formatDate(visit.authorizationDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Flags */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Estado</h3>
                <div className="flex flex-wrap gap-2">
                  {visit.hasCompanions && <Badge color="info">Con acompañantes</Badge>}
                  {visit.hasAssets && <Badge color="warning">Con equipos/activos</Badge>}
                  {visit.notifyResident && <Badge color="success">Notificar residente</Badge>}
                  {visit.notifySecurity && <Badge color="success">Notificar seguridad</Badge>}
                  {visit.durationExceeded && <Badge color="danger">Duración excedida</Badge>}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones - Gestión de acompañantes y activos */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsCompanionsModalOpen(true)}
              className="flex-1"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Gestionar Acompañantes
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAssetsModalOpen(true)}
              className="flex-1"
            >
              <CubeIcon className="h-4 w-4 mr-2" />
              Gestionar Activos
            </Button>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-400 flex justify-between pt-4 border-t border-gray-200">
            <span>Creado: {formatDate(visit.createdAt)}</span>
            <span>Actualizado: {formatDate(visit.updatedAt)}</span>
          </div>
        </div>
      ) : null}

      {/* Modal de gestión de activos */}
      <RegisterAssetsModal
        isOpen={isAssetsModalOpen}
        onClose={() => setIsAssetsModalOpen(false)}
        onSuccess={handleAssetsSuccess}
        visitId={visitId}
        businessId={businessId}
      />

      {/* Modal de gestión de acompañantes */}
      <CompanionsModal
        isOpen={isCompanionsModalOpen}
        onClose={() => setIsCompanionsModalOpen(false)}
        onSuccess={handleCompanionsSuccess}
        visitId={visitId}
        businessId={businessId}
      />
    </Modal>
  );
}
