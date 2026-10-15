/**
 * Modal de confirmación reutilizable
 * Útil para confirmaciones de eliminación, cambios, etc.
 */

'use client';

import { Modal } from './modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass = {
    danger: 'btn btn-danger',
    warning: 'btn btn-quaternary',
    info: 'btn btn-primary',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Mensaje */}
        <p className="text-gray-700">{message}</p>

        {/* Botones */}
        {/* Teléfono: botones a todo el ancho, el de confirmar arriba; escritorio: en fila a la derecha. */}
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <button 
            className="btn btn-secondary btn-sm w-full md:w-auto" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`${confirmButtonClass[type]} btn-sm w-full md:w-auto`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

