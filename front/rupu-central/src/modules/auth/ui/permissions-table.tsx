'use client';

import { useState, useEffect } from 'react';
import { getPermissionsListAction } from '@modules/auth/infrastructure/actions';
import { Table, TableColumn, Spinner, Badge, Button, Input } from '@shared/ui';
import { PencilIcon, TrashIcon, EyeIcon, KeyIcon } from '@heroicons/react/24/outline';

interface PermissionsTableProps {
  token: string;
}

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
  businessTypeId?: number;
  businessTypeName?: string;
}

export function PermissionsTable({ token }: PermissionsTableProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPermissionsListAction(token);
      
      if (result.success && result.data) {
        setPermissions(result.data.permissions);
      } else {
        setError(result.error || 'Error al cargar permisos');
      }
    } catch (err) {
      setError('Error inesperado al cargar permisos');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [token]);

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Definir las columnas de la tabla
  const columns: TableColumn<Permission>[] = [
    {
      key: 'permission',
      label: 'Permiso',
      render: (_, permission) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <KeyIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{permission.name}</div>
            <div className="text-sm text-gray-500">{permission.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Código',
      render: (code) => (
        <Badge className="badge-secondary">
          {code as string}
        </Badge>
      ),
    },
    {
      key: 'resource',
      label: 'Recurso',
      render: (resource) => (
        <div className="text-sm text-gray-900">
          {resource as string}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Acción',
      render: (action) => (
        <Badge className="badge-primary">
          {action as string}
        </Badge>
      ),
    },
    {
      key: 'scope',
      label: 'Scope',
      render: (_, permission) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{permission.scopeName}</div>
          <div className="text-gray-500">{permission.scopeCode}</div>
        </div>
      ),
    },
    {
      key: 'businessTypeName',
      label: 'Tipo de Negocio',
      render: (_, permission) => (
        <div className="text-sm text-gray-900">
          {permission.businessTypeName || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: () => (
        <div className="flex gap-2">
          <Button className="btn-outline btn-sm">
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button className="btn-outline btn-sm">
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button className="btn-outline btn-sm">
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
        <Button onClick={() => loadPermissions()} className="btn-primary btn-sm">
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
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, código, recurso o acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setSearchTerm('')} className="btn-outline">
              Limpiar
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {filteredPermissions.length} de {permissions.length} permisos
          </div>
        </div>
      </div>

      {/* Tabla de permisos */}
      <Table
        columns={columns}
        data={filteredPermissions}
        loading={loading}
        keyExtractor={(permission) => permission.id}
        emptyMessage={searchTerm ? "No se encontraron permisos con los criterios de búsqueda." : "No hay permisos disponibles. Comienza creando tu primer permiso del sistema."}
      />
    </div>
  );
}