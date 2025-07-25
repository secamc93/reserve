import React, { useState, useEffect } from 'react';
import ModalBase from '../ModalBase/ModalBase';
import './BusinessModal.css';

const BusinessModal = ({
    isOpen,
    onClose,
    onSubmit,
    business = null,
    businessTypes = [],
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        business_type_id: '',
        timezone: '',
        address: '',
        description: '',
        logo_url: '',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        custom_domain: '',
        is_active: true,
        enable_delivery: false,
        enable_pickup: false,
        enable_reservations: false
    });

    const [errors, setErrors] = useState({});

    // Cargar datos del negocio si se está editando
    useEffect(() => {
        if (business) {
            setFormData({
                name: business.name || '',
                code: business.code || '',
                business_type_id: business.businessType?.id || '',
                timezone: business.timezone || '',
                address: business.address || '',
                description: business.description || '',
                logo_url: business.logoUrl || '',
                primary_color: business.primaryColor || '#3B82F6',
                secondary_color: business.secondaryColor || '#1E40AF',
                custom_domain: business.customDomain || '',
                is_active: business.isActive !== undefined ? business.isActive : true,
                enable_delivery: business.enableDelivery || false,
                enable_pickup: business.enablePickup || false,
                enable_reservations: business.enableReservations || false
            });
        } else {
            // Reset form for new business
            setFormData({
                name: '',
                code: '',
                business_type_id: '',
                timezone: '',
                address: '',
                description: '',
                logo_url: '',
                primary_color: '#3B82F6',
                secondary_color: '#1E40AF',
                custom_domain: '',
                is_active: true,
                enable_delivery: false,
                enable_pickup: false,
                enable_reservations: false
            });
        }
        setErrors({});
    }, [business, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.code.trim()) {
            newErrors.code = 'El código es requerido';
        } else if (formData.code.length < 3) {
            newErrors.code = 'El código debe tener al menos 3 caracteres';
        }

        if (!formData.business_type_id) {
            newErrors.business_type_id = 'El tipo de negocio es requerido';
        }

        if (formData.custom_domain && !isValidDomain(formData.custom_domain)) {
            newErrors.custom_domain = 'Dominio inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidDomain = (domain) => {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={handleClose}
            title={business ? 'Editar Negocio' : 'Crear Nuevo Negocio'}
            actions={
                <>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        form="business-form"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : (business ? 'Actualizar' : 'Crear')}
                    </button>
                </>
            }
        >
            <div className="info-box">
                <div className="info-content">
                    <div className="info-icon">💡</div>
                    <p>Completa la información básica del negocio. Los campos marcados con * son obligatorios.</p>
                </div>
            </div>
            <form id="business-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Nombre del Negocio *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'error' : ''}
                            disabled={loading}
                            placeholder="Ej: Restaurante La Bella"
                        />
                        {errors.name && <div className="error-text">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="code">Código *</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            className={errors.code ? 'error' : ''}
                            disabled={loading}
                            placeholder="Ej: REST001"
                        />
                        {errors.code && <div className="error-text">{errors.code}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="business_type_id">Tipo de Negocio *</label>
                        <select
                            id="business_type_id"
                            name="business_type_id"
                            value={formData.business_type_id}
                            onChange={handleInputChange}
                            className={errors.business_type_id ? 'error' : ''}
                            disabled={loading}
                        >
                            <option value="">Seleccionar tipo</option>
                            {businessTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.business_type_id && <div className="error-text">{errors.business_type_id}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="timezone">Zona Horaria</label>
                        <input
                            type="text"
                            id="timezone"
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="America/Guayaquil"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Dirección</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Dirección completa del negocio"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="logo_url">URL del Logo</label>
                        <input
                            type="url"
                            id="logo_url"
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="https://ejemplo.com/logo.png"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="primary_color">Color Primario</label>
                        <input
                            type="color"
                            id="primary_color"
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="secondary_color">Color Secundario</label>
                        <input
                            type="color"
                            id="secondary_color"
                            name="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="custom_domain">Dominio Personalizado</label>
                        <input
                            type="text"
                            id="custom_domain"
                            name="custom_domain"
                            value={formData.custom_domain}
                            onChange={handleInputChange}
                            className={errors.custom_domain ? 'error' : ''}
                            disabled={loading}
                            placeholder="mi-negocio.com"
                        />
                        {errors.custom_domain && <div className="error-text">{errors.custom_domain}</div>}
                    </div>

                    <div className="form-group form-group-full">
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Descripción detallada del negocio"
                        />
                    </div>

                    <div className="form-group-checkbox">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_delivery"
                                name="enable_delivery"
                                checked={formData.enable_delivery}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="enable_delivery">Habilitar Delivery</label>
                        </div>
                    </div>
                    <div className="form-group-checkbox">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_pickup"
                                name="enable_pickup"
                                checked={formData.enable_pickup}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="enable_pickup">Habilitar Pickup</label>
                        </div>
                    </div>
                    <div className="form-group-checkbox">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_reservations"
                                name="enable_reservations"
                                checked={formData.enable_reservations}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="enable_reservations">Habilitar Reservas</label>
                        </div>
                    </div>
                    <div className="form-group-checkbox">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="is_active">Negocio Activo</label>
                        </div>
                    </div>
                </div>
            </form>
        </ModalBase>
    );
};

export default BusinessModal; 