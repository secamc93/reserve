'use client';

import { useState, useEffect } from 'react';
import { TokenStorage } from '@shared/config';

export function useAuthSimple() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Obtener datos de autenticación del localStorage
    const storedToken = TokenStorage.getToken();
    const storedUser = TokenStorage.getUser();

    console.log('🔍 useAuthSimple - Token almacenado:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');
    console.log('🔍 useAuthSimple - Usuario almacenado:', storedUser);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const logout = () => {
    TokenStorage.clearSession();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    logout
  };
}
