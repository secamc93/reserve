import React, { useState } from 'react';
import UserProfileModal from './UserProfileModal.js';
import { useAuth } from '../hooks/useAuth.js';
import './Sidebar.css';

const Sidebar = ({ activeView, onViewChange, userInfo, onLogout }) => {
    const { isSuperAdmin, hasPermission } = useAuth();
    const [showProfileModal, setShowProfileModal] = useState(false);

    const menuItems = [
        {
            id: 'calendario',
            icon: '▦',
            label: 'Calendario',
            path: '/calendario'
        },
        {
            id: 'reservas',
            icon: '≡',
            label: 'Reservas',
            path: '/reservas'
        },
        {
            id: 'auth-test',
            icon: '▢',
            label: 'Prueba Auth',
            path: '/auth-test'
        }
    ];

    // Agregar menú de administración si tiene permisos
    if (isSuperAdmin() || hasPermission('manage_users')) {
        menuItems.push({
            id: 'admin-users',
            icon: '▤',
            label: 'Administrar Usuarios',
            path: '/admin-users'
        });
    }

    const handleAvatarClick = () => {
        setShowProfileModal(true);
    };

    const closeProfileModal = () => {
        setShowProfileModal(false);
    };

    return (
        <div className="sidebar">
            {/* Header con información del usuario */}
            <div className="sidebar-header">
                <div className="user-info">
                    <div
                        className="user-avatar clickable-avatar"
                        onClick={handleAvatarClick}
                        title="Ver perfil y permisos"
                    >
                        {userInfo?.avatar_url ? (
                            <img src={userInfo.avatar_url} alt="Avatar" />
                        ) : (
                            <span className="user-avatar-placeholder">
                                {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{userInfo?.name || 'Usuario'}</div>
                        <div className="user-email">{userInfo?.email || 'usuario@ejemplo.com'}</div>
                    </div>
                </div>
                <button
                    className="logout-button"
                    onClick={onLogout}
                    title="Cerrar sesión"
                >
                    <span className="logout-icon">🚪</span>
                    <span className="logout-label">Salir</span>
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li
                            key={item.id}
                            className="nav-item"
                            data-tooltip={item.label}
                        >
                            <button
                                className={`nav-button ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => onViewChange(item.id)}
                                title={item.label}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Modal de perfil de usuario */}
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={closeProfileModal}
                userInfo={userInfo}
            />
        </div>
    );
};

export default Sidebar; 