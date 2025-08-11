'use client';

import React, { useEffect } from 'react';
import Layout from '@/shared/ui/components/Layout';
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
import { useBusinesses } from '../hooks/useBusinesses';
import './BusinessPage.css';

export default function BusinessPage() {
  const { businesses, loading, error, loadBusinesses } = useBusinesses();

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  return (
    <Layout>
      <div className="business-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Administrar Negocios</h1>
            <p>Listado de negocios disponibles</p>
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
            <table className="business-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td>
                      <div className="business-logo-cell">
                        {business.logoURL && business.logoURL.trim() !== '' ? (
                          <img
                            src={`https://media.xn--rup-joa.com/${business.logoURL}`}
                            alt={business.name}
                            className="business-logo-img"
                          />
                        ) : (
                          <span className="business-logo-placeholder">
                            {business.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{business.name}</td>
                    <td>{business.businessType?.name || '-'}</td>
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
