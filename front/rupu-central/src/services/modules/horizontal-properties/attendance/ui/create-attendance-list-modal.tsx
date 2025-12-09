/**
 * Modal: Create Attendance List
 */

'use client';

import { useState } from 'react';
// Using CSS classes for buttons instead of Button component

interface CreateAttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    notes?: string;
  }) => void;
  votingGroupName: string;
}

export function CreateAttendanceListModal({
  isOpen,
  onClose,
  onSubmit,
  votingGroupName,
}: CreateAttendanceListModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La descripción no puede exceder 1000 caracteres';
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Las notas no pueden exceder 2000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      
      // Reset form
      setFormData({ title: '', description: '', notes: '' });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', notes: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Lista de Asistencia
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Grupo de Votación:</strong> {votingGroupName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`input w-full ${errors.title ? 'border-red-300' : ''}`}
                placeholder="Ej: Asistencia Asamblea Ordinaria 2024"
                maxLength={200}
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`input w-full h-20 resize-none ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Descripción opcional de la lista de asistencia..."
                maxLength={1000}
                style={{ color: '#111827' }}
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 caracteres
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className={`input w-full h-20 resize-none ${errors.notes ? 'border-red-300' : ''}`}
                placeholder="Notas adicionales (opcional)..."
                maxLength={2000}
                style={{ color: '#111827' }}
              />
              {errors.notes && (
                <p className="text-red-600 text-xs mt-1">{errors.notes}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/2000 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                Crear Lista
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
