/**
 * Componente: Tabla de Resources (Módulos)
 * Muestra los módulos/recursos del sistema en una tabla con paginación
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, ConfirmModal, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getResourcesAction } from '../../infrastructure/actions/get-resources.action';
import { deleteResourceAction } from '../../infrastructure/actions/delete-resource.action';
import { CreateResourceModal } from './create-resource-modal';
import { EditResourceModal } from './edit-resource-modal';

interface Resource {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function ResourcesTable() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadResources();
  }, [page]);

  const loadResources = async () => {
    setLoading(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
      }

      const result = await getResourcesAction({
        page,
        pageSize,
        token,
      });

      if (result.success && result.data) {
        setResources(result.data.resources);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar recursos:', error);
    }

    setLoading(false);
  };

  const resourcesColumns: TableColumn<Resource>[] = [
    { key: 'id', label: 'ID', width: '80px', align: 'center' },
    { key: 'name', label: 'Nombre', width: '200px' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'createdAt',
      label: 'Fecha Creación',
      width: '180px',
      render: (value) => new Date(String(value)).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '120px',
      align: 'center',
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleEditClick(row)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Editar módulo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Eliminar módulo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )
    },
  ];

  const handleCreateSuccess = () => {
    // Recargar la primera página al crear un nuevo recurso
    setPage(1);
    loadResources();
  };

  const handleEditClick = (resource: Resource) => {
    setEditResource(resource);
  };

  const handleEditSuccess = () => {
    loadResources();
  };

  const handleDeleteClick = (resource: Resource) => {
    setDeleteConfirm({ id: resource.id, name: resource.name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        console.error('❌ No hay token disponible');
        setIsDeleting(false);
        return;
      }

      const result = await deleteResourceAction({
        id: deleteConfirm.id,
        token,
      });

      if (result.success) {
        // Recargar la lista
        loadResources();
        setDeleteConfirm(null);
      } else {
        console.error('❌ Error al eliminar:', result.error);
        alert(result.error || 'Error al eliminar el módulo');
      }
    } catch (error) {
      console.error('❌ Error al eliminar módulo:', error);
      alert('Error al eliminar el módulo');
    }

    setIsDeleting(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Módulos del Sistema ({total})
        </h3>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          + Agregar Módulo
        </button>
      </div>

      <Table
        columns={resourcesColumns}
        data={resources}
        loading={loading}
        emptyMessage="No hay módulos disponibles"
        keyExtractor={(row) => row.id}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-alt">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="pagination-button"
          >
            ← Anterior
          </button>
          
          <span className="pagination-info">
            Página {page} de {totalPages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="pagination-button"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal de Creación */}
      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de Edición */}
      <EditResourceModal
        isOpen={!!editResource}
        onClose={() => setEditResource(null)}
        onSuccess={handleEditSuccess}
        resource={editResource}
      />

      {/* Modal de Confirmación de Eliminación */}
      {!isDeleting && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Eliminación"
          message={`¿Estás seguro que deseas eliminar el módulo "${deleteConfirm?.name}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </div>
  );
}

