import { useState, useCallback, useMemo, useRef } from 'react';
import { UserRepositoryHttp } from '@/features/users/adapters/http/UserRepositoryHttp';
import { GetUsersUseCase } from '@/services/users/application/GetUsersUseCase';
import { CreateUserUseCase } from '@/services/users/application/CreateUserUseCase';
import { User, CreateUserDTO, UserFilters, Role, Business } from '@/services/users/domain/entities/User';

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

  const [roles, setRoles] = useState<Role[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // Ref para evitar múltiples cargas simultáneas
  const loadingRef = useRef(false);

  // Memoize instances to avoid recreating on each render
  const userRepository = useMemo(() => new UserRepositoryHttp(), []);
  const getUsersUseCase = useMemo(() => new GetUsersUseCase(userRepository), [userRepository]);
  const createUserUseCase = useMemo(() => new CreateUserUseCase(userRepository), [userRepository]);


  const loadUsers = useCallback(async (filters: UserFilters = {}) => {
    if (loadingRef.current) return;
    
    setLoading(true);
    setError(null);
    loadingRef.current = true;
    
    try {
      const result = await getUsersUseCase.execute(filters);

      const loadedUsers = result.users || [];
      setUsers(loadedUsers);

      const uniqueRoles = new Map<number, Role>();
      const uniqueBusinesses = new Map<number, Business>();
      loadedUsers.forEach(user => {
        user.roles?.forEach(role => {
          if (!uniqueRoles.has(role.id)) {
            uniqueRoles.set(role.id, role);
          }
        });
        user.businesses?.forEach(business => {
          if (!uniqueBusinesses.has(business.id)) {
            uniqueBusinesses.set(business.id, business);
          }
        });
      });
      setRoles(Array.from(uniqueRoles.values()));
      setBusinesses(Array.from(uniqueBusinesses.values()));

      setPagination({
        page: result.page || 1,
        pageSize: result.pageSize || 10,
        total: result.total || 0,
        totalPages: result.totalPages || 1
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading users');
      setUsers([]);
      setRoles([]);
      setBusinesses([]);
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
    
    setLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      const result = await userRepository.deleteUser(id);

      // Reload user list with current filters
      const currentFilters: UserFilters = {
        page: 1,
        pageSize: 10
      };

      await loadUsers(currentFilters);

      return result;
    } catch (err: any) {
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