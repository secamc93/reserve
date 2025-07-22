import React, { useEffect, useState } from 'react';
import { useUsers } from '../hooks/useUsers.js';
import { useAuth } from '../hooks/useAuth.js';
import CreateUserModal from '../components/CreateUserModal.js';
import './AdminUsersPage.css';

export const AdminUsersPage = () => {
    const { users, roles, loading, error, pagination, loadUsers, createUser, deleteUser } = useUsers();
    const { isSuperAdmin, hasPermission } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        page_size: 10,
        name: '',
        email: '',
        is_active: null
    });

    // Verificar permisos
    const hasAccess = isSuperAdmin() || hasPermission('manage_users');

    useEffect(() => {
        if (hasAccess) {
            loadUsers(filters);
        }
    }, [hasAccess, loadUsers, filters]);

    // Proteger ruta
    if (!hasAccess) {
        return (
            <div className="admin-users-page">
                <div className="access-denied">
                    <h2>🚫 Acceso Denegado</h2>
                    <p>No tienes permisos para acceder a esta sección.</p>
                    <p>Se requiere rol de administrador o permisos de gestión de usuarios.</p>
                </div>
            </div>
        );
    }

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value, page: 1 };
        setFilters(newFilters);
        loadUsers(newFilters);
    };

    const handlePageChange = (newPage) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        loadUsers(newFilters);
    };

    const handleDeleteUser = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar al usuario "${name}"?`)) {
            try {
                await deleteUser(id);
                alert('Usuario eliminado exitosamente');
            } catch (error) {
                alert(`Error eliminando usuario: ${error.message}`);
            }
        }
    };

    const handleCreateUser = async (userData) => {
        try {
            await createUser(userData);
            setShowCreateModal(false);
            alert('Usuario creado exitosamente');
        } catch (error) {
            alert(`Error creando usuario: ${error.message}`);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="admin-users-page">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-users-page">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>👥 Administración de Usuarios</h1>
                        <p>Gestiona usuarios, roles y permisos del sistema</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            ➕ Nuevo Usuario
                        </button>
                    </div>
                </div>
            </header>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {/* Filtros */}
            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            placeholder="Buscar por nombre..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Email:</label>
                        <input
                            type="text"
                            value={filters.email}
                            onChange={(e) => handleFilterChange('email', e.target.value)}
                            placeholder="Buscar por email..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Estado:</label>
                        <select
                            value={filters.is_active ?? ''}
                            onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? null : e.target.value === 'true')}
                        >
                            <option value="">Todos</option>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Roles</th>
                            <th>Estado</th>
                            <th>Último acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    <div className="roles-badges">
                                        {user.roles.map(role => (
                                            <span key={role.id} className="role-badge">
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}
                                    >
                                        {user.getStatusText()}
                                    </span>
                                </td>
                                <td>
                                    {user.lastLoginAt
                                        ? user.lastLoginAt.toLocaleDateString('es-ES')
                                        : 'Nunca'
                                    }
                                </td>
                                <td>
                                    <div className="actions">
                                        <button className="btn-edit" title="Editar">
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            title="Eliminar"
                                            onClick={() => handleDeleteUser(user.id, user.name)}
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
                        <p>No se encontraron usuarios con los filtros aplicados</p>
                    </div>
                )}
            </div>

            {/* Paginación */}
            {pagination.total > pagination.pageSize && (
                <div className="pagination">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <button
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateUser}
                roles={roles}
            />
        </div>
    );
}; 