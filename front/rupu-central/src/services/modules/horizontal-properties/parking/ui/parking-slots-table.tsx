'use client';

import { useEffect, useState } from 'react';
import { getParkingSlotsAction } from '../infrastructure/actions/get-parking-slots.action';
import { ParkingSlotListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { Badge } from '@shared/ui/badge';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ParkingSlotsTableProps {
  businessId: number;
  parkingZoneId?: number;
}

export function ParkingSlotsTable({ businessId, parkingZoneId }: ParkingSlotsTableProps) {
  const [slots, setSlots] = useState<ParkingSlotListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSlots();
  }, [businessId, parkingZoneId, page, pageSize]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getParkingSlotsAction({
        businessId,
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

  const columns = [
    {
      key: 'slotNumber',
      label: 'Número',
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
      label: 'Características',
      render: (_: unknown, slot: ParkingSlotListDTO) => (
        <div className="flex gap-2 text-sm">
          {slot.isCovered && <span className="text-blue-600">Cubierto</span>}
          {slot.hasCharger && <span className="text-green-600">Cargador</span>}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Espacios de Parqueo</h2>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nuevo Espacio
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      <Table
        data={slots}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: pageSize,
          onPageChange: setPage,
          onItemsPerPageChange: setPageSize,
          showItemsPerPageSelector: true,
          itemsPerPageOptions: [5, 10, 25, 50, 100],
        }}
        emptyMessage="No hay espacios de parqueo registrados"
      />
    </div>
  );
}
