'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/shared/contexts/AppContext';
import { useModuleNavigation } from '@/shared/hooks/useModuleNavigation';
import UserProfileModal from '@/features/users/ui/components/UserProfileModal';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { user, hasPermission, isSuperAdmin } = useAppContext();
    const { navigateToModule, preloadModule } = useModuleNavigation();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Memoizar permisos para evitar recálculos en cada render
    const permissions = useMemo(() => {
        const isSuper = isSuperAdmin();

        // Verificar permisos específicos
        const hasUsersManage = hasPermission('users:manage');
        const hasUsersCreate = hasPermission('users:create');
        const hasUsersUpdate = hasPermission('users:update');
        const hasUsersDelete = hasPermission('users:delete');
        const hasManageUsers = hasPermission('manage_users');
        const hasBusinessesManage = hasPermission('businesses:manage');
        const hasTablesManage = hasPermission('tables:manage');
        const hasRoomsManage = hasPermission('rooms:manage');

        // Verificar roles reales del usuario (no como permisos)
        const roleCodes = (user?.roles || []).map(r => (r as any).code || (r as any).name || '').map((c: string) => c.toLowerCase());
        const hasRoleSuperAdmin = roleCodes.includes('super_admin') || roleCodes.includes('platform');
        const hasRoleAdmin = roleCodes.includes('admin');
        const hasRoleManager = roleCodes.includes('manager');

        return {
            isSuper,
            hasUsersManage,
            hasUsersCreate,
            hasUsersUpdate,
            hasUsersDelete,
            hasManageUsers,
            hasBusinessesManage,
            hasTablesManage,
            hasRoomsManage,
            hasRoleSuperAdmin,
            hasRoleAdmin,
            hasRoleManager
        };
    }, [isSuperAdmin, hasPermission, user]);

    // Memoizar menú para evitar recreaciones
    const menuItems = useMemo(() => {
        const items = [
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

        // Verificar múltiples permisos relacionados con usuarios
        const canManageUsers = permissions.isSuper ||
            permissions.hasManageUsers ||
            permissions.hasUsersManage ||
            permissions.hasUsersCreate ||
            permissions.hasUsersUpdate ||
            permissions.hasUsersDelete ||
            permissions.hasRoleSuperAdmin ||
            permissions.hasRoleAdmin ||
            permissions.hasRoleManager;

        // Verificar permisos para negocios
        const canManageBusinesses = permissions.isSuper || 
            permissions.hasBusinessesManage ||
            permissions.hasRoleSuperAdmin ||
            permissions.hasRoleAdmin;

        // Verificar permisos para mesas
        const canManageTables = permissions.isSuper || 
            permissions.hasTablesManage ||
            permissions.hasRoleSuperAdmin ||
            permissions.hasRoleAdmin ||
            permissions.hasRoleManager;

        // Verificar permisos para salas
        const canManageRooms = permissions.isSuper || 
            permissions.hasRoomsManage ||
            permissions.hasRoleSuperAdmin ||
            permissions.hasRoleAdmin ||
            permissions.hasRoleManager;

        if (canManageUsers) {
            items.push({
                id: 'admin-users',
                icon: '▤',
                label: 'Administrar Usuarios',
                path: '/users'
            });
        }

        if (canManageBusinesses) {
            items.push({
                id: 'admin-businesses',
                icon: '🏪',
                label: 'Administrar Negocios',
                path: '/admin-businesses'
            });
        }

        if (canManageTables) {
            items.push({
                id: 'admin-tables',
                icon: '🪑',
                label: 'Administrar Mesas',
                path: '/admin-tables'
            });
        }

        if (canManageRooms) {
            items.push({
                id: 'admin-rooms',
                icon: '🏠',
                label: 'Administrar Salas',
                path: '/admin-rooms'
            });
        }

        return { items, canManageUsers, canManageBusinesses, canManageTables, canManageRooms };
    }, [permissions]);

    // Debug: Verificar qué permisos se están detectando
    useEffect(() => {
        console.log('🔍 Sidebar Debug - Permisos detectados:', permissions);
        console.log('🔍 Sidebar Debug - canManageUsers:', menuItems.canManageUsers);
        console.log('🔍 Sidebar Debug - canManageBusinesses:', menuItems.canManageBusinesses);
        console.log('🔍 Sidebar Debug - canManageTables:', menuItems.canManageTables);
        console.log('🔍 Sidebar Debug - canManageRooms:', menuItems.canManageRooms);
        console.log('🔍 Sidebar Debug - MenuItems finales:', menuItems.items.map(item => item.label));
    }, [permissions, menuItems]);

    // Pre-cargar módulos en background cuando se monta el componente
    useEffect(() => {
        menuItems.items.forEach(item => {
            if (item.path !== pathname) {
                preloadModule(item.path);
            }
        });
    }, [menuItems.items, pathname, preloadModule]);

    // Memoizar handlers para evitar recreaciones
    const handleAvatarClick = useMemo(() => () => {
        setShowProfileModal(true);
    }, []);

    const closeProfileModal = useMemo(() => () => {
        setShowProfileModal(false);
    }, []);

    const handleLogout = useMemo(() => () => {
        // Limpiar contexto y redirigir
        router.push('/auth/login');
    }, [router]);

    const handleNavigation = useMemo(() => (path: string) => {
        navigateToModule(path);
    }, [navigateToModule]);

    // Determinar la vista activa basada en la ruta actual
    const activeView = useMemo(() => {
        const currentPath = pathname;
        const menuItem = menuItems.items.find(item => item.path === currentPath);
        return menuItem ? menuItem.id : 'calendario';
    }, [pathname, menuItems.items]);

    return (
        <div className="sidebar">
            {/* Header con información del usuario */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/rupu-icon.png" alt="Rupü" width={36} height={36} className="logo-icon" />
                </div>
                <div className="user-info">
                    <div
                        className="user-avatar clickable-avatar"
                        onClick={handleAvatarClick}
                        title="Ver perfil y permisos"
                    >
                        {user?.avatarURL ? (
                            <img src={user.avatarURL} alt="Avatar" />
                        ) : (
                            <span className="user-avatar-placeholder">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{user?.name || 'Usuario'}</div>
                        <div className="user-email">{user?.email || 'usuario@ejemplo.com'}</div>
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
                    {menuItems.items.map((item) => (
                        <li
                            key={item.id}
                            className="nav-item"
                            data-tooltip={item.label}
                        >
                            <button
                                className={`nav-button ${activeView === item.id ? 'active' : ''}`}
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
                userInfo={user}
            />
        </div>
    );
};

export default Sidebar; 