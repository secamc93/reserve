'use client';

import { useState, useEffect } from 'react';
import { TokenStorage } from '@shared/config';

export function useAuthSimple() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Obtener datos de autenticación del localStorage
    const storedToken = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
    const storedUser = TokenStorage.getUser();


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
