'use client';

import React from 'react';
import './SuccessMessage.css';

export interface SuccessMessageProps {
  message: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  title = 'Operación exitosa',
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  return (
    <div className={`success-message bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 animate-fadeIn ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-green-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-green-800 mb-1">
            {title}
          </h4>
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex text-green-400 hover:opacity-75 focus:outline-none focus:opacity-75 transition-opacity duration-200"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage; 