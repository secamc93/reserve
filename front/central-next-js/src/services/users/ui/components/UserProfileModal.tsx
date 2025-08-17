'use client';

import React from 'react';
import { User } from '@/services/users/domain/entities/User';
import './UserProfileModal.css';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: User | null;
}

const ensureMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://media.xn--rup-joa.com/${url.replace(/^\//, '')}`;
};

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

  const primaryBusiness = userInfo?.businesses && userInfo.businesses.length > 0 ? userInfo.businesses[0] : undefined;
  const businessLogo = ensureMediaUrl(primaryBusiness?.logoURL);
  const mainRole = userInfo?.roles && userInfo.roles.length > 0 ? userInfo.roles[0] : undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Perfil de Usuario</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          {/* Tarjeta translúcida (vapor) para datos del usuario */}
          <div className="user-card">
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
                <h3>
                  {userInfo?.name || 'Usuario'}
                  {mainRole && <span className="role-chip">{mainRole.name}</span>}
                </h3>
                <p className="user-email">{userInfo?.email || 'usuario@ejemplo.com'}</p>
                <p className="user-phone">Teléfono: {userInfo?.phone || 'No especificado'}</p>
                <div className="user-status">
                  <span className={`status-badge ${userInfo?.isActive ? 'active' : 'inactive'}`}>
                    {userInfo?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {/* Roles dentro de la tarjeta del usuario */}
                <div className="user-card-roles">
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
              </div>
            </div>
          </div>

          {/* Tarjeta del negocio con logo e información */}
          {primaryBusiness && (
            <div className="business-card">
              <div className="business-card-header">
                <div className="business-logo-wrap">
                  {businessLogo ? (
                    <img src={businessLogo} alt={primaryBusiness.name} />
                  ) : (
                    <span className="business-logo-placeholder">
                      {primaryBusiness.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="business-title">
                  <h4>{primaryBusiness.name}</h4>
                  <span className="business-code">{primaryBusiness.code}</span>
                </div>
              </div>
              <div className="business-body">
                {primaryBusiness.description && (
                  <p className="business-desc">{primaryBusiness.description}</p>
                )}
                <div className="business-meta">
                  {primaryBusiness.businessTypeName && (
                    <span className="badge">{primaryBusiness.businessTypeName}</span>
                  )}
                  {primaryBusiness.timezone && (
                    <span className="badge subtle">{primaryBusiness.timezone}</span>
                  )}
                  {primaryBusiness.address && (
                    <span className="badge subtle">{primaryBusiness.address}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Negocios como tags (además de la tarjeta principal) */}
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

          {/* Fechas */}
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