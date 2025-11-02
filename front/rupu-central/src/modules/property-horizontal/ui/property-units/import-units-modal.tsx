/**
 * Modal: Importar Unidades desde Excel
 */

'use client';

import { useState } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { importUnitsFromExcelAction } from '../../infrastructure/actions/property-units';

interface ImportUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

export function ImportUnitsModal({ isOpen, onClose, onSuccess, businessId }: ImportUnitsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    total: number;
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

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

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const result = await importUnitsFromExcelAction({
        token,
        businessId,
        file: selectedFile,
      });

      if (result.success) {
        setSuccess(result.message || 'Unidades importadas correctamente');
        setImportResult(result.data || null);
        if (result.data?.created && result.data.created > 0) {
          // Recargar la lista si se crearon unidades
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(result.message || 'Error al importar las unidades');
      }
    } catch (err) {
      console.error('Error importando unidades:', err);
      setError('Error inesperado al importar las unidades');
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
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Unidades desde Excel" size="lg">
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Formato del Archivo Excel
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Primera fila: Encabezados (se ignoran)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 1: Número de unidad (texto, requerido, único)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Columna 2: Coeficiente (número decimal, requerido, &gt; 0)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>El archivo debe ser .xlsx o .xls</span>
            </div>
          </div>
          
          {/* Ejemplo */}
          <div className="mt-4">
            <h4 className="font-medium text-blue-900 mb-2">Ejemplo:</h4>
            <div className="bg-white border rounded p-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 border-b pb-1 mb-1">
                <span className="font-semibold">Número</span>
                <span className="font-semibold">Coeficiente</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <span>201</span>
                <span>0.015678</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <span>202</span>
                <span>0.014321</span>
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
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.total}</div>
                  <div className="text-green-800">Total procesadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResult.created}</div>
                  <div className="text-green-800">Creadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{importResult.skipped}</div>
                  <div className="text-green-800">Omitidas</div>
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
                {loading ? <Spinner size="sm" /> : 'Importar Unidades'}
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
