'use client';

import { useState } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { bulkUpdateResidentsAction } from '../../infrastructure/actions/residents/bulk-update-residents.action';

interface BulkEditResidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hpId: number;
}

export function BulkEditResidentsModal({ isOpen, onClose, onSuccess, hpId }: BulkEditResidentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    total_processed: number;
    updated: number;
    errors: number;
    error_details: Array<{
      row: number;
      property_unit_number: string;
      error: string;
    }>;
  } | null>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls'].includes(fileExtension || '')) {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo debe ser menor a 10MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!selectedFile) {
      setError('Por favor, selecciona un archivo Excel para importar.');
      return;
    }

    const token = TokenStorage.getToken();
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }

    setLoading(true);

    try {
      const result = await bulkUpdateResidentsAction({
        token,
        hpId,
        file: selectedFile,
      });

      if (result.success) {
        setSuccess(result.message || 'Residentes actualizados correctamente');
        setResult(result.data || null);
        
        if (result.data?.updated && result.data.updated > 0) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(result.error || 'Error al actualizar residentes');
      }
    } catch (err) {
      console.error('Error actualizando residentes:', err);
      setError('Error inesperado al actualizar residentes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edición Masiva de Residentes por Excel" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📝 Instrucciones</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Sube un archivo Excel (.xlsx, .xls) con las columnas requeridas</li>
              <li>• <strong>Columnas obligatorias:</strong> unidad, nombre (o DNI)</li>
              <li>• <strong>Nombres de columnas soportados:</strong></li>
              <li className="ml-4">- Unidad: unidad, unit, property_unit, property_unit_number</li>
              <li className="ml-4">- Nombre: nombre, name, resident_name</li>
              <li className="ml-4">- DNI: dni, document, documento, cedula</li>
              <li>• Al menos uno de nombre o DNI debe estar presente por fila</li>
            </ul>
          </div>

          {/* Selector de archivo */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Seleccionar Archivo Excel</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file"
                disabled={loading}
              />
              <label
                htmlFor="excel-file"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="text-4xl">📊</div>
                <div className="text-sm font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : 'Haz clic para seleccionar archivo Excel'}
                </div>
                <div className="text-xs text-gray-500">
                  Formatos soportados: .xlsx, .xls (máximo 10MB)
                </div>
              </label>
            </div>
            {selectedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-green-600">✅</div>
                  <div className="text-sm text-green-800">
                    Archivo seleccionado: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resultados */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">📊 Resultados de la Edición</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">{result.total_processed}</div>
                  <div className="text-gray-600">Total Procesados</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">{result.updated}</div>
                  <div className="text-gray-600">Actualizados</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-red-600">{result.errors}</div>
                  <div className="text-gray-600">Errores</div>
                </div>
              </div>
              {result.error_details.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-red-600 mb-2">📋 Detalles de errores:</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-red-50 border-b border-red-200">
                          <th className="px-2 py-1 text-left font-medium text-red-800">Fila</th>
                          <th className="px-2 py-1 text-left font-medium text-red-800">Unidad</th>
                          <th className="px-2 py-1 text-left font-medium text-red-800">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.error_details.map((errorDetail, index) => (
                          <tr key={index} className="border-b border-red-100">
                            <td className="px-2 py-1 text-red-700 font-mono">
                              {errorDetail.row}
                            </td>
                            <td className="px-2 py-1 text-red-700 font-medium">
                              {errorDetail.property_unit_number}
                            </td>
                            <td className="px-2 py-1 text-red-600">
                              {errorDetail.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alertas */}
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Procesando...
              </>
            ) : (
              '📊 Procesar Excel'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
