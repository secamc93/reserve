'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PropertyUnitsTable } from '@/modules/property-horizontal/ui/property-units/property-units-table';
import { PropertyNavigation } from '@/modules/property-horizontal/ui/components/property-navigation';

export default function UnitsPage() {
  const params = useParams();
  const hpId = parseInt(params.id as string);

  if (isNaN(hpId)) {
    return (
      <div className="p-6">
        <div className="text-red-600">ID de propiedad inválido</div>
      </div>
    );
  }

  return (
    <div>
      {/* Navegación */}
      <PropertyNavigation hpId={hpId} />
      
      <div className="p-6">
        <PropertyUnitsTable hpId={hpId} />
      </div>
    </div>
  );
}
