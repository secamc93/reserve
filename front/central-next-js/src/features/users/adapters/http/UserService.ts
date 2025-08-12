import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';
import { User, CreateUserDTO, UpdateUserDTO, UserFilters, UserListDTO, Role } from '@/features/users/domain/User';

export class UserService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
    console.log('UserService initialized with base URL:', config.API_BASE_URL);
  }

  async getUsers(params: UserFilters = {}): Promise<UserListDTO> {
    try {
      const cleanParams = this.cleanGetUsersParams(params);
      console.log('UserService: Getting users with filters:', cleanParams);
      
      const response = await this.httpClient.get('/api/v1/users', cleanParams);
      console.log('UserService: Users response:', response);
      
      // Asegurar que la respuesta tenga la estructura correcta
      if (response && typeof response === 'object') {
        console.log('🔍 UserService: Processing response structure:', response);
        
        // El backend devuelve { success: true, data: [...], count: 4 }
        if (response.success && Array.isArray(response.data)) {
          console.log('🔍 UserService: Mapeando usuarios del backend:', response.data);
          
          // Mapear los usuarios del backend al formato del frontend
          const mappedUsers = response.data.map((user: any) => {
            const mappedUser = this.mapUserFromBackend(user);
            console.log('🔍 UserService: Usuario mapeado:', {
              original: { id: user.id, is_active: user.is_active, avatar_url: user.avatar_url },
              mapped: { id: mappedUser.id, isActive: mappedUser.isActive, avatarURL: mappedUser.avatarURL }
            });
            return mappedUser;
          });
          
          console.log('🔍 UserService: Usuarios mapeados finales:', mappedUsers);
          
          return {
            users: mappedUsers,
            total: response.count || response.total || response.data.length,
            page: response.page || 1,
            pageSize: response.pageSize || 10,
            totalPages: response.totalPages || 1
          };
        }
        
        // Fallback para otras estructuras
        const users = response.users || response.data?.users || response.data || [];
        const mappedUsers = Array.isArray(users) ? users.map((user: any) => this.mapUserFromBackend(user)) : [];
        
        return {
          users: mappedUsers,
          total: response.total || response.count || response.data?.total || 0,
          page: response.page || response.data?.page || 1,
          pageSize: response.pageSize || response.data?.pageSize || 10,
          totalPages: response.totalPages || response.data?.totalPages || 1
        };
      }
      
      throw new Error('Invalid response format from API');
    } catch (error) {
      console.error('UserService: Error getting users:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      console.log('UserService: Getting user ID:', id);
      const response = await this.httpClient.get(`/api/v1/users/${id}`);
      console.log('UserService: User response:', response);
      
      // Asegurar que la respuesta tenga la estructura correcta
      if (response && typeof response === 'object') {
        const userData = response.user || response.data?.user || response;
        return this.mapUserFromBackend(userData);
      }
      
      throw new Error('Invalid response format from API');
    } catch (error) {
      console.error('UserService: Error getting user:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserDTO): Promise<{ success: boolean; userId?: number; email?: string; password?: string; message?: string }> {
    try {
      console.log('UserService: Creating user:', userData);
      
      // Handle file upload if avatarFile is present
      let dataToSend: any = { ...userData };
      
      if (userData.avatarFile) {
        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        if (userData.phone) formData.append('phone', userData.phone);
        formData.append('is_active', userData.isActive.toString());
        formData.append('avatarFile', userData.avatarFile);
        
        // Add arrays as individual items
        userData.roleIds.forEach(id => formData.append('role_ids', id.toString()));
        userData.businessIds.forEach(id => formData.append('business_ids', id.toString()));
        
        dataToSend = formData;
      }
      
      const response = await this.httpClient.post('/api/v1/users', dataToSend);
      console.log('UserService: User created:', response);
      
      // Asegurar que la respuesta tenga la estructura correcta
      if (response && typeof response === 'object') {
        return {
          success: response.success || response.data?.success || true,
          userId: response.userId || response.data?.userId || response.user?.id,
          email: response.email || response.data?.email || response.user?.email,
          password: response.password || response.data?.password,
          message: response.message || response.data?.message || 'User created successfully'
        };
      }
      
      return { success: true, message: 'User created successfully' };
    } catch (error) {
      console.error('UserService: Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserDTO): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('UserService: Updating user ID:', id, 'Data:', userData);
      
      // Handle file upload if avatarFile is present
      let dataToSend: any = { ...userData };
      
      if (userData.avatarFile) {
        console.log('📁 UserService: Creando FormData con archivo:', userData.avatarFile);
        const formData = new FormData();
        if (userData.name) formData.append('name', userData.name);
        if (userData.email) formData.append('email', userData.email);
        if (userData.phone) formData.append('phone', userData.phone);
        if (userData.isActive !== undefined) formData.append('is_active', userData.isActive.toString());
        formData.append('avatarFile', userData.avatarFile);
        
        // Add arrays as individual items
        if (userData.roleIds) {
          userData.roleIds.forEach(id => formData.append('role_ids', id.toString()));
        }
        if (userData.businessIds) {
          userData.businessIds.forEach(id => formData.append('business_ids', id.toString()));
        }
        
        // Log FormData contents
        console.log('📁 UserService: FormData creado con los siguientes campos:');
        for (let [key, value] of formData.entries()) {
          console.log(`📁 UserService: ${key}:`, value);
        }
        
        dataToSend = formData;
      }
      
      const response = await this.httpClient.put(`/api/v1/users/${id}`, dataToSend);
      console.log('UserService: User updated:', response);
      
      // Asegurar que la respuesta tenga la estructura correcta
      if (response && typeof response === 'object') {
        return {
          success: response.success || response.data?.success || true,
          message: response.message || response.data?.message || 'User updated successfully'
        };
      }
      
      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      console.error('UserService: Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('UserService: Deleting user ID:', id);
      const response = await this.httpClient.delete(`/api/v1/users/${id}`);
      console.log('UserService: User deleted:', response);
      
      // Asegurar que la respuesta tenga la estructura correcta
      if (response && typeof response === 'object') {
        return {
          success: response.success || response.data?.success || true,
          message: response.message || response.data?.message || 'User deleted successfully'
        };
      }
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('UserService: Error deleting user:', error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      console.log('UserService: Getting roles');
      const response = await this.httpClient.get('/api/v1/roles');
      console.log('UserService: Roles response:', response);
      return response.data || [];
    } catch (error) {
      console.error('UserService: Error getting roles:', error);
      throw error;
    }
  }

  private cleanGetUsersParams(params: UserFilters): any {
    const cleaned: any = {};

    if (params.page && params.page > 0) {
      cleaned.page = params.page;
    }

    if (params.pageSize && params.pageSize > 0 && params.pageSize <= 100) {
      cleaned.page_size = params.pageSize;
    }

    if (params.name && params.name.trim() !== '') {
      cleaned.name = params.name.trim();
    }

    if (params.email && params.email.trim() !== '' && this.isValidEmail(params.email)) {
      cleaned.email = params.email.trim();
    }

    if (params.phone && params.phone.trim() !== '' && params.phone.trim().length === 10) {
      cleaned.phone = params.phone.trim();
    }

    if (params.isActive !== null && params.isActive !== undefined) {
      cleaned.is_active = params.isActive;
    }

    if (params.roleId && params.roleId > 0) {
      cleaned.role_id = params.roleId;
    }

    if (params.businessId && params.businessId > 0) {
      cleaned.business_id = params.businessId;
    }

    if (params.createdAt && params.createdAt.trim() !== '') {
      cleaned.created_at = params.createdAt.trim();
    }

    if (params.sortBy && params.sortBy.trim() !== '') {
      cleaned.sort_by = params.sortBy.trim();
    }

    if (params.sortOrder && params.sortOrder.trim() !== '') {
      cleaned.sort_order = params.sortOrder.trim();
    }

    console.log('🔧 Original parameters:', params);
    console.log('✅ Cleaned parameters:', cleaned);

    return cleaned;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mapear usuario del formato del backend al formato del frontend
  private mapUserFromBackend(backendUser: any): User {
    console.log('🔍 mapUserFromBackend - Usuario original:', {
      id: backendUser.id,
      name: backendUser.name,
      is_active: backendUser.is_active,
      avatar_url: backendUser.avatar_url,
      logo_url: backendUser.businesses?.[0]?.logo_url
    });

    const mappedUser = {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      phone: backendUser.phone || '',
      avatarURL: backendUser.avatar_url || '',
      isActive: backendUser.is_active,
      roles: backendUser.roles?.map((role: any) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        level: role.level,
        isSystem: role.is_system,
        scopeId: role.scope_id,
        scopeName: role.scope_name,
        scopeCode: role.scope_code
      })) || [],
      businesses: backendUser.businesses?.map((business: any) => ({
        id: business.id,
        name: business.name,
        code: business.code,
        businessTypeId: business.business_type_id,
        timezone: business.timezone,
        address: business.address,
        description: business.description,
        logoURL: business.logo_url,
        primaryColor: business.primary_color,
        secondaryColor: business.secondary_color,
        tertiaryColor: business.tertiary_color,
        quaternaryColor: business.quaternary_color,
        navbarImageURL: business.navbar_image_url,
        customDomain: business.custom_domain,
        isActive: business.is_active,
        enableDelivery: business.enable_delivery,
        enablePickup: business.enable_pickup,
        enableReservations: business.enable_reservations,
        businessTypeName: business.business_type_name,
        businessTypeCode: business.business_type_code
      })) || [],
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
      lastLoginAt: backendUser.last_login_at
    };

    console.log('🔍 mapUserFromBackend - Usuario mapeado:', {
      id: mappedUser.id,
      name: mappedUser.name,
      isActive: mappedUser.isActive,
      avatarURL: mappedUser.avatarURL,
      logoURL: mappedUser.businesses?.[0]?.logoURL
    });

    return mappedUser;
  }
} 