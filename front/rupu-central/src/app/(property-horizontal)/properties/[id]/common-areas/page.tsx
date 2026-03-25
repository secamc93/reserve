'use client';

import { useParams } from 'next/navigation';
import { CommonAreasTable } from '@/services/modules/horizontal-properties/common-areas/ui/common-areas-table';

export default function CommonAreasPage() {
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
        <CommonAreasTable businessId={businessId} />
      </div>
    </div>
  );
}
