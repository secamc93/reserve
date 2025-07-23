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
        business_id: '', // Cambiado a business_id (singular) para un solo negocio
        role_id: '', // Cambiado a role_id (singular) para un solo rol
        is_active: true,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userCredentials, setUserCredentials] = useState(null);

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
                business_id: '', // Cambiado a business_id
                role_id: '', // Cambiado a role_id
                is_active: true,
            });
            setErrors({});
            setUserCredentials(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'business_id') {
            // Para select simple de negocio
            setFormData((prev) => ({
                ...prev,
                business_id: value ? parseInt(value, 10) : '',
            }));
        } else if (name === 'role_id') {
            // Para select simple de rol
            setFormData((prev) => ({
                ...prev,
                role_id: value ? parseInt(value, 10) : '',
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
        if (!formData.role_id) newErrors.role_id = 'Debe seleccionar un rol.';
        if (!formData.business_id) newErrors.business_id = 'Debe seleccionar un negocio.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                // Convertir role_id y business_id a arrays para mantener compatibilidad con el backend
                const submitData = {
                    ...formData,
                    role_ids: formData.role_id ? [formData.role_id] : [],
                    business_ids: formData.business_id ? [formData.business_id] : []
                };
                
                const result = await onSubmit(submitData);
                
                // Si la API devuelve email y password, mostrarlos
                if (result && (result.email || result.password)) {
                    setUserCredentials({
                        email: result.email || formData.email,
                        password: result.password
                    });
                }
            } catch (error) {
                console.error('Error al crear usuario:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleClose = () => {
        setUserCredentials(null);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Crear Nuevo Usuario</h2>
                    <button className="close-button" onClick={handleClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {userCredentials ? (
                        // Mostrar credenciales del usuario creado
                        <div className="credentials-display">
                            <div className="success-message">
                                <div className="success-icon">✅</div>
                                <h3>¡Usuario Creado Exitosamente!</h3>
                                <p>El usuario ha sido creado. Aquí están las credenciales de acceso:</p>
                            </div>
                            
                            <div className="credentials-box">
                                <div className="credential-item">
                                    <label>Email:</label>
                                    <div className="credential-value">
                                        <span>{userCredentials.email}</span>
                                        <button 
                                            className="copy-button"
                                            onClick={() => navigator.clipboard.writeText(userCredentials.email)}
                                            title="Copiar email"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="credential-item">
                                    <label>Contraseña:</label>
                                    <div className="credential-value">
                                        <span>{userCredentials.password}</span>
                                        <button 
                                            className="copy-button"
                                            onClick={() => navigator.clipboard.writeText(userCredentials.password)}
                                            title="Copiar contraseña"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="credentials-warning">
                                <div className="warning-icon">⚠️</div>
                                <p><strong>Importante:</strong> Guarda estas credenciales en un lugar seguro. La contraseña no se mostrará nuevamente.</p>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleClose}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Formulario de creación
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
                                <div className="form-group">
                                    <label htmlFor="role_id">Rol</label>
                                    <select 
                                        id="role_id" 
                                        name="role_id" 
                                        value={formData.role_id} 
                                        onChange={handleChange}
                                        className={errors.role_id ? 'error' : ''}
                                    >
                                        <option value="">Seleccionar rol</option>
                                        {safeRoles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role_id && <p className="error-text">{errors.role_id}</p>}
                                    {safeRoles.length === 0 && <p className="no-data">Cargando roles...</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="business_id">Negocio</label>
                                    <select 
                                        id="business_id" 
                                        name="business_id" 
                                        value={formData.business_id} 
                                        onChange={handleChange}
                                        className={errors.business_id ? 'error' : ''}
                                    >
                                        <option value="">Seleccionar negocio</option>
                                        {safeBusinesses.map((business) => (
                                            <option key={business.id} value={business.id}>
                                                {business.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.business_id && <p className="error-text">{errors.business_id}</p>}
                                    {safeBusinesses.length === 0 && <p className="no-data">Cargando negocios...</p>}
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

                            {/* Nota informativa sobre contraseña al final */}
                            <div className="info-box">
                                <div className="info-content">
                                    <span className="info-icon">🔐</span>
                                    <p>La contraseña se generará automáticamente y se mostrará una vez creado el usuario.</p>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateUserModal; 