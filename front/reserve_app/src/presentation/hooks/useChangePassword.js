import { useState, useCallback } from 'react';
import { AuthService } from '../../infrastructure/api/AuthService.js';

export const useChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const authService = new AuthService();

    const changePassword = useCallback(async (passwordData) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await authService.changePassword(passwordData);
            
            if (result && result.success) {
                return result;
            } else {
                throw new Error(result?.message || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            console.error('useChangePassword: Error:', err);
            
            // Manejar errores específicos de la API
            let errorMessage = 'Error al cambiar la contraseña';
            
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        changePassword,
        loading,
        error,
        clearError: () => setError(null)
    };
}; 