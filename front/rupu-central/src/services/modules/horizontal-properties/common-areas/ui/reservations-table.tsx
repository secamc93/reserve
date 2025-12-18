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
      label: 'Zona Común',
      render: (reservation: ReservationListDTO) => reservation.commonAreaName,
    },
    {
      label: 'Unidad',
      render: (reservation: ReservationListDTO) => reservation.propertyUnitNumber,
    },
    {
      label: 'Residente',
      render: (reservation: ReservationListDTO) => reservation.residentName || '-',
    },
    {
      label: 'Estado',
      render: (reservation: ReservationListDTO) => reservation.statusName,
    },
    {
      label: 'Fecha',
      render: (reservation: ReservationListDTO) => new Date(reservation.reservationDate).toLocaleDateString(),
    },
    {
      label: 'Horario',
      render: (reservation: ReservationListDTO) => `${reservation.startTime} - ${reservation.endTime}`,
    },
    {
      label: 'Invitados',
      render: (reservation: ReservationListDTO) => reservation.numberOfGuests,
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
        <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      <Table
        data={reservations}
        columns={columns}
        currentPage={page}
        totalItems={total}
        itemsPerPage={pageSize}
        onPageChange={setPage}
        onItemsPerPageChange={setPageSize}
        showItemsPerPageSelector={true}
        itemsPerPageOptions={[5, 10, 25, 50, 100]}
      />
    </div>
  );
}
