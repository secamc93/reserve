import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './presentation/components/Layout.js';
import GestionReservas from './presentation/pages/GestionReservas.js';
import CalendarioPage from './presentation/pages/CalendarioPage.js';
import AuthTestPage from './presentation/pages/AuthTestPage.js';
import { AdminUsersPage } from './presentation/pages/AdminUsersPage.js';
import AdminBusinessesPage from './presentation/pages/AdminBusinessesPage.js';
import AdminTablesPage from './presentation/pages/AdminTablesPage.js';
import Login from './presentation/components/Login.js';
import UnauthorizedPage from './presentation/pages/UnauthorizedPage.js';
import ChangePasswordPage from './presentation/pages/ChangePasswordPage.js';
import ProtectedRoute from './presentation/components/ProtectedRoute.js';
import { useAuth } from './presentation/hooks/useAuth.js';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de login - accesible sin autenticación */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/calendario" replace /> : <Login />
            } 
          />

          {/* Ruta de no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Ruta de cambio de contraseña - requiere token pero no autenticación completa */}
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/calendario"
            element={
              <ProtectedRoute>
                <Layout>
                  <CalendarioPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <Layout>
                  <GestionReservas />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth-test"
            element={
              <ProtectedRoute>
                <Layout>
                  <AuthTestPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-users"
            element={
              <ProtectedRoute requiredPermissions={['users:manage']}>
                <Layout>
                  <AdminUsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-businesses"
            element={
              <ProtectedRoute requiredPermissions={['businesses:manage']}>
                <Layout>
                  <AdminBusinessesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-tables"
            element={
              <ProtectedRoute requiredPermissions={['tables:manage']}>
                <Layout>
                  <AdminTablesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Ruta raíz - redirigir al calendario */}
          <Route 
            path="/" 
            element={<Navigate to="/calendario" replace />} 
          />

          {/* Ruta para cualquier otra URL - redirigir al calendario */}
          <Route 
            path="*" 
            element={<Navigate to="/calendario" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
