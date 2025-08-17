'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useServerAuth } from '@/shared/hooks/useServerAuth';

interface UseLoginReturn {
  loading: boolean;
  error: string;
  handleLogin: (email: string, password: string) => Promise<void>;
  clearError: () => void;
}

export const useLogin = (defaultRedirect?: string): UseLoginReturn => {
  const [error, setError] = useState('');
  const { login, loading } = useServerAuth();
  const router = useRouter();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      // Crear FormData para usar con Server Actions
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await login(formData);
      
      if (result && result.success) {
        // Si hay redirección específica, usarla
        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else if (defaultRedirect) {
          // Redirección por defecto
          router.push(defaultRedirect);
        }
      } else {
        // Manejar error del Server Action
        setError(result?.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  }, [login, router, defaultRedirect]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    loading,
    error,
    handleLogin,
    clearError
  };
}; 