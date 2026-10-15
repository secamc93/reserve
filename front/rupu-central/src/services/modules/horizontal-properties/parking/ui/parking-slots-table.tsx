'use client';

import { useEffect, useState, useCallback } from 'react';
import { getParkingSlotsAction } from '../infrastructure/actions/get-parking-slots.action';
import { ParkingSlotListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { useIsMobile, MobileCard, mobileColumn } from '@/services/mobile-ui';
import { usePaginationParams } from '@shared/ui/pagination';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { Badge } from '@shared/ui/badge';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateParkingSlotModal } from './create-parking-slot-modal';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface ParkingSlotsTableProps {
  businessId: number;
  parkingZoneId?: number;
}

export function ParkingSlotsTable({ businessId, parkingZoneId }: ParkingSlotsTableProps) {
  const isMobile = useIsMobile();
  const [slots, setSlots] = useState<ParkingSlotListDTO[]>([]);
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
    
    if (businessToken && activeBusiness === tokenBusinessId) {
      return businessToken;
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

  useEffect(() => {
    loadSlots();
  }, [businessId, parkingZoneId, page, pageSize]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getBusinessToken();
      const result = await getParkingSlotsAction({
        businessId,
        token,
        parkingZoneId,
        page,
        pageSize,
      });
      setSlots(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando espacios de parqueo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadSlots();
  };

  const columns = [
    {
      key: 'slotNumber',
      label: 'Numero',
      render: (_: unknown, slot: ParkingSlotListDTO) => <span className="font-medium">{slot.slotNumber}</span>,
    },
    {
      key: 'zone',
      label: 'Zona',
      render: (_: unknown, slot: ParkingSlotListDTO) => slot.parkingZoneName,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (_: unknown, slot: ParkingSlotListDTO) => slot.parkingTypeName,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: unknown, slot: ParkingSlotListDTO) => (
        <span className={slot.isActive ? 'text-green-600' : 'text-red-600'}>
          {slot.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'availability',
      label: 'Disponibilidad',
      render: (_: unknown, slot: ParkingSlotListDTO) => {
        if (slot.isOccupied) {
          return <Badge color="danger">Ocupado</Badge>;
        }
        if (slot.isAssigned) {
          return <Badge color="warning">Asignado</Badge>;
        }
        if (slot.isAvailable) {
          return <Badge color="success">Disponible</Badge>;
        }
        return <Badge color="info">No disponible</Badge>;
      },
    },
    {
      key: 'features',
      label: 'Caracteristicas',
      render: (_: unknown, slot: ParkingSlotListDTO) => (
        <div className="flex gap-2 text-sm">
          {slot.isCovered && <span className="text-blue-600">Cubierto</span>}
          {slot.hasCharger && <span className="text-green-600">Cargador</span>}
          {!slot.isCovered && !slot.hasCharger && <span className="text-gray-400">-</span>}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  if (loading && slots.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold">Espacios de Parqueo</h2>
        <Button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto min-h-[44px] md:min-h-0 justify-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nuevo Espacio
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={slots}
        columns={isMobile ? mobileColumn<ParkingSlotListDTO>('Espacios', (slot) => (
            <MobileCard
              title={slot.slotNumber}
              subtitle={slot.parkingZoneName}
              badge={slot.isOccupied ? <Badge color="danger">Ocupado</Badge> : slot.isAssigned ? <Badge color="warning">Asignado</Badge> : slot.isAvailable ? <Badge color="success">Disponible</Badge> : <Badge color="info">No disponible</Badge>}
              fields={[
                { label: 'Tipo', value: slot.parkingTypeName },
                { label: 'Estado', value: slot.isActive ? 'Activo' : 'Inactivo' },
                { label: 'Características', value: [slot.isCovered && 'Cubierto', slot.hasCharger && 'Cargador'].filter(Boolean).join(' · ') || '-', full: true },
              ]}
            />
          )) : columns}
        loading={loading}
        pagination={{ total, totalPages }}
        emptyMessage="No hay espacios de parqueo registrados"
      />

      <CreateParkingSlotModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        businessId={businessId}
        defaultZoneId={parkingZoneId}
      />
    </div>
  );
}
