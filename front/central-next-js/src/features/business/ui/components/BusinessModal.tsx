'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Business, CreateBusinessRequest, UpdateBusinessRequest, BusinessType } from '../../domain/Business';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import './BusinessModal.css';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBusinessRequest | UpdateBusinessRequest) => Promise<void>;
  business?: Business | null;
  mode: 'create' | 'edit';
  businessTypes: BusinessType[];
}

const BusinessModal: React.FC<BusinessModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  business, 
  mode, 
  businessTypes 
}) => {
  const [formData, setFormData] = useState<CreateBusinessRequest | UpdateBusinessRequest>({
    name: '',
    code: '',
    businessTypeId: 1,
    timezone: 'Europe/Madrid',
    address: '',
    description: '',
    logoURL: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    customDomain: '',
    enableDelivery: false,
    enablePickup: false,
    enableReservations: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (business && mode === 'edit') {
      setFormData({
        name: business.name,
        code: business.code,
        businessTypeId: business.businessTypeId,
        timezone: business.timezone,
        address: business.address,
        description: business.description,
        logoURL: business.logoURL,
        primaryColor: business.primaryColor,
        secondaryColor: business.secondaryColor,
        customDomain: business.customDomain,
        enableDelivery: business.enableDelivery,
        enablePickup: business.enablePickup,
        enableReservations: business.enableReservations
      });
    }
  }, [business, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del negocio es requerido';
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'El código del negocio es requerido';
    }

    if (!formData.businessTypeId) {
      newErrors.businessTypeId = 'El tipo de negocio es requerido';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'La dirección es requerida';
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
      const msg = error?.message || error?.response?.data?.message || 'Ocurrió un error al guardar el negocio';
      setApiError(msg);
      console.error('Error al guardar el negocio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '🏢 Crear Nuevo Negocio' : '✏️ Editar Negocio'}
      actions={
        <>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="business-form" className="btn-submit" disabled={loading}>
            {loading ? (mode === 'create' ? 'Creando...' : 'Actualizando...') : (mode === 'create' ? 'Crear Negocio' : 'Actualizar Negocio')}
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
      
      <form id="business-form" onSubmit={handleSubmit} className="modal-form" noValidate>
        <div className="form-grid">
          {/* Información básica */}
          <div className="form-group">
            <label htmlFor="name">Nombre del Negocio *</label>
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
            <label htmlFor="businessTypeId">Tipo de Negocio *</label>
            <select
              id="businessTypeId"
              value={formData.businessTypeId || ''}
              onChange={(e) => handleInputChange('businessTypeId', parseInt(e.target.value))}
              className={errors.businessTypeId ? 'error' : ''}
              required
            >
              <option value="">Seleccionar tipo</option>
              {businessTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
            {errors.businessTypeId && <p className="error-text">{errors.businessTypeId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="timezone">Zona Horaria</label>
            <select
              id="timezone"
              value={formData.timezone || ''}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={errors.address ? 'error' : ''}
              required
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Configuración de marca */}
          <div className="form-group">
            <label htmlFor="primaryColor">Color Primario</label>
            <input
              type="color"
              id="primaryColor"
              value={formData.primaryColor || '#3b82f6'}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="secondaryColor">Color Secundario</label>
            <input
              type="color"
              id="secondaryColor"
              value={formData.secondaryColor || '#8b5cf6'}
              onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="logoURL">URL del Logo</label>
            <input
              type="url"
              id="logoURL"
              value={formData.logoURL || ''}
              onChange={(e) => handleInputChange('logoURL', e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customDomain">Dominio Personalizado</label>
            <input
              type="text"
              id="customDomain"
              value={formData.customDomain || ''}
              onChange={(e) => handleInputChange('customDomain', e.target.value)}
              placeholder="mi-negocio.com"
            />
          </div>

          {/* Funcionalidades */}
          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enableReservations || false}
                onChange={(e) => handleInputChange('enableReservations', e.target.checked)}
              />
              Habilitar Reservas
            </label>
          </div>

          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enableDelivery || false}
                onChange={(e) => handleInputChange('enableDelivery', e.target.checked)}
              />
              Habilitar Delivery
            </label>
          </div>

          <div className="form-group form-group-full">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enablePickup || false}
                onChange={(e) => handleInputChange('enablePickup', e.target.checked)}
              />
              Habilitar Recogida
            </label>
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default BusinessModal; 