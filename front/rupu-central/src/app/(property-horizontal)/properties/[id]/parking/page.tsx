'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ParkingView } from '@/services/modules/horizontal-properties/parking/ui/parking-view';

export default function ParkingPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return <div className="p-6 text-red-600">ID de propiedad inválido</div>;
  }

  return (
    <Suspense fallback={null}>
      <ParkingView businessId={businessId} />
    </Suspense>
  );
}
