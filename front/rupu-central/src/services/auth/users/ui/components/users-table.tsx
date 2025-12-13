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
  CalendarIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Table, TableColumn, PaginationProps, TableFiltersProps } from '@shared/ui/table';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { Modal } from '@shared/ui/modal';
import { deleteUserAction } from '../../infrastructure/actions';
import { getUserByIdAction } from '../../infrastructure/actions';
import { generatePasswordAction } from '../../infrastructure/actions';
import { UserDetailModal } from './user-detail-modal';
import { TokenStorage } from '@shared/config'; 

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  is_active: boolean;
  is_super_user?: boolean;
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
  business_role_assignments?: Array<{
    business_id: number;
    business_name?: string;
    role_id: number;
    role_name: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onRefresh?: () => void;
  onEditUser?: (user: any) => void;
  onViewUser?: (user: any) => void;
  onDeleteUser?: (user: any) => void;
  onAssignRoles?: (user: any) => void;
  selectedUser?: any | null;
  isDeleteModalOpen?: boolean;
  closeDeleteModal?: () => void;
  isViewModalOpen?: boolean;
  closeViewModal?: () => void;
  // Props de paginación
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Props de filtros
  filters?: TableFiltersProps;
}

export function UsersTable({ 
  users = [], 
  loading = false, 
  onRefresh,
  onEditUser,
  onViewUser,
  onDeleteUser,
  onAssignRoles,
  selectedUser,
  isDeleteModalOpen,
  closeDeleteModal,
  isViewModalOpen,
  closeViewModal,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  filters
}: UsersTableProps) {
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPasswordData, setGeneratedPasswordData] = useState<{ email?: string; password?: string; message?: string } | null>(null);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] = useState(false);
  const [userToGeneratePassword, setUserToGeneratePassword] = useState<User | null>(null);

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    const token = TokenStorage.getBusinessToken();
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

  const handleOpenConfirmPasswordModal = (user: User) => {
    setUserToGeneratePassword(user);
    setShowConfirmPasswordModal(true);
  };

  const handleCloseConfirmPasswordModal = () => {
    setShowConfirmPasswordModal(false);
    setUserToGeneratePassword(null);
  };

  const handleGeneratePassword = async () => {
    if (!userToGeneratePassword) return;
    
    const token = TokenStorage.getBusinessToken();
    if (!token) {
      console.error('No hay token de autenticación disponible');
      return;
    }
    
    setGeneratingPassword(true);
    setPasswordCopied(false);
    setEmailCopied(false);
    setShowConfirmPasswordModal(false);
    
    try {
      const result = await generatePasswordAction({
        token,
        user_id: userToGeneratePassword.id,
      });
      
      if (result.success && result.data) {
        setGeneratedPasswordData(result.data);
        setShowPasswordModal(true);
      } else {
        console.error('Error generando contraseña:', result.error);
        alert(result.error || 'Error al generar contraseña');
      }
    } catch (error) {
      console.error('Error generando contraseña:', error);
      alert('Error al generar contraseña');
    } finally {
      setGeneratingPassword(false);
      setUserToGeneratePassword(null);
    }
  };

  const handleCopyPassword = () => {
    if (generatedPasswordData?.password) {
      navigator.clipboard.writeText(generatedPasswordData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const handleCopyEmail = () => {
    if (generatedPasswordData?.email) {
      navigator.clipboard.writeText(generatedPasswordData.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPasswordData(null);
    setPasswordCopied(false);
    setEmailCopied(false);
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

  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      label: 'Usuario',
      render: (_, user) => (
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
      ),
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (_, user) => (
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
      ),
    },
    {
      key: 'roles',
      label: 'Roles por Negocio',
      render: (_, user) => (
        <div className="flex flex-wrap gap-2">
          {user.is_super_user ? (
            <Badge className="text-xs bg-purple-100 text-purple-700">Super Administrador</Badge>
          ) : user.business_role_assignments && user.business_role_assignments.length > 0 ? (
            user.business_role_assignments.map((bra, idx) => (
              <div
                key={`${bra.business_id}-${bra.role_id}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs bg-green-100 text-green-800"
              >
                <span className="font-medium">{bra.business_name || `Negocio ${bra.business_id}`}</span>
                <span className="text-green-600">:</span>
                <span>{bra.role_name}</span>
              </div>
            ))
          ) : (
            <Badge className="text-xs bg-gray-100 text-gray-600">Sin rol asignado</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_, user) => (
        <Badge 
          type={user.is_active ? "success" : "error"}
          className="text-xs"
        >
          {user.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'last_login',
      label: 'Último acceso',
      render: (_, user) => (
        <div className="text-sm text-gray-600">
          {user.last_login_at ? (
            <span title={formatDateTime(user.last_login_at)}>
              {formatDate(user.last_login_at)}
            </span>
          ) : (
            <span className="text-gray-400">Nunca</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center',
      render: (_, user) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewUser?.(user)}
            className="p-2 hover:bg-blue-50 hover:text-blue-600"
            title="Ver detalles"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditUser?.(user)}
            className="p-2 hover:bg-green-50 hover:text-green-600"
            title="Editar usuario"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAssignRoles?.(user)}
            className="p-2 hover:bg-purple-50 hover:text-purple-600"
            title="Asignar roles"
          >
            <ShieldCheckIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenConfirmPasswordModal(user)}
            disabled={generatingPassword}
            className="p-2 hover:bg-yellow-50 hover:text-yellow-600 disabled:opacity-50"
            title="Generar nueva contraseña"
          >
            <KeyIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteUser?.(user)}
            className="p-2 hover:bg-red-50 hover:text-red-600"
            title="Eliminar usuario"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const pagination: PaginationProps | undefined = onPageChange ? {
    currentPage,
    totalPages,
    totalItems: totalCount,
    itemsPerPage: pageSize,
    onPageChange,
    onItemsPerPageChange: onPageSizeChange,
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  } : undefined;

  return (
    <>
      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No hay usuarios disponibles"
        keyExtractor={(user) => user.id.toString()}
        pagination={pagination}
        filters={filters}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen || false}
        onClose={closeDeleteModal || (() => {})}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de confirmación para generar contraseña */}
      <ConfirmModal
        isOpen={showConfirmPasswordModal}
        onClose={handleCloseConfirmPasswordModal}
        onConfirm={handleGeneratePassword}
        title="Generar Nueva Contraseña"
        message={`¿Estás seguro de que quieres generar una nueva contraseña para el usuario "${userToGeneratePassword?.name}" (${userToGeneratePassword?.email})? Esta acción cambiará la contraseña actual y solo podrás ver la nueva contraseña una vez.`}
        confirmText="Generar Contraseña"
        cancelText="Cancelar"
        type="warning"
      />

      {/* Modal de detalles del usuario */}
      <UserDetailModal
        isOpen={isViewModalOpen || false}
        onClose={closeViewModal || (() => {})}
        user={selectedUser}
      />

      {/* Modal para mostrar contraseña generada */}
      <Modal
        isOpen={showPasswordModal}
        onClose={handleClosePasswordModal}
        title="Nueva Contraseña Generada"
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono text-gray-900">
                  {generatedPasswordData?.email || 'N/A'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Copiar email"
                >
                  {emailCopied ? (
                    <CheckIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña generada:
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono text-gray-900">
                  {generatedPasswordData?.password || 'N/A'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Copiar contraseña"
                >
                  {passwordCopied ? (
                    <CheckIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Esta contraseña solo se muestra una vez. Asegúrate de copiarla y guardarla de forma segura.
          </p>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="primary"
              onClick={handleClosePasswordModal}
              className="btn-primary"
            >
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
