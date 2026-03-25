'use client';

import { useParams } from 'next/navigation';
import { ReservationsTable } from '@/services/modules/horizontal-properties/common-areas/ui/reservations-table';

export default function ReservationsPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return (
      <div className="p-6">
        <div className="text-red-600">ID de propiedad inválido</div>
      </div>
    );
  }

  return (
    <div>
      {/* Navegación */}

      <div className="p-6">
        <ReservationsTable businessId={businessId} />
      </div>
    </div>
  );
}
