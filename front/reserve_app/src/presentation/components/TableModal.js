import React, { useState, useEffect } from 'react';
import './TableModal.css';

const TableModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    table = null, 
    businesses = [],
    loading = false 
}) => {
    const [formData, setFormData] = useState({
        business_id: '',
        number: '',
        capacity: ''
    });

    const [errors, setErrors] = useState({});

    // Cargar datos de la mesa si se está editando
    useEffect(() => {
        if (table) {
            setFormData({
                business_id: table.businessId || table.business?.id || '',
                number: table.number || '',
                capacity: table.capacity || ''
            });
        } else {
            // Reset form for new table
            setFormData({
                business_id: '',
                number: '',
                capacity: ''
            });
        }
        setErrors({});
    }, [table, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.business_id) {
            newErrors.business_id = 'El negocio es requerido';
        }

        if (!formData.number) {
            newErrors.number = 'El número de mesa es requerido';
        } else if (parseInt(formData.number) <= 0) {
            newErrors.number = 'El número de mesa debe ser mayor a 0';
        }

        if (!formData.capacity) {
            newErrors.capacity = 'La capacidad es requerida';
        } else if (parseInt(formData.capacity) <= 0) {
            newErrors.capacity = 'La capacidad debe ser mayor a 0';
        } else if (parseInt(formData.capacity) > 20) {
            newErrors.capacity = 'La capacidad no puede ser mayor a 20 personas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Convertir valores a números
        const submitData = {
            business_id: parseInt(formData.business_id),
            number: parseInt(formData.number),
            capacity: parseInt(formData.capacity)
        };

        onSubmit(submitData);
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="table-modal-overlay">
            <div className="table-modal">
                <div className="table-modal-header">
                    <h2>{table ? 'Editar Mesa' : 'Crear Nueva Mesa'}</h2>
                    <button 
                        className="table-modal-close" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="table-modal-form">
                    <div className="table-modal-body">
                        <div className="form-group">
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
                            {errors.business_id && <span className="error-message">{errors.business_id}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="number">Número de Mesa *</label>
                                <input
                                    type="number"
                                    id="number"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    className={errors.number ? 'error' : ''}
                                    disabled={loading}
                                    min="1"
                                    placeholder="ej: 1"
                                />
                                {errors.number && <span className="error-message">{errors.number}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">Capacidad *</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    className={errors.capacity ? 'error' : ''}
                                    disabled={loading}
                                    min="1"
                                    max="20"
                                    placeholder="ej: 4"
                                />
                                {errors.capacity && <span className="error-message">{errors.capacity}</span>}
                            </div>
                        </div>

                        <div className="form-info">
                            <div className="info-item">
                                <span className="info-icon">ℹ️</span>
                                <span className="info-text">
                                    El número de mesa debe ser único dentro del mismo negocio
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-icon">👥</span>
                                <span className="info-text">
                                    La capacidad máxima es de 20 personas por mesa
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="table-modal-footer">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : (table ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TableModal; 