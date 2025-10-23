'use client';

import { useState, useEffect } from 'react';
import { getUsersAction, createUserAction, GetUsersInput } from '@modules/auth/infrastructure/actions';
import { Table, TableColumn, Spinner, Badge, Button, Input, Select, FormModal } from '@shared/ui';
import { CreateUserForm, CreateUserData } from '../forms/create-user-form';
import { PencilIcon, TrashIcon, EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface UsersTableProps {
  token: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
    level: number;
    is_system: boolean;
    scope_id: number;
  }>;
  businesses: Array<{
    id: number;
    name: string;
    logo_url: string;
    business_type_id: number;
    business_type_name: string;
  }>;
}

export function UsersTable({ token }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: undefined as boolean | undefined,
    role_id: undefined as number | undefined,
    business_id: undefined as number | undefined,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: GetUsersInput = {
        token,
        page,
        page_size: 10,
        ...filters,
      };

      const result = await getUsersAction(params);
      
      if (result.success && result.data) {
        setUsers(result.data.users);
        setCurrentPage(result.data.page);
        setTotalPages(result.data.total_pages);
        setTotalUsers(result.data.count);
      } else {
        setError(result.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error inesperado al cargar usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers(1);
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    setIsCreating(true);
    try {
      const result = await createUserAction({
        ...userData,
        token,
      });
      
      if (result.success) {
        // Recargar la lista de usuarios
        await loadUsers(currentPage);
        setShowCreateModal(false);
      } else {
        setError(result.error || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error inesperado al crear el usuario');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      email: '',
      phone: '',
      is_active: undefined,
      role_id: undefined,
      business_id: undefined,
    });
    setCurrentPage(1);
    loadUsers(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      label: 'Usuario',
      render: (_, user) => (
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (email) => (
        <div className="text-sm text-gray-900">{email as string}</div>
      ),
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (phone) => (
        <div className="text-sm text-gray-900">
          {(phone as string) || '-'}
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (_, user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.slice(0, 2).map((role) => (
            <Badge key={role.id} className="badge-primary">
              {role.name}
            </Badge>
          ))}
          {user.roles.length > 2 && (
            <Badge className="badge-secondary">
              +{user.roles.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (isActive) => (
        <Badge className={isActive ? 'badge-success' : 'badge-error'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'last_login_at',
      label: 'Último Acceso',
      render: (lastLogin) => (
        <div className="text-sm text-gray-900">
          {lastLogin ? formatDate(lastLogin as string) : 'Nunca'}
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
        <Button onClick={() => loadUsers()} className="btn-primary btn-sm">
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
          <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Input
              label="Nombre"
              placeholder="Buscar por nombre..."
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Buscar por email..."
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
            />
            <Input
              label="Teléfono"
              placeholder="Buscar por teléfono..."
              value={filters.phone}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
            />
            <Select
              label="Estado"
              placeholder="Seleccionar estado"
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
              options={[
                { value: '', label: 'Todos' },
                { value: 'true', label: 'Activo' },
                { value: 'false', label: 'Inactivo' },
              ]}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="btn-primary btn-sm">
                Buscar
              </Button>
              <Button onClick={handleClearFilters} className="btn-outline btn-sm">
                Limpiar Filtros
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Total: {totalUsers} usuarios
            </div>
          </div>
        </div>
      </div>

      {/* Header con botón crear */}
      <div className="card w-full">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Usuarios del Sistema</h3>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <Table
        columns={columns}
        data={users}
        loading={loading}
        keyExtractor={(user) => user.id}
        emptyMessage="No hay usuarios disponibles"
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-alt">
          <div className="pagination-info">
            Página {currentPage} de {totalPages} ({totalUsers} usuarios)
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Anterior
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de creación de usuario */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Usuario"
        size="md"
      >
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          loading={isCreating}
        />
      </FormModal>
    </div>
  );
}