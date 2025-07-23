import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../components/ChangePasswordModal.js';
import { useChangePassword } from '../hooks/useChangePassword.js';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
    const [showModal, setShowModal] = useState(true);
    const { changePassword, loading, error } = useChangePassword();
    const navigate = useNavigate();

    // Verificar si el usuario tiene token válido
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const handleChangePassword = async (passwordData) => {
        try {
            const result = await changePassword(passwordData);
            
            if (result && result.success) {
                // Limpiar token y redirigir al login
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('userRolesPermissions');
                
                // Redirigir al login después de un breve delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                
                return result;
            }
        } catch (error) {
            console.error('Error en ChangePasswordPage:', error);
            throw error;
        }
    };

    const handleCloseModal = () => {
        // Si el usuario cierra el modal sin cambiar la contraseña, 
        // redirigir al login también
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userRolesPermissions');
        navigate('/login');
    };

    return (
        <div className="change-password-page">
            <div className="change-password-container">
                <div className="change-password-header">
                    <h1>🔐 Cambio de Contraseña Requerido</h1>
                    <p>Por seguridad, debes cambiar tu contraseña antes de continuar.</p>
                </div>
                
                {error && (
                    <div className="error-banner">
                        ⚠️ {error}
                    </div>
                )}
                
                <div className="change-password-content">
                    <div className="info-card">
                        <div className="info-icon">ℹ️</div>
                        <div className="info-content">
                            <h3>Información Importante</h3>
                            <ul>
                                <li>Tu contraseña actual es temporal</li>
                                <li>Debes crear una nueva contraseña segura</li>
                                <li>Después del cambio, serás redirigido al login</li>
                                <li>Usa la nueva contraseña para acceder al sistema</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={handleChangePassword}
            />
        </div>
    );
};

export default ChangePasswordPage; 