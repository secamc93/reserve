'use client';

import { useEffect, useState } from 'react';
import { getParkingZonesAction } from '../infrastructure/actions/get-parking-zones.action';
import { ParkingZoneListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ParkingZonesTableProps {
  businessId: number;
}

export function ParkingZonesTable({ businessId }: ParkingZonesTableProps) {
  const [zones, setZones] = useState<ParkingZoneListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadZones();
  }, [businessId, page, pageSize]);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getParkingZonesAction({
        businessId,
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

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (_: unknown, zone: ParkingZoneListDTO) => zone.name,
    },
    {
      key: 'code',
      label: 'Código',
      render: (_: unknown, zone: ParkingZoneListDTO) => zone.code,
    },
    {
      key: 'location',
      label: 'Ubicación',
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Zonas de Parqueo</h2>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nueva Zona
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      <Table
        data={zones}
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
        emptyMessage="No hay zonas de parqueo registradas"
      />
    </div>
  );
}
