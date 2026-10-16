/**
 * Poderes y exportar de una lista de asistencia: modal flotante (90 %) sobre los grupos de
 * votación, con el fondo difuminado. Al cerrarlo se vuelve a la asistencia del grupo.
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AttendanceListModal } from '@/services/modules/horizontal-properties/attendance/ui';
import { removeAttendanceListAction, getAttendanceListAction, getAttendanceListRecordsAction, getAttendanceListSummaryAction } from '@/services/modules/horizontal-properties/attendance/infrastructure/actions';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { TokenStorage } from '@shared/config';
import { Spinner } from '@shared/ui';
import { DsFloatingPanel, VtNotice } from '@shared/ui/ds';
import { VotingGroupsSection } from '@/services/modules/horizontal-properties/voting/ui/voting-groups-section';
import { AttendanceList } from '@/services/modules/horizontal-properties/attendance/domain/entities';

export default function AttendanceListPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [attendanceList, setAttendanceList] = useState<AttendanceList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const businessId = parseInt(params.id as string);
  const groupId = parseInt(params.groupId as string);
  const attendanceListId = parseInt(params.attendanceListId as string);

  useEffect(() => {
    const userToken = TokenStorage.getBusinessToken();
    if (!userToken) {
      router.push('/login');
      return;
    }
    setToken(userToken);
  }, [router]);

  // Cargar lista cuando el token esté disponible o cambie el ID
  useEffect(() => {
    if (!token) return;
    loadAttendanceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, attendanceListId]);

  const loadAttendanceList = async () => {
    setLoading(true);
    setError(null);

    try {
      const [listRes] = await Promise.all([
        getAttendanceListAction({ token, id: attendanceListId }),
      ]);

      if (!listRes.success || !listRes.data) throw new Error(listRes.error || 'No se pudo obtener la lista');
      setAttendanceList(listRes.data);
    } catch (err) {
      setError('Error al cargar la lista de asistencia');
      console.error('Error loading attendance list:', err);
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async () => {
    if (!token || !attendanceList) return;
    setDeleting(true);
    setError(null);
    try {
      const result = await removeAttendanceListAction({
        token,
        id: attendanceList.id,
        businessId,
      });
      if (result.success) {
        router.push(`/properties/${businessId}/voting-groups/${groupId}/attendance`);
      } else {
        setError(result.error || 'No se pudo eliminar la lista');
      }
    } catch (err) {
      setError('Error al eliminar la lista');
    } finally {
      setDeleting(false);
    }
  };
  const handleDeleteList = () => setShowConfirm(true);

  const close = () => router.push(`/properties/${businessId}/voting-groups/${groupId}/attendance`);

  return (
    <>
      <VotingGroupsSection businessId={businessId} />
      {attendanceList && token && !loading ? (
        <AttendanceListModal
          isOpen={true}
          onClose={close}
          attendanceList={attendanceList}
          token={token}
          businessId={businessId}
          onDeleteList={handleDeleteList}
          deleting={deleting}
        />
      ) : (
        <DsFloatingPanel onClose={close} ariaLabel="Poderes y exportar">
          <div className="p-6 md:p-8">
            {loading || !token ? (
              <div className="flex justify-center py-16">
                <Spinner size="md" text="Cargando lista de asistencia..." />
              </div>
            ) : (
              <VtNotice>{error || 'Lista de asistencia no encontrada'}</VtNotice>
            )}
          </div>
        </DsFloatingPanel>
      )}
      {attendanceList && (
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={performDelete}
          title="Eliminar lista"
          message={`¿Estás seguro de eliminar la lista "${attendanceList.title}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </>
  );
}
