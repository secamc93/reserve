import React from 'react';
import './ModalBase.css';

const ModalBase = ({
    isOpen,
    onClose,
    title,
    children,
    actions,
    className = '',
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        // Solo prevenir si es exactamente el overlay, no sus hijos
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleContainerClick = (e) => {
        // Prevenir que el click en el contenedor cierre el modal
        e.stopPropagation();
    };

    const handleCloseClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-container-base ${className}`} onClick={handleContainerClick}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="modal-close-btn" onClick={handleCloseClick}>✕</button>
                </div>
                <div className="modal-content">
                    {children}
                    <div className="modal-actions">
                        {actions}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalBase; 