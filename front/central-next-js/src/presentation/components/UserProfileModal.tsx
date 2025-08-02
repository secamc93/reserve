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
              <span className="avatar-placeholder">
                {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="profile-details">
              <h3>{userInfo?.name || 'Usuario'}</h3>
              <p>{userInfo?.email || 'usuario@ejemplo.com'}</p>
              <p>Teléfono: {userInfo?.phone || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 