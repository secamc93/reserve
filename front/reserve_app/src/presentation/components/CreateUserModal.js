import React, { useState, useEffect } from 'react';
import './CreateUserModal.css';

/**
 * Modal para crear un nuevo usuario.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Si el modal está abierto.
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @param {Function} props.onSubmit - Función para enviar los datos del nuevo usuario.
 * @param {Array} props.roles - Lista de roles disponibles.
 * @param {Array} props.businesses - Lista de negocios disponibles.
 */
const CreateUserModal = ({ isOpen, onClose, onSubmit, roles, businesses }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_ids: [],
        role_ids: [],
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    // ✅ Asegurar que roles y businesses sean arrays
    const safeRoles = Array.isArray(roles) ? roles : [];
    const safeBusinesses = Array.isArray(businesses) ? businesses : [];

    // Limpiar formulario cuando el modal se abre o cierra
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                business_ids: [],
                role_ids: [],
                is_active: true,
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'role_ids') {
            const roleId = parseInt(value, 10);
            setFormData((prev) => ({
                ...prev,
                role_ids: checked
                    ? [...prev.role_ids, roleId]
                    : prev.role_ids.filter((id) => id !== roleId),
            }));
        } else if (type === 'checkbox' && name === 'business_ids') {
            const businessId = parseInt(value, 10);
            setFormData((prev) => ({
                ...prev,
                business_ids: checked
                    ? [...prev.business_ids, businessId]
                    : prev.business_ids.filter((id) => id !== businessId),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre completo es obligatorio.';
        if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del correo no es válido.';
        if (formData.role_ids.length === 0) newErrors.role_ids = 'Debe seleccionar al menos un rol.';
        if (formData.business_ids.length === 0) newErrors.business_ids = 'Debe seleccionar al menos un negocio.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Crear Nuevo Usuario</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Nombre Completo</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                                {errors.name && <p className="error-text">{errors.name}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Correo</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                                {errors.email && <p className="error-text">{errors.email}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Teléfono (opcional)</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group form-group-checkbox">
                                <label>Estado</label>
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <span>Usuario activo</span>
                                </label>
                            </div>
                        </div>

                        {/* Nota informativa sobre contraseña */}
                        <div className="info-box">
                            <div className="info-content">
                                <span className="info-icon">🔐</span>
                                <p>La contraseña se generará automáticamente y se mostrará una vez creado el usuario.</p>
                            </div>
                        </div>

                        <div className="form-group roles-group">
                            <label>Roles</label>
                            <div className="roles-container">
                                {safeRoles.length > 0 ? (
                                    safeRoles.map((role) => (
                                        <label
                                            key={role.id}
                                            className={`role-label ${formData.role_ids.includes(role.id) ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                name="role_ids"
                                                value={role.id}
                                                checked={formData.role_ids.includes(role.id)}
                                                onChange={handleChange}
                                            />
                                            {role.name}
                                        </label>
                                    ))
                                ) : (
                                    <p className="no-data">Cargando roles...</p>
                                )}
                            </div>
                            {errors.role_ids && <p className="error-text">{errors.role_ids}</p>}
                        </div>

                        <div className="form-group businesses-group">
                            <label>Negocios</label>
                            <div className="businesses-container">
                                {safeBusinesses.length > 0 ? (
                                    safeBusinesses.map((business) => (
                                        <label
                                            key={business.id}
                                            className={`business-label ${formData.business_ids.includes(business.id) ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                name="business_ids"
                                                value={business.id}
                                                checked={formData.business_ids.includes(business.id)}
                                                onChange={handleChange}
                                            />
                                            {business.name}
                                        </label>
                                    ))
                                ) : (
                                    <p className="no-data">Cargando negocios...</p>
                                )}
                            </div>
                            {errors.business_ids && <p className="error-text">{errors.business_ids}</p>}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Crear Usuario</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateUserModal; 