'use client';

import React from 'react';
import LoginCard from '../components/LoginCard';
import LoginForm from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import './Login.css';

const LoginPage = () => {
  const { loading, error, handleLogin, clearError } = useLogin('/calendar');

  return (
    <div className="login-container">
      <LoginCard>
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          onClearError={clearError}
        />
      </LoginCard>
    </div>
  );
};

export default LoginPage; 