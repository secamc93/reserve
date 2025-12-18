/**
 * Gráfica simple circular (donut chart) para mostrar distribuciones
 */

'use client';

interface SimpleChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title?: string;
  showLegend?: boolean;
}

export function SimpleChart({ data, title, showLegend = true }: SimpleChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm">No hay datos disponibles</p>
      </div>
    );
  }

  let cumulativePercent = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const centerX = 80;
  const centerY = 80;

  const segments = data
    .filter(item => item.value > 0)
    .map((item) => {
      const percentage = (item.value / total) * 100;
      const dashArray = (percentage / 100) * circumference;
      const dashOffset = circumference - (cumulativePercent / 100) * circumference;
      cumulativePercent += percentage;

      return {
        ...item,
        percentage,
        dashArray,
        dashOffset,
      };
    });

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">{title}</h4>
      )}
      <div className="flex flex-col items-center gap-6">
        {/* Gráfica circular */}
        <div className="relative">
          <svg viewBox="0 0 160 160" className="w-48 h-48">
            {/* Círculo de fondo */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="12"
            />
            {/* Segmentos */}
            {segments.map((segment, index) => (
              <circle
                key={`${segment.label}-${index}`}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={`${segment.dashArray} ${circumference}`}
                strokeDashoffset={segment.dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${centerX} ${centerY})`}
              />
            ))}
          </svg>
          {/* Texto central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500 uppercase">Total</span>
          </div>
        </div>

        {/* Leyenda */}
        {showLegend && segments.length > 0 && (
          <div className="w-full space-y-2">
            {segments.map((segment, index) => (
              <div key={`legend-${index}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-gray-700">{segment.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-semibold">{segment.value}</span>
                  <span className="text-gray-500 text-xs">({segment.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


