import React from 'react';
import './PasswordGeneratedModal.css';

const PasswordGeneratedModal = ({ isOpen, onClose, email, password }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        alert('Contraseña copiada al portapapeles');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="password-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="password-modal-header">
                    <h2>🎉 Usuario Creado Exitosamente</h2>
                </div>
                <div className="password-modal-body">
                    <div className="success-info">
                        <p><strong>📧 Email:</strong> {email}</p>
                        <div className="password-section">
                            <p><strong>🔐 Contraseña temporal:</strong></p>
                            <div className="password-display">
                                <code>{password}</code>
                                <button onClick={copyToClipboard} className="copy-btn">
                                    📋 Copiar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="warning-box">
                        <p>⚠️ <strong>IMPORTANTE:</strong> Guarde esta contraseña en un lugar seguro. No se mostrará nuevamente por razones de seguridad.</p>
                    </div>
                </div>
                <div className="password-modal-footer">
                    <button onClick={onClose} className="btn btn-primary">Entendido</button>
                </div>
            </div>
        </div>
    );
};

export default PasswordGeneratedModal; 