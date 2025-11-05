/**
 * Page: Specific Attendance List Management
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PropertyNavigation } from '@modules/property-horizontal/ui/components';
import { AttendanceListModal } from '@modules/property-horizontal/ui/attendance';
import { removeAttendanceListAction, getAttendanceListAction, getAttendanceListRecordsAction, getAttendanceListSummaryAction } from '@modules/property-horizontal/infrastructure/actions/attendance';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { TokenStorage } from '@shared/config';
import { AttendanceList } from '@modules/property-horizontal/domain/entities/attendance';

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
    const userToken = TokenStorage.getToken();
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
      const result = await removeAttendanceListAction({ token, id: attendanceList.id });
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

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PropertyNavigation
          businessId={businessId}
          currentSection="attendance"
          groupId={groupId}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !attendanceList) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PropertyNavigation
          businessId={businessId}
          currentSection="attendance"
          groupId={groupId}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error || 'Lista de asistencia no encontrada'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PropertyNavigation
        businessId={businessId}
        currentSection="attendance"
        groupId={groupId}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
            </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {attendanceList.title}
          </h1>
          {attendanceList.description && (
            <p className="text-gray-600 mt-2">
              {attendanceList.description}
            </p>
          )}

          <div className="mt-4">
            <button
              onClick={handleDeleteList}
              disabled={deleting}
              className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
            >
              {deleting ? 'Eliminando...' : 'Eliminar lista'}
            </button>
          </div>
        </div>

        {/* Attendance List Modal Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <AttendanceListModal
            isOpen={true}
            onClose={() => router.back()}
            attendanceList={attendanceList}
            token={token}
            businessId={businessId}
          />
        </div>

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
      </div>
    </div>
  );
}
