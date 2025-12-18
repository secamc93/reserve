'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VisitsTable } from '@/services/modules/horizontal-properties/visits/ui/visits-table';
import { PropertyNavigation } from '@/services/modules/horizontal-properties/properties/ui/property-navigation';

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
      <PropertyNavigation businessId={businessId} />

      <div className="p-6">
        <VisitsTable businessId={businessId} />
      </div>
    </div>
  );
}
