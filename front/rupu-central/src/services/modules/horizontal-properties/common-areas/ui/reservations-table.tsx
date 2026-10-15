'use client';

import { useEffect, useState, useCallback } from 'react';
import { getReservationsAction } from '../infrastructure/actions/get-reservations.action';
import { ReservationListDTO } from '../domain';
import { Table } from '@shared/ui/table';
import { useIsMobile, MobileCard, mobileColumn } from '@/services/mobile-ui';
import { usePaginationParams } from '@shared/ui/pagination';
import { Button } from '@shared/ui/button';
import { Alert } from '@shared/ui/alert';
import { Spinner } from '@shared/ui/spinner';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

interface ReservationsTableProps {
  businessId: number;
}

export function ReservationsTable({ businessId }: ReservationsTableProps) {
  const isMobile = useIsMobile();
  const [reservations, setReservations] = useState<ReservationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { page, pageSize, setPage } = usePaginationParams();
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-xl md:text-2xl font-bold">Reservas de Zonas Comunes</h1>
        <Button className="w-full md:w-auto min-h-[44px] md:min-h-0 justify-center">Nueva Reserva</Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={reservations}
        columns={isMobile ? mobileColumn<ReservationListDTO>('Reservas', (r) => (
          <MobileCard
            title={r.commonAreaName}
            subtitle={r.residentName || undefined}
            badge={<span className="text-sm font-medium text-gray-700">{r.statusName}</span>}
            fields={[
              { label: 'Unidad', value: r.propertyUnitNumber },
              { label: 'Fecha', value: new Date(r.reservationDate).toLocaleDateString() },
              { label: 'Horario', value: `${r.startTime} - ${r.endTime}` },
              { label: 'Invitados', value: String(r.numberOfGuests) },
            ]}
          />
        )) : columns}
        loading={loading}
        pagination={{ total }}
      />
    </div>
  );
}
