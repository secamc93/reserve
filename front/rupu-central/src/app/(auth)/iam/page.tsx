/**
 * Página de administración IAM (Identity and Access Management)
 * Gestión de usuarios, roles y permisos
 */

'use client';

import { useState } from 'react';
import { RolesTable, ResourcesTable, PermissionsTable } from '@modules/auth/ui';

export default function IAMPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'resources'>('roles');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Usuarios, Roles y Permisos
          </h1>
          <p className="text-gray-600 mt-2">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex gap-4 border-b pb-4">
            <button
              className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('users')}
            >
              Usuarios
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('roles')}
            >
              Roles
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'resources' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('resources')}
            >
              Módulos
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'permissions' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('permissions')}
            >
              Permisos
            </button>
          </div>

          {/* Content */}
          <div className="py-4">
            {activeTab === 'users' && (
              <div className="text-center text-gray-500 py-8">
                <p>Módulo de usuarios en construcción...</p>
              </div>
            )}

            {activeTab === 'roles' && <RolesTable />}

            {activeTab === 'resources' && <ResourcesTable />}

            {activeTab === 'permissions' && <PermissionsTable />}
          </div>
        </div>
      </div>
    </div>
  );
}
