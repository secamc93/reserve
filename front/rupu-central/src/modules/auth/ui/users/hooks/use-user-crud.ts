/**
 * Hook para operaciones CRUD de usuarios
 * Aplica estilos globales y usa actions de usuarios
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction, 
  getUserByIdAction,
  CreateUserInput,
  UpdateUserInput,
  DeleteUserInput,
  GetUserByIdInput
} from '../../../infrastructure/actions/users';

export interface UseUserCrudOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseUserCrudReturn {
  // Estado
  loading: boolean;
  error: string | null;
  
  // Acciones
  createUser: (input: CreateUserInput) => Promise<boolean>;
  updateUser: (input: UpdateUserInput) => Promise<boolean>;
  deleteUser: (input: DeleteUserInput) => Promise<boolean>;
  getUserById: (input: GetUserByIdInput) => Promise<any>;
  
  // Utilidades
  clearError: () => void;
}

export function useUserCrud(options: UseUserCrudOptions = {}) {
  const { onSuccess, onError } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear usuario
  const createUser = useCallback(async (input: CreateUserInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createUserAction(input);

      if (result.success) {
        onSuccess?.('Usuario creado exitosamente');
        return true;
      } else {
        const errorMsg = result.error || 'Error al crear usuario';
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  // Actualizar usuario
  const updateUser = useCallback(async (input: UpdateUserInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateUserAction(input);

      if (result.success) {
        onSuccess?.('Usuario actualizado exitosamente');
        return true;
      } else {
        const errorMsg = result.error || 'Error al actualizar usuario';
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  // Eliminar usuario
  const deleteUser = useCallback(async (input: DeleteUserInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteUserAction(input);

      if (result.success) {
        onSuccess?.('Usuario eliminado exitosamente');
        return true;
      } else {
        const errorMsg = result.error || 'Error al eliminar usuario';
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  // Obtener usuario por ID
  const getUserById = useCallback(async (input: GetUserByIdInput): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUserByIdAction(input);

      if (result.success && result.data) {
        return result.data;
      } else {
        const errorMsg = result.error || 'Error al obtener usuario';
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    
    // Acciones
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    
    // Utilidades
    clearError
  };
}
