'use client';

import { useEffect, useState, useCallback } from 'react';
import { getReservationsAction } from '../infrastructure/actions/get-reservations.action';
import { ReservationListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

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

  useEffect(() => {
    loadReservations();
  }, [businessId, page, pageSize]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getBusinessToken();
      const result = await getReservationsAction({
        businessId,
        token,
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
