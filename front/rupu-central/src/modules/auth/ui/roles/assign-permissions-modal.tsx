/**
 * Componente: Modal para Asignar Permisos a un Rol
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@shared/ui/modal';
import { Button } from '@shared/ui/button';
import { XMarkIcon, KeyIcon } from '@heroicons/react/24/outline';
import { getPermissionsListAction, getRolePermissionsAction, removeRolePermissionAction } from '@modules/auth/infrastructure/actions';
import { TokenStorage } from '@shared/config';

export interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | null;
  roleName?: string;
  onAssign: (roleId: number, permissionIds: number[]) => Promise<void>;
  onRemove?: (roleId: number, permissionId: number) => Promise<void>;
  loading?: boolean;
}

export function AssignPermissionsModal({
  isOpen,
  onClose,
  roleId,
  roleName = 'el rol',
  onAssign,
  onRemove,
  loading = false
}: AssignPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Cargar permisos disponibles y permisos del rol
  useEffect(() => {
    if (isOpen && roleId) {
      loadPermissions();
    }
  }, [isOpen, roleId]);

  const loadPermissions = async () => {
    setFetchLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('No hay token disponible');
        setFetchLoading(false);
        return;
      }

      // Cargar todos los permisos disponibles
      const allPermissionsResult = await getPermissionsListAction(token);
      
      // Cargar permisos asignados al rol
      const rolePermissionsResult = await getRolePermissionsAction(
        { role_id: roleId },
        token
      );
      
      console.log('🔍 loadPermissions - Resultados:', {
        allPermissions: allPermissionsResult.success ? allPermissionsResult.data?.permissions.length : 0,
        rolePermissions: rolePermissionsResult.success ? rolePermissionsResult.data?.permissions.length : 0
      });
      
      if (allPermissionsResult.success && allPermissionsResult.data) {
        setPermissions(allPermissionsResult.data.permissions);
      }
      
      if (rolePermissionsResult.success && rolePermissionsResult.data) {
        const assignedIds = rolePermissionsResult.data.permissions.map(p => p.id);
        setRolePermissions(assignedIds);
        setSelectedPermissions(assignedIds);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async () => {
    if (!roleId || selectedPermissions.length === 0) {
      return;
    }
    
    await onAssign(roleId, selectedPermissions);
    setSelectedPermissions([]);
  };
  
  const handleRemovePermission = async (permissionId: number) => {
    if (!roleId || !onRemove) return;
    
    try {
      await onRemove(roleId, permissionId);
      // Actualizar la lista de permisos seleccionados
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    } catch (error) {
      console.error('Error removiendo permiso:', error);
    }
  };

  const handleClose = () => {
    setSelectedPermissions([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Asignar Permisos"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Selecciona los permisos que deseas asignar a {roleName}.
        </p>

        {fetchLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {permissions.map(permission => (
              <label
                key={permission.id}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedPermissions.includes(permission.id) ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handleTogglePermission(permission.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {permission.name}
                  </div>
                  {permission.description && (
                    <div className="text-sm text-gray-500">
                      {permission.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        {selectedPermissions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-900">
              <strong>{selectedPermissions.length}</strong> permiso{selectedPermissions.length !== 1 ? 's' : ''} seleccionado{selectedPermissions.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || selectedPermissions.length === 0}
          >
            <KeyIcon className="w-4 h-4 mr-2" />
            {loading ? 'Asignando...' : 'Asignar Permisos'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

