'use client';

import { useEffect } from 'react';
import Layout from '@/shared/ui/components/Layout';
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
import { useTables } from '../hooks/useTables';

export default function TablesPage() {
  const { tables, loading, error, loadTables } = useTables();

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Administrar Mesas</h1>

        {loading && (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map(table => (
                  <tr key={table.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{table.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{table.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
