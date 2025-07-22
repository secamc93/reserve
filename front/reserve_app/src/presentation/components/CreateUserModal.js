import React, { useState, useEffect } from 'react';
import './CreateUserModal.css';

/**
 * Modal para crear un nuevo usuario.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Si el modal está abierto.
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @param {Function} props.onSubmit - Función para enviar los datos del nuevo usuario.
 * @param {Array} props.roles - Lista de roles disponibles.
 */
const CreateUserModal = ({ isOpen, onClose, onSubmit, roles }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        username: '',
        role_ids: [],
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    // Limpiar formulario cuando el modal se abre o cierra
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                username: '',
                role_ids: [],
                is_active: true,
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name !== 'is_active') {
            const roleId = parseInt(value, 10);
            setFormData((prev) => ({
                ...prev,
                role_ids: checked
                    ? [...prev.role_ids, roleId]
                    : prev.role_ids.filter((id) => id !== roleId),
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
        if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del correo no es válido.';
        if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
        if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es obligatorio.';
        if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es obligatorio.';
        if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es obligatorio.';
        if (formData.role_ids.length === 0) newErrors.role_ids = 'Debe seleccionar al menos un rol.';

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
                                <label htmlFor="first_name">Nombre</label>
                                <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                                {errors.first_name && <p className="error-text">{errors.first_name}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Apellido</label>
                                <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                                {errors.last_name && <p className="error-text">{errors.last_name}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="correo">Correo</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                                {errors.email && <p className="error-text">{errors.email}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="username">Nombre de usuario</label>
                                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
                                {errors.username && <p className="error-text">{errors.username}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                                {errors.password && <p className="error-text">{errors.password}</p>}
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

                        <div className="form-group roles-group">
                            <label>Roles</label>
                            <div className="roles-container">
                                {roles && roles.map((role) => (
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
                                ))}
                            </div>
                            {errors.role_ids && <p className="error-text">{errors.role_ids}</p>}
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