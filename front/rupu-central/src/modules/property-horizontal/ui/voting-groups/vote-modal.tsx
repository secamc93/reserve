/**
 * Modal: Votar en una Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createVoteAction, getResidentsAction } from '../../infrastructure/actions';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hpId: number;
  groupId: number;
  votingId: number;
  votingTitle: string;
  votingType: string;
  allowAbstention: boolean;
  options: Array<{ id: number; optionText: string; optionCode: string; displayOrder: number }>;
}

interface ResidentOption {
  id: number;
  name: string;
  unitNumber: string;
  isMain: boolean;
}

export function VoteModal({
  isOpen,
  onClose,
  onSuccess,
  hpId,
  groupId,
  votingId,
  votingTitle,
  votingType,
  allowAbstention,
  options,
}: VoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [allResidents, setAllResidents] = useState<ResidentOption[]>([]); // Lista completa
  const [unitFilter, setUnitFilter] = useState(''); // Filtro por unidad

  // Cargar residentes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadResidents();
    }
  }, [isOpen, hpId]);

  // Filtrar residentes en tiempo real cuando cambia el filtro
  useEffect(() => {
    if (!unitFilter.trim()) {
      // Si no hay filtro, mostrar todos los residentes activos
      setResidents(allResidents.filter(r => r.id)); // Mantener solo los que tienen ID válido
    } else {
      // Filtrar por número de unidad (búsqueda parcial, case-insensitive)
      const filtered = allResidents.filter(resident =>
        resident.unitNumber.toLowerCase().includes(unitFilter.toLowerCase())
      );
      setResidents(filtered);
    }
  }, [unitFilter, allResidents]);

  const loadResidents = async () => {
    setLoadingResidents(true);
    setError(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      // Cargar solo residentes activos de esta propiedad horizontal
      const data = await getResidentsAction({
        hpId,
        token,
        page: 1,
        pageSize: 100,
        isActive: true,
      });

      console.log('📊 Residentes activos cargados:', data.residents.length);
      console.log('📋 Datos de residentes:', data.residents);

      const residentOptions: ResidentOption[] = data.residents.map((r) => ({
        id: r.id,
        name: r.name,
        unitNumber: r.propertyUnitNumber,
        isMain: r.isMainResident,
      }));

      setResidents(residentOptions);
      setAllResidents(residentOptions); // Guardar lista completa

      // Si no hay residentes activos, intentar cargar todos los residentes para debug
      if (residentOptions.length === 0) {
        console.warn('⚠️ No hay residentes activos. Verificando todos los residentes...');
        const allData = await getResidentsAction({
          hpId,
          token,
          page: 1,
          pageSize: 100,
        });
        console.log('📊 Total de residentes (todos):', allData.residents.length);
        console.log('📋 Residentes (todos):', allData.residents);
        
        if (allData.residents.length > 0) {
          setError('Los residentes registrados no están marcados como activos. Por favor, activa al menos un residente para poder votar.');
          // Guardar también los residentes inactivos para el filtro
          const allResidentOptions: ResidentOption[] = allData.residents.map((r) => ({
            id: r.id,
            name: r.name,
            unitNumber: r.propertyUnitNumber,
            isMain: r.isMainResident,
          }));
          setAllResidents(allResidentOptions);
        }
      } else {
        // Si solo hay un residente, seleccionarlo automáticamente
        if (residentOptions.length === 1) {
          setSelectedResidentId(residentOptions[0].id);
        }
      }
    } catch (err) {
      console.error('❌ Error cargando residentes:', err);
      setError('Error al cargar la lista de residentes');
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedResidentId) {
      setError('Debe seleccionar el residente que emite el voto');
      return;
    }

    if (!selectedOptionId) {
      setError('Debe seleccionar una opción para votar');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      // Obtener IP y User Agent del cliente
      const ipAddress = 'client-ip'; // En producción se obtendría del servidor
      const userAgent = navigator.userAgent;

      const result = await createVoteAction({
        token,
        hpId,
        groupId,
        votingId,
        data: {
          votingId,
          votingOptionId: selectedOptionId,
          residentId: selectedResidentId,
          ipAddress,
          userAgent,
        },
      });

      if (result.success) {
        console.log('✅ Voto registrado:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al registrar el voto');
      }
    } catch (err) {
      console.error('Error registrando voto:', err);
      
      // Extraer el mensaje de error específico de la API
      let errorMessage = 'Error inesperado al registrar el voto';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Personalizar mensajes comunes
      if (errorMessage.includes('ya votó')) {
        errorMessage = '⚠️ Este residente ya emitió su voto en esta votación';
      } else if (errorMessage.includes('no encontrado') || errorMessage.includes('not found')) {
        errorMessage = 'La votación o el residente no fueron encontrados';
      } else if (errorMessage.includes('inactivo') || errorMessage.includes('inactive')) {
        errorMessage = 'La votación no está activa o el residente está inactivo';
      } else if (errorMessage.includes('token')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedOptionId(null);
    setSelectedResidentId(null);
    setError(null);
    setUnitFilter(''); // Limpiar filtro al resetear
  };

  const clearUnitFilter = () => {
    setUnitFilter('');
  };

  const handleClose = () => {
    if (!loading && !loadingResidents) {
      resetForm();
      onClose();
    }
  };

  // Ordenar opciones por displayOrder
  const sortedOptions = [...options].sort((a, b) => a.displayOrder - b.displayOrder);

  // Ordenar residentes: principales primero, luego por nombre
  const sortedResidents = [...residents].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Votar: ${votingTitle}`} size="md">
      {loadingResidents ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando residentes...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la votación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <p>Tipo: <span className="font-medium">{votingType}</span></p>
              {allowAbstention && (
                <p className="text-green-700">✓ Permite abstención</p>
              )}
            </div>
          </div>

          {/* Filtro de búsqueda por unidad */}
          {allResidents.length > 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar por número de unidad
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Ej: 101, A-201, 301..."
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    className="input w-full"
                    disabled={loading}
                  />
                </div>
                {unitFilter && (
                  <button
                    type="button"
                    onClick={clearUnitFilter}
                    className="btn btn-secondary"
                    disabled={loading}
                    title="Limpiar filtro"
                  >
                    ✖️
                  </button>
                )}
              </div>
              {unitFilter && (
                <p className="text-xs text-gray-600 mt-1">
                  🔍 Mostrando {residents.length} de {allResidents.length} residentes
                </p>
              )}
            </div>
          )}

          {/* Selector de residente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votando como residente *
            </label>
            {residents.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                <p className="font-medium mb-1">⚠️ No hay residentes activos</p>
                <p className="text-sm">
                  {error || 'No hay residentes activos registrados para esta propiedad. Verifica que los residentes estén marcados como activos en la sección de Residentes.'}
                </p>
              </div>
            ) : residents.length === 1 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900">{residents[0].name}</p>
                <p className="text-sm text-gray-600">
                  Unidad: {residents[0].unitNumber}
                  {residents[0].isMain && <span className="ml-2 text-green-600">• Principal</span>}
                </p>
              </div>
            ) : (
              <select
                value={selectedResidentId || ''}
                onChange={(e) => setSelectedResidentId(Number(e.target.value))}
                className="input w-full"
                disabled={loading}
                required
              >
                <option value="">Selecciona un residente</option>
                {sortedResidents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name} - Unidad: {resident.unitNumber}
                    {resident.isMain ? ' (Principal)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Opciones de votación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona tu voto *
            </label>
          <div className="space-y-2">
            {sortedOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOptionId === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="vote-option"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{option.optionText}</p>
                  <p className="text-sm text-gray-500">Código: {option.optionCode}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
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
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedOptionId || !selectedResidentId || residents.length === 0}
            className="btn btn-primary min-w-[120px]"
          >
            {loading ? <Spinner size="sm" /> : 'Confirmar Voto'}
          </button>
        </div>
        </form>
      )}
    </Modal>
  );
}

