import React, { useState } from 'react';
import Layout from './presentation/components/Layout.js';
import GestionReservas from './presentation/pages/GestionReservas.js';
import CalendarioPage from './presentation/pages/CalendarioPage.js';
import AuthTestPage from './presentation/pages/AuthTestPage.js';
import { AdminUsersPage } from './presentation/pages/AdminUsersPage.js';
import Login from './presentation/components/Login.js';
import { useAuth } from './presentation/hooks/useAuth.js';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('calendario');
  const { isAuthenticated, userInfo, loading, logout } = useAuth();

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleLoginSuccess = (loginResult) => {
    console.log('🔐 App: Login exitoso, actualizando estado');
    // El hook useAuth ya maneja el estado de autenticación
  };

  const handleLogout = () => {
    console.log('🔐 App: Cerrando sesión');
    logout();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'calendario':
        return <CalendarioPage />;
      case 'reservas':
        return <GestionReservas />;
      case 'auth-test':
        return <AuthTestPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      default:
        return <CalendarioPage />;
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Mostrar aplicación principal si está autenticado
  return (
    <div className="App">
      <Layout
        activeView={activeView}
        onViewChange={handleViewChange}
        userInfo={userInfo}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;
