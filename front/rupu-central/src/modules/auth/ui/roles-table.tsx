'use client';

import { useState, useEffect } from 'react';
import { getRolesAction } from '@modules/auth/infrastructure/actions';
import { Table, TableColumn, Spinner, Badge, Button } from '@shared/ui';
import { PencilIcon, TrashIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface RolesTableProps {
  token: string;
}

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
}

export function RolesTable({ token }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRolesAction(token);
      
      if (result.success && result.data) {
        setRoles(result.data.roles);
      } else {
        setError(result.error || 'Error al cargar roles');
      }
    } catch (err) {
      setError('Error inesperado al cargar roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Role>[] = [
    {
      key: 'role',
      label: 'Rol',
      render: (_, role) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{role.name}</div>
            <div className="text-sm text-gray-500">ID: {role.id}</div>
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
      key: 'level',
      label: 'Nivel',
      render: (level) => (
        <Badge className="badge-primary">
          Nivel {level as number}
        </Badge>
      ),
    },
    {
      key: 'isSystem',
      label: 'Tipo',
      render: (isSystem) => (
        <Badge className={isSystem ? 'badge-warning' : 'badge-success'}>
          {isSystem ? 'Sistema' : 'Personalizado'}
        </Badge>
      ),
    },
    {
      key: 'scopeId',
      label: 'Scope ID',
      render: (scopeId) => (
        <div className="text-sm text-gray-900">
          {scopeId as number}
        </div>
      ),
    },
    {
      key: 'scopeName',
      label: 'Scope',
      render: (scopeName) => (
        <div className="text-sm text-gray-900">
          {scopeName as string}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, role) => (
        <div className="flex gap-2">
          <Button className="btn-outline btn-sm">
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button className="btn-outline btn-sm">
            <PencilIcon className="w-4 h-4" />
          </Button>
          {!role.isSystem && (
            <Button className="btn-outline btn-sm">
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
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
        <Button onClick={() => loadRoles()} className="btn-primary btn-sm">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header con botón crear */}
      <div className="card w-full">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Roles del Sistema</h3>
            <Button className="btn-primary">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Crear Rol
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de roles */}
      <Table
        columns={columns}
        data={roles}
        loading={loading}
        keyExtractor={(role) => role.id}
        emptyMessage="No hay roles disponibles. Comienza creando tu primer rol del sistema."
      />
    </div>
  );
}