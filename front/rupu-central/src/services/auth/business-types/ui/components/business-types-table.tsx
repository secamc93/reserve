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
import { Table, TableColumn, PaginationProps, TableFiltersProps } from '@shared/ui/table';
import { ConfirmModal } from '@shared/ui/confirm-modal';
import { BusinessTypeForm } from './business-type-form';
import { Modal } from '@shared/ui/modal';
import { TokenStorage } from '@shared/config';
import { createBusinessTypeAction, updateBusinessTypeAction, deleteBusinessTypeAction } from '../../infrastructure/actions';
import { BusinessType } from '../../domain/entities';

interface BusinessTypesTableProps {
  businessTypes: BusinessType[];
  loading?: boolean;
  onRefresh?: () => void;
  // Props de paginación
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Props de filtros
  filters?: TableFiltersProps;
  // Callback para abrir modal de crear (opcional)
  onCreateClick?: () => void;
}

export function BusinessTypesTable({ 
  businessTypes = [], 
  loading = false, 
  onRefresh,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  filters,
  onCreateClick
}: BusinessTypesTableProps) {
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [crudLoading, setCrudLoading] = useState(false);

  const handleCreate = async (data: any) => {
    setFormLoading(true);
    
    try {
      const token = TokenStorage.getBusinessToken();
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
      const token = TokenStorage.getBusinessToken();
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
    
    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
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

  const columns: TableColumn<BusinessType>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (_, businessType) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {businessType.icon || '🏢'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{businessType.name || 'Sin nombre'}</p>
            <p className="text-sm text-gray-500">{businessType.code || 'Sin código'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (_, businessType) => (
        <p className="text-sm text-gray-600 max-w-xs truncate" title={businessType.description || 'Sin descripción'}>
          {businessType.description || 'Sin descripción'}
        </p>
      ),
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (_, businessType) => (
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
      render: (_, businessType) => {
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
      align: 'center',
      render: (_, businessType) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBusinessType(businessType);
              setShowEditModal(true);
            }}
            className="p-2 hover:bg-green-50 hover:text-green-600"
            title="Editar tipo de negocio"
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
            title="Eliminar tipo de negocio"
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

  // Si hay filtros, agregar el botón de crear si no está presente
  const filtersWithCreateButton = filters ? {
    ...filters,
    headerActions: filters.headerActions || (
      <Button
        variant="primary"
        onClick={() => {
          if (onCreateClick) {
            onCreateClick();
          } else {
            setShowCreateModal(true);
          }
        }}
        className="btn-primary"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Crear Tipo
      </Button>
    ),
  } : undefined;

  return (
    <>
      <Table
        columns={columns}
        data={businessTypes}
        loading={loading}
        emptyMessage="No hay tipos de negocio disponibles"
        keyExtractor={(businessType) => businessType.id.toString()}
        pagination={pagination}
        filters={filtersWithCreateButton}
      />

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
