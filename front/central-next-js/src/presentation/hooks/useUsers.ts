import { useState, useCallback, useMemo, useRef } from 'react';
import { UserRepositoryImpl } from '../../internal/infrastructure/secondary/UserRepositoryImpl';
import { GetUsersUseCase } from '../../internal/application/usecases/GetUsersUseCase';
import { CreateUserUseCase } from '../../internal/application/usecases/CreateUserUseCase';
import { User, CreateUserDTO, UserFilters, UserListDTO, Role, Business } from '../../internal/domain/entities/User';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Ref para evitar múltiples cargas simultáneas
  const loadingRef = useRef(false);

  // Memoize instances to avoid recreating on each render
  const userRepository = useMemo(() => new UserRepositoryImpl(), []);
  const getUsersUseCase = useMemo(() => new GetUsersUseCase(userRepository), [userRepository]);
  const createUserUseCase = useMemo(() => new CreateUserUseCase(userRepository), [userRepository]);

  // Extraer roles y businesses únicos de los usuarios cargados
  const roles = useMemo(() => {
    const uniqueRoles = new Map<number, Role>();
    users.forEach(user => {
      user.roles?.forEach(role => {
        if (!uniqueRoles.has(role.id)) {
          uniqueRoles.set(role.id, role);
        }
      });
    });
    return Array.from(uniqueRoles.values());
  }, [users]);

  const businesses = useMemo(() => {
    const uniqueBusinesses = new Map<number, Business>();
    users.forEach(user => {
      user.businesses?.forEach(business => {
        if (!uniqueBusinesses.has(business.id)) {
          uniqueBusinesses.set(business.id, business);
        }
      });
    });
    return Array.from(uniqueBusinesses.values());
  }, [users]);

  const loadUsers = useCallback(async (filters: UserFilters = {}) => {
    if (loadingRef.current) return;
    
    setLoading(true);
    setError(null);
    loadingRef.current = true;
    
    try {
      console.log('🔍 useUsers: Loading users with filters:', filters);
      const result = await getUsersUseCase.execute(filters);
      console.log('🔍 useUsers: Users loaded successfully:', result);
      
      // Los usuarios ya vienen mapeados correctamente del UserService
      // No necesitamos mapear de nuevo
      setUsers(result.users || []);
      
      setPagination({
        page: result.page || 1,
        pageSize: result.pageSize || 10,
        total: result.total || 0,
        totalPages: result.totalPages || 1
      });
      setError(null);
    } catch (err: any) {
      console.error('🔍 useUsers: Error loading users:', err);
      setError(err.message || 'Error loading users');
      setUsers([]);
      setPagination({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [getUsersUseCase]);

  const createUser = useCallback(async (userData: CreateUserDTO) => {
    if (loadingRef.current) return;
    
    setLoading(true);
    loadingRef.current = true;
    
    try {
      const result = await createUserUseCase.execute(userData);

      if (result.success && result.userId) {
        // Add user immediately with correct ID
        const newUser: User = {
          id: result.userId,
          name: userData.name,
          email: result.email || userData.email,
          phone: userData.phone || '',
          avatarURL: '',
          isActive: userData.isActive,
          roles: userData.roleIds?.map(id => ({ id, name: 'Loading...', code: '', level: 1, isSystem: false, scopeId: 1, description: '', scopeName: '', scopeCode: '' })) || [],
          businesses: userData.businessIds?.map(id => ({ 
            id, 
            name: 'Loading...', 
            code: '', 
            businessTypeId: 1, 
            timezone: 'UTC',
            address: '',
            description: '',
            logoURL: '',
            primaryColor: '',
            secondaryColor: '',
            customDomain: '',
            isActive: true,
            enableDelivery: false,
            enablePickup: false,
            enableReservations: true,
            businessTypeName: '',
            businessTypeCode: '',
          })) || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to list immediately
        setUsers(prevUsers => [newUser, ...prevUsers]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));

        console.log('🚀 User added with ID:', result.userId);
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [createUserUseCase]);

  const updateUser = useCallback(async (id: number, userData: any) => {
    if (loadingRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      loadingRef.current = true;

      const result = await userRepository.updateUser(id, userData);

      // Reload users after updating
      await loadUsers();

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userRepository, loadUsers]);

  const deleteUser = useCallback(async (id: number) => {
    if (loadingRef.current) return;
    
    console.log('🗑️ useUsers: Starting user deletion ID:', id);
    setLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      const result = await userRepository.deleteUser(id);
      console.log('✅ useUsers: User deleted:', result);

      // Reload user list with current filters
      const currentFilters: UserFilters = {
        page: 1,
        pageSize: 10
      };

      await loadUsers(currentFilters);

      return result;
    } catch (err: any) {
      console.error('❌ useUsers: Error deleting user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userRepository, loadUsers]);

  const getUserById = useCallback(async (id: number) => {
    if (loadingRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      loadingRef.current = true;

      const result = await userRepository.getUserById(id);

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userRepository]);

  return { 
    users, 
    roles, 
    businesses, 
    loading, 
    error, 
    pagination, 
    loadUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    getUserById 
  };
}; 