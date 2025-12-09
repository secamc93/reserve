'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ResidentsTable } from '@/services/modules/horizontal-properties/residents/ui/residents-table';
import { PropertyNavigation } from '@/services/modules/horizontal-properties/properties/ui/property-navigation';

export default function ResidentsPage() {
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
        <ResidentsTable businessId={businessId} />
      </div>
    </div>
  );
}
