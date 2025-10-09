/**
 * Componente: Tabla de Permisos
 * Muestra todos los permisos del sistema en una tabla
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getPermissionsListAction } from '../../infrastructure/actions/get-permissions-list.action';

interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
}

export function PermissionsTable() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
      }

      const result = await getPermissionsListAction(token);

      if (result.success && result.data) {
        // Ordenar permisos por ID de menor a mayor
        const sortedPermissions = result.data.permissions.sort((a, b) => a.id - b.id);
        setPermissions(sortedPermissions);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar permisos:', error);
    }

    setLoading(false);
  };

  const permissionsColumns: TableColumn<Permission>[] = [
    { key: 'id', label: 'ID', width: '80px', align: 'center' },
    { key: 'resource', label: 'Recurso', width: '200px' },
    {
      key: 'action',
      label: 'Acción',
      width: '120px',
      render: (value) => (
        <Badge type={value === 'Manage' ? 'primary' : value === 'Read' ? 'info' : 'warning'}>
          {value}
        </Badge>
      )
    },
    { key: 'description', label: 'Descripción' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Permisos del Sistema ({permissions.length})
        </h3>
      </div>

      <Table
        columns={permissionsColumns}
        data={permissions}
        loading={loading}
        emptyMessage="No hay permisos disponibles"
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

