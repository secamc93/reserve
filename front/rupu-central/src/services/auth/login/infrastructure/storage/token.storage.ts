/**
 * Utilidad de almacenamiento de tokens y datos de sesión (client-side)
 * Nota: Usa localStorage, por lo que solo funciona en el navegador.
 */

export interface BusinessColors {
  primary: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
}

export interface BusinessData {
  id: number;
  name: string;
  code: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  business_type_id?: number;
  business_type_code?: string;
  business_type_name?: string;
  business_type_icon?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface PermissionRole {
  id: number;
  name: string;
  description: string;
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  active: boolean;
}

export interface UserPermissions {
  isSuperAdmin: boolean;
  roles: PermissionRole[];
  resources: ResourcePermission[];
}

export interface UserData {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  is_super_admin?: boolean;
  scope?: string;
}

class TokenStorageClass {
  private isBrowser() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getItem<T>(key: string): T | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: any) {
    if (!this.isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  getSessionToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('session_token');
  }

  setSessionToken(token: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem('session_token', token);
  }

  getBusinessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('business_token');
  }

  setBusinessToken(token: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem('business_token', token);
  }

  getUser(): UserData | null {
    return this.getItem<UserData>('user_data');
  }

  setUser(user: UserData) {
    this.setItem('user_data', user);
  }

  getActiveBusiness(): number | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem('active_business');
    if (raw === null) return null;
    return Number(raw);
  }

  hasActiveBusiness(): boolean {
    return this.getActiveBusiness() !== null;
  }

  setActiveBusiness(businessId: number) {
    if (!this.isBrowser()) return;
    localStorage.setItem('active_business', String(businessId));
  }

  getActiveBusinessType(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('active_business_type');
  }

  setActiveBusinessType(typeCode: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem('active_business_type', typeCode);
  }

  getActiveBusinessTypeName(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('active_business_type_name');
  }

  setActiveBusinessTypeName(name: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem('active_business_type_name', name);
  }

  getBusinessesData(): BusinessData[] | null {
    return this.getItem<BusinessData[]>('businesses_data');
  }

  setBusinessesData(businesses: BusinessData[]) {
    this.setItem('businesses_data', businesses);
  }

  getBusinessColors(): BusinessColors | null {
    return this.getItem<BusinessColors>('business_colors');
  }

  setBusinessColors(colors: BusinessColors) {
    this.setItem('business_colors', colors);
  }

  getUserPermissions(): UserPermissions | null {
    return this.getItem<UserPermissions>('user_permissions');
  }

  setUserPermissions(permissions: UserPermissions) {
    this.setItem('user_permissions', permissions);
  }

  removeUserPermissions() {
    if (!this.isBrowser()) return;
    localStorage.removeItem('user_permissions');
  }

  clearSession() {
    if (!this.isBrowser()) return;
    localStorage.removeItem('session_token');
    localStorage.removeItem('business_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('active_business');
    localStorage.removeItem('active_business_type');
    localStorage.removeItem('active_business_type_name');
    localStorage.removeItem('businesses_data');
    localStorage.removeItem('business_colors');
    localStorage.removeItem('user_permissions');
  }
}

export const TokenStorage = new TokenStorageClass();
