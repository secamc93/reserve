'use client';

import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  onClearError?: () => void;
}

export default function LoginForm({ onSubmit, loading = false, error, onClearError }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error && onClearError) {
      onClearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData.email, formData.password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <div className="input-container">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Correo electrónico"
            required
            disabled={loading}
          />
          <span className="input-icon">📧</span>
        </div>
      </div>

      <div className="form-group">
        <div className="input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Contraseña"
            required
            disabled={loading}
          />
          <span className="input-icon">🔒</span>
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            disabled={loading}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="login-button"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
} 