 /**
 * Component: Attendance Management for Voting Groups
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Using CSS classes for buttons instead of Button component
import { createAttendanceListAction, generateAttendanceListAction, listAttendanceListsAction, removeAttendanceListAction } from '../../infrastructure/actions/attendance';
import { AttendanceList } from '../../domain/entities/attendance';
import { CreateAttendanceListModal } from './create-attendance-list-modal';
import { AttendanceListModal } from './attendance-list-modal';
import { AttendanceSummaryModal } from './attendance-summary-modal';
import { ConfirmModal } from '@shared/ui';

interface AttendanceManagementProps {
  votingGroupId: number;
  votingGroupName: string;
  token: string;
  businessId: number;
  useRoutes?: boolean; // If true, navigate to routes instead of opening modals
}

export function AttendanceManagement({
  votingGroupId,
  votingGroupName,
  token,
  businessId,
  useRoutes = false,
}: AttendanceManagementProps) {
  const router = useRouter();
  const [attendanceLists, setAttendanceLists] = useState<AttendanceList[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedAttendanceList, setSelectedAttendanceList] = useState<AttendanceList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attendanceListToDelete, setAttendanceListToDelete] = useState<AttendanceList | null>(null);

  // Cargar listas existentes al abrir
  useEffect(() => {
    const loadLists = async () => {
      try {
        const result = await listAttendanceListsAction({ token, businessId, votingGroupId });
        if (result.success && result.data) {
          setAttendanceLists(result.data);
        }
      } catch {
        // silencioso si no está implementado en backend aún
      }
    };
    if (token && businessId && votingGroupId) loadLists();
  }, [token, businessId, votingGroupId]);

  const handleCreateAttendanceList = async (data: {
    title: string;
    description?: string;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createAttendanceListAction({
        token,
        data: {
          votingGroupId,
          title: data.title,
          description: data.description,
          notes: data.notes,
        },
      });

      if (result.success && result.data) {
        setAttendanceLists(prev => [result.data!, ...prev]);
        setShowCreateModal(false);
        
        if (useRoutes) {
          // Navigate to the specific attendance list page
          router.push(`/properties/${businessId}/voting-groups/${votingGroupId}/attendance/${result.data.id}`);
        } else {
          // Abrir automáticamente la lista creada en modal
          setSelectedAttendanceList(result.data);
          setShowAttendanceModal(true);
        }
      } else {
        setError(result.error || 'Error al crear la lista de asistencia');
      }
    } catch (error) {
      setError('Error inesperado al crear la lista de asistencia');
      console.error('Error creating attendance list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAttendanceList = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAttendanceListAction({
        token,
        votingGroupId,
      });

      if (result.success && result.data) {
        setAttendanceLists(prev => [result.data!, ...prev]);
        
        if (useRoutes) {
          // Navigate to the specific attendance list page
          router.push(`/properties/${businessId}/voting-groups/${votingGroupId}/attendance/${result.data.id}`);
        } else {
          // Abrir automáticamente la lista generada en modal
          setSelectedAttendanceList(result.data);
          setShowAttendanceModal(true);
        }
      } else {
        setError(result.error || 'Error al generar la lista de asistencia');
      }
    } catch (error) {
      setError('Error inesperado al generar la lista de asistencia');
      console.error('Error generating attendance list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAttendanceList = (attendanceList: AttendanceList) => {
    if (useRoutes) {
      // Navigate to the specific attendance list page
      router.push(`/properties/${businessId}/voting-groups/${votingGroupId}/attendance/${attendanceList.id}`);
    } else {
      // Open modal
      setSelectedAttendanceList(attendanceList);
      setShowAttendanceModal(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestión de Asistencia
          </h3>
          <p className="text-sm text-gray-600">
            Gestiona la asistencia para: {votingGroupName}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          📝 Crear Lista Manual
        </button>
        
        <button
          onClick={handleGenerateAttendanceList}
          disabled={loading}
          className="btn btn-outline flex items-center gap-2"
        >
          ⚡ Generar Lista Automática
        </button>
      </div>

      {/* Attendance Lists */}
      {attendanceLists.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Listas de Asistencia</h4>
          {attendanceLists.map((list) => (
            <div
              key={list.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{list.title}</h5>
                  {list.description && (
                    <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>ID: {list.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      list.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {list.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                    <span>Creada: {new Date(list.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenAttendanceList(list)}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                  >
                    📋 Abrir Lista
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAttendanceList(list);
                      setShowSummaryModal(true);
                    }}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    📊 Resumen
                  </button>
                  <button
                    onClick={() => {
                      setAttendanceListToDelete(list);
                      setShowDeleteConfirm(true);
                    }}
                    className="btn btn-error btn-sm flex items-center gap-2"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {attendanceLists.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay listas de asistencia
          </h3>
          <p className="text-gray-600 mb-4">
            Crea una lista manual o genera una automática para comenzar a gestionar la asistencia.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Procesando...</p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateAttendanceListModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAttendanceList}
          votingGroupName={votingGroupName}
        />
      )}

      {showAttendanceModal && selectedAttendanceList && (
        <AttendanceListModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          attendanceList={selectedAttendanceList}
          token={token}
          businessId={businessId}
        />
      )}

      {showSummaryModal && selectedAttendanceList && (
        <AttendanceSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          attendanceListId={selectedAttendanceList.id}
          token={token}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar lista de asistencia"
        message="Esta acción eliminará de forma permanente la lista de asistencia seleccionada. ¿Deseas continuar?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onClose={() => {
          setShowDeleteConfirm(false);
          setAttendanceListToDelete(null);
        }}
        onConfirm={async () => {
          if (!attendanceListToDelete) return;
          setLoading(true);
          setError(null);
          try {
            const result = await removeAttendanceListAction({
              token,
              id: attendanceListToDelete.id,
              businessId,
            });

            if (result.success) {
              setAttendanceLists(prev => prev.filter(list => list.id !== attendanceListToDelete.id));
              setShowDeleteConfirm(false);
              setAttendanceListToDelete(null);
            } else {
              setError(result.error || 'Error al eliminar la lista de asistencia');
            }
          } catch (err) {
            console.error('Error deleting attendance list:', err);
            setError('Error inesperado al eliminar la lista de asistencia');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
