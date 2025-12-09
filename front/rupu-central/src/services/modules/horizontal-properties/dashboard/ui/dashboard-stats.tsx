/**
 * Componente de estadísticas del dashboard
 */

'use client';

interface DashboardStatsProps {
  totalUnits: number;
  occupiedUnits: number;
  pendingFees: number;
  totalRevenue: number;
}

export function DashboardStats({ totalUnits, occupiedUnits, pendingFees, totalRevenue }: DashboardStatsProps) {
  const stats = [
    { label: 'Total Unidades', value: totalUnits, color: 'bg-blue-500' },
    { label: 'Unidades Ocupadas', value: occupiedUnits, color: 'bg-green-500' },
    { label: 'Expensas Pendientes', value: pendingFees, color: 'bg-yellow-500' },
    { label: 'Ingresos Totales', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
            <span className="text-white text-2xl font-bold">📊</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

