import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import UserInfo from '../components/UserInfo.js';
import './AuthTestPage.css';

const AuthTestPage = () => {
  const {
    isAuthenticated,
    userInfo,
    isSuperAdmin,
    hasPermission,
    canManageResource,
    canReadResource,
    getUserRoles,
    getUserPermissions,
    logout
  } = useAuth();

  const roles = getUserRoles();
  const permissions = getUserPermissions();

  const testPermissions = [
    'reservations:manage',
    'tables:manage',
    'clients:manage',
    'users:manage',
    'businesses:manage'
  ];

  const testResources = [
    'reservations',
    'tables',
    'clients',
    'users',
    'businesses'
  ];

  return (
    <div className="auth-test-page">
      <div className="auth-test-header">
        <h1>🔐 Prueba de Autenticación</h1>
        <p>Página para verificar el funcionamiento del sistema de autenticación</p>
      </div>

      <div className="auth-test-content">
        <div className="auth-status-section">
          <h2>📊 Estado de Autenticación</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Autenticado:</span>
              <span className={`status-value ${isAuthenticated ? 'success' : 'error'}`}>
                {isAuthenticated ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Super Admin:</span>
              <span className={`status-value ${isSuperAdmin() ? 'success' : 'warning'}`}>
                {isSuperAdmin() ? '👑 Sí' : '👤 No'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Usuario:</span>
              <span className="status-value">{userInfo?.name || 'No disponible'}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Email:</span>
              <span className="status-value">{userInfo?.email || 'No disponible'}</span>
            </div>
          </div>
        </div>

        <div className="permissions-test-section">
          <h2>🔐 Prueba de Permisos</h2>
          <div className="permissions-grid">
            {testPermissions.map(permission => (
              <div key={permission} className="permission-test-item">
                <span className="permission-name">{permission}</span>
                <span className={`permission-status ${hasPermission(permission) ? 'granted' : 'denied'}`}>
                  {hasPermission(permission) ? '✅ Concedido' : '❌ Denegado'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="resources-test-section">
          <h2>📁 Prueba de Recursos</h2>
          <div className="resources-grid">
            {testResources.map(resource => (
              <div key={resource} className="resource-test-item">
                <span className="resource-name">{resource}</span>
                <div className="resource-permissions">
                  <span className={`resource-perm ${canReadResource(resource) ? 'granted' : 'denied'}`}>
                    📖 Leer: {canReadResource(resource) ? '✅' : '❌'}
                  </span>
                  <span className={`resource-perm ${canManageResource(resource) ? 'granted' : 'denied'}`}>
                    ⚙️ Gestionar: {canManageResource(resource) ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="roles-section">
          <h2>🎭 Roles del Usuario ({roles.length})</h2>
          <div className="roles-grid">
            {roles.map(role => (
              <div key={role.id} className="role-display-item">
                <div className="role-header">
                  <span className="role-name">{role.name}</span>
                  <span className="role-level">Nivel {role.level}</span>
                </div>
                <div className="role-code">{role.code}</div>
                <div className="role-description">{role.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="permissions-section">
          <h2>🔐 Permisos del Usuario ({permissions.length})</h2>
          <div className="permissions-display-grid">
            {permissions.map(permission => (
              <div key={permission.id} className="permission-display-item">
                <div className="permission-header">
                  <span className="permission-name">{permission.name}</span>
                  <span className={`permission-action ${permission.action}`}>
                    {permission.action}
                  </span>
                </div>
                <div className="permission-resource">📁 {permission.resource}</div>
                <div className="permission-description">{permission.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="user-info-section">
          <h2>👤 Información Detallada del Usuario</h2>
          <UserInfo />
        </div>

        <div className="actions-section">
          <h2>⚡ Acciones</h2>
          <div className="actions-grid">
            <button className="action-button primary" onClick={() => window.location.reload()}>
              🔄 Recargar Página
            </button>
            <button className="action-button danger" onClick={logout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage; 