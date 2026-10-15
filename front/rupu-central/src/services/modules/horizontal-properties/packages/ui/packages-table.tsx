'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsMobile, mobileColumn, MobileCard, MobileActionButton } from '@/services/mobile-ui';
import { Table, Badge, Alert, TableColumn, Button, Spinner, Select, Input } from '@shared/ui';
import { usePaginationParams } from '@shared/ui/pagination';
import { getPackagesAction, getPackageStatusesAction, deletePackageAction } from '../infrastructure/actions';
import { PackageListDTO, PackageStatus } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { ReceivePackageModal } from './receive-package-modal';
import { DeliverPackageModal } from './deliver-package-modal';
import { PackageDetailModal } from './package-detail-modal';
import { PlusIcon, CheckCircleIcon, EyeIcon, TrashIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PackagesTableProps {
  businessId: number;
}

export function PackagesTable({ businessId }: PackagesTableProps) {
  const [packages, setPackages] = useState<PackageListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { page: currentPage, pageSize, setPage: setCurrentPage } = usePaginationParams();
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageListDTO | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [packageStatuses, setPackageStatuses] = useState<PackageStatus[]>([]);
  const [filterStatusId, setFilterStatusId] = useState<number | undefined>(undefined);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

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

  const loadPackageStatuses = useCallback(async () => {
    try {
      const token = await getBusinessToken();
      const statuses = await getPackageStatusesAction({ token });
      setPackageStatuses(statuses.filter(s => s.isActive));
    } catch (error) {
      console.error('Error cargando estados:', error);
    }
  }, [getBusinessToken]);

  useEffect(() => {
    loadPackageStatuses();
  }, [loadPackageStatuses]);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setAlert(null);
    try {
      const token = await getBusinessToken();

      const data = await getPackagesAction({
        businessId,
        token,
        page: currentPage,
        pageSize: pageSize,
        packageStatusId: filterStatusId,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      });

      setPackages(data.packages);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);

      if (data.packages.length === 0 && data.total === 0) {
        setAlert({ 
          type: 'info', 
          message: 'No hay paquetes registrados. Puedes recibir un nuevo paquete usando el botón "Recibir Paquete".' 
        });
      }
    } catch (error: any) {
      console.error('Error al cargar paquetes:', error);
      const errorMessage = error?.message || 'Error al cargar los paquetes. Por favor, intenta nuevamente.';
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [businessId, currentPage, pageSize, filterStatusId, filterStartDate, filterEndDate, getBusinessToken]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleClearFilters = () => {
    setFilterStatusId(undefined);
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterStatusId !== undefined || filterStartDate !== '' || filterEndDate !== '';

  const handleViewDetails = (pkg: PackageListDTO) => {
    setSelectedPackageId(pkg.id);
    setIsDetailModalOpen(true);
  };

  const handleDeletePackage = async (pkg: PackageListDTO) => {
    if (!confirm(`¿Estás seguro de que deseas marcar el paquete ${pkg.trackingNumber} como retornado?`)) {
      return;
    }
    setProcessingPackageId(pkg.id);
    try {
      const token = await getBusinessToken();
      await deletePackageAction({
        businessId,
        packageId: pkg.id,
        token,
      });
      setAlert({ type: 'success', message: 'Paquete marcado como retornado' });
      setTimeout(() => setAlert(null), 5000);
      loadPackages();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando paquete';
      setAlert({ type: 'error', message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setProcessingPackageId(null);
    }
  };

  const getStatusBadgeColor = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregado') || statusLower.includes('delivered')) return 'success';
    if (statusLower.includes('recibido') || statusLower.includes('received')) return 'info';
    if (statusLower.includes('almacén') || statusLower.includes('storage')) return 'warning';
    if (statusLower.includes('retornado') || statusLower.includes('returned')) return 'danger';
    return 'info';
  };

  const handlePackageReceived = useCallback(() => {
    setIsReceiveModalOpen(false);
    loadPackages();
    setAlert({ type: 'success', message: 'Paquete recibido exitosamente' });
    setTimeout(() => setAlert(null), 5000);
  }, [loadPackages]);

  const handleDeliverClick = (pkg: PackageListDTO) => {
    setSelectedPackage(pkg);
    setIsDeliverModalOpen(true);
  };

  const handlePackageDelivered = useCallback(() => {
    setIsDeliverModalOpen(false);
    setSelectedPackage(null);
    loadPackages();
    setAlert({ type: 'success', message: 'Paquete entregado exitosamente' });
    setTimeout(() => setAlert(null), 5000);
  }, [loadPackages]);

  const isMobile = useIsMobile();

  /** Acciones permitidas de un paquete (las comparten la fila de escritorio y la tarjeta de teléfono). */
  const packageFlags = (pkg: PackageListDTO) => {
    const isDelivered = pkg.statusCode === 'delivered' || !!pkg.deliveredAt;
    const canDeliver = pkg.statusCode === 'received' || pkg.statusCode === 'in_storage' || pkg.statusCode === 'notified';
    return {
      isProcessing: processingPackageId === pkg.id,
      canDeliver: canDeliver && !isDelivered,
      canDelete: !isDelivered && pkg.statusCode !== 'returned' && pkg.statusCode !== 'lost',
    };
  };

  const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('es-CO') : '-');

  const mobileColumns = mobileColumn<PackageListDTO>('Paquetes', (pkg) => {
    const f = packageFlags(pkg);
    return (
      <MobileCard
        title={`Unidad ${pkg.propertyUnitNumber}`}
        subtitle={[pkg.trackingNumber, pkg.carrier].filter(Boolean).join(' · ')}
        badge={<Badge color={getStatusBadgeColor(pkg.statusName)}>{pkg.statusName}</Badge>}
        fields={[
          { label: 'Residente', value: pkg.residentName || '-', full: true },
          { label: 'Recibido', value: fmtDate(pkg.receivedAt) },
          { label: 'Entregado', value: fmtDate(pkg.deliveredAt) },
        ]}
        actions={<>
          {f.canDeliver && (
            <MobileActionButton variant="primary" className="flex-1" disabled={f.isProcessing} onClick={() => handleDeliverClick(pkg)}>
              <CheckCircleIcon className="h-5 w-5" /> Entregar
            </MobileActionButton>
          )}
          <MobileActionButton className="flex-1" onClick={() => handleViewDetails(pkg)}>
            <EyeIcon className="h-5 w-5" /> Detalle
          </MobileActionButton>
          {f.canDelete && (
            <MobileActionButton variant="danger" title="Marcar como retornado" disabled={f.isProcessing} onClick={() => handleDeletePackage(pkg)}>
              <TrashIcon className="h-5 w-5" />
            </MobileActionButton>
          )}
        </>}
      />
    );
  });

  const columns: TableColumn<PackageListDTO>[] = [
    {
      key: 'trackingNumber',
      label: 'Tracking',
      render: (_, pkg) => (
        <div>
          <div className="font-medium">{pkg.trackingNumber}</div>
          <div className="text-sm text-gray-500">{pkg.carrier}</div>
        </div>
      ),
    },
    {
      key: 'propertyUnitNumber',
      label: 'Unidad',
      render: (_, pkg) => <span className="font-medium">{pkg.propertyUnitNumber}</span>,
    },
    {
      key: 'residentName',
      label: 'Residente',
      render: (_, pkg) => <span>{pkg.residentName || '-'}</span>,
    },
    {
      key: 'statusName',
      label: 'Estado',
      render: (_, pkg) => (
        <Badge color={getStatusBadgeColor(pkg.statusName)}>
          {pkg.statusName}
        </Badge>
      ),
    },
    {
      key: 'receivedAt',
      label: 'Fecha Recepción',
      render: (_, pkg) => {
        if (!pkg.receivedAt) return <span className="text-gray-400">-</span>;
        const date = new Date(pkg.receivedAt);
        return <span>{date.toLocaleDateString('es-CO')}</span>;
      },
    },
    {
      key: 'deliveredAt',
      label: 'Fecha Entrega',
      render: (_, pkg) => {
        if (!pkg.deliveredAt) return <span className="text-gray-400">-</span>;
        const date = new Date(pkg.deliveredAt);
        return <span>{date.toLocaleDateString('es-CO')}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, pkg) => {
        const isProcessing = processingPackageId === pkg.id;
        const isDelivered = pkg.statusCode === 'delivered' || pkg.deliveredAt;
        const canDeliver = pkg.statusCode === 'received' || pkg.statusCode === 'in_storage' || pkg.statusCode === 'notified';
        const canDelete = !isDelivered && pkg.statusCode !== 'returned' && pkg.statusCode !== 'lost';

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(pkg)}
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            {canDeliver && !isDelivered && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeliverClick(pkg)}
                disabled={isProcessing}
                title="Entregar paquete"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeletePackage(pkg)}
                disabled={isProcessing}
                title="Marcar como retornado"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading && packages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h2 className="text-xl font-semibold">Paquetes</h2>
        <div className="grid grid-cols-2 gap-2 md:flex [&>button]:min-h-[44px] md:[&>button]:min-h-0 [&>button]:justify-center [&>button]:whitespace-nowrap">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
            {hasActiveFilters && <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">!</span>}
          </Button>
          <Button onClick={() => setIsReceiveModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Recibir Paquete
          </Button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filtros</h3>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                <XMarkIcon className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Estado"
                value={filterStatusId?.toString() || ''}
                onChange={(e) => {
                  setFilterStatusId(e.target.value ? Number(e.target.value) : undefined);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'Todos los estados' },
                  ...packageStatuses.map((status) => ({
                    value: status.id.toString(),
                    label: status.name,
                  })),
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Table
        data={packages}
        columns={isMobile ? mobileColumns : columns}
        loading={loading}
        pagination={{ total: totalCount, totalPages }}
        emptyMessage="No hay paquetes registrados"
      />

      <ReceivePackageModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        onSuccess={handlePackageReceived}
        businessId={businessId}
      />

      {selectedPackage && (
        <DeliverPackageModal
          isOpen={isDeliverModalOpen}
          onClose={() => {
            setIsDeliverModalOpen(false);
            setSelectedPackage(null);
          }}
          onSuccess={handlePackageDelivered}
          businessId={businessId}
          packageId={selectedPackage.id}
          packageInfo={selectedPackage}
        />
      )}

      {selectedPackageId && (
        <PackageDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPackageId(null);
          }}
          packageId={selectedPackageId}
          businessId={businessId}
        />
      )}
    </div>
  );
}
