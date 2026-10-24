/**
 * A4 · Asistencia del grupo de votación: panel flotante (90 %) sobre los grupos de votación,
 * con el fondo difuminado. Al cerrarlo se vuelve a los grupos.
 */

'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DsFloatingPanel } from '@shared/ui/ds';
import { AttendancePanel } from '@/services/modules/horizontal-properties/voting/ui/attendance-panel';
import { VotingGroupsSection } from '@/services/modules/horizontal-properties/voting/ui/voting-groups-section';

export default function AttendanceManagementPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = parseInt(params.id as string);
  const groupId = parseInt(params.groupId as string);
  const close = useCallback(() => router.push(`/properties/${businessId}/voting-groups`), [router, businessId]);

  if (isNaN(businessId) || isNaN(groupId)) {
    return <div className="p-6 text-red-600">Grupo de votación inválido</div>;
  }

  return (
    <>
      <VotingGroupsSection businessId={businessId} autoTour={false} />
      <DsFloatingPanel onClose={close} ariaLabel="Asistencia">
        <AttendancePanel businessId={businessId} groupId={groupId} onClose={close} />
      </DsFloatingPanel>
    </>
  );
}
