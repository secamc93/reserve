'use client';

import { useParams } from 'next/navigation';
import { DsBody, DsPage, VtNotice } from '@shared/ui/ds';
import { ResidentsTable } from '@/services/modules/horizontal-properties/residents/ui/residents-table';

/** Residentes de la propiedad (R1–R4). La barra superior con la miga de pan la pone el layout. */
export default function ResidentsPage() {
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

  return <ResidentsTable businessId={businessId} />;
}
