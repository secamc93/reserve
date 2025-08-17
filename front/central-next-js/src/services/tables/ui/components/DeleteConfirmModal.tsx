'use client';

import React, { useState } from 'react';
import { Table } from '@/services/tables/domain/entities/Table';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  table: Table | null;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  table,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen || !table) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setApiError(null);
    try {
      await onConfirm();
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Ocurrió un error al eliminar la mesa';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      actions={
        <>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-submit"
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </>
      }
      className="delete-confirm-modal"
    >
      {apiError && (
        <ErrorMessage
          message={apiError}
          dismissible
          onDismiss={() => setApiError(null)}
          className="mb-4"
        />
      )}

      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-center mb-2">
        ¿Eliminar Mesa #{table.number}?
      </h3>

      <p className="text-center mb-2">
        Estás a punto de eliminar la mesa número <strong>{table.number}</strong> con
        capacidad para <strong>{table.capacity}</strong> personas.
      </p>

      <p className="text-red-600 text-sm text-center">
        Esta acción no se puede deshacer y se eliminarán todas las reservas asociadas.
      </p>
    </ModalBase>
  );
};

export default DeleteConfirmModal;

