/**
 * A4 · Asistencia del grupo de votación.
 */

'use client';

import { useParams } from 'next/navigation';
import { AttendancePanel } from '@/services/modules/horizontal-properties/voting/ui/attendance-panel';

export default function AttendanceManagementPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);
  const groupId = parseInt(params.groupId as string);

  if (isNaN(businessId) || isNaN(groupId)) {
    return <div className="p-6 text-red-600">Grupo de votación inválido</div>;
  }

  return <AttendancePanel businessId={businessId} groupId={groupId} />;
}
