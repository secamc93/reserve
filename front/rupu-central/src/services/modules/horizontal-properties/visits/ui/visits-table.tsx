'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Alert, TableColumn, Button } from '@shared/ui';
import { getVisitsAction, registerEntryAction, registerExitAction } from '../infrastructure/actions';
import { VisitListDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { CreateVisitModal } from './create-visit-modal';
import { PlusIcon, EyeIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/outline';

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
  }, [businessId, currentPage, pageSize, getBusinessToken]);

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

        return (
          <div className="flex gap-2">
            {!hasEntry && !statusLower.includes('cancelada') && !statusLower.includes('rechazada') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegisterEntry(visit.id)}
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
                onClick={() => handleRegisterExit(visit.id)}
                disabled={isProcessing}
                title="Registrar salida"
              >
                <ArrowLeftCircleIcon className="h-4 w-4 text-red-600" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // TODO: Implementar modal de detalles
                setAlert({ type: 'info', message: `Detalles de visita #${visit.id} - Próximamente` });
                setTimeout(() => setAlert(null), 3000);
              }}
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Visitas</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Visita
        </Button>
      </div>

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
    </div>
  );
}
