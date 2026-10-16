'use client';

import { useParams } from 'next/navigation';
import { DsBody, DsPage, VtNotice } from '@shared/ui/ds';
import { PropertyUnitsTable } from '@/services/modules/horizontal-properties/units/ui/property-units-table';

/** Unidades de la propiedad (U1–U3). La barra superior con la miga de pan la pone el layout. */
export default function UnitsPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);

  if (isNaN(businessId)) {
    return (
      <DsPage>
        <DsBody>
          <VtNotice>ID de propiedad inválido</VtNotice>
        </DsBody>
      </DsPage>
    );
  }

  return <PropertyUnitsTable businessId={businessId} />;
}
