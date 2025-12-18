'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Alert, TableColumn, Button, Spinner } from '@shared/ui';
import { getPackagesAction, deliverPackageAction } from '../infrastructure/actions';
import { PackageListDTO } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { ReceivePackageModal } from './receive-package-modal';
import { DeliverPackageModal } from './deliver-package-modal';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PackagesTableProps {
  businessId: number;
}

export function PackagesTable({ businessId }: PackagesTableProps) {
  const [packages, setPackages] = useState<PackageListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageListDTO | null>(null);
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null);

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
  }, [businessId, currentPage, pageSize, getBusinessToken]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

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
        const canDeliver = pkg.statusCode === 'received' || pkg.statusCode === 'in_storage';

        return (
          <div className="flex gap-2">
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Paquetes</h2>
        <Button onClick={() => setIsReceiveModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Recibir Paquete
        </Button>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Table
        data={packages}
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
    </div>
  );
}
