/**
 * Componente: Tarjeta de Unidad Residencial
 * Componente reutilizable para mostrar información de una unidad residencial
 */

'use client';

import { Badge } from '@shared/ui';

export interface ResidentialUnit {
  id: number;
  number: string;
  resident: string;
  residentId?: number | null; // ✅ NUEVO: ID del residente para debugging
  hasVoted: boolean;
  votedOption?: string; // Texto de la opción votada
  votedOptionId?: number; // ID de la opción votada
  votedOptionColor?: string; // Color de la opción votada (hex)
  participationCoefficient?: number; // Coeficiente de participación
}

interface ScaleConfig {
  gridCols: string;
  cardPadding: string;
  iconSize: string;
  iconText: string;
  nameText: string;
  unitText: string;
}

interface UnitCardProps {
  unit: ResidentialUnit;
  scale?: ScaleConfig;
}

export function UnitCard({ unit, scale }: UnitCardProps) {
  // Configuración por defecto si no se proporciona escala
  const defaultScale = {
    cardPadding: "p-4",
    iconSize: "w-12 h-12",
    iconText: "text-lg",
    nameText: "text-sm",
    unitText: "text-xs"
  };

  const currentScale = scale || defaultScale;

  // Función para generar tonos más intensos a partir de un color hex
  const generateColorShades = (hex: string) => {
    // Convertir hex a RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Generar tonos más intensos para resaltar el voto
    const bgLight = `rgba(${r}, ${g}, ${b}, 0.15)`; // Más intenso que 0.1
    const borderLight = `rgba(${r}, ${g}, ${b}, 0.5)`; // Más intenso que 0.3
    const iconBgLight = `rgba(${r}, ${g}, ${b}, 0.3)`; // Más intenso que 0.2
    const iconText = hex;
    
    return { bgLight, borderLight, iconBgLight, iconText };
  };

  // Colores por defecto o personalizados
  const getColors = () => {
    // Si no ha votado, usar blanco
    if (!unit.hasVoted) {
      return {
        useCustom: false,
        bg: 'bg-white',
        border: 'border-gray-300',
        iconBg: 'bg-gray-100',
        iconText: 'text-gray-500',
        badge: 'error' as const
      };
    }

    // Si tiene color personalizado del voto, usarlo con mayor intensidad
    if (unit.votedOptionColor) {
      const shades = generateColorShades(unit.votedOptionColor);
      return {
        useCustom: true,
        customStyles: {
          bg: shades.bgLight,
          border: shades.borderLight,
          iconBg: unit.votedOptionColor, // Color sólido más fuerte para el icono
          iconText: "#ffffff" // Texto blanco para contraste
        },
        badge: 'success' as const
      };
    }

    // Si no tiene color personalizado, usar colores por defecto según ID
    const defaultColors = [
      { bg: 'bg-green-50', border: 'border-green-300', iconBg: 'bg-green-100', iconText: 'text-green-700', badge: 'success' as const },
      { bg: 'bg-blue-50', border: 'border-blue-300', iconBg: 'bg-blue-100', iconText: 'text-blue-700', badge: 'primary' as const },
      { bg: 'bg-purple-50', border: 'border-purple-300', iconBg: 'bg-purple-100', iconText: 'text-purple-700', badge: 'primary' as const },
      { bg: 'bg-yellow-50', border: 'border-yellow-300', iconBg: 'bg-yellow-100', iconText: 'text-yellow-700', badge: 'primary' as const },
      { bg: 'bg-pink-50', border: 'border-pink-300', iconBg: 'bg-pink-100', iconText: 'text-pink-700', badge: 'primary' as const },
      { bg: 'bg-indigo-50', border: 'border-indigo-300', iconBg: 'bg-indigo-100', iconText: 'text-indigo-700', badge: 'primary' as const },
      { bg: 'bg-red-50', border: 'border-red-300', iconBg: 'bg-red-100', iconText: 'text-red-700', badge: 'error' as const },
      { bg: 'bg-orange-50', border: 'border-orange-300', iconBg: 'bg-orange-100', iconText: 'text-orange-700', badge: 'primary' as const },
    ];

    const colorIndex = unit.votedOptionId ? (unit.votedOptionId - 1) % defaultColors.length : 0;
    return {
      useCustom: false,
      ...defaultColors[colorIndex]
    };
  };

  const colors = getColors();

  if (colors.useCustom && colors.customStyles) {
    // Diseño simplificado: solo número de unidad y color de opción
    return (
      <div 
        className={`${currentScale.cardPadding} rounded-xl border-2 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer relative group`}
        style={{
          backgroundColor: colors.customStyles.bg,
          borderColor: colors.customStyles.border,
          boxShadow: `0 4px 6px -1px ${colors.customStyles.iconBg}20, 0 2px 4px -1px ${colors.customStyles.iconBg}10`
        }}
      >
        {/* Solo el número de unidad con color de fondo de la opción */}
        <div 
          className="w-full px-3 py-3 rounded-lg font-bold text-white shadow-sm"
          style={{
            backgroundColor: colors.customStyles.iconBg,
          }}
        >
          {unit.number}
        </div>
        
        {/* Tooltip con detalles - z-index muy alto para aparecer por encima de todo */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-[9999]">
          <div className="font-semibold mb-1">{unit.number}</div>
          <div className="text-gray-300">{unit.resident}</div>
          <div className="text-gray-300">ID Residente: {unit.residentId || 'N/A'}</div>
          <div className="text-gray-300">Coef: {unit.participationCoefficient?.toFixed(4) || '0.0000'}</div>
          <div className="text-gray-300">Estado: {unit.hasVoted ? `Votó: ${unit.votedOption}` : 'Pendiente'}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  // Usar clases de Tailwind para colores por defecto con el diseño simplificado
  return (
    <div 
      className={`${currentScale.cardPadding} rounded-xl border-2 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer relative group ${colors.bg} ${colors.border}`}
    >
      {/* Solo el número de unidad con color de fondo */}
      <div className={`w-full px-3 py-3 rounded-lg font-bold text-white shadow-sm ${colors.iconBg}`}>
        {unit.number}
      </div>
      
      {/* Tooltip con detalles - z-index muy alto para aparecer por encima de todo */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-[9999]">
        <div className="font-semibold mb-1">{unit.number}</div>
        <div className="text-gray-300">{unit.resident}</div>
        <div className="text-gray-300">ID Residente: {unit.residentId || 'N/A'}</div>
        <div className="text-gray-300">Coef: {unit.participationCoefficient?.toFixed(4) || '0.0000'}</div>
        <div className="text-gray-300">Estado: {unit.hasVoted ? `Votó: ${unit.votedOption}` : 'Pendiente'}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
