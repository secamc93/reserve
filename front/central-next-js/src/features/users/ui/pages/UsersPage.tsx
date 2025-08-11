'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
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
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    // Solo cargar si ya están inicializados los datos
    if (isInitialized) {
      loadUsers(newFilters);
    }
  }, [filters, loadUsers, isInitialized]);

  const handlePageChange = useCallback((newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    if (isInitialized) {
      loadUsers(newFilters);
    }
  }, [filters, loadUsers, isInitialized]);

  const handleDeleteUser = useCallback(async (id: number, name: string) => {
    console.log('🗑️ Deleting user:', { id, name });

    if (window.confirm(`¿Eliminar usuario "${name}" (ID: ${id})?`)) {
      try {
        await deleteUser(id);
        alert(`✅ Usuario "${name}" eliminado exitosamente!`);
      } catch (error: any) {
        console.error('❌ Error deleting:', error);
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
  }, [isInitialized, filters.page, filters.pageSize]); // Solo recargar cuando cambien page o pageSize

  // Debug: Ver qué datos están llegando
  useEffect(() => {
    console.log('🔍 UsersPage Debug - Usuarios cargados:', users);
    if (users.length > 0) {
      console.log('🔍 UsersPage Debug - Primer usuario:', {
        id: users[0].id,
        name: users[0].name,
        isActive: users[0].isActive,
        avatarURL: users[0].avatarURL,
        businesses: users[0].businesses?.map(b => ({ id: b.id, name: b.name, logoURL: b.logoURL }))
      });
    }
  }, [users]);

  // Debug específico para avatares
  useEffect(() => {
    users.forEach(user => {
      if (user.avatarURL) {
        console.log('🔍 Avatar Debug - Usuario:', user.name, 'Avatar URL:', user.avatarURL);
      } else {
        console.log('⚠️ Avatar Debug - Usuario:', user.name, 'NO tiene avatarURL');
      }
    });
  }, [users]);

  // Memoizar componentes para evitar re-renderizados
  const createUserModal = useMemo(() => (
    <CreateUserModal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onSubmit={handleCreateUser}
      roles={roles}
      businesses={businesses}
    />
  ), [showCreateModal, handleCreateUser, roles, businesses]);

  const editUserModal = useMemo(() => (
    <EditUserModal
      isOpen={showEditModal}
      onClose={handleCloseEditModal}
      onSubmit={handleEditUser}
      user={selectedUser}
      roles={roles}
      businesses={businesses}
    />
  ), [showEditModal, handleCloseEditModal, handleEditUser, selectedUser, roles, businesses]);

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
          <div className="error-container">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={() => loadUsers(filters)} className="btn btn-primary">
              Reintentar
            </button>
          </div>
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
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Usuario</th>    
                <th>Email</th>
                <th>Teléfono</th>
                <th>Roles</th>
                <th>Negocios</th>
                <th>Estado</th>
                <th>Último Login</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-avatar-cell">
                      {user.avatarURL && user.avatarURL.trim() !== '' ? (
                        <img 
                          src={user.avatarURL} 
                          alt={user.name}
                          className="user-avatar-cell-img"
                          style={{ width: 50, height: 50, borderRadius: '50%', display: 'block', objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="user-avatar-cell-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <small className="user-dates">
                          Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <div className="tags-container">
                      {user.roles.map((role) => (
                        <span key={role.id} className="tag role-tag" title={role.description}>
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="tags-container">
                      {user.businesses.map((business) => (
                        <div key={business.id} className="business-info">
                          <div className="business-logo-cell">
                            {business.logoURL && business.logoURL.trim() !== '' ? (
                              <img 
                                src={`https://media.xn--rup-joa.com/${business.logoURL}`} 
                                alt={business.name}
                                className="business-logo-cell-img"
                              />
                            ) : (
                              <span className="business-logo-cell-placeholder">
                                {business.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="business-name">{business.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {user.lastLoginAt ? (
                      <span className="last-login">
                        {new Date(user.lastLoginAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    ) : (
                      <span className="no-login">Nunca</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleOpenEditModal(user)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && !loading && (
            <div className="empty-state">
              <p>No se encontraron usuarios</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Crear primer usuario
              </button>
            </div>
          )}
        </div>

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