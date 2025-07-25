import React, { useState, useEffect } from 'react';
import ModalBase from '../ModalBase/ModalBase';
import './RoomModal.css';

const RoomModal = ({
    isOpen,
    onClose,
    onSubmit,
    room = null,
    businesses = [],
    loading = false
}) => {
    const [formData, setFormData] = useState({
        business_id: '',
        name: '',
        code: '',
        description: '',
        capacity: '',
        min_capacity: '1',
        max_capacity: '',
        is_active: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (room) {
            setFormData({
                business_id: room.businessId || room.business?.id || '',
                name: room.name || '',
                code: room.code || '',
                description: room.description || '',
                capacity: room.capacity || '',
                min_capacity: room.minCapacity || '1',
                max_capacity: room.maxCapacity || '',
                is_active: room.isActive !== undefined ? room.isActive : true
            });
        } else {
            setFormData({
                business_id: '',
                name: '',
                code: '',
                description: '',
                capacity: '',
                min_capacity: '1',
                max_capacity: '',
                is_active: true
            });
        }
        setErrors({});
    }, [room, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.business_id) {
            newErrors.business_id = 'El negocio es requerido';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre de la sala es requerido';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }
        if (!formData.code.trim()) {
            newErrors.code = 'El código de la sala es requerido';
        } else if (formData.code.trim().length < 2) {
            newErrors.code = 'El código debe tener al menos 2 caracteres';
        }
        if (!formData.capacity) {
            newErrors.capacity = 'La capacidad es requerida';
        } else if (parseInt(formData.capacity) <= 0) {
            newErrors.capacity = 'La capacidad debe ser mayor a 0';
        }
        if (parseInt(formData.min_capacity) < 1) {
            newErrors.min_capacity = 'La capacidad mínima debe ser al menos 1';
        }
        if (formData.max_capacity && parseInt(formData.max_capacity) > 0) {
            if (parseInt(formData.max_capacity) < parseInt(formData.min_capacity)) {
                newErrors.max_capacity = 'La capacidad máxima debe ser mayor o igual a la capacidad mínima';
            }
            if (parseInt(formData.max_capacity) > parseInt(formData.capacity)) {
                newErrors.max_capacity = 'La capacidad máxima no puede ser mayor a la capacidad total';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const submitData = {
            business_id: parseInt(formData.business_id),
            name: formData.name.trim(),
            code: formData.code.trim(),
            description: formData.description.trim(),
            capacity: parseInt(formData.capacity),
            min_capacity: parseInt(formData.min_capacity),
            max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : 0,
            is_active: formData.is_active
        };
        onSubmit(submitData);
    };

    const actions = (
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
                className="btn-submit"
                disabled={loading}
                form="room-form"
            >
                {loading ? 'Guardando...' : (room ? 'Actualizar' : 'Crear')}
            </button>
        </>
    );

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={onClose}
            title={room ? '🏠 Editar Sala' : '🏠 Crear Nueva Sala'}
            actions={actions}
        >
            <form id="room-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-grid">
                    <div className="form-group form-group-business">
                        <label htmlFor="business_id">Negocio *</label>
                        <select
                            id="business_id"
                            name="business_id"
                            value={formData.business_id}
                            onChange={handleInputChange}
                            className={errors.business_id ? 'error' : ''}
                            disabled={loading}
                        >
                            <option value="">Seleccionar negocio</option>
                            {businesses.map(business => (
                                <option key={business.id} value={business.id}>
                                    {business.name} ({business.code})
                                </option>
                            ))}
                        </select>
                        {errors.business_id && <div className="error-text">{errors.business_id}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Nombre de la Sala *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'error' : ''}
                            disabled={loading}
                            placeholder="ej: Sala Principal"
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
                            placeholder="ej: SALA01"
                        />
                        {errors.code && <div className="error-text">{errors.code}</div>}
                    </div>
                </div>
                <div className="form-group form-group-full">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Descripción opcional de la sala..."
                        rows="3"
                    />
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="capacity">Capacidad Total *</label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            className={errors.capacity ? 'error' : ''}
                            disabled={loading}
                            min="1"
                            placeholder="ej: 20"
                        />
                        {errors.capacity && <div className="error-text">{errors.capacity}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="min_capacity">Capacidad Mínima</label>
                        <input
                            type="number"
                            id="min_capacity"
                            name="min_capacity"
                            value={formData.min_capacity}
                            onChange={handleInputChange}
                            className={errors.min_capacity ? 'error' : ''}
                            disabled={loading}
                            min="1"
                            placeholder="ej: 5"
                        />
                        {errors.min_capacity && <div className="error-text">{errors.min_capacity}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="max_capacity">Capacidad Máxima</label>
                        <input
                            type="number"
                            id="max_capacity"
                            name="max_capacity"
                            value={formData.max_capacity}
                            onChange={handleInputChange}
                            className={errors.max_capacity ? 'error' : ''}
                            disabled={loading}
                            min="0"
                            placeholder="ej: 15 (0 = sin límite)"
                        />
                        {errors.max_capacity && <div className="error-text">{errors.max_capacity}</div>}
                    </div>
                    <div className="form-group form-group-checkbox" style={{ marginTop: 0, marginBottom: 0, justifyContent: 'flex-end' }}>
                        <label style={{ textAlign: 'center', width: '100%' }}>Sala activa</label>
                        <div className="room-toggle-container">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="room-toggle-checkbox"
                            />
                            <label htmlFor="is_active" className={formData.is_active ? 'room-toggle-label active' : 'room-toggle-label'}>
                                {formData.is_active ? 'Activa' : 'Inactiva'}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="info-box">
                    <div className="info-content">
                        <span className="info-icon">ℹ️</span>
                        <p>El código de la sala debe ser único dentro del mismo negocio</p>
                    </div>
                </div>
                <div className="info-box">
                    <div className="info-content">
                        <span className="info-icon">👥</span>
                        <p>La capacidad mínima y máxima son opcionales para configurar límites de reserva</p>
                    </div>
                </div>
                <div className="info-box">
                    <div className="info-content">
                        <span className="info-icon">🏢</span>
                        <p>Una sala puede contener múltiples mesas o ser reservada como unidad completa</p>
                    </div>
                </div>
            </form>
        </ModalBase>
    );
};

export default RoomModal; 