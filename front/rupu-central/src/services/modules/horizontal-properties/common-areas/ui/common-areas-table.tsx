'use client';

import { useEffect, useState } from 'react';
import { getCommonAreasAction } from '../infrastructure/actions/get-common-areas.action';
import { CommonAreaListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';

interface CommonAreasTableProps {
  businessId: number;
}

export function CommonAreasTable({ businessId }: CommonAreasTableProps) {
  const [commonAreas, setCommonAreas] = useState<CommonAreaListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCommonAreas();
  }, [businessId, page, pageSize]);

  const loadCommonAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCommonAreasAction({
        businessId,
        page,
        pageSize,
      });
      setCommonAreas(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando zonas comunes');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (_: unknown, area: CommonAreaListDTO) => area.name,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (_: unknown, area: CommonAreaListDTO) => area.typeName,
    },
    {
      key: 'location',
      label: 'Ubicación',
      render: (_: unknown, area: CommonAreaListDTO) => area.location || '-',
    },
    {
      key: 'capacity',
      label: 'Capacidad',
      render: (_: unknown, area: CommonAreaListDTO) => area.maxCapacity,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: unknown, area: CommonAreaListDTO) => (
        <span className={area.isActive ? 'text-green-600' : 'text-red-600'}>
          {area.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'requiresApproval',
      label: 'Requiere Aprobación',
      render: (_: unknown, area: CommonAreaListDTO) => (area.requiresApproval ? 'Sí' : 'No'),
    },
  ];

  if (loading && commonAreas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zonas Comunes</h1>
        <Button>Nueva Zona Común</Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={commonAreas}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: page,
          totalItems: total,
          totalPages: Math.ceil(total / pageSize),
          itemsPerPage: pageSize,
          onPageChange: setPage,
          onItemsPerPageChange: setPageSize,
          showItemsPerPageSelector: true,
          itemsPerPageOptions: [5, 10, 25, 50, 100],
        }}
      />
    </div>
  );
}
