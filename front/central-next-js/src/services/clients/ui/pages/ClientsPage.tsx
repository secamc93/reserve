'use client';

import React, { useEffect } from 'react';
import Layout from '@/shared/ui/components/Layout';
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
import { useClients } from '../hooks/useClients';
import './ClientsPage.css';

export default function ClientsPage() {
  const { clients, loading, error, loadClients } = useClients();

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <Layout>
      <div className="clients-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Administrar Clientes</h1>
            <p>Listado de clientes registrados</p>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
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
