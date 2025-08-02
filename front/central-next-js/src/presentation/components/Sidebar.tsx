'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import UserProfileModal from './UserProfileModal';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { isSuperAdmin, hasPermission, userInfo, logout } = useAuth();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        {
            id: 'calendario',
            icon: '▦',
            label: 'Calendario',
            path: '/calendar'
        },
        {
            id: 'reservas',
            icon: '≡',
            label: 'Reservas',
            path: '/reservas'
        }
    ];

    // Debug: Verificar permisos
    const isSuper = isSuperAdmin();
    const hasUsersManage = hasPermission('users:manage');
    const hasUsersCreate = hasPermission('users:create');
    const hasUsersUpdate = hasPermission('users:update');
    const hasUsersDelete = hasPermission('users:delete');
    const hasManageUsers = hasPermission('manage_users');
    const hasBusinessesManage = hasPermission('businesses:manage');
    const hasTablesManage = hasPermission('tables:manage');
    const hasRoomsManage = hasPermission('rooms:manage');

    console.log('🔍 Sidebar Debug - Permisos de Usuario:');
    console.log('  - isSuperAdmin:', isSuper);
    console.log('  - users:manage:', hasUsersManage);
    console.log('  - users:create:', hasUsersCreate);
    console.log('  - users:update:', hasUsersUpdate);
    console.log('  - users:delete:', hasUsersDelete);
    console.log('  - manage_users:', hasManageUsers);
    console.log('  - businesses:manage:', hasBusinessesManage);
    console.log('  - tables:manage:', hasTablesManage);

    // Agregar menú de administración si tiene permisos
    // Verificar múltiples permisos relacionados con usuarios
    const canManageUsers = isSuper ||
        hasManageUsers ||
        hasUsersManage ||
        hasUsersCreate ||
        hasUsersUpdate ||
        hasUsersDelete;

    // Verificar permisos para negocios
    const canManageBusinesses = isSuper || hasBusinessesManage;

    // Verificar permisos para mesas
    const canManageTables = isSuper || hasTablesManage;

    // Verificar permisos para salas
    const canManageRooms = isSuper || hasRoomsManage;

    console.log('🔍 Sidebar Debug - canManageUsers:', canManageUsers);
    console.log('🔍 Sidebar Debug - canManageBusinesses:', canManageBusinesses);
    console.log('🔍 Sidebar Debug - canManageTables:', canManageTables);
    console.log('🔍 Sidebar Debug - canManageRooms:', hasRoomsManage);

    if (canManageUsers) {
        menuItems.push({
            id: 'admin-users',
            icon: '▤',
            label: 'Administrar Usuarios',
            path: '/admin-users'
        });
        console.log('🔍 Sidebar Debug - Agregando módulo "Administrar Usuarios"');
    } else {
        console.log('🔍 Sidebar Debug - NO se agrega módulo "Administrar Usuarios"');
    }

    if (canManageBusinesses) {
        menuItems.push({
            id: 'admin-businesses',
            icon: '🏪',
            label: 'Administrar Negocios',
            path: '/admin-businesses'
        });
        console.log('🔍 Sidebar Debug - Agregando módulo "Administrar Negocios"');
    } else {
        console.log('🔍 Sidebar Debug - NO se agrega módulo "Administrar Negocios"');
    }

    if (canManageTables) {
        menuItems.push({
            id: 'admin-tables',
            icon: '🪑',
            label: 'Administrar Mesas',
            path: '/admin-tables'
        });
        console.log('🔍 Sidebar Debug - Agregando módulo "Administrar Mesas"');
    } else {
        console.log('🔍 Sidebar Debug - NO se agrega módulo "Administrar Mesas"');
    }

    if (canManageRooms) {
        menuItems.push({
            id: 'admin-rooms',
            icon: '🏠',
            label: 'Administrar Salas',
            path: '/admin-rooms'
        });
        console.log('🔍 Sidebar Debug - Agregando módulo "Administrar Salas"');
    } else {
        console.log('🔍 Sidebar Debug - NO se agrega módulo "Administrar Salas"');
    }

    console.log('🔍 Sidebar Debug - MenuItems finales:', menuItems.map(item => item.label));

    const handleAvatarClick = () => {
        setShowProfileModal(true);
    };

    const closeProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    // Determinar la vista activa basada en la ruta actual
    const getActiveView = () => {
        const currentPath = pathname;
        const menuItem = menuItems.find(item => item.path === currentPath);
        return menuItem ? menuItem.id : 'calendario';
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
                    onClick={handleLogout}
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
                                className={`nav-button ${getActiveView() === item.id ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
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