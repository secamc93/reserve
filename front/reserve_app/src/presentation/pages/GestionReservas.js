// Presentation - GestionReservas Page
import React, { useState } from 'react';
import { useReservas } from '../hooks/useReservas.js';
import ReservaRow from '../components/ReservaRow.js';
import ReservaFilters from '../components/ReservaFilters.js';
import CreateReservaModal from '../components/CreateReservaModal.js';
import './GestionReservas.css';

const GestionReservas = () => {
  const {
    reservas,
    loading,
    total,
    updateReservaStatus,
    cancelReserva,
    createReserva,
    applyFilters,
    clearFilters
  } = useReservas();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateReserva = async (reservaData) => {
    const result = await createReserva(reservaData);
    if (result.success) {
      setShowCreateModal(false);
    }
    return result;
  };

  const handleCancelReserva = async (id) => {
    const result = await cancelReserva(id);
    return result;
  };

  if (loading) {
    return (
      <div className="gestion-reservas">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-reservas">
      <header className="gestion-header">
        <div className="header-content">
          <h1>🏪 Gestión de Reservas</h1>
          <p>Sistema de administración interna para el restaurante</p>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-number">{total}</span>
              <span className="stat-label">Total Reservas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reservas.filter(r => r.isPendiente()).length}
              </span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reservas.filter(r => r.isAsignado()).length}
              </span>
              <span className="stat-label">Asignadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reservas.filter(r => r.isConfirmado()).length}
              </span>
              <span className="stat-label">Confirmadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reservas.filter(r => r.isCompletado()).length}
              </span>
              <span className="stat-label">Completadas</span>
            </div>
          </div>
        </div>
      </header>

      <div className="gestion-content">
        <ReservaFilters
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          loading={loading}
        />

        <div className="reservas-section">
          <div className="section-header">
            <h2>📋 Lista de Reservas</h2>
            <div className="header-actions">
              {loading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <span>Cargando reservas...</span>
                </div>
              )}
              <button
                className="btn-create-reserva"
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
              >
                ➕ Crear Reserva
              </button>
            </div>
          </div>

          {loading && reservas.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner-large"></div>
                <p>Cargando reservas...</p>
              </div>
            </div>
          ) : reservas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No hay reservas disponibles</h3>
              <p>No se encontraron reservas con los filtros aplicados.</p>
              <div className="empty-actions">
                <button 
                  className="clear-filters-button"
                  onClick={clearFilters}
                >
                  Limpiar Filtros
                </button>
                <button 
                  className="btn-create-reserva"
                  onClick={() => setShowCreateModal(true)}
                >
                  ➕ Crear Primera Reserva
                </button>
              </div>
            </div>
          ) : (
            <div className="reservas-list">
              <div className="list-header">
                <div className="list-header-left">
                  <span>ID | Estado</span>
                </div>
                <div className="list-header-center">
                  <span>Cliente | Fecha</span>
                </div>
                <div className="list-header-right">
                  <span>Invitados</span>
                </div>
              </div>
              
              <div className="reservas-rows">
                {reservas.map((reserva) => (
                  <ReservaRow
                    key={reserva.reserva_id}
                    reserva={reserva}
                    onUpdateStatus={updateReservaStatus}
                    onCancelReserva={handleCancelReserva}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Reserva Modal */}
      {showCreateModal && (
        <CreateReservaModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReserva}
          loading={loading}
        />
      )}
    </div>
  );
};

export default GestionReservas; 