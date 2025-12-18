'use client';

import { useEffect, useState } from 'react';
import { getParkingAssignmentsAction } from '../infrastructure/actions/get-parking-assignments.action';
import { ParkingAssignmentListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { Badge } from '@shared/ui/badge';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ParkingAssignmentsTableProps {
  businessId: number;
  propertyUnitId?: number;
}

export function ParkingAssignmentsTable({ businessId, propertyUnitId }: ParkingAssignmentsTableProps) {
  const [assignments, setAssignments] = useState<ParkingAssignmentListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAssignments();
  }, [businessId, propertyUnitId, page, pageSize]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getParkingAssignmentsAction({
        businessId,
        propertyUnitId,
        isActive: true,
        page,
        pageSize,
      });
      setAssignments(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'slot',
      label: 'Espacio',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => (
        <span className="font-medium">{assignment.parkingSlotNumber}</span>
      ),
    },
    {
      key: 'unit',
      label: 'Unidad',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => 
        assignment.propertyUnitNumber || '-',
    },
    {
      key: 'resident',
      label: 'Residente',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => 
        assignment.residentName || '-',
    },
    {
      key: 'vehicle',
      label: 'Vehículo',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => (
        <div>
          <div className="font-medium">{assignment.vehiclePlate}</div>
          {assignment.vehicleBrand && assignment.vehicleModel && (
            <div className="text-sm text-gray-500">
              {assignment.vehicleBrand} {assignment.vehicleModel}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Fecha Inicio',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => {
        const date = new Date(assignment.startDate);
        return <span>{date.toLocaleDateString('es-CO')}</span>;
      },
    },
    {
      key: 'endDate',
      label: 'Fecha Fin',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => {
        if (!assignment.endDate) return <span className="text-gray-400">Permanente</span>;
        const date = new Date(assignment.endDate);
        return <span>{date.toLocaleDateString('es-CO')}</span>;
      },
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: unknown, assignment: ParkingAssignmentListDTO) => (
        <Badge color={assignment.isActive ? 'success' : 'danger'}>
          {assignment.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
  ];

  if (loading && assignments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Asignaciones Permanentes</h2>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nueva Asignación
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={assignments}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(total / pageSize),
          totalItems: total,
          itemsPerPage: pageSize,
          onPageChange: setPage,
          onItemsPerPageChange: setPageSize,
          showItemsPerPageSelector: true,
          itemsPerPageOptions: [5, 10, 25, 50, 100],
        }}
        emptyMessage="No hay asignaciones registradas"
      />
    </div>
  );
}
