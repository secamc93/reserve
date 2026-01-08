'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Alert, TableColumn, Button, Modal, Input, Select } from '@shared/ui';
import { getVisitsAction, registerEntryAction, registerExitAction, deleteVisitAction, getVisitTypesAction, getVisitStatusesAction } from '../infrastructure/actions';
import { VisitListDTO, VisitType, VisitStatus } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { CreateVisitModal } from './create-visit-modal';
import { VisitDetailModal } from './visit-detail-modal';
import { PlusIcon, EyeIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon, TrashIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface VisitsTableProps {
  businessId: number;
}

export function VisitsTable({ businessId }: VisitsTableProps) {
  const [visits, setVisits] = useState<VisitListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [processingVisitId, setProcessingVisitId] = useState<number | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<number | null>(null);
  const [isEntryConfirmOpen, setIsEntryConfirmOpen] = useState(false);
  const [visitToRegisterEntry, setVisitToRegisterEntry] = useState<VisitListDTO | null>(null);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [visitToRegisterExit, setVisitToRegisterExit] = useState<VisitListDTO | null>(null);
  
  // Filtros
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [visitStatuses, setVisitStatuses] = useState<VisitStatus[]>([]);
  const [filters, setFilters] = useState<{
    visitTypeId?: number;
    visitStatusId?: number;
    startDate?: string;
    endDate?: string;
  }>({});

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

  const loadVisits = useCallback(async () => {
    setLoading(true);
    setAlert(null);
    try {
      const token = await getBusinessToken();

      const data = await getVisitsAction({
        businessId,
        token,
        page: currentPage,
        pageSize: pageSize,
        visitTypeId: filters.visitTypeId,
        visitStatusId: filters.visitStatusId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      setVisits(data.visits);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);

      // Mostrar mensaje informativo si no hay datos
      if (data.visits.length === 0 && data.total === 0) {
        setAlert({ 
          type: 'info', 
          message: 'No hay visitas registradas. Puedes crear una nueva visita usando el botón "Nueva Visita".' 
        });
      }
    } catch (error: any) {
      console.error('Error al cargar visitas:', error);
      const errorMessage = error?.message || 'Error al cargar las visitas. Por favor, intenta nuevamente.';
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [businessId, currentPage, pageSize, filters, getBusinessToken]);

  // Cargar tipos y estados de visita
  useEffect(() => {
    if (businessId) {
      loadVisitTypesAndStatuses();
    }
  }, [businessId]);

  const loadVisitTypesAndStatuses = async () => {
    try {
      const token = await getBusinessToken();
      const [types, statuses] = await Promise.all([
        getVisitTypesAction({ token }),
        getVisitStatusesAction({ token }),
      ]);
      setVisitTypes(types.filter(t => t.isActive));
      setVisitStatuses(statuses.filter(s => s.isActive));
    } catch (error) {
      console.error('Error cargando tipos y estados:', error);
    }
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Resetear página cuando cambian los filtros
      setCurrentPage(1);
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const getStatusBadgeColor = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completada') || statusLower.includes('completed')) return 'success';
    if (statusLower.includes('curso') || statusLower.includes('in_progress')) return 'info';
    if (statusLower.includes('autorizada') || statusLower.includes('authorized')) return 'success';
    if (statusLower.includes('pendiente') || statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('rechazada') || statusLower.includes('rejected')) return 'danger';
    if (statusLower.includes('cancelada') || statusLower.includes('cancelled')) return 'danger';
    return 'info';
  };

  const handleVisitCreated = useCallback(() => {
    setIsCreateModalOpen(false);
    loadVisits(); // Recargar la lista
    setAlert({ type: 'success', message: 'Visita creada exitosamente' });
    setTimeout(() => setAlert(null), 5000);
  }, [loadVisits]);

  const handleRegisterEntryClick = useCallback((visit: VisitListDTO) => {
    setVisitToRegisterEntry(visit);
    setIsEntryConfirmOpen(true);
  }, []);

  const handleConfirmRegisterEntry = useCallback(async () => {
    if (!visitToRegisterEntry) return;

    setProcessingVisitId(visitToRegisterEntry.id);
    try {
      const token = await getBusinessToken();
      await registerEntryAction({ 
        businessId, 
        visitId: visitToRegisterEntry.id, 
        data: { gate: 'Principal', method: 'manual' },
        token 
      });
      setAlert({ type: 'success', message: 'Entrada registrada exitosamente' });
      setTimeout(() => setAlert(null), 5000);
      loadVisits();
      setIsEntryConfirmOpen(false);
      setVisitToRegisterEntry(null);
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al registrar la entrada';
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setProcessingVisitId(null);
    }
  }, [visitToRegisterEntry, businessId, getBusinessToken, loadVisits]);

  const handleRegisterExitClick = useCallback((visit: VisitListDTO) => {
    setVisitToRegisterExit(visit);
    setIsExitConfirmOpen(true);
  }, []);

  const handleConfirmRegisterExit = useCallback(async () => {
    if (!visitToRegisterExit) return;

    setProcessingVisitId(visitToRegisterExit.id);
    try {
      const token = await getBusinessToken();
      await registerExitAction({
        businessId,
        visitId: visitToRegisterExit.id,
        data: { gate: 'Principal' },
        token
      });
      setAlert({ type: 'success', message: 'Salida registrada exitosamente' });
      setTimeout(() => setAlert(null), 5000);
      loadVisits();
      setIsExitConfirmOpen(false);
      setVisitToRegisterExit(null);
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al registrar la salida';
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setProcessingVisitId(null);
    }
  }, [visitToRegisterExit, businessId, getBusinessToken, loadVisits]);

  const handleViewDetails = useCallback((visitId: number) => {
    setSelectedVisitId(visitId);
    setIsDetailModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((visitId: number) => {
    setVisitToDelete(visitId);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!visitToDelete) return;

    setProcessingVisitId(visitToDelete);
    try {
      const token = await getBusinessToken();
      await deleteVisitAction({
        businessId,
        visitId: visitToDelete,
        token,
      });
      setAlert({ type: 'success', message: 'Visita cancelada exitosamente' });
      setTimeout(() => setAlert(null), 5000);
      loadVisits();
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al cancelar la visita';
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setProcessingVisitId(null);
      setIsDeleteConfirmOpen(false);
      setVisitToDelete(null);
    }
  }, [visitToDelete, businessId, getBusinessToken, loadVisits]);

  const columns: TableColumn<VisitListDTO>[] = [
    {
      key: 'visitorName',
      label: 'Visitante',
      render: (_, visit) => (
        <div>
          <div className="font-medium">{visit.visitorName}</div>
          <div className="text-sm text-gray-500">DNI: {visit.visitorDni}</div>
        </div>
      ),
    },
    {
      key: 'propertyUnitNumber',
      label: 'Unidad',
      render: (_, visit) => <span className="font-medium">{visit.propertyUnitNumber}</span>,
    },
    {
      key: 'visitTypeName',
      label: 'Tipo',
      render: (_, visit) => <span>{visit.visitTypeName}</span>,
    },
    {
      key: 'visitStatusName',
      label: 'Estado',
      render: (_, visit) => (
        <Badge color={getStatusBadgeColor(visit.visitStatusName)}>
          {visit.visitStatusName}
        </Badge>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Fecha Programada',
      render: (_, visit) => {
        const date = new Date(visit.scheduledDate);
        return <span>{date.toLocaleDateString('es-CO')}</span>;
      },
    },
    {
      key: 'actualEntryTime',
      label: 'Entrada',
      render: (_, visit) => {
        if (!visit.actualEntryTime) return <span className="text-gray-400">-</span>;
        const date = new Date(visit.actualEntryTime);
        return <span>{date.toLocaleString('es-CO')}</span>;
      },
    },
    {
      key: 'actualExitTime',
      label: 'Salida',
      render: (_, visit) => {
        if (!visit.actualExitTime) return <span className="text-gray-400">-</span>;
        const date = new Date(visit.actualExitTime);
        return <span>{date.toLocaleString('es-CO')}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, visit) => {
        const isProcessing = processingVisitId === visit.id;
        const hasEntry = !!visit.actualEntryTime;
        const hasExit = !!visit.actualExitTime;
        const statusLower = visit.visitStatusName.toLowerCase();
        const isCancelledOrRejected = statusLower.includes('cancelada') || statusLower.includes('cancelled') ||
                                       statusLower.includes('rechazada') || statusLower.includes('rejected');
        const isCompleted = statusLower.includes('completada') || statusLower.includes('completed');

        return (
          <div className="flex gap-1">
            {!hasEntry && !isCancelledOrRejected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegisterEntryClick(visit)}
                disabled={isProcessing}
                title="Registrar entrada"
              >
                <ArrowRightCircleIcon className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {hasEntry && !hasExit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegisterExitClick(visit)}
                disabled={isProcessing}
                title="Registrar salida"
              >
                <ArrowLeftCircleIcon className="h-4 w-4 text-red-600" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(visit.id)}
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            {!isCompleted && !isCancelledOrRejected && !hasEntry && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteClick(visit.id)}
                disabled={isProcessing}
                title="Cancelar visita"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Visitas</h2>
        <div className="flex gap-2">
          <Button
            variant={filtersVisible ? 'primary' : 'outline'}
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length}
              </span>
            )}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Visita
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      {filtersVisible && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Filtros de Búsqueda</h3>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Limpiar Filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Tipo de Visita"
              value={filters.visitTypeId?.toString() || ''}
              onChange={(e) => handleFilterChange('visitTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
              options={[
                { value: '', label: 'Todos los tipos' },
                ...visitTypes.map((type) => ({
                  value: type.id.toString(),
                  label: type.name,
                })),
              ]}
            />
            <Select
              label="Estado"
              value={filters.visitStatusId?.toString() || ''}
              onChange={(e) => handleFilterChange('visitStatusId', e.target.value ? parseInt(e.target.value) : undefined)}
              options={[
                { value: '', label: 'Todos los estados' },
                ...visitStatuses.map((status) => ({
                  value: status.id.toString(),
                  label: status.name,
                })),
              ]}
            />
            <Input
              label="Fecha Inicio"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
            />
            <Input
              label="Fecha Fin"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
            />
          </div>
        </div>
      )}

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Table
        data={visits}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: pageSize,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: setPageSize,
          showItemsPerPageSelector: true,
          itemsPerPageOptions: [5, 10, 25, 50, 100],
        }}
        emptyMessage="No hay visitas registradas"
      />

      <CreateVisitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleVisitCreated}
        businessId={businessId}
      />

      {selectedVisitId && (
        <VisitDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedVisitId(null);
          }}
          visitId={selectedVisitId}
          businessId={businessId}
        />
      )}

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setVisitToDelete(null);
        }}
        title="Confirmar cancelación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Está seguro que desea cancelar la visita #{visitToDelete}? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setVisitToDelete(null);
              }}
            >
              No, mantener
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={processingVisitId === visitToDelete}
            >
              Sí, cancelar visita
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación de entrada */}
      <Modal
        isOpen={isEntryConfirmOpen}
        onClose={() => {
          setIsEntryConfirmOpen(false);
          setVisitToRegisterEntry(null);
        }}
        title="Confirmar registro de entrada"
        size="md"
      >
        {visitToRegisterEntry && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200">
              <p className="text-gray-700 font-medium mb-2">Información de la visita:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Visitante:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterEntry.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DNI:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterEntry.visitorDni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unidad:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterEntry.propertyUnitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterEntry.visitTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha programada:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(visitToRegisterEntry.scheduledDate).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              ¿Confirma que desea registrar la <strong>entrada</strong> de este visitante en la puerta principal?
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEntryConfirmOpen(false);
                  setVisitToRegisterEntry(null);
                }}
                disabled={processingVisitId === visitToRegisterEntry.id}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRegisterEntry}
                disabled={processingVisitId === visitToRegisterEntry.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingVisitId === visitToRegisterEntry.id ? 'Registrando...' : 'Confirmar entrada'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmación de salida */}
      <Modal
        isOpen={isExitConfirmOpen}
        onClose={() => {
          setIsExitConfirmOpen(false);
          setVisitToRegisterExit(null);
        }}
        title="Confirmar registro de salida"
        size="md"
      >
        {visitToRegisterExit && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200">
              <p className="text-gray-700 font-medium mb-2">Información de la visita:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Visitante:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterExit.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DNI:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterExit.visitorDni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unidad:</span>
                  <span className="font-medium text-gray-900">{visitToRegisterExit.propertyUnitNumber}</span>
                </div>
                {visitToRegisterExit.actualEntryTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hora de entrada:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(visitToRegisterExit.actualEntryTime).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
                {visitToRegisterExit.actualEntryTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tiempo transcurrido:</span>
                    <span className="font-medium text-gray-900">
                      {Math.floor((new Date().getTime() - new Date(visitToRegisterExit.actualEntryTime).getTime()) / 60000)} minutos
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600">
              ¿Confirma que desea registrar la <strong>salida</strong> de este visitante en la puerta principal?
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsExitConfirmOpen(false);
                  setVisitToRegisterExit(null);
                }}
                disabled={processingVisitId === visitToRegisterExit.id}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmRegisterExit}
                disabled={processingVisitId === visitToRegisterExit.id}
              >
                {processingVisitId === visitToRegisterExit.id ? 'Registrando...' : 'Confirmar salida'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
