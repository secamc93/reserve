/**
 * Componente: Tabla de Roles
 * Muestra los roles del sistema en una tabla
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getRolesAction } from '../../infrastructure/actions/get-roles.action';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
}

export function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    console.log('🔄 Cargando roles...');

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
      }

      console.log('🔑 Token encontrado, llamando al backend...');
      const result = await getRolesAction(token);
      console.log('📦 Respuesta de getRolesAction:', result);

      if (result.success && result.data) {
        console.log('✅ Roles cargados:', result.data.roles.length);
        // Ordenar roles por ID de menor a mayor
        const sortedRoles = result.data.roles.sort((a, b) => a.id - b.id);
        setRoles(sortedRoles);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
    }

    setLoading(false);
  };

  const rolesColumns: TableColumn<Role>[] = [
    { key: 'id', label: 'ID', width: '80px', align: 'center' },
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'scopeName',
      label: 'Alcance',
      render: (value, row) => (
        <Badge type={row.scopeCode === 'platform' ? 'primary' : 'success'}>
          {String(value)}
        </Badge>
      )
    },
    { key: 'level', label: 'Nivel', width: '100px', align: 'center' },
    { key: 'isSystem', label: 'Sistema', width: '100px', align: 'center', render: (value) => value ? '✓' : '—' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Roles del Sistema ({roles.length})
        </h3>
        <button className="btn btn-primary btn-sm">
          + Agregar Rol
        </button>
      </div>

      <Table
        columns={rolesColumns}
        data={roles}
        loading={loading}
        emptyMessage="No hay roles disponibles"
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

