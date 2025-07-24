import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import './AuthTestPage.css';

const AuthTestPage = () => {
  const { userRolesPermissions } = useAuth();
  const [expandedResources, setExpandedResources] = useState(new Set());

  // Obtener permisos agrupados por recurso
  const getGroupedPermissions = () => {
    if (!userRolesPermissions || !userRolesPermissions.resources) {
      return {};
    }

    // Los recursos están directamente en userRolesPermissions.resources
    return userRolesPermissions.resources.reduce((groups, resourceGroup) => {
      groups[resourceGroup.resource] = resourceGroup.actions || [];
      return groups;
    }, {});
  };

  const groupedPermissions = getGroupedPermissions();

  const toggleResource = (resource) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedResources(newExpanded);
  };

  const getResourceIcon = (resource) => {
    const icons = {
      'reservations': '📅',
      'tables': '🪑',
      'rooms': '🏠',
      'clients': '👥',
      'users': '👤',
      'businesses': '🏢',
      'roles': '🎭',
      'permissions': '🔐',
      'business_types': '🏷️',
      'scopes': '🔍',
      'reports': '📊',
      'default': '📁'
    };
    return icons[resource] || icons.default;
  };

  return (
    <div className="auth-test-page">
      <div className="auth-test-header">
        <h1>🔐 Permisos del Usuario</h1>
        <p>Permisos organizados por recurso</p>
      </div>

      <div className="auth-test-content">
        <div className="permissions-groups-container">
          {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
            <div key={resource} className="permission-group">
              <div 
                className="permission-group-header"
                onClick={() => toggleResource(resource)}
              >
                <div className="group-header-left">
                  <span className="group-icon">{getResourceIcon(resource)}</span>
                  <div className="group-info">
                    <h3 className="group-title">{resource}</h3>
                    <span className="group-count">{resourcePermissions.length} permisos</span>
                  </div>
                </div>
                <div className="group-header-right">
                  <button className="expand-button">
                    {expandedResources.has(resource) ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {expandedResources.has(resource) && (
                <div className="permission-group-content">
                  <table className="permissions-table">
                    <thead>
                      <tr>
                        <th>Permiso</th>
                        <th>Acción</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourcePermissions.map((permission) => (
                        <tr key={permission.id} className="permission-row">
                          <td className="permission-name-cell">
                            <span className="permission-name">{permission.name}</span>
                          </td>
                          <td className="permission-action-cell">
                            <span className={`permission-action-badge ${permission.action}`}>
                              {permission.action}
                            </span>
                          </td>
                          <td className="permission-description-cell">
                            <span className="permission-description">{permission.description}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage; 