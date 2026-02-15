/**
 * Componente: Sección de Grupos de Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge, Spinner } from '@shared/ui';
import { CreateVotingGroupModal } from './create-voting-group-modal';
import { EditVotingGroupModal } from './edit-voting-group-modal';
import { DeleteVotingGroupModal } from './delete-voting-group-modal';
import { VotingsList } from './votings-list';
import { AttendanceManagement } from '../../attendance/ui/attendance-management';
import { TokenStorage } from '@shared/config';
import { getVotingGroupsAction } from '../infrastructure/actions';
import { generateGroupPublicUrlAction } from '../infrastructure/actions/public-voting';

interface VotingGroup {
  id: number;
  businessId: number;
  name: string;
  description: string;
  votingStartDate: string;
  votingEndDate: string;
  isActive: boolean;
  requiresQuorum: boolean;
  quorumPercentage: number;
  createdByUserId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VotingGroupsSectionProps {
  businessId: number;
}

export function VotingGroupsSection({ businessId }: VotingGroupsSectionProps) {
  const [votingGroups, setVotingGroups] = useState<VotingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<VotingGroup | null>(null); // Still needed for edit/delete modals
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [attendanceGroupId, setAttendanceGroupId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string>('');
  const [showGroupQRModal, setShowGroupQRModal] = useState(false);
  const [groupQRData, setGroupQRData] = useState<{
    qrDataUrl: string;
    publicUrl: string;
    groupName: string;
    votingsCount: number;
  } | null>(null);

  useEffect(() => {
    loadVotingGroups();
  }, [businessId]);

  useEffect(() => {
    const token = TokenStorage.getBusinessToken();
    if (token) {
      setUserToken(token);
    }
  }, []);

  const loadVotingGroups = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        console.error('❌ No hay business token disponible. Debe seleccionar un negocio primero.');
        setLoading(false);
        return;
      }

      const result = await getVotingGroupsAction({
        token,
        businessId,
      });

      if (result.success && result.data) {
        setVotingGroups(result.data);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar grupos de votación:', error);
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    console.log('✅ Grupo de votación creado exitosamente');
    loadVotingGroups();
  };

  const handleEditClick = (group: VotingGroup) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    console.log('✅ Grupo de votación editado exitosamente');
    loadVotingGroups();
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedGroup(null);
  };

  const handleDeleteClick = (group: VotingGroup) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    console.log('✅ Grupo de votación eliminado exitosamente');
    loadVotingGroups();
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setSelectedGroup(null);
  };

  const handleAttendanceToggle = (group: VotingGroup) => {
    setAttendanceGroupId(prev => (prev === group.id ? null : group.id));
    setExpandedGroupId(group.id);
  };

  const handleToggleGroup = (groupId: number) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const handleGenerateGroupQR = async (group: VotingGroup) => {
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        alert('Error: No hay token de autenticación');
        return;
      }

      console.log('📱 [GROUP QR] Generando QR para grupo:', group.name);

      const result = await generateGroupPublicUrlAction({
        token,
        businessId: group.businessId,
        groupId: group.id,
        durationHours: 24
      });

      if (result.success && result.data) {
        console.log('✅ [GROUP QR] URL generada:', result.data.public_url);

        // Generar imagen QR con librería qrcode
        const QRCode = await import('qrcode');
        const qrDataURL = await QRCode.default.toDataURL(result.data.public_url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setGroupQRData({
          qrDataUrl: qrDataURL,
          publicUrl: result.data.public_url,
          groupName: result.data.group_name,
          votingsCount: result.data.votings_count
        });
        setShowGroupQRModal(true);
      } else {
        throw new Error(result.error || 'Error al generar URL pública');
      }
    } catch (err) {
      console.error('❌ [GROUP QR] Error generando QR de grupo:', err);
      alert('Error al generar el código QR del grupo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" text="Cargando grupos de votación..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary ml-auto"
        >
          + Crear Grupo de Votación
        </button>
      </div>

      {/* Contenido */}
      <div>
        {votingGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay grupos de votación creados
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primer grupo de votación para comenzar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
            >
              Crear Primer Grupo
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {votingGroups.map((group) => {
              const isExpanded = expandedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="w-full rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
                  }}
                >
                  {/* Header del Grupo */}
                  <div className="p-6">
                    {/* Fila 1: Título centrado */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white text-center">
                          {group.name}
                        </h3>
                      </div>
                    </div>

                    {/* Fila 2: Badge + Información + Botones */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Lado izquierdo: Badge + Info */}
                      <div className="flex items-center gap-3 flex-1">
                        {/* Badge de estado */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold whitespace-nowrap ${group.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                          }`}>
                          {group.isActive ? 'Activa' : 'Inactiva'}
                        </span>

                        {/* Información en una fila con efectos */}
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">Inicio:</span>
                            <span className="font-medium">{new Date(group.votingStartDate).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">Fin:</span>
                            <span className="font-medium">{new Date(group.votingEndDate).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </span>
                          {group.requiresQuorum && (
                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="font-semibold">Quórum:</span>
                              <span className="font-medium">{group.quorumPercentage}% (7/10)</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span className="font-semibold">Cantidad de votaciones:</span>
                            <span className="font-medium">-</span>
                          </span>

                        </div>
                      </div>

                      {/* Lado derecho: Botones de acción */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(group);
                          }}
                          className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                          title="Editar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(group);
                          }}
                          className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                          title="Eliminar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Botón QR del grupo */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateGroupQR(group);
                          }}
                          className="p-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors"
                          title="Generar QR del grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleToggleGroup(group.id)}
                          className="p-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-all"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          title={isExpanded ? 'Contraer' : 'Expandir'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Votaciones del Grupo (Expandible) */}
                  {isExpanded && (
                    <div className="mt-4 space-y-6 pt-4 border-t border-white/20">
                      {/* Descripción del grupo con efecto visual */}
                      {group.description && (
                        <div className="px-6">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-md">
                            <p className="text-white/90 text-sm leading-relaxed">
                              <span className="font-semibold text-white">Descripción: </span>
                              {group.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Gestión de Asistencia - Siempre visible */}
                      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mx-6">
                        {userToken ? (
                          <AttendanceManagement
                            votingGroupId={group.id}
                            votingGroupName={group.name}
                            token={userToken}
                            businessId={businessId}
                            useRoutes={false}
                          />
                        ) : (
                          <div className="text-sm text-gray-500">
                            Selecciona un negocio para cargar las listas de asistencia.
                          </div>
                        )}
                      </div>

                      <VotingsList
                        businessId={businessId}
                        groupId={group.id}
                        groupName={group.name}
                        onToggleAttendance={() => handleAttendanceToggle(group)}
                        isAttendanceVisible={attendanceGroupId === group.id}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de creación */}
      <CreateVotingGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        businessId={businessId}
      />

      {/* Modal de edición */}
      {selectedGroup && (
        <EditVotingGroupModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
          businessId={businessId}
          group={selectedGroup}
        />
      )}

      {/* Modal de eliminación */}
      {selectedGroup && (
        <DeleteVotingGroupModal
          isOpen={showDeleteModal}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
          businessId={businessId}
          group={selectedGroup}
        />
      )}

      {/* Modal QR del grupo */}
      {showGroupQRModal && groupQRData && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📱 QR del Grupo de Votación
              </h2>
              <button
                onClick={() => setShowGroupQRModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                <h3 className="text-lg font-semibold text-blue-900 text-center">
                  {groupQRData.groupName}
                </h3>
                <p className="text-sm text-blue-700 text-center mt-2">
                  Acceso a {groupQRData.votingsCount} {groupQRData.votingsCount === 1 ? 'votación' : 'votaciones'} del grupo
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-4 border-gray-200">
                <img
                  src={groupQRData.qrDataUrl}
                  alt="QR Code del Grupo"
                  className="w-80 h-80"
                />
              </div>

              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1 font-semibold">URL Pública:</p>
                <p className="text-sm text-gray-900 font-mono break-all">
                  {groupQRData.publicUrl}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(groupQRData.publicUrl);
                    alert('✅ URL copiada al portapapeles');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar URL
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `qr-grupo-${groupQRData.groupName.replace(/\s+/g, '-').toLowerCase()}.png`;
                    link.href = groupQRData.qrDataUrl;
                    link.click();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar QR
                </button>
              </div>

              <button
                onClick={() => setShowGroupQRModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestión de asistencia - Removed, now using routes */}
    </div>
  );
}

