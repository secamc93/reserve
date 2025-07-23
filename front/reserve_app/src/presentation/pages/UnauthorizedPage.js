import React from 'react';
import { Link } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">🚫</div>
        <h1>Acceso No Autorizado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Contacta al administrador si crees que esto es un error.</p>
        <div className="unauthorized-actions">
          <Link to="/calendario" className="btn-primary">
            Ir al Calendario
          </Link>
          <Link to="/" className="btn-secondary">
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 