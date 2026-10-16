'use client';

import { useParams } from 'next/navigation';
import { PackagesTable } from '@/services/modules/horizontal-properties/packages/ui';

export default function PackagesPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return <div className="p-6 text-[#c8382d]">ID de propiedad inválido</div>;
  }

  // La barra superior (miga de pan "Propiedad / Paquetería") la pone el layout
  return <PackagesTable businessId={businessId} />;
}
