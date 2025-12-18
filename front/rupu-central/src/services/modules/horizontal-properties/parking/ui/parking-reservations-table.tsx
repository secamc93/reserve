'use client';

import { useEffect, useState } from 'react';
import { getParkingReservationsAction } from '../infrastructure/actions/get-parking-reservations.action';
import { ParkingReservationListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { Badge } from '@shared/ui/badge';
import { PlusIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/outline';

interface ParkingReservationsTableProps {
  businessId: number;
}

export function ParkingReservationsTable({ businessId }: ParkingReservationsTableProps) {
  const [reservations, setReservations] = useState<ParkingReservationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReservations();
  }, [businessId, page, pageSize]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getParkingReservationsAction({
        businessId,
        page,
        pageSize,
      });
      setReservations(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando reservas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completada') || statusLower.includes('completed')) return 'success';
    if (statusLower.includes('confirmada') || statusLower.includes('confirmed')) return 'success';
    if (statusLower.includes('en uso') || statusLower.includes('checked_in')) return 'info';
    if (statusLower.includes('pendiente') || statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('cancelada') || statusLower.includes('cancelled')) return 'danger';
    return 'info';
  };

  const columns = [
    {
      key: 'slot',
      label: 'Espacio',
      render: (_: unknown, reservation: ParkingReservationListDTO) => (
        <span className="font-medium">{reservation.parkingSlotNumber}</span>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehículo',
      render: (_: unknown, reservation: ParkingReservationListDTO) => (
        <span className="font-medium">{reservation.vehiclePlate}</span>
      ),
    },
    {
      key: 'unit',
      label: 'Unidad',
      render: (_: unknown, reservation: ParkingReservationListDTO) => 
        reservation.propertyUnitNumber || '-',
    },
    {
      key: 'person',
      label: 'Residente/Visitante',
      render: (_: unknown, reservation: ParkingReservationListDTO) => 
        reservation.residentName || reservation.visitorName || '-',
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (_: unknown, reservation: ParkingReservationListDTO) => {
        const date = new Date(reservation.reservationDate);
        return <span>{date.toLocaleDateString('es-CO')}</span>;
      },
    },
    {
      key: 'time',
      label: 'Horario',
      render: (_: unknown, reservation: ParkingReservationListDTO) => (
        <span>{reservation.startTime} - {reservation.endTime}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: unknown, reservation: ParkingReservationListDTO) => (
        <Badge color={getStatusBadgeColor(reservation.statusName)}>
          {reservation.statusName}
        </Badge>
      ),
    },
    {
      key: 'checkinout',
      label: 'Check-in/out',
      render: (_: unknown, reservation: ParkingReservationListDTO) => (
        <div className="flex gap-2">
          {reservation.checkedInAt ? (
            <span className="text-green-600" title="Check-in realizado">
              <ArrowRightCircleIcon className="w-5 h-5" />
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          {reservation.checkedOutAt ? (
            <span className="text-blue-600" title="Check-out realizado">
              <ArrowLeftCircleIcon className="w-5 h-5" />
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  if (loading && reservations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reservas Temporales</h2>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      <Table
        data={reservations}
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
        emptyMessage="No hay reservas registradas"
      />
    </div>
  );
}
