'use client';

import React from 'react';
import { User } from '../../internal/domain/entities/User';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: User | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userInfo }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Perfil de Usuario</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          <div className="user-profile-info">
            <div className="profile-avatar">
              {userInfo?.avatarURL ? (
                <img src={userInfo.avatarURL} alt={userInfo.name} />
              ) : (
                <span className="avatar-placeholder">
                  {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="profile-details">
              <h3>{userInfo?.name || 'Usuario'}</h3>
              <p className="user-email">{userInfo?.email || 'usuario@ejemplo.com'}</p>
              <p className="user-phone">Teléfono: {userInfo?.phone || 'No especificado'}</p>
              
              <div className="user-status">
                <span className={`status-badge ${userInfo?.isActive ? 'active' : 'inactive'}`}>
                  {userInfo?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="user-roles-section">
            <h4>Roles</h4>
            <div className="tags-container">
              {userInfo?.roles && userInfo.roles.length > 0 ? (
                userInfo.roles.map((role) => (
                  <span key={role.id} className="tag role-tag">
                    {role.name}
                  </span>
                ))
              ) : (
                <p className="no-data">No tiene roles asignados</p>
              )}
            </div>
          </div>

          <div className="user-businesses-section">
            <h4>Negocios</h4>
            <div className="tags-container">
              {userInfo?.businesses && userInfo.businesses.length > 0 ? (
                userInfo.businesses.map((business) => (
                  <span key={business.id} className="tag business-tag">
                    {business.name}
                  </span>
                ))
              ) : (
                <p className="no-data">No tiene negocios asignados</p>
              )}
            </div>
          </div>

          <div className="user-timestamps">
            <div className="timestamp-item">
              <span className="timestamp-label">Creado:</span>
              <span className="timestamp-value">
                {userInfo?.createdAt ? formatDate(userInfo.createdAt) : 'N/A'}
              </span>
            </div>
            <div className="timestamp-item">
              <span className="timestamp-label">Actualizado:</span>
              <span className="timestamp-value">
                {userInfo?.updatedAt ? formatDate(userInfo.updatedAt) : 'N/A'}
              </span>
            </div>
            {userInfo?.lastLoginAt && (
              <div className="timestamp-item">
                <span className="timestamp-label">Último acceso:</span>
                <span className="timestamp-value">
                  {formatDate(userInfo.lastLoginAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 