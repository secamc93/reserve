'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VotingGroupsSection } from '@/modules/property-horizontal/ui/voting-groups/voting-groups-section';
import { PropertyNavigation } from '@/modules/property-horizontal/ui/components/property-navigation';

export default function VotingGroupsPage() {
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
        <VotingGroupsSection businessId={hpId} />
      </div>
    </div>
  );
}
