/**
 * Componente: Tabla de Business Types
 */

'use client';

import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  BuildingOfficeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Table } from '@shared/ui/table';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { BusinessTypeForm } from './business-type-form';
import { Modal } from '@shared/ui/modal';
import { TokenStorage } from '@shared/config';
import { createBusinessTypeAction } from '../../infrastructure/actions/business-types/create-business-type.action';
import { updateBusinessTypeAction } from '../../infrastructure/actions/business-types/update-business-type.action';
import { deleteBusinessTypeAction } from '../../infrastructure/actions/business-types/delete-business-type.action';
import { BusinessType } from '../hooks/use-business-types';

interface BusinessTypesTableProps {
  businessTypes: BusinessType[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function BusinessTypesTable({ 
  businessTypes = [], 
  loading = false, 
  onRefresh 
}: BusinessTypesTableProps) {
  
  console.log('🔍 BusinessTypesTable - Props recibidas:', { businessTypes, loading });
  console.log('🔍 BusinessTypesTable - businessTypes.length:', businessTypes.length);
  console.log('🔍 BusinessTypesTable - businessTypes:', businessTypes);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [crudLoading, setCrudLoading] = useState(false);

  const handleCreate = async (data: any) => {
    setFormLoading(true);
    
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('No hay token de autenticación disponible');
        return;
      }

      const result = await createBusinessTypeAction({
        ...data,
        token,
      });

      if (result.success) {
        setShowCreateModal(false);
        onRefresh?.();
      } else {
        console.error('Error creando tipo de negocio:', result.error);
      }
    } catch (error) {
      console.error('Error creando tipo de negocio:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedBusinessType) return;
    
    setFormLoading(true);
    
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('No hay token de autenticación disponible');
        return;
      }

      const result = await updateBusinessTypeAction({
        id: selectedBusinessType.id,
        ...data,
        token,
      });

      if (result.success) {
        setShowEditModal(false);
        setSelectedBusinessType(null);
        onRefresh?.();
      } else {
        console.error('Error actualizando tipo de negocio:', result.error);
      }
    } catch (error) {
      console.error('Error actualizando tipo de negocio:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBusinessType) return;
    
    const token = TokenStorage.getToken();
    if (!token) {
      console.error('No hay token de autenticación disponible');
      return;
    }
    
    setCrudLoading(true);
    
    try {
      const result = await deleteBusinessTypeAction({
        id: selectedBusinessType.id,
        token: token
      });
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedBusinessType(null);
        onRefresh?.();
      } else {
        console.error('Error eliminando tipo de negocio:', result.error);
      }
    } catch (error) {
      console.error('Error eliminando tipo de negocio:', error);
    } finally {
      setCrudLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (businessType: BusinessType) => {
        console.log('🔍 Renderizando businessType:', businessType);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {businessType.icon || '🏢'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{businessType.name || 'Sin nombre'}</p>
              <p className="text-sm text-gray-500">{businessType.code || 'Sin código'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (businessType: BusinessType) => (
        <p className="text-sm text-gray-600 max-w-xs truncate" title={businessType.description || 'Sin descripción'}>
          {businessType.description || 'Sin descripción'}
        </p>
      ),
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (businessType: BusinessType) => (
        <Badge 
          type={businessType.is_active ? "success" : "error"}
          className="text-xs"
        >
          {businessType.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Creado',
      render: (businessType: BusinessType) => {
        try {
          return (
            <span className="text-sm text-gray-600">
              {businessType.created_at ? formatDate(businessType.created_at) : 'Sin fecha'}
            </span>
          );
        } catch (error) {
          console.error('Error formateando fecha:', businessType.created_at, error);
          return <span className="text-sm text-gray-600">Fecha inválida</span>;
        }
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (businessType: BusinessType) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBusinessType(businessType);
              setShowEditModal(true);
            }}
            className="p-2 hover:bg-green-50 hover:text-green-600"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBusinessType(businessType);
              setShowDeleteModal(true);
            }}
            className="p-2 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Cargando tipos de negocio...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header con botón crear */}
      <div className="card w-full">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tipos de Negocio</h3>
            <Button 
              className="btn-primary" 
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Crear Tipo
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de business types */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {businessTypes.map((businessType) => (
                <tr key={businessType.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {businessType.icon || '🏢'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{businessType.name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-500">{businessType.code || 'Sin código'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {businessType.description || 'Sin descripción'}
                    </p>
                  </td>
                  <td>
                    <Badge 
                      type={businessType.is_active ? "success" : "error"}
                      className="text-xs"
                    >
                      {businessType.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">
                      {businessType.created_at ? formatDate(businessType.created_at) : 'Sin fecha'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBusinessType(businessType);
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-green-50 hover:text-green-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBusinessType(businessType);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Tipo de Negocio"
        size="lg"
      >
        <BusinessTypeForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
          mode="create"
        />
      </Modal>

      {/* Modal para editar */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBusinessType(null);
        }}
        title="Editar Tipo de Negocio"
        size="lg"
      >
        <BusinessTypeForm
          onSubmit={handleEdit}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedBusinessType(null);
          }}
          loading={formLoading}
          mode="edit"
          initialData={selectedBusinessType || {}}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBusinessType(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Tipo de Negocio"
        message={`¿Estás seguro de que quieres eliminar el tipo de negocio "${selectedBusinessType?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
