'use client';

import React from 'react';

interface LoginCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  logoAlt?: string;
}

export default function LoginCard({ 
  children, 
  title = 'Iniciar Sesión',
  subtitle = 'Sistema de Gestión de Reservas',
  logoUrl = '/rupu-icon.png',
  logoAlt = 'Rupü'
}: LoginCardProps) {
  const handleImageError = (e: any) => {
    console.warn('Logo no encontrado:', logoUrl);
    // Ocultar la imagen si no se puede cargar
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="login-logo">
          <img 
            src={logoUrl} 
            alt={logoAlt}
            onError={handleImageError}
            onLoad={() => console.log('Logo cargado exitosamente:', logoUrl)}
          />
        </div>
        {title && (
          <h1 className="login-title">{title}</h1>
        )}
        {subtitle && (
          <p className="login-subtitle">{subtitle}</p>
        )}
      </div>

      {children}

      <div className="login-footer">
        <p className="help-text">Ingresa tus credenciales para continuar</p>
      </div>
    </div>
  );
} 