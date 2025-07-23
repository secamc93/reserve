import React, { useState } from 'react';
import './ChangePasswordModal.css';

/**
 * Modal para cambiar contraseña.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Si el modal está abierto.
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @param {Function} props.onSubmit - Función para enviar el cambio de contraseña.
 */
const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.current_password.trim()) {
            newErrors.current_password = 'La contraseña actual es obligatoria.';
        }
        
        if (!formData.new_password.trim()) {
            newErrors.new_password = 'La nueva contraseña es obligatoria.';
        } else if (formData.new_password.length < 6) {
            newErrors.new_password = 'La nueva contraseña debe tener al menos 6 caracteres.';
        }
        
        if (!formData.confirm_password.trim()) {
            newErrors.confirm_password = 'Confirma la nueva contraseña.';
        } else if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Las contraseñas no coinciden.';
        }
        
        if (formData.current_password === formData.new_password) {
            newErrors.new_password = 'La nueva contraseña debe ser diferente a la actual.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const result = await onSubmit({
                    current_password: formData.current_password,
                    new_password: formData.new_password
                });
                
                if (result && result.success) {
                    setShowSuccess(true);
                    // Limpiar formulario
                    setFormData({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                    });
                }
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
                setErrors({
                    submit: error.message || 'Error al cambiar la contraseña.'
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleClose = () => {
        setFormData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        setErrors({});
        setIsSubmitting(false);
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container change-password-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🔐 Cambiar Contraseña</h2>
                    <button className="close-button" onClick={handleClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {showSuccess ? (
                        <div className="success-display">
                            <div className="success-message">
                                <div className="success-icon">✅</div>
                                <h3>¡Contraseña Cambiada Exitosamente!</h3>
                                <p>Tu contraseña ha sido actualizada. Serás redirigido al login.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleClose}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="current_password">Contraseña Actual</label>
                                <input
                                    type="password"
                                    id="current_password"
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    className={errors.current_password ? 'error' : ''}
                                    placeholder="Ingresa tu contraseña actual"
                                />
                                {errors.current_password && <p className="error-text">{errors.current_password}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="new_password">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="new_password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className={errors.new_password ? 'error' : ''}
                                    placeholder="Ingresa tu nueva contraseña"
                                />
                                {errors.new_password && <p className="error-text">{errors.new_password}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm_password">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className={errors.confirm_password ? 'error' : ''}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                                {errors.confirm_password && <p className="error-text">{errors.confirm_password}</p>}
                            </div>

                            {errors.submit && (
                                <div className="error-message">
                                    ⚠️ {errors.submit}
                                </div>
                            )}

                            <div className="password-requirements">
                                <h4>Requisitos de la contraseña:</h4>
                                <ul>
                                    <li>Mínimo 6 caracteres</li>
                                    <li>Debe ser diferente a la contraseña actual</li>
                                    <li>Se recomienda usar mayúsculas, minúsculas, números y símbolos</li>
                                </ul>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal; 