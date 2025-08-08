import { useState, useCallback, useMemo, useEffect } from 'react';
import { UserRepositoryImpl } from '../../internal/infrastructure/secondary/UserRepositoryImpl';
import { BusinessService } from '../../internal/infrastructure/secondary/BusinessService';
import { GetUsersUseCase } from '../../internal/application/usecases/GetUsersUseCase';
import { CreateUserUseCase } from '../../internal/application/usecases/CreateUserUseCase';
import { User, CreateUserDTO, UserFilters, UserListDTO, Role, Business } from '../../internal/domain/entities/User';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Memoize instances to avoid recreating on each render
  const userRepository = useMemo(() => new UserRepositoryImpl(), []);
  const businessService = useMemo(() => new BusinessService(), []);
  const getUsersUseCase = useMemo(() => new GetUsersUseCase(userRepository), [userRepository]);
  const createUserUseCase = useMemo(() => new CreateUserUseCase(userRepository), [userRepository]);

  const loadUsers = useCallback(async (filters: UserFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 useUsers: Loading users with filters:', filters);
      const result = await getUsersUseCase.execute(filters);
      console.log('🔍 useUsers: Users loaded successfully:', result);
      
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
    }
  }, [getUsersUseCase]);

  const loadRoles = useCallback(async () => {
    try {
      const result = await userRepository.getRoles();
      setRoles(result || []);
    } catch (err: any) {
      console.error("Error loading roles:", err);
      setRoles([]);
    }
  }, [userRepository]);

  const loadBusinesses = useCallback(async () => {
    try {
      const result = await businessService.getBusinesses();
      setBusinesses(result || []);
    } catch (err: any) {
      console.error("Error loading businesses:", err);
      setBusinesses([]);
    }
  }, [businessService]);

  const createUser = useCallback(async (userData: CreateUserDTO) => {
    setLoading(true);
    try {
      const result = await createUserUseCase.execute(userData);

      if (result.success && result.userId) {
        // Add user immediately with correct ID
        const newUser: User = {
          id: result.userId,
          name: userData.name,
          email: result.email || userData.email,
          phone: userData.phone || '',
          isActive: userData.isActive,
          roles: userData.roleIds?.map(id => ({ id, name: 'Loading...', code: '', level: 1, isSystem: false, scopeId: 1 })) || [],
          businesses: userData.businessIds?.map(id => ({ 
            id, 
            name: 'Loading...', 
            code: '', 
            businessTypeId: 1, 
            timezone: 'UTC',
            isActive: true,
            enableDelivery: false,
            enablePickup: false,
            enableReservations: true
          })) || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
    }
  }, [createUserUseCase]);

  const updateUser = useCallback(async (id: number, userData: any) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userRepository.updateUser(id, userData);

      // Reload users after updating
      await loadUsers();

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userRepository, loadUsers]);

  const deleteUser = useCallback(async (id: number) => {
    console.log('🗑️ useUsers: Starting user deletion ID:', id);
    setLoading(true);
    setError(null);

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
    }
  }, [userRepository, loadUsers]);

  const getUserById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userRepository.getUserById(id);

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userRepository]);

  // Load roles and businesses only once when hook initializes
  useEffect(() => {
    loadRoles();
    loadBusinesses();
  }, [loadRoles, loadBusinesses]);

  return { 
    users, 
    roles, 
    businesses, 
    loading, 
    error, 
    pagination, 
    loadUsers, 
    loadRoles, 
    loadBusinesses, 
    createUser, 
    updateUser, 
    deleteUser, 
    getUserById 
  };
}; 