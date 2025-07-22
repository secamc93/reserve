import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose, userInfo }) => {
    const { getUserRoles, getUserPermissions, isSuperAdmin } = useAuth();

    if (!isOpen) return null;

    const roles = getUserRoles();
    const permissions = getUserPermissions();

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Función para traducir y describir las acciones de permisos
    const getPermissionActionInfo = (action) => {
        const actionMap = {
            'manage': {
                label: 'GESTIONAR',
                description: 'Control total: crear, ver, editar, eliminar y configurar todos los aspectos del recurso'
            },
            'create': {
                label: 'CREAR',
                description: 'Permite crear nuevos registros y elementos en el sistema'
            },
            'read': {
                label: 'VER',
                description: 'Acceso de solo lectura para visualizar información existente'
            },
            'update': {
                label: 'EDITAR',
                description: 'Modificar y actualizar registros existentes, sin poder eliminarlos'
            },
            'delete': {
                label: 'ELIMINAR',
                description: 'Remover permanentemente registros del sistema'
            }
        };

        return actionMap[action.toLowerCase()] || {
            label: action.toUpperCase(),
            description: 'Permiso específico del sistema'
        };
    };

    // Función para traducir nombres de recursos
    const getResourceDisplayName = (resource) => {
        const resourceMap = {
            'users': 'Usuarios',
            'reservations': 'Reservas',
            'tables': 'Mesas',
            'clients': 'Clientes',
            'businesses': 'Negocios',
            'roles': 'Roles',
            'permissions': 'Permisos',
            'reports': 'Reportes',
            'settings': 'Configuraciones'
        };

        return resourceMap[resource.toLowerCase()] || resource;
    };

    return (
        <div className="user-profile-modal-overlay" onClick={handleOverlayClick}>
            <div className="user-profile-modal">
                <div className="modal-header">
                    <div className="user-info-header">
                        <div className="user-avatar-large">
                            {userInfo?.avatar_url ? (
                                <img src={userInfo.avatar_url} alt="Avatar" />
                            ) : (
                                <span className="user-avatar-placeholder-large">
                                    {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="user-details-modal">
                            <h2 className="user-name-modal">{userInfo?.name || 'Usuario'}</h2>
                            <p className="user-email-modal">{userInfo?.email || 'usuario@ejemplo.com'}</p>
                            {isSuperAdmin() && (
                                <div className="super-admin-badge-modal">👑 Super Administrador</div>
                            )}
                        </div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose} title="Cerrar">
                        ✕
                    </button>
                </div>

                <div className="modal-content">
                    {/* Sección de Roles */}
                    <div className="roles-section-modal">
                        <h3 className="section-title">
                            🎭 Tus Roles ({roles.length})
                        </h3>
                        <div className="roles-grid">
                            {roles.map((role) => (
                                <div key={role.id} className="role-card">
                                    <div className="role-header">
                                        <span className="role-name-large">{role.name}</span>
                                    </div>
                                    <div className="role-details">
                                        {role.description && (
                                            <p className="role-description">{role.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección de Permisos */}
                    <div className="permissions-section-modal">
                        <h3 className="section-title">
                            🔐 Tus Permisos ({permissions.length})
                        </h3>
                        <div className="permissions-grid">
                            {permissions.map((permission) => {
                                const actionInfo = getPermissionActionInfo(permission.action);
                                const resourceName = getResourceDisplayName(permission.resource);

                                return (
                                    <div key={permission.id} className="permission-card">
                                        <div className="permission-header">
                                            <span className="permission-name-large">{permission.name}</span>
                                            <span className={`permission-action-badge ${permission.action.toLowerCase()}`}>
                                                {actionInfo.label}
                                            </span>
                                        </div>
                                        <div className="permission-details">
                                            <span className="permission-resource-large">
                                                📁 {resourceName}
                                            </span>
                                            <p className="permission-description-large">
                                                <strong>Qué puedes hacer:</strong> {actionInfo.description}
                                            </p>
                                            {permission.description && (
                                                <p className="permission-extra-description">
                                                    <em>{permission.description}</em>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Estado vacío */}
                    {roles.length === 0 && permissions.length === 0 && (
                        <div className="empty-state-modal">
                            <span className="empty-icon">🔒</span>
                            <h3>Sin roles o permisos asignados</h3>
                            <p>Contacta al administrador para obtener acceso al sistema.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal; 