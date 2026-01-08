'use client';

import { useState, useEffect, useRef } from 'react';
import { getPropertyUnitsAction } from '@/services/modules/horizontal-properties/units/infrastructure/actions';
import { PropertyUnit } from '@/services/modules/horizontal-properties/units/domain';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface UnitAutocompleteProps {
  value?: number;
  onChange: (unitId: number | undefined) => void;
  businessId: number;
  token: string;
  required?: boolean;
  label?: string;
}

export function UnitAutocomplete({
  value,
  onChange,
  businessId,
  token,
  required = false,
  label = 'Unidad de Propiedad *',
}: UnitAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<PropertyUnit[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef(false);
  const unitsRef = useRef<PropertyUnit[]>([]);
  const selectedUnitRef = useRef<PropertyUnit | null>(null);

  // Cargar todas las unidades al montar
  useEffect(() => {
    loadUnits();
  }, [businessId, token]);

  // Cargar unidad seleccionada
  useEffect(() => {
    if (value && units.length > 0) {
      const unit = units.find(u => u.id === value);
      if (unit && selectedUnit?.id !== unit.id) {
        isSelectingRef.current = true;
        selectedUnitRef.current = unit;
        setSelectedUnit(unit);
        setSearchTerm(getUnitLabel(unit));
        setTimeout(() => {
          isSelectingRef.current = false;
        }, 100);
      }
    } else if (!value && selectedUnit) {
      isSelectingRef.current = true;
      selectedUnitRef.current = null;
      setSelectedUnit(null);
      setSearchTerm('');
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
    }
  }, [value, units]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const result = await getPropertyUnitsAction({
        businessId,
        token,
        page: 1,
        pageSize: 500, // Cargar muchas unidades para búsqueda local
        isActive: true,
      });
      const loadedUnits = result.units || [];
      unitsRef.current = loadedUnits;
      setUnits(loadedUnits);
      setFilteredUnits(loadedUnits);
    } catch (error) {
      console.error('Error cargando unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda local y por API cuando hay término
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si estamos seleccionando una unidad, no buscar
    if (isSelectingRef.current) {
      return;
    }

    // Usar referencias para obtener valores actuales sin causar re-renders
    const currentUnits = unitsRef.current;
    const currentSelected = selectedUnitRef.current;

    // Si el término coincide exactamente con la unidad seleccionada, no buscar
    if (currentSelected && searchTerm === getUnitLabel(currentSelected)) {
      setFilteredUnits([currentSelected]);
      return;
    }

    if (searchTerm.trim() === '') {
      setFilteredUnits(currentUnits);
      return;
    }

    // Búsqueda local primero
    const localFiltered = currentUnits.filter(unit => {
      const searchLower = searchTerm.toLowerCase();
      const number = unit.number?.toLowerCase() || '';
      const block = unit.block?.toLowerCase() || '';
      const floor = unit.floor?.toString() || '';
      return number.includes(searchLower) || block.includes(searchLower) || floor.includes(searchLower);
    });

    setFilteredUnits(localFiltered);

    // Si hay pocos resultados locales, buscar en API con debounce
    // Solo buscar si el término es diferente al label de la unidad seleccionada
    const currentSearchTerm = searchTerm;
    const selectedLabel = currentSelected ? getUnitLabel(currentSelected) : '';
    const shouldSearchAPI = localFiltered.length < 10 && 
                            currentSearchTerm.length >= 2 && 
                            (!currentSelected || currentSearchTerm !== selectedLabel);
    
    if (shouldSearchAPI) {
      searchTimeoutRef.current = setTimeout(() => {
        // Verificar nuevamente antes de buscar
        if (!isSelectingRef.current && 
            searchTerm === currentSearchTerm &&
            (!selectedUnitRef.current || searchTerm !== getUnitLabel(selectedUnitRef.current))) {
          searchInAPI(searchTerm);
        }
      }, 600); // Debounce aumentado a 600ms
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Solo depende de searchTerm

  const searchInAPI = async (term: string) => {
    // Evitar búsquedas si el término coincide con la unidad seleccionada
    if (selectedUnit && term === getUnitLabel(selectedUnit)) {
      return;
    }

    // Evitar búsquedas si estamos seleccionando
    if (isSelectingRef.current) {
      return;
    }

    // Evitar búsquedas si el término actual es diferente
    if (searchTerm !== term) {
      return;
    }

    setLoading(true);
    try {
      const result = await getPropertyUnitsAction({
        businessId,
        token,
        page: 1,
        pageSize: 50,
        number: term,
        isActive: true,
      });
      
      const apiUnits = result.units || [];
      
      // Solo actualizar si el término de búsqueda sigue siendo el mismo
      if (searchTerm === term && !isSelectingRef.current) {
        // Combinar resultados locales y de API, eliminando duplicados
        setUnits(prevUnits => {
          const combined = [...prevUnits, ...apiUnits];
          const unique = Array.from(new Map(combined.map(u => [u.id, u])).values());
          unitsRef.current = unique; // Actualizar referencia
          return unique;
        });
        
        // Actualizar filteredUnits solo con los resultados de la API para este término
        setFilteredUnits(apiUnits);
      }
    } catch (error) {
      console.error('Error buscando unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnitLabel = (unit: PropertyUnit) => {
    const parts = [unit.number];
    if (unit.block) parts.push(`Bloque ${unit.block}`);
    if (unit.floor) parts.push(`Piso ${unit.floor}`);
    return parts.join(' - ');
  };

  const handleSelect = (unit: PropertyUnit) => {
    // Establecer flag ANTES de cualquier actualización
    isSelectingRef.current = true;
    const unitLabel = getUnitLabel(unit);
    
    // Limpiar cualquier búsqueda pendiente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    selectedUnitRef.current = unit; // Actualizar referencia
    setSelectedUnit(unit);
    setSearchTerm(unitLabel);
    onChange(unit.id);
    setIsOpen(false);
    
    // Permitir búsquedas nuevamente después de un delay más largo
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 500);
  };

  const handleClear = () => {
    isSelectingRef.current = true;
    selectedUnitRef.current = null;
    setSelectedUnit(null);
    setSearchTerm('');
    onChange(undefined);
    setIsOpen(false);
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 300);
  };

  // Cerrar cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar por número, bloque o piso..."
          className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          required={required}
        />
        {selectedUnit && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <span className="text-xl">×</span>
          </button>
        )}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Buscando unidades...
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron unidades
            </div>
          ) : (
            <ul className="py-1">
              {filteredUnits.map((unit) => (
                <li
                  key={unit.id}
                  onClick={() => handleSelect(unit)}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedUnit?.id === unit.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{getUnitLabel(unit)}</div>
                  {unit.unitType && (
                    <div className="text-sm text-gray-500">Tipo: {unit.unitType}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
