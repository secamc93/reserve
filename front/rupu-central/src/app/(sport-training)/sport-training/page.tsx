/**
 * Sport Training Dashboard
 * Pagina principal del modulo Sport Training con navegacion a todos los submodulos
 */
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@shared/ui';

const modules = [
  {
    title: 'Jugadores',
    description: 'Gestionar jugadores, menores y adultos',
    href: '/sport-training/players',
    icon: '&#9917;',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    title: 'Tutores',
    description: 'Gestionar tutores y padres de jugadores menores',
    href: '/sport-training/guardians',
    icon: '&#128101;',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
  {
    title: 'Entrenadores',
    description: 'Gestionar entrenadores y sus especialidades',
    href: '/sport-training/coaches',
    icon: '&#127941;',
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    title: 'Grupos',
    description: 'Grupos de entrenamiento y sus jugadores',
    href: '/sport-training/groups',
    icon: '&#128101;',
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  },
  {
    title: 'Sesiones',
    description: 'Sesiones de entrenamiento individuales y grupales',
    href: '/sport-training/sessions',
    icon: '&#128197;',
    color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
  },
  {
    title: 'Reservas',
    description: 'Reservas de sesiones y flujo de aprobacion',
    href: '/sport-training/bookings',
    icon: '&#128203;',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  },
  {
    title: 'Configuracion',
    description: 'Catalogos maestros del sistema',
    href: '/sport-training/settings',
    icon: '&#9881;',
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
  },
];

export default function SportTrainingPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sport Training</h1>
          <p className="text-gray-600 mt-2">
            Sistema de gestion de entrenamientos deportivos
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <button
              key={mod.href}
              onClick={() => router.push(mod.href)}
              className={`border rounded-lg p-6 text-left transition-colors ${mod.color}`}
            >
              <div className="text-3xl mb-3" dangerouslySetInnerHTML={{ __html: mod.icon }} />
              <h2 className="text-xl font-semibold text-gray-900">{mod.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{mod.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
