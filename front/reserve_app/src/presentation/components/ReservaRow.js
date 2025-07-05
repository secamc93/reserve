// Presentation - ReservaRow Component
import React, { useState } from 'react';
import StatusHistoryTimeline from './StatusHistoryTimeline.js';
import './ReservaRow.css';

const ReservaRow = ({ reserva, onUpdateStatus, onCancelReserva }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`¿Está seguro de cambiar el estado a ${newStatus}?`)) {
      const result = await onUpdateStatus(reserva.reserva_id, newStatus);
      if (result.success) {
        alert('Estado actualizado exitosamente');
      } else {
        alert('Error al actualizar el estado: ' + result.error);
      }
    }
  };

  const handleCancelReserva = async () => {
    if (window.confirm('¿Está seguro de cancelar esta reserva? Esta acción utiliza el endpoint específico de cancelación.')) {
      const result = await onCancelReserva(reserva.reserva_id);
      if (result.success) {
        alert('Reserva cancelada exitosamente');
      } else {
        alert('Error al cancelar la reserva: ' + result.error);
      }
    }
  };

  return (
    <div className="reserva-row">
      {/* Compact Row - Always Visible */}
      <div className="reserva-row-compact" onClick={toggleExpanded}>
        <div className="row-left">
          <div className="reserva-id">
            <span className="id-label">#{reserva.reserva_id}</span>
          </div>
          <div className="reserva-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: reserva.getStatusColor() }}
            >
              {reserva.getStatusIcon()} {reserva.estado_nombre}
            </span>
          </div>
        </div>

        <div className="row-center">
          <div className="cliente-info">
            <span className="cliente-nombre">{reserva.cliente_nombre}</span>
            <span className="cliente-email">{reserva.cliente_email}</span>
          </div>
          <div className="fecha-info">
            <span className="fecha">{reserva.start_at.toLocaleDateString('es-ES')}</span>
            <span className="hora">{reserva.getFormattedTime()}</span>
          </div>
        </div>

        <div className="row-right">
          <div className="guests-info">
            <span className="guests-count">👥 {reserva.number_of_guests}</span>
          </div>
          <div className="expand-indicator">
            <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details - Shown when expanded */}
      {isExpanded && (
        <div className="reserva-row-expanded">
          <div className="expanded-content">
            <div className="details-grid">
              <div className="detail-section">
                <h4>👤 Información del Cliente</h4>
                <div className="detail-item">
                  <span className="label">Nombre:</span>
                  <span className="value">{reserva.cliente_nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{reserva.cliente_email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">{reserva.cliente_telefono}</span>
                </div>
                <div className="detail-item">
                  <span className="label">DNI:</span>
                  <span className="value">{reserva.cliente_dni}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>📅 Detalles de la Reserva</h4>
                <div className="detail-item">
                  <span className="label">Fecha:</span>
                  <span className="value">{reserva.getFormattedDate()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Horario:</span>
                  <span className="value">{reserva.getFormattedTime()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Duración:</span>
                  <span className="value">{reserva.getFormattedDuration()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Invitados:</span>
                  <span className="value">{reserva.number_of_guests}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Estado:</span>
                  <span className="value">{reserva.estado_nombre}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>🏪 Restaurante</h4>
                <div className="detail-item">
                  <span className="label">Nombre:</span>
                  <span className="value">{reserva.restaurante_nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Código:</span>
                  <span className="value">{reserva.restaurante_codigo}</span>
                </div>
                {reserva.restaurante_direccion && (
                  <div className="detail-item">
                    <span className="label">Dirección:</span>
                    <span className="value">{reserva.restaurante_direccion}</span>
                  </div>
                )}
              </div>

              {reserva.mesa_id && (
                <div className="detail-section">
                  <h4>🪑 Mesa Asignada</h4>
                  <div className="detail-item">
                    <span className="label">Número:</span>
                    <span className="value">{reserva.mesa_numero}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Capacidad:</span>
                    <span className="value">{reserva.mesa_capacidad}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <StatusHistoryTimeline reserva={reserva} />

            <div className="actions-section">
              <h4>🔄 Cambiar Estado</h4>
              <div className="action-buttons">
                {reserva.canChangeStatus() && reserva.estado_codigo !== 'pendiente' && (
                  <button 
                    className="btn-status btn-pendiente"
                    onClick={() => handleStatusChange('pendiente')}
                  >
                    ⏳ Pendiente
                  </button>
                )}
                {reserva.canChangeStatus() && reserva.estado_codigo !== 'asignado' && (
                  <button 
                    className="btn-status btn-asignado"
                    onClick={() => handleStatusChange('asignado')}
                  >
                    🪑 Asignado
                  </button>
                )}
                {reserva.canChangeStatus() && reserva.estado_codigo !== 'confirmado' && (
                  <button 
                    className="btn-status btn-confirmado"
                    onClick={() => handleStatusChange('confirmado')}
                  >
                    ✅ Confirmado
                  </button>
                )}
                {reserva.canChangeStatus() && reserva.estado_codigo !== 'completado' && (
                  <button 
                    className="btn-status btn-completado"
                    onClick={() => handleStatusChange('completado')}
                  >
                    🎉 Completado
                  </button>
                )}
              </div>
              {!reserva.canChangeStatus() && (
                <div className="status-locked-message">
                  <span className="status-locked-icon">🔒</span>
                  <span className="status-locked-text">
                    Esta reserva está {reserva.estado_nombre.toLowerCase()} y no se puede cambiar su estado
                  </span>
                </div>
              )}
            </div>

            {/* Cancel Reservation Section - Only show if can be canceled */}
            {reserva.canBeCanceled() && (
              <div className="cancel-section">
                <h4>🚫 Cancelar Reserva</h4>
                <div className="cancel-description">
                  <p>Utiliza el endpoint específico de cancelación (PATCH /cancel)</p>
                  {reserva.getStatusChangeCount() > 0 && (
                    <p>Esta reserva ha tenido {reserva.getStatusChangeCount()} cambio(s) de estado</p>
                  )}
                </div>
                <div className="cancel-actions">
                  <button 
                    className="btn-cancel-reserva"
                    onClick={handleCancelReserva}
                  >
                    🗑️ Cancelar Reserva
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaRow; 