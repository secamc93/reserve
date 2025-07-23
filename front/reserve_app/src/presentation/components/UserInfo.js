import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import './UserInfo.css';

const UserInfo = () => {
  const { userInfo, userRolesPermissions, isSuperAdmin, getUserRoles, getUserPermissions, logout } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!userInfo) {
    return null;
  }

  const roles = getUserRoles();
  const permissions = getUserPermissions();

  return (
    <div className="user-info-container">
      <div className="user-info-header" onClick={toggleDetails}>
        <div className="user-avatar">
          {userInfo.avatar_url ? (
            <img src={userInfo.avatar_url} alt="Avatar" />
          ) : (
            <span className="user-avatar-placeholder">
              {userInfo.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="user-details">
          <div className="user-name">{userInfo.name || 'Usuario'}</div>
          <div className="user-email">{userInfo.email || 'usuario@ejemplo.com'}</div>
          {isSuperAdmin() && (
            <div className="super-admin-badge">👑 Super Admin</div>
          )}
        </div>
        <div className="user-actions">
          <button 
            className="logout-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Cerrar sesión"
          >
            🚪
          </button>
          <button className="toggle-details-btn">
            {showDetails ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="user-details-expanded">
          <div className="roles-section">
            <h4>🎭 Roles ({roles.length})</h4>
            <div className="roles-list">
              {roles.map((role) => (
                <div key={role.id} className="role-item">
                  <span className="role-name">{role.name}</span>
                  <span className="role-code">({role.code})</span>
                  <span className="role-level">Nivel {role.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="permissions-section">
            <h4>🔐 Permisos ({permissions.length})</h4>
            <div className="permissions-table-container">
              <table className="permissions-table">
                <thead>
                  <tr>
                    <th>Permiso</th>
                    <th>Acción</th>
                    <th>Recurso</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id} className="permission-row">
                      <td className="permission-name-cell">
                        <span className="permission-name">{permission.name}</span>
                      </td>
                      <td className="permission-action-cell">
                        <span className={`permission-action-badge ${permission.action}`}>
                          {permission.action}
                        </span>
                      </td>
                      <td className="permission-resource-cell">
                        <span className="permission-resource">📁 {permission.resource}</span>
                      </td>
                      <td className="permission-description-cell">
                        <span className="permission-description">{permission.description}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="logout-section">
            <button 
              className="logout-btn-expanded"
              onClick={handleLogout}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo; 