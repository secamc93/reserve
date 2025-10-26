/**
 * Componente de tabla de usuarios
 * Aplica estilos globales y usa componentes reutilizables
 */

'use client';

import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Table } from '@shared/ui/table';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { deleteUserAction } from '../../../infrastructure/actions/users/delete-user.action';
import { getUserByIdAction } from '../../../infrastructure/actions/users/get-user-by-id.action';
import { UserDetailModal } from './user-detail-modal';
import { TokenStorage } from '../../../infrastructure/storage/token.storage';

interface UsersTableProps {
  users: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar_url?: string;
    is_active: boolean;
    last_login_at?: string;
    roles: Array<{
      id: number;
      name: string;
      description: string;
    }>;
    businesses: Array<{
      id: number;
      name: string;
      logo_url: string;
    }>;
    created_at: string;
    updated_at: string;
  }>;
  loading?: boolean;
  onRefresh?: () => void;
  onEditUser?: (user: any) => void;
  onViewUser?: (user: any) => void;
  onDeleteUser?: (user: any) => void;
  selectedUser?: any | null;
  isDeleteModalOpen?: boolean;
  closeDeleteModal?: () => void;
  isViewModalOpen?: boolean;
  closeViewModal?: () => void;
}

export function UsersTable({ 
  users = [], 
  loading = false, 
  onRefresh,
  onEditUser,
  onViewUser,
  onDeleteUser,
  selectedUser,
  isDeleteModalOpen,
  closeDeleteModal,
  isViewModalOpen,
  closeViewModal
}: UsersTableProps) {
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    const token = TokenStorage.getToken();
    if (!token) {
      console.error('No hay token de autenticación disponible');
      return;
    }
    
    setCrudLoading(true);
    setDeletingId(selectedUser.id);
    
    try {
      const result = await deleteUserAction({
        id: selectedUser.id,
        token: token
      });
      
      if (result.success) {
        onRefresh?.();
        closeDeleteModal?.();
      } else {
        console.error('Error eliminando usuario:', result.error);
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    } finally {
      setCrudLoading(false);
      setDeletingId(null);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Usuario
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5" />
                    Contacto
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Roles</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Último acceso
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!users || users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No hay usuarios</p>
                    <p className="text-sm">Los usuarios aparecerán aquí cuando se agreguen</p>
                  </td>
                </tr>
              ) : (
                (users || []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Lógica de roles: mostrar rol global para usuarios de plataforma (scope_id: 1)
                          // o rol específico del business para usuarios de negocio
                          const platformRoles = user.roles.filter(role => role.scope_id === 1);
                          const businessRoles = user.roles.filter(role => role.scope_id !== 1);
                          
                          if (platformRoles.length > 0) {
                            // Usuario de plataforma: mostrar rol global
                            return platformRoles.map((role) => (
                              <Badge key={role.id} type="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {role.name}
                              </Badge>
                            ));
                          } else if (user.businesses.length > 0) {
                            // Usuario de negocio: mostrar business y rol como un solo elemento
                            return user.businesses.map((business) => {
                              const businessRole = businessRoles.find(role => 
                                // Aquí necesitaríamos mapear el role del business, pero por ahora mostramos el business
                                true
                              );
                              return (
                                <div key={business.id} className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                                  businessRole ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                  <span className={`font-medium ${
                                    businessRole ? 'text-green-800' : 'text-gray-700'
                                  }`}>
                                    {business.name}
                                  </span>
                                  <span className={`mx-1 ${
                                    businessRole ? 'text-green-600' : 'text-gray-500'
                                  }`}>
                                    :
                                  </span>
                                  <span className={`${
                                    businessRole ? 'text-green-700' : 'text-gray-600'
                                  }`}>
                                    {businessRole ? businessRole.name : 'Sin rol'}
                                  </span>
                                </div>
                              );
                            });
                          } else {
                            // Sin roles asignados
                            return (
                              <Badge type="secondary" className="text-xs bg-gray-100 text-gray-600">
                                Sin rol asignado
                              </Badge>
                            );
                          }
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        type={user.is_active ? "success" : "error"}
                        className="text-xs"
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {user.last_login_at ? (
                          <span title={formatDateTime(user.last_login_at)}>
                            {formatDate(user.last_login_at)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewUser?.(user)}
                          className="p-2 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditUser?.(user)}
                          className="p-2 hover:bg-green-50 hover:text-green-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteUser?.(user)}
                          className="p-2 hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen || false}
        onClose={closeDeleteModal || (() => {})}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={crudLoading && deletingId === selectedUser?.id}
      />

      {/* Modal de detalles del usuario */}
      <UserDetailModal
        isOpen={isViewModalOpen || false}
        onClose={closeViewModal || (() => {})}
        user={selectedUser}
      />
    </>
  );
}
