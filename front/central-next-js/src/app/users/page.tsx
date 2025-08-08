'use client';

import React, { useState, useEffect } from 'react';
import CreateUserModal from '../../presentation/components/CreateUserModal';
import EditUserModal from '../../presentation/components/EditUserModal';
import { CreateUserDTO, UpdateUserDTO, UserFilters, User } from '../../internal/domain/entities/User';
import { useUsers } from '../../presentation/hooks/useUsers';
import './users.css';

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    pageSize: 10,
    name: '',
    email: '',
    isActive: undefined
  });

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

  // Load users on component mount
  useEffect(() => {
    loadUsers(filters);
  }, [loadUsers, filters]);

  const handleFilterChange = (field: keyof UserFilters, value: any) => {
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  const handleDeleteUser = async (id: number, name: string) => {
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
  };

  const handleCreateUser = async (userData: CreateUserDTO) => {
    try {
      const result = await createUser(userData);
      return result;
    } catch (error: any) {
      alert(`Error creating user: ${error.message}`);
      throw error;
    }
  };

  const handleEditUser = async (id: number, userData: UpdateUserDTO) => {
    try {
      const result = await updateUser(id, userData);
      return result;
    } catch (error: any) {
      alert(`Error updating user: ${error.message}`);
      throw error;
    }
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="error-container">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => loadUsers(filters)} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
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
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Roles</th>
              <th>Negocios</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.avatarURL ? (
                        <img src={user.avatarURL} alt={user.name} />
                      ) : (
                        <span className="avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="user-name">{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <div className="tags-container">
                    {user.roles.map((role) => (
                      <span key={role.id} className="tag role-tag">
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="tags-container">
                    {user.businesses.map((business) => (
                      <span key={business.id} className="tag business-tag">
                        {business.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
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

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        roles={roles}
        businesses={businesses}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditUser}
        user={selectedUser}
        roles={roles}
        businesses={businesses}
      />
    </div>
  );
} 