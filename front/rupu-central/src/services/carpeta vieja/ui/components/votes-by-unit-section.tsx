/**
 * Componente: Sección de Votos por Unidad
 * Componente reutilizable para mostrar el estado de votación por unidad residencial
 */

'use client';

import { useState } from 'react';
import { UnitCard, type ResidentialUnit } from './unit-card';

interface VotesByUnitSectionProps {
  units: ResidentialUnit[];
  title?: string;
  showPreviewNote?: boolean;
  maxHeight?: string;
  fillAvailableSpace?: boolean;
  showScaleControl?: boolean;
  onVoteClick?: (unit: ResidentialUnit) => void; // ✅ Callback para abrir modal de voto
  onDeleteVoteClick?: (unit: ResidentialUnit) => void; // ✅ Callback para eliminar voto
  showVoteButton?: boolean; // ✅ Mostrar botón de votar/eliminar en cada tarjeta
}

export function VotesByUnitSection({ 
  units, 
  title = "🏠 Votos por Unidad",
  showPreviewNote = true,
  maxHeight = "max-h-96",
  fillAvailableSpace = false,
  showScaleControl = true,
  onVoteClick,
  onDeleteVoteClick,
  showVoteButton = false
}: VotesByUnitSectionProps) {
  const [scale, setScale] = useState(5); // 0=extra pequeño, 5=mediano, 10=muy grande

  // Configuración de escala más amplia (0-10)
  const scaleConfig = {
    0: { // Extra pequeño - máxima densidad
      gridCols: "grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 2xl:grid-cols-15",
      cardPadding: "p-1",
      iconSize: "w-5 h-5",
      iconText: "text-xs",
      nameText: "text-xs",
      unitText: "text-xs"
    },
    1: { // Muy pequeño - máxima densidad
      gridCols: "grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12",
      cardPadding: "p-1",
      iconSize: "w-6 h-6",
      iconText: "text-xs",
      nameText: "text-xs",
      unitText: "text-xs"
    },
    2: { // Muy pequeño
      gridCols: "grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11",
      cardPadding: "p-2",
      iconSize: "w-8 h-8",
      iconText: "text-sm",
      nameText: "text-xs",
      unitText: "text-xs"
    },
    3: { // Pequeño
      gridCols: "grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10",
      cardPadding: "p-2",
      iconSize: "w-8 h-8",
      iconText: "text-sm",
      nameText: "text-xs",
      unitText: "text-xs"
    },
    4: { // Pequeño-mediano
      gridCols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9",
      cardPadding: "p-3",
      iconSize: "w-10 h-10",
      iconText: "text-base",
      nameText: "text-sm",
      unitText: "text-xs"
    },
    5: { // Mediano
      gridCols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8",
      cardPadding: "p-4",
      iconSize: "w-12 h-12",
      iconText: "text-lg",
      nameText: "text-sm",
      unitText: "text-xs"
    },
    6: { // Mediano-grande
      gridCols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7",
      cardPadding: "p-4",
      iconSize: "w-12 h-12",
      iconText: "text-lg",
      nameText: "text-sm",
      unitText: "text-xs"
    },
    7: { // Grande
      gridCols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      cardPadding: "p-5",
      iconSize: "w-14 h-14",
      iconText: "text-xl",
      nameText: "text-base",
      unitText: "text-sm"
    },
    8: { // Grande
      gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      cardPadding: "p-6",
      iconSize: "w-16 h-16",
      iconText: "text-xl",
      nameText: "text-base",
      unitText: "text-sm"
    },
    9: { // Muy grande
      gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      cardPadding: "p-6",
      iconSize: "w-18 h-18",
      iconText: "text-2xl",
      nameText: "text-lg",
      unitText: "text-base"
    },
    10: { // Extra grande - mínima densidad
      gridCols: "grid-cols-1 md:grid-cols-2",
      cardPadding: "p-8",
      iconSize: "w-20 h-20",
      iconText: "text-3xl",
      nameText: "text-xl",
      unitText: "text-lg"
    }
  };

  const currentScale = scaleConfig[scale as keyof typeof scaleConfig];
  
  // Determinar la altura del contenedor scrollable
  const scrollContainerHeight = fillAvailableSpace ? 'h-full' : 'h-[60vh]';
  
  return (
    <>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
      <div className={fillAvailableSpace ? 'flex flex-col h-full' : 'space-y-4'}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            {showScaleControl && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Tamaño:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Pequeño</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(scale / 10) * 100}%, #e5e7eb ${(scale / 10) * 100}%, #e5e7eb 100%)`
                  }}
                />
                  <span className="text-xs text-gray-500">Grande</span>
                </div>
              </div>
            )}
            {showPreviewNote && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                <p className="text-xs text-yellow-800">
                  <strong>Vista previa</strong> - CRUD próximamente
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Cuadrícula de Unidades Residenciales con scroll independiente */}
        <div className={`${scrollContainerHeight} ${fillAvailableSpace ? 'flex-1' : ''} overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 px-4 pt-4`}>
          <div className={`grid ${currentScale.gridCols} gap-4 pb-4`}>
            {units.map((unit) => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                scale={currentScale}
                onVoteClick={onVoteClick}
                onDeleteVoteClick={onDeleteVoteClick}
                showVoteButton={showVoteButton}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
