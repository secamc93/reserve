'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VisitsTable } from '@/services/modules/horizontal-properties/visits/ui/visits-table';

export default function VisitsPage() {
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
        <VisitsTable businessId={businessId} />
      </div>
    </div>
  );
}
