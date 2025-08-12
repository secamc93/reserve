'use client';

import React, { useState, useEffect } from 'react';
import { CreateReservationData } from '@/features/reservations/domain/Reservation';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import './CreateReservationModal.css';

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReservationData) => Promise<any>;
  loading: boolean;
  initialDate?: Date | null;
}

const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  initialDate
}) => {
  const [formData, setFormData] = useState<CreateReservationData>({
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    cliente_dni: '',
    start_at: '',
    end_at: '',
    number_of_guests: 1,
    mesa_id: 1,
    restaurante_id: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate) {
      const startTime = new Date(initialDate);
      startTime.setHours(12, 0, 0, 0); // 12:00 PM por defecto
      
      const endTime = new Date(initialDate);
      endTime.setHours(14, 0, 0, 0); // 2:00 PM por defecto

      setFormData(prev => ({
        ...prev,
        start_at: startTime.toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
        end_at: endTime.toISOString().slice(0, 16)
      }));
    }
  }, [initialDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente_nombre.trim()) {
      newErrors.cliente_nombre = 'El nombre del cliente es requerido';
    }

    if (!formData.cliente_email.trim()) {
      newErrors.cliente_email = 'El email del cliente es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.cliente_email)) {
      newErrors.cliente_email = 'El email no es válido';
    }

    if (!formData.cliente_telefono.trim()) {
      newErrors.cliente_telefono = 'El teléfono del cliente es requerido';
    }

    if (!formData.start_at) {
      newErrors.start_at = 'La fecha y hora de inicio es requerida';
    }

    if (!formData.end_at) {
      newErrors.end_at = 'La fecha y hora de fin es requerida';
    }

    if (formData.start_at && formData.end_at) {
      const startDate = new Date(formData.start_at);
      const endDate = new Date(formData.end_at);
      
      if (startDate >= endDate) {
        newErrors.end_at = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    if (formData.number_of_guests <= 0) {
      newErrors.number_of_guests = 'El número de invitados debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setApiError(null);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        cliente_nombre: '',
        cliente_email: '',
        cliente_telefono: '',
        cliente_dni: '',
        start_at: '',
        end_at: '',
        number_of_guests: 1,
        mesa_id: 1,
        restaurante_id: 1,
      });
      setErrors({});
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Ocurrió un error al crear la reserva';
      setApiError(msg);
      console.error('Error al crear reserva:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="📅 Crear Nueva Reserva"
      actions={
        <>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="reservation-form"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Reserva'}
          </button>
        </>
      }
    >
      {apiError && (
        <ErrorMessage
          message={apiError}
          dismissible
          onDismiss={() => setApiError(null)}
          className="mb-4"
        />
      )}

      <form id="reservation-form" onSubmit={handleSubmit} className="modal-form">
        <div className="form-section">
            <h3>👤 Información del Cliente</h3>
            
            <div className="form-group">
              <label htmlFor="cliente_nombre">Nombre *</label>
              <input
                type="text"
                id="cliente_nombre"
                name="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={handleInputChange}
                className={errors.cliente_nombre ? 'error' : ''}
                placeholder="Nombre completo del cliente"
              />
              {errors.cliente_nombre && <span className="error-message">{errors.cliente_nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cliente_email">Email *</label>
              <input
                type="email"
                id="cliente_email"
                name="cliente_email"
                value={formData.cliente_email}
                onChange={handleInputChange}
                className={errors.cliente_email ? 'error' : ''}
                placeholder="email@ejemplo.com"
              />
              {errors.cliente_email && <span className="error-message">{errors.cliente_email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cliente_telefono">Teléfono *</label>
              <input
                type="tel"
                id="cliente_telefono"
                name="cliente_telefono"
                value={formData.cliente_telefono}
                onChange={handleInputChange}
                className={errors.cliente_telefono ? 'error' : ''}
                placeholder="+34 123 456 789"
              />
              {errors.cliente_telefono && <span className="error-message">{errors.cliente_telefono}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cliente_dni">DNI (opcional)</label>
              <input
                type="text"
                id="cliente_dni"
                name="cliente_dni"
                value={formData.cliente_dni}
                onChange={handleInputChange}
                placeholder="12345678A"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>📅 Información de la Reserva</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_at">Fecha y Hora de Inicio *</label>
                <input
                  type="datetime-local"
                  id="start_at"
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleInputChange}
                  className={errors.start_at ? 'error' : ''}
                />
                {errors.start_at && <span className="error-message">{errors.start_at}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="end_at">Fecha y Hora de Fin *</label>
                <input
                  type="datetime-local"
                  id="end_at"
                  name="end_at"
                  value={formData.end_at}
                  onChange={handleInputChange}
                  className={errors.end_at ? 'error' : ''}
                />
                {errors.end_at && <span className="error-message">{errors.end_at}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="number_of_guests">Número de Invitados *</label>
                <input
                  type="number"
                  id="number_of_guests"
                  name="number_of_guests"
                  value={formData.number_of_guests}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className={errors.number_of_guests ? 'error' : ''}
                />
                {errors.number_of_guests && <span className="error-message">{errors.number_of_guests}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mesa_id">Mesa</label>
                <select
                  id="mesa_id"
                  name="mesa_id"
                  value={formData.mesa_id}
                  onChange={handleInputChange}
                >
                  <option value={1}>Mesa 1</option>
                  <option value={2}>Mesa 2</option>
                  <option value={3}>Mesa 3</option>
                  <option value={4}>Mesa 4</option>
                  <option value={5}>Mesa 5</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </ModalBase>
  );
};

export default CreateReservationModal; 