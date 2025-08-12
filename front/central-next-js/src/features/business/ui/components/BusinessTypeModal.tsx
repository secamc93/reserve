'use client';

import React, { useState, useEffect } from 'react';
import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../../domain/Business';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import './BusinessTypeModal.css';

interface BusinessTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBusinessTypeRequest | UpdateBusinessTypeRequest) => Promise<void>;
  businessType?: BusinessType | null;
  mode: 'create' | 'edit';
}

const BusinessTypeModal: React.FC<BusinessTypeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  businessType, 
  mode 
}) => {
  const [formData, setFormData] = useState<CreateBusinessTypeRequest | UpdateBusinessTypeRequest>({
    name: '',
    code: '',
    description: '',
    icon: '🏢'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (businessType && mode === 'edit') {
      setFormData({
        name: businessType.name,
        code: businessType.code,
        description: businessType.description,
        icon: businessType.icon
      });
    }
  }, [businessType, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del tipo de negocio es requerido';
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'El código del tipo de negocio es requerido';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.icon?.trim()) {
      newErrors.icon = 'El icono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      const msg = error?.message || error?.response?.data?.message || 'Ocurrió un error al guardar el tipo de negocio';
      setApiError(msg);
      console.error('Error al guardar el tipo de negocio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '🏷️ Crear Nuevo Tipo de Negocio' : '✏️ Editar Tipo de Negocio'}
      actions={
        <>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="business-type-form" className="btn-submit" disabled={loading}>
            {loading ? (mode === 'create' ? 'Creando...' : 'Actualizando...') : (mode === 'create' ? 'Crear Tipo' : 'Actualizar Tipo')}
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
      
      <form id="business-type-form" onSubmit={handleSubmit} className="modal-form" noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="code">Código *</label>
            <input
              type="text"
              id="code"
              value={formData.code || ''}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className={errors.code ? 'error' : ''}
              required
            />
            {errors.code && <p className="error-text">{errors.code}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icono *</label>
            <input
              type="text"
              id="icon"
              value={formData.icon || ''}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              className={errors.icon ? 'error' : ''}
              placeholder="🏢"
              required
            />
            {errors.icon && <p className="error-text">{errors.icon}</p>}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              rows={3}
              required
            />
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default BusinessTypeModal; 