import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, loading, hasPermission, isSuperAdmin } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos si se especifican
  if (requiredPermissions.length > 0) {
    // Los Super Admins tienen acceso a todo
    if (isSuperAdmin()) {
      console.log('🔐 ProtectedRoute: Super Admin - acceso permitido');
      return children;
    }

    // Verificar si tiene AL MENOS UNO de los permisos requeridos
    const hasAnyPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );
    
    console.log('🔐 ProtectedRoute Debug:');
    console.log('  - Permisos requeridos:', requiredPermissions);
    console.log('  - Tiene algún permiso:', hasAnyPermission);
    
    if (!hasAnyPermission) {
      console.log('🔐 ProtectedRoute: Sin permisos - redirigiendo a unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 