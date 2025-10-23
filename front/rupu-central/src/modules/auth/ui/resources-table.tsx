'use client';

import { useState, useEffect } from 'react';
import { getResourcesAction, deleteResourceAction } from '@modules/auth/infrastructure/actions';
import { Table, TableColumn, Spinner, Badge, Button, Input, ConfirmModal } from '@shared/ui';
import { PencilIcon, TrashIcon, EyeIcon, CubeTransparentIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ResourcesTableProps {
  token: string;
}

interface Resource {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function ResourcesTable({ token }: ResourcesTableProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getResourcesAction({ token });
      
      if (result.success && result.data) {
        setResources(result.data.resources);
      } else {
        setError(result.error || 'Error al cargar recursos');
      }
    } catch (err) {
      setError('Error inesperado al cargar recursos');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [token]);

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;

    setDeletingId(resourceToDelete.id);
    try {
      const result = await deleteResourceAction({ id: resourceToDelete.id, token });
      
      if (result.success) {
        // Recargar la lista de recursos
        await loadResources();
        setShowDeleteModal(false);
        setResourceToDelete(null);
      } else {
        setError(result.error || 'Error al eliminar el recurso');
      }
    } catch (err) {
      setError('Error inesperado al eliminar el recurso');
      console.error('Error deleting resource:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setResourceToDelete(null);
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Resource>[] = [
    {
      key: 'resource',
      label: 'Recurso',
      render: (_, resource) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <CubeTransparentIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{resource.name}</div>
            <div className="text-sm text-gray-500">ID: {resource.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (description) => (
        <div className="text-sm text-gray-900 max-w-xs">
          {description as string}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (createdAt) => (
        <div className="text-sm text-gray-900">
          {formatDate(createdAt as string)}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Actualizado',
      render: (updatedAt) => (
        <div className="text-sm text-gray-900">
          {formatDate(updatedAt as string)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, resource) => (
        <div className="flex gap-2">
          <Button className="btn-outline btn-sm">
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button className="btn-outline btn-sm">
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button 
            className="btn-outline btn-sm"
            onClick={() => handleDeleteClick(resource)}
            disabled={deletingId === resource.id}
            loading={deletingId === resource.id}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
        <Button onClick={() => loadResources()} className="btn-primary btn-sm">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Filtros */}
      <div className="card w-full">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
            <Button className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Crear Recurso
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setSearchTerm('')} className="btn-outline">
              Limpiar
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {filteredResources.length} de {resources.length} recursos
          </div>
        </div>
      </div>

      {/* Tabla de recursos */}
      <Table
        columns={columns}
        data={filteredResources}
        loading={loading}
        keyExtractor={(resource) => resource.id}
        emptyMessage={searchTerm ? "No se encontraron recursos con los criterios de búsqueda." : "No hay recursos disponibles. Comienza creando tu primer recurso del sistema."}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Recurso"
        message={`¿Estás seguro de que quieres eliminar el recurso "${resourceToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}