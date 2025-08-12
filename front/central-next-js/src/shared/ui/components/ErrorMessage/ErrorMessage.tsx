'use client';

import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  message: string;
  title?: string;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  variant = 'error',
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'error':
        return (
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const defaultTitle = {
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información'
  };

  const variantClass = `${variant}-variant`;

  return (
    <div className={`error-message ${variantClass} animate-fadeIn ${className}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>
          {getIcon()}
        </div>
        <div style={{ marginLeft: '0.75rem', flex: 1 }}>
          <h4 className="error-title">
            {title || defaultTitle[variant]}
          </h4>
          <p className="error-text">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <div style={{ marginLeft: 'auto', paddingLeft: '0.75rem' }}>
            <button
              type="button"
              onClick={onDismiss}
              className="close-button"
            >
              <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Cerrar</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 