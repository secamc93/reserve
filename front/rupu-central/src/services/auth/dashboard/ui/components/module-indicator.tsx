/**
 * Componente de indicador visual para módulos del dashboard
 */

'use client';

interface ModuleIndicatorProps {
  label: string;
  value: number;
  total: number;
  color: string;
  showPercentage?: boolean;
}

export function ModuleIndicator({ 
  label, 
  value, 
  total, 
  color,
  showPercentage = true 
}: ModuleIndicatorProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const barWidth = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-semibold">{value}</span>
          {showPercentage && (
            <span className="text-gray-500 text-xs">({percentage}%)</span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}


