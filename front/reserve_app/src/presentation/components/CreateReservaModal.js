// Presentation - CreateReservaModal Component
import React, { useState } from 'react';
import './CreateReservaModal.css';

const CreateReservaModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    start_at: '',
    end_at: '',
    number_of_guests: 1,
    restaurant_id: 1
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El formato del email no es válido';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (formData.phone.length < 7) {
      newErrors.phone = 'El teléfono debe tener al menos 7 dígitos';
    }

    if (!formData.dni) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (formData.dni < 1) {
      newErrors.dni = 'El DNI debe ser un número válido';
    }

    if (!formData.start_at) {
      newErrors.start_at = 'La fecha y hora de inicio es obligatoria';
    }

    if (!formData.end_at) {
      newErrors.end_at = 'La fecha y hora de fin es obligatoria';
    }

    // Date validation
    if (formData.start_at && formData.end_at) {
      const startDate = new Date(formData.start_at);
      const endDate = new Date(formData.end_at);
      const now = new Date();

      if (startDate < now) {
        newErrors.start_at = 'La fecha no puede ser en el pasado';
      }

      if (startDate >= endDate) {
        newErrors.end_at = 'La hora de fin debe ser posterior a la de inicio';
      }
    }

    if (formData.number_of_guests < 1 || formData.number_of_guests > 20) {
      newErrors.number_of_guests = 'El número de invitados debe estar entre 1 y 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert datetime-local format to ISO format
    const processedData = {
      ...formData,
      start_at: new Date(formData.start_at).toISOString(),
      end_at: new Date(formData.end_at).toISOString(),
      dni: parseInt(formData.dni, 10),
      number_of_guests: parseInt(formData.number_of_guests, 10),
      restaurant_id: parseInt(formData.restaurant_id, 10)
    };

    await onSubmit(processedData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dni: '',
      start_at: '',
      end_at: '',
      number_of_guests: 1,
      restaurant_id: 1
    });
    setErrors({});
    onClose();
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Crear Nueva Reserva</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">👤 Nombre Completo *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'error' : ''}
                placeholder="Ej: Juan Pérez"
                disabled={loading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">📧 Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="Ej: juan@example.com"
                disabled={loading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">📱 Teléfono *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'error' : ''}
                placeholder="Ej: 3001234567"
                disabled={loading}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dni">🆔 DNI *</label>
              <input
                type="number"
                id="dni"
                value={formData.dni}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                className={errors.dni ? 'error' : ''}
                placeholder="Ej: 12345678"
                disabled={loading}
              />
              {errors.dni && <span className="error-text">{errors.dni}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="start_at">📅 Fecha y Hora de Inicio *</label>
              <input
                type="datetime-local"
                id="start_at"
                value={formData.start_at}
                onChange={(e) => handleInputChange('start_at', e.target.value)}
                className={errors.start_at ? 'error' : ''}
                min={getMinDateTime()}
                disabled={loading}
              />
              {errors.start_at && <span className="error-text">{errors.start_at}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_at">🕒 Fecha y Hora de Fin *</label>
              <input
                type="datetime-local"
                id="end_at"
                value={formData.end_at}
                onChange={(e) => handleInputChange('end_at', e.target.value)}
                className={errors.end_at ? 'error' : ''}
                min={formData.start_at || getMinDateTime()}
                disabled={loading}
              />
              {errors.end_at && <span className="error-text">{errors.end_at}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="number_of_guests">👥 Número de Invitados *</label>
              <input
                type="number"
                id="number_of_guests"
                value={formData.number_of_guests}
                onChange={(e) => handleInputChange('number_of_guests', e.target.value)}
                className={errors.number_of_guests ? 'error' : ''}
                min="1"
                max="20"
                disabled={loading}
              />
              {errors.number_of_guests && <span className="error-text">{errors.number_of_guests}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="restaurant_id">🏪 Restaurante *</label>
              <select
                id="restaurant_id"
                value={formData.restaurant_id}
                onChange={(e) => handleInputChange('restaurant_id', e.target.value)}
                disabled={loading}
              >
                <option value="1">Trattoria la bella</option>
                {/* Add more restaurants as needed */}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservaModal; 