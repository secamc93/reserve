'use client';

import { useEffect, useState, useCallback } from 'react';
import { getParkingZonesAction } from '../infrastructure/actions/get-parking-zones.action';
import { ParkingZoneListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { useIsMobile, MobileCard, mobileColumn } from '@/services/mobile-ui';
import { usePaginationParams } from '@shared/ui/pagination';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateParkingZoneModal } from './create-parking-zone-modal';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface ParkingZonesTableProps {
  businessId: number;
}

export function ParkingZonesTable({ businessId }: ParkingZonesTableProps) {
  const isMobile = useIsMobile();
  const [zones, setZones] = useState<ParkingZoneListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { page, pageSize, setPage } = usePaginationParams();
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getBusinessToken = useCallback(async (): Promise<string> => {
    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin || false;
    
    // Super admin siempre usa business_id = 0 en el token
    const tokenBusinessId = isSuperAdmin ? 0 : businessId;
    
    let businessToken = TokenStorage.getBusinessToken();
    const activeBusiness = TokenStorage.getActiveBusiness();
    
    // Si ya tenemos un token y el business activo coincide, usarlo
    if (businessToken && activeBusiness === tokenBusinessId) {
      return businessToken;
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

  useEffect(() => {
    loadZones();
  }, [businessId, page, pageSize]);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getBusinessToken();
      const result = await getParkingZonesAction({
        businessId,
        token,
        page,
        pageSize,
      });
      setZones(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando zonas de parqueo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadZones();
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (_: unknown, zone: ParkingZoneListDTO) => <span className="font-medium">{zone.name}</span>,
    },
    {
      key: 'code',
      label: 'Codigo',
      render: (_: unknown, zone: ParkingZoneListDTO) => <code className="text-sm bg-gray-100 px-2 py-1 rounded">{zone.code}</code>,
    },
    {
      key: 'location',
      label: 'Ubicacion',
      render: (_: unknown, zone: ParkingZoneListDTO) => zone.location || '-',
    },
    {
      key: 'totalSlots',
      label: 'Total Espacios',
      render: (_: unknown, zone: ParkingZoneListDTO) => zone.totalSlots,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: unknown, zone: ParkingZoneListDTO) => (
        <span className={zone.isActive ? 'text-green-600' : 'text-red-600'}>
          {zone.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  if (loading && zones.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold">Zonas de Parqueo</h2>
        <Button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto min-h-[44px] md:min-h-0 justify-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nueva Zona
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={zones}
        columns={isMobile ? mobileColumn<ParkingZoneListDTO>('Zonas', (zone) => (
            <MobileCard
              title={zone.name}
              subtitle={zone.location || undefined}
              badge={<span className={`text-sm font-medium ${zone.isActive ? 'text-green-600' : 'text-red-600'}`}>{zone.isActive ? 'Activa' : 'Inactiva'}</span>}
              fields={[
                { label: 'Código', value: zone.code },
                { label: 'Espacios', value: String(zone.totalSlots) },
              ]}
            />
          )) : columns}
        loading={loading}
        pagination={{ total, totalPages }}
        emptyMessage="No hay zonas de parqueo registradas"
      />

      <CreateParkingZoneModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        businessId={businessId}
      />
    </div>
  );
}
