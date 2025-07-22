import { useState, useCallback, useMemo, useEffect } from 'react';
import { ApiUserRepository } from '../../infrastructure/adapters/ApiUserRepository.js';
import { GetUsersUseCase } from '../../application/use-cases/GetUsersUseCase.js';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

    // Memoizar instancias para evitar que se recreen en cada renderizado.
    // Esto es la clave para romper el bucle infinito.
    const repository = useMemo(() => new ApiUserRepository(), []);
    const getUsersUseCase = useMemo(() => new GetUsersUseCase(repository), [repository]);
    const createUserUseCase = useMemo(() => new CreateUserUseCase(repository), [repository]);

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
            const result = await repository.getRoles();
            if (result.success) {
                setRoles(result.data);
            }
        } catch (err) {
            console.error("Error cargando roles:", err);
            // No establecemos un error general para que la UI de usuarios pueda funcionar
            // incluso si los roles fallan.
        }
    }, [repository]);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        try {
            const result = await createUserUseCase.execute(userData);
            if (result.success) {
                await loadUsers(); // Recargar usuarios
            }
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [createUserUseCase, loadUsers]);

    const updateUser = async (id, userData) => {
        try {
            setLoading(true);
            setError(null);

            const result = await repository.updateUser(id, userData);

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
        setLoading(true);
        try {
            await repository.deleteUser(id);
            await loadUsers(); // Recargar usuarios
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [repository, loadUsers]);

    const getUserById = async (id) => {
        try {
            setLoading(true);
            setError(null);

            const result = await repository.getUserById(id);

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar roles solo una vez al inicializar el hook
    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    return { users, roles, loading, error, pagination, loadUsers, loadRoles, createUser, updateUser, deleteUser, getUserById };
}; 