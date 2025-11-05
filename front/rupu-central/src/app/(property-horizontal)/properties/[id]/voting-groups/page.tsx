'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VotingGroupsSection } from '@/modules/property-horizontal/ui/voting-groups/voting-groups-section';
import { PropertyNavigation } from '@/modules/property-horizontal/ui/components/property-navigation';

export default function VotingGroupsPage() {
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
        <VotingGroupsSection businessId={businessId} />
      </div>
    </div>
  );
}
