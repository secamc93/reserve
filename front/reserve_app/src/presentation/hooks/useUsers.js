import { useState, useCallback, useMemo, useEffect } from 'react';
import { ApiUserRepository } from '../../infrastructure/adapters/ApiUserRepository.js';
import { ApiBusinessRepository } from '../../infrastructure/adapters/ApiBusinessRepository.js';
import { GetUsersUseCase } from '../../application/use-cases/GetUsersUseCase.js';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [businesses, setBusinesses] = useState([]); // ✅ Inicializar como array vacío
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

    // Memoizar instancias para evitar que se recreen en cada renderizado.
    const userRepository = useMemo(() => new ApiUserRepository(), []);
    const businessRepository = useMemo(() => new ApiBusinessRepository(), []);
    const getUsersUseCase = useMemo(() => new GetUsersUseCase(userRepository), [userRepository]);
    const createUserUseCase = useMemo(() => new CreateUserUseCase(userRepository), [userRepository]);

    const loadUsers = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await getUsersUseCase.execute(filters);
            if (result.success) {
                setUsers(result.data);
                setPagination({
                    page: result.page,
                    pageSize: result.pageSize,
                    total: result.total
                });
                setError(null);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getUsersUseCase]);

    const loadRoles = useCallback(async () => {
        try {
            const result = await userRepository.getRoles();
            if (result.success) {
                setRoles(result.data || []); // ✅ Asegurar que siempre sea array
            } else {
                setRoles([]); // ✅ Fallback a array vacío
            }
        } catch (err) {
            console.error("Error cargando roles:", err);
            setRoles([]); // ✅ Fallback a array vacío en caso de error
        }
    }, [userRepository]);

    const loadBusinesses = useCallback(async () => {
        try {
            const result = await businessRepository.getBusinesses();
            console.log('🔥 Result from businessRepository.getBusinesses():', result);

            // ✅ Asegurar que el resultado sea siempre un array
            if (Array.isArray(result)) {
                setBusinesses(result);
            } else {
                console.warn('businesses result is not an array:', result);
                setBusinesses([]);
            }
        } catch (err) {
            console.error("Error cargando businesses:", err);
            setBusinesses([]); // ✅ Fallback a array vacío en caso de error
        }
    }, [businessRepository]);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const result = await createUserUseCase.execute(userData);

            if (result.success && result.user_id) {
                // ✅ Agregar usuario inmediatamente con ID correcto
                const newUser = {
                    id: result.user_id,           // ✅ ID del backend
                    name: userData.name,
                    email: result.email,
                    phone: userData.phone || '',
                    isActive: userData.is_active,
                    roles: userData.role_ids?.map(id => ({ id, name: 'Loading...' })) || [],
                    businesses: userData.business_ids?.map(id => ({ id, name: 'Loading...' })) || [],
                    lastLoginAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Agregar a la lista inmediatamente
                setUsers(prevUsers => [newUser, ...prevUsers]);
                setPagination(prev => ({ ...prev, total: prev.total + 1 }));

                console.log('🚀 Usuario agregado con ID:', result.user_id);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createUserUseCase]);

    const updateUser = async (id, userData) => {
        try {
            setLoading(true);
            setError(null);

            const result = await userRepository.updateUser(id, userData);

            // Recargar usuarios después de actualizar
            await loadUsers();

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = useCallback(async (id) => {
        console.log('🗑️ useUsers: Iniciando eliminación usuario ID:', id);
        setLoading(true);
        setError(null);

        try {
            // Llamar al repositorio
            const result = await userRepository.deleteUser(id);
            console.log('✅ useUsers: Usuario eliminado:', result);

            // Recargar la lista de usuarios con los filtros actuales
            const currentFilters = {
                page: 1, // Resetear a página 1 por si eliminamos el último usuario de una página
                page_size: 10
            };

            await loadUsers(currentFilters);

            return result;
        } catch (err) {
            console.error('❌ useUsers: Error eliminando usuario:', err);
            setError(err.message);
            throw err; // Re-lanzar para que AdminUsersPage pueda manejarlo
        } finally {
            setLoading(false);
        }
    }, [userRepository, loadUsers]);

    const getUserById = async (id) => {
        try {
            setLoading(true);
            setError(null);

            const result = await userRepository.getUserById(id);

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar roles y businesses solo una vez al inicializar el hook
    useEffect(() => {
        loadRoles();
        loadBusinesses();
    }, [loadRoles, loadBusinesses]);

    return { users, roles, businesses, loading, error, pagination, loadUsers, loadRoles, loadBusinesses, createUser, updateUser, deleteUser, getUserById };
}; 