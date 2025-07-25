import React, { useState, useEffect } from 'react';
import ModalBase from '../ModalBase/ModalBase';
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

    useEffect(() => {
        if (table) {
            setFormData({
                business_id: table.businessId || table.business?.id || '',
                number: table.number || '',
                capacity: table.capacity || ''
            });
        } else {
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
        if (!validateForm()) return;
        const submitData = {
            business_id: parseInt(formData.business_id),
            number: parseInt(formData.number),
            capacity: parseInt(formData.capacity)
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
                form="table-form"
            >
                {loading ? 'Guardando...' : (table ? 'Actualizar' : 'Crear')}
            </button>
        </>
    );

    return (
        <ModalBase
            isOpen={isOpen}
            onClose={onClose}
            title={table ? '🪑 Editar Mesa' : '🪑 Crear Nueva Mesa'}
            actions={actions}
        >
            <form id="table-form" onSubmit={handleSubmit} autoComplete="off">
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
                <div className="form-grid">
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
                        {errors.number && <div className="error-text">{errors.number}</div>}
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
                        {errors.capacity && <div className="error-text">{errors.capacity}</div>}
                    </div>
                </div>
                <div className="info-box">
                    <div className="info-content">
                        <span className="info-icon">ℹ️</span>
                        <p>El número de mesa debe ser único dentro del mismo negocio</p>
                    </div>
                </div>
                <div className="info-box">
                    <div className="info-content">
                        <span className="info-icon">👥</span>
                        <p>La capacidad máxima es de 20 personas por mesa</p>
                    </div>
                </div>
            </form>
        </ModalBase>
    );
};

export default TableModal; 