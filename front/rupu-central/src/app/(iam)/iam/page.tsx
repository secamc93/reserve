'use client';

import Link from 'next/link';
import { UsersIcon, ShieldCheckIcon, KeyIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';

export default function IAMPage() {
  const modules = [
    {
      name: 'Usuarios',
      description: 'Gestiona los usuarios del sistema y sus detalles.',
      icon: UsersIcon,
      link: '/iam/users',
      stats: {
        total: 120,
        active: 100,
        inactive: 20
      },
      color: 'bg-blue-500'
    },
    {
      name: 'Roles',
      description: 'Define y asigna roles para controlar el acceso.',
      icon: ShieldCheckIcon,
      link: '/iam/roles',
      stats: {
        total: 15,
        custom: 10,
        system: 5
      },
      color: 'bg-green-500'
    },
    {
      name: 'Permisos',
      description: 'Administra los permisos detallados para cada acción.',
      icon: KeyIcon,
      link: '/iam/permissions',
      stats: {
        total: 250,
        assigned: 200,
        unassigned: 50
      },
      color: 'bg-purple-500'
    },
    {
      name: 'Recursos',
      description: 'Define los recursos a los que se aplican los permisos.',
      icon: CubeTransparentIcon,
      link: '/iam/resources',
      stats: {
        total: 30,
        active: 25,
        inactive: 5
      },
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard IAM
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenido al panel de control de IAM. Aquí puedes gestionar todos los aspectos de la seguridad y el acceso de tu aplicación.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {modules.map((module) => (
            <Link key={module.name} href={module.link} className={`card shadow-lg compact side ${module.color} text-white transition-transform transform hover:scale-105`}>
              <div className="card-body">
                <div className="flex items-center">
                  <module.icon className="h-8 w-8 mr-3" />
                  <h2 className="card-title text-xl">{module.name}</h2>
                </div>
                <p className="text-sm opacity-90">{module.description}</p>
                <div className="mt-4">
                  {module.name === 'Usuarios' && (
                    <>
                      <p className="text-sm font-medium">Total: {module.stats.total}</p>
                      <p className="text-sm font-medium">Activos: {module.stats.active}</p>
                    </>
                  )}
                  {module.name === 'Roles' && (
                    <>
                      <p className="text-sm font-medium">Total: {module.stats.total}</p>
                      <p className="text-sm font-medium">Personalizados: {module.stats.custom}</p>
                    </>
                  )}
                  {module.name === 'Permisos' && (
                    <>
                      <p className="text-sm font-medium">Total: {module.stats.total}</p>
                      <p className="text-sm font-medium">Asignados: {module.stats.assigned}</p>
                    </>
                  )}
                  {module.name === 'Recursos' && (
                    <>
                      <p className="text-sm font-medium">Total: {module.stats.total}</p>
                      <p className="text-sm font-medium">Activos: {module.stats.active}</p>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/iam/users/create" className="btn btn-outline btn-primary">
              Crear Nuevo Usuario
            </Link>
            <Link href="/iam/roles/create" className="btn btn-outline btn-secondary">
              Crear Nuevo Rol
            </Link>
            <Link href="/iam/resources/create" className="btn btn-outline btn-accent">
              Crear Nuevo Recurso
            </Link>
          </div>
        </div>

        {/* Overview Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card shadow-lg bg-base-100">
            <div className="card-body">
              <h3 className="card-title text-xl">Actividad Reciente</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Usuario "Juan Pérez" actualizó su perfil.</li>
                <li>Rol "Editor" modificado por "María García".</li>
                <li>Nuevo recurso "Reportes" añadido.</li>
              </ul>
            </div>
          </div>
          <div className="card shadow-lg bg-base-100">
            <div className="card-body">
              <h3 className="card-title text-xl">Estado del Sistema</h3>
              <div className="flex items-center mb-2">
                <span className="badge badge-success mr-2">Online</span>
                <p className="text-gray-700">Todos los servicios operativos.</p>
              </div>
              <div className="flex items-center">
                <span className="badge badge-info mr-2">Info</span>
                <p className="text-gray-700">Última auditoría de seguridad: 1 semana.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}