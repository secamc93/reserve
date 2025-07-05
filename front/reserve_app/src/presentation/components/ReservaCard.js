// Presentation - ReservaCard Component
import React from 'react';
import './ReservaCard.css';

const ReservaCard = ({ reserva, onUpdateStatus }) => {
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

  return (
    <div className="reserva-card">
      <div className="reserva-header">
        <div className="reserva-id">
          <span className="label">Reserva #</span>
          <span className="value">{reserva.reserva_id}</span>
        </div>
        <div 
          className="status-badge"
          style={{ backgroundColor: reserva.getStatusColor() }}
        >
          {reserva.estado_nombre}
        </div>
      </div>

      <div className="reserva-body">
        <div className="reserva-info">
          <div className="info-section">
            <h3>👤 Cliente</h3>
            <p><strong>Nombre:</strong> {reserva.cliente_nombre}</p>
            <p><strong>Email:</strong> {reserva.cliente_email}</p>
            <p><strong>Teléfono:</strong> {reserva.cliente_telefono}</p>
            <p><strong>DNI:</strong> {reserva.cliente_dni}</p>
          </div>

          <div className="info-section">
            <h3>📅 Fecha y Hora</h3>
            <p><strong>Fecha:</strong> {reserva.getFormattedDate()}</p>
            <p><strong>Horario:</strong> {reserva.getFormattedTime()}</p>
            <p><strong>Invitados:</strong> {reserva.number_of_guests}</p>
          </div>

          <div className="info-section">
            <h3>🏪 Restaurante</h3>
            <p><strong>Nombre:</strong> {reserva.restaurante_nombre}</p>
            <p><strong>Código:</strong> {reserva.restaurante_codigo}</p>
            {reserva.restaurante_direccion && (
              <p><strong>Dirección:</strong> {reserva.restaurante_direccion}</p>
            )}
          </div>

          {reserva.mesa_id && (
            <div className="info-section">
              <h3>🪑 Mesa</h3>
              <p><strong>Número:</strong> {reserva.mesa_numero}</p>
              <p><strong>Capacidad:</strong> {reserva.mesa_capacidad}</p>
            </div>
          )}

          <div className="info-section">
            <h3>📋 Detalles</h3>
            <p><strong>Creada:</strong> {reserva.reserva_creada.toLocaleString('es-ES')}</p>
            <p><strong>Actualizada:</strong> {reserva.reserva_actualizada.toLocaleString('es-ES')}</p>
          </div>
        </div>

        <div className="reserva-actions">
          <h3>🔄 Cambiar Estado</h3>
          <div className="action-buttons">
            {reserva.estado_codigo !== 'pendiente' && (
              <button 
                className="btn-status btn-pendiente"
                onClick={() => handleStatusChange('pendiente')}
              >
                Pendiente
              </button>
            )}
            {reserva.estado_codigo !== 'confirmado' && (
              <button 
                className="btn-status btn-confirmado"
                onClick={() => handleStatusChange('confirmado')}
              >
                Confirmar
              </button>
            )}
            {reserva.estado_codigo !== 'cancelado' && (
              <button 
                className="btn-status btn-cancelado"
                onClick={() => handleStatusChange('cancelado')}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaCard; 