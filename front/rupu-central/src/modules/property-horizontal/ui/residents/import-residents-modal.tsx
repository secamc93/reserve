/**
 * Modal: Importar Residentes desde Excel
 */

'use client';

import { useState } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { importResidentsFromExcelAction } from '../../infrastructure/actions/residents';

interface ImportResidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

export function ImportResidentsModal({ isOpen, onClose, onSuccess, businessId }: ImportResidentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    total: number;
    created: number;
    errors: string[];
  } | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar extensión
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        setError('El archivo debe ser .xlsx o .xls');
        return;
      }

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo debe ser menor a 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setImportResult(null);
      setErrorDetails([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setImportResult(null);
    setErrorDetails([]);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const result = await importResidentsFromExcelAction({
        token,
        businessId,
        file: selectedFile,
      });

      if (result.success) {
        setSuccess(result.message || 'Residentes importados correctamente');
        setImportResult(result.data || null);
        if (result.data?.created && result.data.created > 0) {
          // Recargar la lista si se crearon residentes
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(result.message || 'Error al importar los residentes');
        if (result.details && result.details.length > 0) {
          setErrorDetails(result.details);
        }
      }
    } catch (err) {
      console.error('Error importando residentes:', err);
      setError('Error inesperado al importar los residentes');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFile(null);
      setError(null);
      setSuccess(null);
      setImportResult(null);
      setErrorDetails([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Residentes desde Excel" size="lg">
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Información Importante
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-orange-600">⚠️</span>
              <span><strong>Las unidades deben existir primero</strong> antes de crear residentes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>El archivo debe ser .xlsx o .xls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Primera fila: Encabezados (se ignoran)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 1: Número de unidad (debe existir)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 2: Nombre completo del residente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 3: DNI del residente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 4: Email (opcional)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 5: Teléfono (opcional)</span>
            </div>
          </div>
          
          {/* Ejemplo */}
          <div className="mt-4">
            <h4 className="font-medium text-blue-900 mb-2">Ejemplo:</h4>
            <div className="bg-white border rounded p-2 text-xs font-mono">
              <div className="grid grid-cols-5 gap-2 border-b pb-1 mb-1">
                <span className="font-semibold">Unidad</span>
                <span className="font-semibold">Nombre</span>
                <span className="font-semibold">DNI</span>
                <span className="font-semibold">Email</span>
                <span className="font-semibold">Teléfono</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <span>101</span>
                <span>Juan Pérez</span>
                <span>12345678</span>
                <span>juan@email.com</span>
                <span>3001234567</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <span>102</span>
                <span>María García</span>
                <span>87654321</span>
                <span>maria@email.com</span>
                <span>3007654321</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Resultado de importación */}
          {importResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                📊 Resultado de la Importación
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.total}</div>
                  <div className="text-green-800">Total procesados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResult.created}</div>
                  <div className="text-green-800">Creados</div>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-900 mb-2">Errores encontrados:</h4>
                  <div className="bg-red-50 border border-red-200 rounded p-2 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 py-1">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detalles de errores */}
          {errorDetails.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                ❌ Detalles de Errores
              </h3>
              <div className="bg-red-100 border border-red-300 rounded p-2 max-h-32 overflow-y-auto">
                {errorDetails.map((detail, index) => (
                  <div key={index} className="text-sm text-red-700 py-1">
                    • {detail}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Success */}
          {success && (
            <Alert type="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn btn-outline"
            >
              {importResult ? 'Cerrar' : 'Cancelar'}
            </button>
            {!importResult && (
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="btn btn-primary min-w-[120px]"
              >
                {loading ? <Spinner size="sm" /> : 'Importar Residentes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}

