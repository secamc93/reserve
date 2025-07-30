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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-container-base ${className}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
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