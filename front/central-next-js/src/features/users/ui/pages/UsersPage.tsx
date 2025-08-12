'use client';

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
const CreateUserModal = lazy(() => import('../components/CreateUserModal'));
const EditUserModal = lazy(() => import('../components/EditUserModal'));
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
import DataTable, { DataTableColumn, DataTableRowAction } from '@/shared/ui/components/DataTable/DataTable';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import { CreateUserDTO, UpdateUserDTO, UserFilters, User } from '@/features/users/domain/User';
import { useUsers } from '../hooks/useUsers';
import { useAppContext } from '@/shared/contexts/AppContext';
import Layout from '@/shared/ui/components/Layout';
import './UsersPage.css';

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Memoizar filters para evitar re-renderizados
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    pageSize: 10,
    name: '',
    email: '',
    isActive: undefined
  });

  const { isInitialized } = useAppContext();
  const {
    users,
    roles,
    businesses,
    loading,
    error,
    pagination,
    loadUsers,
    createUser,
    updateUser,
    deleteUser
  } = useUsers();

  // Memoizar handlers para evitar re-creaciones
  const handleFilterChange = useCallback((field: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleDeleteUser = useCallback(async (id: number, name: string) => {
    if (window.confirm(`¿Eliminar usuario "${name}" (ID: ${id})?`)) {
      try {
        await deleteUser(id);
        alert(`✅ Usuario "${name}" eliminado exitosamente!`);
      } catch (error: any) {
        alert(`❌ Error eliminando usuario: ${error.message}`);
      }
    }
  }, [deleteUser]);

  const handleCreateUser = useCallback(async (userData: CreateUserDTO) => {
    try {
      const result = await createUser(userData);
      return result;
    } catch (error: any) {
      alert(`Error creating user: ${error.message}`);
      throw error;
    }
  }, [createUser]);

  const handleEditUser = useCallback(async (id: number, userData: UpdateUserDTO) => {
    try {
      const result = await updateUser(id, userData);
      return result;
    } catch (error: any) {
      alert(`Error updating user: ${error.message}`);
      throw error;
    }
  }, [updateUser]);

  const handleOpenEditModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedUser(null);
  }, []);

  // Cargar usuarios solo cuando estén inicializados los datos y cambien los filters
  useEffect(() => {
    if (isInitialized) {
      loadUsers(filters);
    }
  }, [isInitialized, filters, loadUsers]);

  // Memoizar componentes para evitar re-renderizados y cargarlos bajo demanda
  const createUserModal = useMemo(() => (
    showCreateModal ? (
      <Suspense fallback={null}>
        <CreateUserModal
          isOpen
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          roles={roles}
          businesses={businesses}
        />
      </Suspense>
    ) : null
  ), [showCreateModal, handleCreateUser, roles, businesses]);

  const editUserModal = useMemo(() => (
    showEditModal ? (
      <Suspense fallback={null}>
        <EditUserModal
          isOpen
          onClose={handleCloseEditModal}
          onSubmit={handleEditUser}
          user={selectedUser}
          roles={roles}
          businesses={businesses}
        />
      </Suspense>
    ) : null
  ), [showEditModal, handleCloseEditModal, handleEditUser, selectedUser, roles, businesses]);

  const columns: Array<DataTableColumn<User>> = useMemo(() => [
    { key: 'id', header: 'ID' },
    {
      key: 'avatar',
      header: 'Avatar',
      render: (user) => (
        <div className="user-avatar-cell">
          {user.avatarURL && user.avatarURL.trim() !== '' ? (
            <img
              src={user.avatarURL}
              alt={user.name}
              className="user-avatar-cell-img"
              style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <span className="user-avatar-cell-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'name',
      header: 'Usuario',
      render: (user) => (
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <small className="user-dates">
              Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
            </small>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email' },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (u) => u.phone || '-'
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => (
        <div className="tags-container">
          {u.roles.map((role) => (
            <span key={role.id} className="tag role-tag" title={role.description}>
              {role.name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'businesses',
      header: 'Negocios',
      render: (u) => (
        <div className="tags-container">
          {u.businesses.map((b) => (
            <div key={b.id} className="business-info">
              <div className="business-logo-cell">
                {b.logoURL && b.logoURL.trim() !== '' ? (
                  <img
                    src={`https://media.xn--rup-joa.com/${b.logoURL}`}
                    alt={b.name}
                    className="business-logo-cell-img"
                  />
                ) : (
                  <span className="business-logo-cell-placeholder">
                    {b.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="business-name">{b.name}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (u) => (
        <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
          {u.isActive ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'lastLoginAt',
      header: 'Último Login',
      render: (u) =>
        u.lastLoginAt ? (
          <span className="last-login">
            {new Date(u.lastLoginAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span className="no-login">Nunca</span>
        )
    }
  ], []);

  const actions: Array<DataTableRowAction<User>> = useMemo(() => [
    {
      label: 'Editar',
      title: 'Editar usuario',
      onClick: handleOpenEditModal,
      className: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      label: 'Eliminar',
      title: 'Eliminar usuario',
      onClick: (u) => handleDeleteUser(u.id, u.name),
      className: 'text-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  ], [handleOpenEditModal, handleDeleteUser]);

  // Mostrar loading optimizado
  if (!isInitialized) {
    return (
      <Layout>
        <div className="users-page">
          <LoadingSpinner 
            size="large" 
            text="Inicializando módulo de usuarios..." 
            className="theme-primary"
          />
        </div>
      </Layout>
    );
  }

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="users-page">
          <LoadingSpinner 
            size="medium" 
            text="Cargando usuarios..." 
            className="theme-primary"
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="users-page">
          <ErrorMessage
            message={error}
            title="Error al cargar usuarios"
            variant="error"
            dismissible
            onDismiss={() => loadUsers(filters)}
            className="mb-4"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="users-page">
        <div className="page-header">
          <div className="header-content">
            <h1>👥 Gestión de Usuarios</h1>
            <p>Administra los usuarios del sistema</p>
          </div>
          <button 
            className="btn btn-primary create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Crear Usuario
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={filters.name || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Buscar por nombre..."
              />
            </div>
            
            <div className="filter-group">
              <label>Email:</label>
              <input
                type="email"
                value={filters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Buscar por email..."
              />
            </div>
            
            <div className="filter-group">
              <label>Estado:</label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">Todos</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <DataTable<User>
          data={users}
          columns={columns}
          rowKey={(u) => u.id}
          loading={loading}
          actions={actions}
          emptyState={
            <div className="empty-state">
              <p>No se encontraron usuarios</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Crear primer usuario
              </button>
            </div>
          }
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              ← Anterior
            </button>

            <span className="pagination-info">
              Página {pagination.page} de {pagination.totalPages}
              ({pagination.total} usuarios)
            </span>

            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Modals */}
        {createUserModal}
        {editUserModal}
      </div>
    </Layout>
  );
} 