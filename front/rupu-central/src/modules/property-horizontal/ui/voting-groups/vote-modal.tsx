/**
 * Modal: Votar en una Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createVoteAction, getResidentsAction } from '../../infrastructure/actions';
import { getUnvotedUnitsAction } from '../../infrastructure/actions/voting';

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
  currentVotes?: Array<{ property_unit_id: number; voted_at: string }>; // ✅ NUEVO: Votos actuales para filtrar
}

interface ResidentOption {
  id: number;
  name: string;
  unitNumber: string;
  isMain: boolean;
  isActive?: boolean;
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
  currentVotes = [], // ✅ NUEVO: Votos actuales para filtrar
}: VoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);

  // Log cuando cambia el selectedResidentId
  useEffect(() => {
    console.log('🔄 selectedResidentId cambió a:', selectedResidentId);
  }, [selectedResidentId]);

  // Log cuando cambia el selectedOptionId
  useEffect(() => {
    console.log('🔄 selectedOptionId cambió a:', selectedOptionId);
  }, [selectedOptionId]);
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [allResidents, setAllResidents] = useState<ResidentOption[]>([]); // Lista completa
  const [unitFilter, setUnitFilter] = useState(''); // Filtro por unidad (búsqueda)
  const [selectedResidentName, setSelectedResidentName] = useState(''); // Nombre del residente seleccionado
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Indicador de búsqueda en progreso

  // Cargar residentes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadResidents();
    }
  }, [isOpen, hpId]);

  // 🔄 IMPORTANTE: Consultar endpoint cada vez que se abre el dropdown
  useEffect(() => {
    if (showResidentDropdown && isOpen) {
      console.log('🔄 [VOTE MODAL] Dropdown abierto - consultando endpoint directamente');
      loadResidents();
    }
  }, [showResidentDropdown, isOpen]);

  // Buscar residentes en el backend cuando cambia el filtro (solo cuando se está buscando)
  useEffect(() => {
    // Solo buscar si el usuario está escribiendo (dropdown abierto)
    if (!showResidentDropdown || selectedResidentId) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true); // Indicar que se va a buscar
    
    const searchResidents = async () => {
      if (!isOpen || !hpId) {
        setIsSearching(false);
        return;
      }
      
      const token = TokenStorage.getToken();
      if (!token) {
        setIsSearching(false);
        return;
      }

      try {
        // Usar el endpoint de unidades sin votar con filtro (SIEMPRE consulta directa al endpoint, sin cache)
        const unvotedData = await getUnvotedUnitsAction({
          hpId,
          groupId,
          votingId,
          token,
          unitNumber: unitFilter.trim() || undefined, // Filtrar por número de unidad
        });

        console.log('🔍 [VOTE MODAL] Búsqueda de unidades sin votar (consulta directa):', {
          filtro: unitFilter || '(todos)',
          resultados: unvotedData.data?.length || 0,
          response: unvotedData
        });

        if (!unvotedData.success || !unvotedData.data) {
          setResidents([]);
          return;
        }

        // Mapear unidades sin votar a formato de residentes
        let residentOptions: ResidentOption[] = unvotedData.data.map((unit) => ({
          id: unit.unit_id,
          name: unit.resident_name || `Unidad ${unit.unit_number}`,
          unitNumber: unit.unit_number,
          isMain: true,
          isActive: true,
        }));

        // ✅ FILTRO ADICIONAL: Eliminar unidades que ya votaron (según datos del SSE)
        if (currentVotes.length > 0) {
          const votedUnitIds = new Set(currentVotes.map(vote => vote.property_unit_id));
          const beforeFilter = residentOptions.length;
          
          residentOptions = residentOptions.filter(resident => {
            const hasVoted = votedUnitIds.has(resident.id);
            if (hasVoted) {
              console.log(`🚫 [VOTE MODAL] Filtrando unidad ${resident.unitNumber} (ID: ${resident.id}) - ya votó (búsqueda)`);
            }
            return !hasVoted;
          });
          
          console.log(`🔍 [VOTE MODAL] Filtro aplicado en búsqueda: ${beforeFilter} → ${residentOptions.length} unidades (eliminadas ${beforeFilter - residentOptions.length})`);
        }

        setResidents(residentOptions);
      } catch (err) {
        console.error('❌ Error buscando unidades sin votar:', err);
        setResidents([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      searchResidents();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [unitFilter, hpId, isOpen, showResidentDropdown, selectedResidentId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.resident-search-dropdown')) {
        setShowResidentDropdown(false);
      }
    };

    if (showResidentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResidentDropdown]);

  const loadResidents = async () => {
    setLoadingResidents(true);
    setError(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      // Cargar solo unidades sin votar (SIEMPRE consulta directa al endpoint, sin cache)
      console.log('🔍 [VOTE MODAL] Cargando unidades sin votar (consulta directa):', { hpId, groupId, votingId });
      
      const unvotedData = await getUnvotedUnitsAction({
        hpId,
        groupId,
        votingId,
        token,
      });

      console.log('📊 [VOTE MODAL] Respuesta del endpoint:', unvotedData);
      console.log('📊 Unidades sin votar obtenidas:', unvotedData.data?.length || 0);

      if (!unvotedData.success || !unvotedData.data) {
        setError('Error al cargar unidades sin votar');
        return;
      }

      // Mapear unidades sin votar a formato de residentes
      let residentOptions: ResidentOption[] = unvotedData.data.map((unit) => ({
        id: unit.unit_id,
        name: unit.resident_name || `Unidad ${unit.unit_number}`,
        unitNumber: unit.unit_number,
        isMain: true, // Asumir que es residente principal
        isActive: true,
      }));

      // ✅ FILTRO ADICIONAL: Eliminar unidades que ya votaron (según datos del SSE)
      if (currentVotes.length > 0) {
        const votedUnitIds = new Set(currentVotes.map(vote => vote.property_unit_id));
        const beforeFilter = residentOptions.length;
        
        residentOptions = residentOptions.filter(resident => {
          const hasVoted = votedUnitIds.has(resident.id);
          if (hasVoted) {
            console.log(`🚫 [VOTE MODAL] Filtrando unidad ${resident.unitNumber} (ID: ${resident.id}) - ya votó`);
          }
          return !hasVoted;
        });
        
        console.log(`🔍 [VOTE MODAL] Filtro aplicado: ${beforeFilter} → ${residentOptions.length} unidades (eliminadas ${beforeFilter - residentOptions.length})`);
      }

      console.log('✅ Residentes sin votar cargados:', residentOptions.length);

      setResidents(residentOptions);
      setAllResidents(residentOptions); // Guardar lista inicial

      if (residentOptions.length === 0) {
        setError('No hay unidades disponibles para votar. Todas las unidades ya han emitido su voto.');
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
    console.log('🔄 Iniciando submit del voto...');
    console.log('📊 Estado actual:', {
      selectedResidentId,
      selectedOptionId,
      residents: residents.length,
      loading
    });
    
    setError(null);

    if (!selectedResidentId) {
      console.log('❌ Error: No hay residente seleccionado');
      setError('Debe seleccionar el residente que emite el voto');
      return;
    }

    if (!selectedOptionId) {
      console.log('❌ Error: No hay opción seleccionada');
      setError('Debe seleccionar una opción para votar');
      return;
    }

    console.log('✅ Validaciones pasadas, procediendo con el voto...');

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

      console.log('📤 Enviando voto al servidor...', {
        votingId,
        votingOptionId: selectedOptionId,
        propertyUnitId: selectedResidentId, // selectedResidentId contiene el unit_id
        hpId,
        groupId
      });

      const result = await createVoteAction({
        token,
        hpId,
        groupId,
        votingId,
        data: {
          votingId,
          votingOptionId: selectedOptionId,
          propertyUnitId: selectedResidentId, // selectedResidentId contiene el unit_id
          ipAddress,
          userAgent,
        },
      });

      console.log('📥 Respuesta del servidor:', result);

      if (result.success) {
        console.log('✅ Voto registrado exitosamente:', result.data);
        
        // Obtener el nombre del residente y la opción votada para el mensaje
        const resident = residents.find(r => r.id === selectedResidentId);
        const option = options.find(o => o.id === selectedOptionId);
        const residentName = resident?.name || 'Residente';
        const optionText = option?.optionText || 'Opción';
        
        // Mostrar mensaje de confirmación y resetear formulario para siguiente voto
        setSuccessMessage(`✅ Voto registrado exitosamente: ${residentName} votó por "${optionText}"`);
        resetForm();
        
        // 🔄 IMPORTANTE: Recargar lista de unidades sin votar para reflejar el nuevo estado
        console.log('🔄 Recargando lista de unidades sin votar después del voto...');
        await loadResidents();
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        // Notificar al componente padre (para actualizaciones SSE) pero NO cerrar modal
        onSuccess();
      } else {
        console.log('❌ Error en la respuesta:', result.error);
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
    setSelectedResidentName('');
    setError(null);
    setSuccessMessage(null); // Limpiar mensaje de éxito
    setUnitFilter(''); // Limpiar filtro al resetear
  };

  const clearUnitFilter = () => {
    setUnitFilter('');
    setSelectedResidentId(null);
    setSelectedResidentName('');
    setShowResidentDropdown(false);
  };

  const handleClose = () => {
    if (!loading && !loadingResidents) {
      resetForm();
      onClose();
    }
  };

  // Ordenar opciones por displayOrder
  const sortedOptions = [...options].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Votar: ${votingTitle}`} size="md">
      {loadingResidents ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando residentes...</span>
        </div>
      ) : (
        <form onSubmit={(e) => {
          console.log('📝 Formulario submit detectado');
          handleSubmit(e);
        }} className="space-y-6">
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

          {/* Selector de residente con búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votando como residente *
            </label>
            <div className="relative resident-search-dropdown">
              {/* Si hay un residente seleccionado, mostrar solo su nombre (no editable) */}
              {selectedResidentId && selectedResidentName ? (
                <div className="relative">
                  <input
                    type="text"
                    value={selectedResidentName}
                    readOnly
                    className="input w-full pr-16 bg-green-50 border-green-300 text-green-800 font-medium cursor-not-allowed"
                    disabled={loading}
                  />
                  {/* Botón para cambiar residente */}
                  <button
                    type="button"
                    onClick={clearUnitFilter}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-600 hover:text-green-800"
                    title="Cambiar residente"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Campo de búsqueda cuando no hay residente seleccionado */
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por número de unidad..."
                    value={unitFilter}
                    onChange={(e) => {
                      console.log('✏️ [VOTE MODAL] Escribiendo en filtro - abriendo dropdown y consultando endpoint');
                      setUnitFilter(e.target.value);
                      setShowResidentDropdown(true);
                    }}
                    onFocus={() => {
                      console.log('🎯 [VOTE MODAL] Input enfocado - abriendo dropdown y consultando endpoint');
                      setShowResidentDropdown(true);
                    }}
                    className="input w-full pr-8"
                    disabled={loading}
                  />
                  {/* Indicador sutil de búsqueda */}
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              {/* Dropdown solo se muestra cuando no hay residente seleccionado y está activo */}
              {!selectedResidentId && showResidentDropdown && (unitFilter || allResidents.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {residents.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {unitFilter ? 'No se encontraron residentes' : 'No hay residentes activos'}
                    </div>
                  ) : (
                    [...residents].sort((a, b) => {
                      if (a.isMain && !b.isMain) return -1;
                      if (!a.isMain && b.isMain) return 1;
                      return a.name.localeCompare(b.name);
                    }).map((resident) => (
                      <div
                        key={resident.id}
                        className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          console.log('🏠 Seleccionando residente:', {
                            id: resident.id,
                            name: resident.name,
                            unitNumber: resident.unitNumber
                          });
                          setSelectedResidentId(resident.id);
                          setSelectedResidentName(`${resident.unitNumber} - ${resident.name}`);
                          setUnitFilter(''); // Limpiar el filtro de búsqueda
                          setShowResidentDropdown(false);
                        }}
                      >
                        <div className="font-medium">{resident.name}</div>
                        <div className="text-xs text-gray-500">
                          Unidad: {resident.unitNumber}
                          {resident.isMain && <span className="ml-2 text-green-600">• Principal</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {selectedResidentId && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ <strong>Residente seleccionado:</strong> {residents.find(r => r.id === selectedResidentId)?.name} 
                  - Unidad: {residents.find(r => r.id === selectedResidentId)?.unitNumber}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ID: {selectedResidentId} | Puedes continuar con la selección del voto
                </p>
              </div>
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

        {/* Mensaje de éxito */}
        {successMessage && (
          <Alert type="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
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
            className={`btn min-w-[120px] ${
              loading || !selectedOptionId || !selectedResidentId || residents.length === 0
                ? 'btn-disabled opacity-50 cursor-not-allowed'
                : 'btn-primary'
            }`}
            onClick={(e) => {
              console.log('🖱️ Click en botón de votar detectado');
              console.log('🔍 Estado del botón:', {
                loading,
                selectedOptionId,
                selectedResidentId,
                residentsLength: residents.length,
                disabled: loading || !selectedOptionId || !selectedResidentId || residents.length === 0
              });
            }}
            title={
              !selectedResidentId ? 'Selecciona un residente primero' :
              !selectedOptionId ? 'Selecciona una opción de voto' :
              residents.length === 0 ? 'No hay residentes disponibles' :
              'Confirmar voto'
            }
          >
            {loading ? (
              <Spinner size="sm" />
            ) : !selectedResidentId ? (
              'Selecciona Residente'
            ) : !selectedOptionId ? (
              'Selecciona Voto'
            ) : (
              'Confirmar Voto'
            )}
          </button>
        </div>
        </form>
      )}
    </Modal>
  );
}

