'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CreateTableRequest, UpdateTableRequest, Table } from '@/services/tables/domain/entities/Table';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import { useAppContext } from '@/shared/contexts/AppContext';
import './TableModal.css';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTableRequest | UpdateTableRequest) => Promise<void>;
  table?: Table | null;
  mode: 'create' | 'edit';
}

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  table,
  mode
}) => {
  const { user } = useAppContext();
  const defaultBusinessId = useMemo(() => {
    return user?.businesses?.[0]?.id ? Number(user.businesses[0].id) : 1;
  }, [user]);

  const [formData, setFormData] = useState<CreateTableRequest | UpdateTableRequest>({
    businessId: defaultBusinessId,
    number: 1,
    capacity: 2
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (table && mode === 'edit') {
      setFormData({
        businessId: table.businessId,
        number: table.number,
        capacity: table.capacity
      });
    } else {
      setFormData({
        businessId: defaultBusinessId,
        number: 1,
        capacity: 2
      });
    }
    setErrors({});
  }, [table, mode, defaultBusinessId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number || formData.number <= 0) {
      newErrors.number = 'El número de mesa es requerido y debe ser mayor a 0';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'La capacidad es requerida y debe ser mayor a 0';
    }

    if (formData.capacity && formData.capacity > 20) {
      newErrors.capacity = 'La capacidad no puede ser mayor a 20';
    }

    if (!('businessId' in formData) || !formData.businessId) {
      newErrors.businessId = 'El negocio es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      // Priorizar mensaje del backend si existe
      const msg = error?.message || error?.response?.data?.message || 'Ocurrió un error al guardar la mesa';
      setApiError(msg);
      console.error('Error al guardar la mesa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof (CreateTableRequest | UpdateTableRequest), value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseInt(value) || 0 : value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Nueva Mesa' : 'Editar Mesa'}
      actions={
        <>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="table-form" className="btn-submit" disabled={loading}>
            {loading ? (mode === 'create' ? 'Creando...' : 'Actualizando...') : (mode === 'create' ? 'Crear Mesa' : 'Actualizar Mesa')}
          </button>
        </>
      }
    >
      {apiError && (
        <ErrorMessage 
          message={apiError} 
          title="Error al procesar la solicitud"
          variant="error"
          dismissible={true}
          onDismiss={() => setApiError(null)}
          className="mb-4"
        />
      )}
      <form id="table-form" onSubmit={handleSubmit} className="modal-form" noValidate>
        <div className="form-grid">
          {/* Número de mesa */}
          <div className="form-group">
            <label htmlFor="number">Número de Mesa *</label>
            <input
              type="number"
              id="number"
              value={formData.number || ''}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={errors.number ? 'error' : ''}
              min={1}
              required
            />
            {errors.number && <p className="error-text">{errors.number}</p>}
          </div>

          {/* Capacidad */}
          <div className="form-group">
            <label htmlFor="capacity">Capacidad *</label>
            <input
              type="number"
              id="capacity"
              value={formData.capacity || ''}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className={errors.capacity ? 'error' : ''}
              min={1}
              max={20}
              required
            />
            {errors.capacity && <p className="error-text">{errors.capacity}</p>}
            <p className="help-text">Máximo 20 personas por mesa</p>
          </div>

          {/* Negocio (solo lectura) */}
          <div className="form-group form-group-full">
            <label>Negocio</label>
            <input type="text" value={user?.businesses?.[0]?.name || `ID: ${defaultBusinessId}`} readOnly />
            {errors.businessId && <p className="error-text">{errors.businessId}</p>}
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default TableModal; 