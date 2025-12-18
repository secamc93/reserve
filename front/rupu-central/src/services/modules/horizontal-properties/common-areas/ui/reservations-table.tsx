'use client';

import { useEffect, useState } from 'react';
import { getReservationsAction } from '../infrastructure/actions/get-reservations.action';
import { ReservationListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';

interface ReservationsTableProps {
  businessId: number;
}

export function ReservationsTable({ businessId }: ReservationsTableProps) {
  const [reservations, setReservations] = useState<ReservationListDTO[]>([]);
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
      const result = await getReservationsAction({
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

  const columns = [
    {
      key: 'commonArea',
      label: 'Zona Común',
      render: (_: unknown, reservation: ReservationListDTO) => reservation.commonAreaName,
    },
    {
      key: 'unit',
      label: 'Unidad',
      render: (_: unknown, reservation: ReservationListDTO) => reservation.propertyUnitNumber,
    },
    {
      key: 'resident',
      label: 'Residente',
      render: (_: unknown, reservation: ReservationListDTO) => reservation.residentName || '-',
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: unknown, reservation: ReservationListDTO) => reservation.statusName,
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (_: unknown, reservation: ReservationListDTO) => new Date(reservation.reservationDate).toLocaleDateString(),
    },
    {
      key: 'time',
      label: 'Horario',
      render: (_: unknown, reservation: ReservationListDTO) => `${reservation.startTime} - ${reservation.endTime}`,
    },
    {
      key: 'guests',
      label: 'Invitados',
      render: (_: unknown, reservation: ReservationListDTO) => reservation.numberOfGuests,
    },
  ];

  if (loading && reservations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reservas de Zonas Comunes</h1>
        <Button>Nueva Reserva</Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={reservations}
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
