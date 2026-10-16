'use client';

import { useParams } from 'next/navigation';
import { VisitsTable } from '@/services/modules/horizontal-properties/visits/ui/visits-table';

export default function VisitsPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return <div className="p-6 text-[#c8382d]">ID de propiedad inválido</div>;
  }

  // La barra superior (miga de pan "Propiedad / Visitas") la pone el layout
  return <VisitsTable businessId={businessId} />;
}
