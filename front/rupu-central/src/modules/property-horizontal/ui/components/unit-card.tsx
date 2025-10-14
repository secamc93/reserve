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

  // Función para generar tonos claros y oscuros a partir de un color hex
  const generateColorShades = (hex: string) => {
    // Convertir hex a RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Generar tonos más claros para el fondo
    const bgLight = `rgba(${r}, ${g}, ${b}, 0.1)`;
    const borderLight = `rgba(${r}, ${g}, ${b}, 0.3)`;
    const iconBgLight = `rgba(${r}, ${g}, ${b}, 0.2)`;
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

    // Si tiene color personalizado, usarlo
    if (unit.votedOptionColor) {
      const shades = generateColorShades(unit.votedOptionColor);
      return {
        useCustom: true,
        customStyles: {
          bg: shades.bgLight,
          border: shades.borderLight,
          iconBg: shades.iconBgLight,
          iconText: shades.iconText
        },
        badge: 'primary' as const
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
    // Usar estilos inline para colores personalizados
    return (
      <div 
        className={`${currentScale.cardPadding} rounded-xl border-2 text-center transition-all hover:shadow-md`}
        style={{
          backgroundColor: colors.customStyles.bg,
          borderColor: colors.customStyles.border
        }}
      >
        <div 
          className={`${currentScale.iconSize} mx-auto mb-3 flex items-center justify-center rounded-full font-bold ${currentScale.iconText}`}
          style={{
            backgroundColor: colors.customStyles.iconBg,
            color: colors.customStyles.iconText
          }}
        >
          {unit.number}
        </div>
        <p className={`font-semibold text-gray-900 ${currentScale.nameText} mb-1 truncate`} title={unit.resident}>
          {unit.resident}
        </p>
        <p className={`text-gray-500 ${currentScale.unitText} mb-1`}>Unidad {unit.number}</p>
        {unit.participationCoefficient && (
          <p className={`text-gray-400 ${currentScale.unitText} mb-2`} title="Coeficiente de participación">
            Coef: {unit.participationCoefficient.toFixed(4)}
          </p>
        )}
        <div className="space-y-1">
          <Badge type={colors.badge}>
            ✅ {unit.votedOption}
          </Badge>
        </div>
      </div>
    );
  }

  // Usar clases de Tailwind para colores por defecto
  return (
    <div 
      className={`${currentScale.cardPadding} rounded-xl border-2 text-center transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
    >
      <div className={`${currentScale.iconSize} mx-auto mb-3 flex items-center justify-center rounded-full font-bold ${currentScale.iconText} ${colors.iconBg} ${colors.iconText}`}>
        {unit.number}
      </div>
      <p className={`font-semibold text-gray-900 ${currentScale.nameText} mb-1 truncate`} title={unit.resident}>
        {unit.resident}
      </p>
      <p className={`text-gray-500 ${currentScale.unitText} mb-1`}>Unidad {unit.number}</p>
      {unit.participationCoefficient && (
        <p className={`text-gray-400 ${currentScale.unitText} mb-2`} title="Coeficiente de participación">
          Coef: {unit.participationCoefficient.toFixed(4)}
        </p>
      )}
      {unit.hasVoted && unit.votedOption ? (
        <div className="space-y-1">
          <Badge type={colors.badge}>
            ✅ {unit.votedOption}
          </Badge>
        </div>
      ) : (
        <Badge type="error">
          ⏳ Pendiente
        </Badge>
      )}
    </div>
  );
}
