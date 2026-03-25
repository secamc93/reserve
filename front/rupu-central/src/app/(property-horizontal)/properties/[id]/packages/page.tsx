'use client';

import { useParams } from 'next/navigation';
import { PackagesTable } from '@/services/modules/horizontal-properties/packages/ui';

export default function PackagesPage() {
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
        <PackagesTable businessId={businessId} />
      </div>
    </div>
  );
}
