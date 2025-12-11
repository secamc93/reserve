/**
 * Tarjeta de estadísticas para el dashboard
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  link: string;
  color: string;
  stats: {
    total: number;
    [key: string]: number | string;
  };
  renderCustomStats?: () => ReactNode;
}

export function StatsCard({ 
  title, 
  description, 
  icon: Icon, 
  link, 
  color, 
  stats,
  renderCustomStats 
}: StatsCardProps) {
  return (
    <Link 
      href={link} 
      className={`${color} rounded-lg shadow-md border-0 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] block overflow-hidden`}
      style={{ color: '#ffffff' }}
    >
      <div className="p-4" style={{ color: '#ffffff' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-white/20 rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <Icon className="h-5 w-5" style={{ color: '#ffffff' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold mb-1 truncate" style={{ color: '#ffffff' }}>{title}</h2>
            <p className="text-xs line-clamp-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{description}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          {renderCustomStats ? (
            <div style={{ color: '#ffffff' }}>
              {renderCustomStats()}
            </div>
          ) : (
            <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Total: {stats.total}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
