/**
 * Componente: Validación de Residente para Votación Pública
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { getPropertyUnitsForPublicVotingAction, validateResidentAction } from '@/modules/property-horizontal/infrastructure/actions/public-voting';

interface PropertyUnit {
  id: number;
  number: string;
}

interface ResidentData {
  id: number;
  name: string;
  unitNumber: string;
  votingId: number;
  hpId: number;
  groupId?: number;
}

interface VotingContextData {
  property: {
    id: number;
    name: string;
    address: string;
  };
  voting: {
    id: number;
    title: string;
    description: string;
  };
  voting_group: {
    id: number;
    name: string;
    description: string;
  };
}

interface PublicVotingValidationProps {
  publicToken: string;
  votingContext: VotingContextData;
  onSuccess: (authToken: string, resident: ResidentData) => void;
  onError: (error: string) => void;
}

export function PublicVotingValidation({
  publicToken,
  votingContext,
  onSuccess,
  onError
}: PublicVotingValidationProps) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<PropertyUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar unidades de la propiedad
  useEffect(() => {
    loadUnits();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#unit') && !target.closest('.unit-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const loadUnits = async () => {
    try {
      console.log('📦 [VALIDATION] Cargando unidades...');
      setLoadingUnits(true);
      
      const result = await getPropertyUnitsForPublicVotingAction({
        publicToken
      });

      console.log('📥 [VALIDATION] Resultado de unidades:', result);

          if (result.success && result.data) {
            const loadedUnits = result.data.units || [];
            console.log(`✅ [VALIDATION] ${loadedUnits.length} unidades cargadas`);
            console.log('📋 [VALIDATION] Estructura de unidades:', loadedUnits.slice(0, 3)); // Mostrar las primeras 3
            setUnits(loadedUnits);
            setFilteredUnits(loadedUnits);
      } else {
        console.error('❌ [VALIDATION] Error al cargar unidades:', result.error);
        throw new Error(result.error || 'Error al cargar unidades');
      }
    } catch (err) {
      console.error('❌ [VALIDATION] Error cargando unidades:', err);
      onError('Error al cargar las unidades de la propiedad');
    } finally {
      setLoadingUnits(false);
    }
  };

  // Filtrar unidades en tiempo real
  useEffect(() => {
    if (unitSearchTerm.trim() === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(unit =>
        unit.number.toLowerCase().includes(unitSearchTerm.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  }, [unitSearchTerm, units]);

  const handleSelectUnit = (unit: PropertyUnit) => {
    setSelectedUnitId(unit.id?.toString() || unit.number);
    setUnitSearchTerm(unit.number);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUnitId || !dni.trim()) {
      console.warn('⚠️ [VALIDATION] Datos incompletos');
      setError('Por favor, seleccione una unidad e ingrese su DNI');
      return;
    }

        console.log('🔐 [VALIDATION] Validando residente:', {
          propertyUnitId: parseInt(selectedUnitId),
          dni: dni.trim()
        });

    console.log('🔄 [VALIDATION] Iniciando validación, setting loading to true');
    setLoading(true);

    try {
      // Encontrar el ID real de la unidad seleccionada
      const selectedUnit = units.find(unit => 
        (unit.id?.toString() || unit.number) === selectedUnitId
      );
      
      if (!selectedUnit) {
        setError('Unidad no encontrada');
        setLoading(false);
        return;
      }

      const result = await validateResidentAction({
        publicToken,
        propertyUnitId: selectedUnit.id || parseInt(selectedUnit.number),
        dni: dni.trim()
      });

      console.log('📥 [VALIDATION] Resultado de validación:', result);

      if (result.success && result.data) {
        const { voting_auth_token, resident_id, resident_name, property_unit_number, voting_id, hp_id, group_id } = result.data;
        
        console.log('✅ [VALIDATION] Residente validado:', {
          resident_id,
          resident_name,
          property_unit_number,
          voting_id,
          hp_id,
          group_id
        });

        onSuccess(voting_auth_token, {
          id: resident_id,
          name: resident_name,
          unitNumber: property_unit_number,
          votingId: voting_id,
          hpId: hp_id,
          groupId: group_id
        });
      } else {
        console.error('❌ [VALIDATION] Error en validación:', result.error || result.message);
        const errorMessage = result.error || result.message || 'Error al validar residente';
        setError(errorMessage);
        // No llamar onError() para permitir reintentar
      }
    } catch (err) {
      console.error('❌ [VALIDATION] Error validando residente:', err);
      setError('Error de conexión. Por favor, intente nuevamente.');
      // No llamar onError() para permitir reintentar
    } finally {
      console.log('🔄 [VALIDATION] Finalizando validación, setting loading to false');
      setLoading(false);
    }
  };

  if (loadingUnits) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando unidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🗳️</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Validación de Residente
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Seleccione su unidad e ingrese su DNI para continuar
          </p>
        </div>

        {/* Información del contexto de votación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {votingContext.property.name}
            </h3>
            
            <div className="border-t border-blue-200 pt-3">
              <h4 className="text-md font-semibold text-blue-800 mb-1">
                {votingContext.voting.title}
              </h4>
              <p className="text-xs text-blue-600 mb-2">
                {votingContext.voting.description}
              </p>
              <p className="text-xs text-blue-500">
                📋 {votingContext.voting_group.name}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert type="error" onClose={() => setError(null)}>
                <div className="space-y-2">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm opacity-90">
                    Verifique que la unidad y el DNI sean correctos e intente nuevamente.
                  </p>
                </div>
              </Alert>
            )}

            <div className="relative">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unidad Residencial
              </label>
              <div className="relative">
                <input
                  id="unit"
                  type="text"
                  value={unitSearchTerm}
                  onChange={(e) => {
                    setUnitSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) {
                      setSelectedUnitId('');
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white"
                  placeholder="Busque su apartamento/casa (ej: 101, 202, A-1)"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Dropdown de resultados */}
              {showDropdown && filteredUnits.length > 0 && (
                <div className="unit-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredUnits.map((unit, index) => (
                    <button
                      key={unit.id || index}
                      type="button"
                      onClick={() => handleSelectUnit(unit)}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        selectedUnitId === (unit.id?.toString() || unit.number) ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{unit.number}</span>
                        {selectedUnitId === (unit.id?.toString() || unit.number) && (
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {showDropdown && unitSearchTerm && filteredUnits.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500 text-sm">
                  No se encontraron unidades que coincidan con &quot;{unitSearchTerm}&quot;
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                Digite el número de su apartamento/casa para buscarlo
              </p>
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                Documento de Identidad (DNI)
              </label>
              <input
                id="dni"
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white"
                placeholder="Ingrese su número de DNI"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Ingrese el DNI del residente registrado en esta unidad
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !selectedUnitId || !dni.trim()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Validando...</span>
                  </>
                ) : (
                  'Continuar a Votación'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Información</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-2">
              <p>• Solo residentes registrados pueden votar</p>
              <p>• El DNI debe coincidir exactamente con el registrado</p>
              <p>• Cada residente puede votar una sola vez</p>
              <p>• Su voto es confidencial y seguro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


