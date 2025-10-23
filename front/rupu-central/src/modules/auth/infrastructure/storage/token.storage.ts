/**
 * Servicio de almacenamiento de tokens
 * Maneja el guardado, lectura y eliminación del token en localStorage
 * IMPORTANTE: Solo usar en el cliente (Client Components)
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const BUSINESS_IDS_KEY = 'auth_business_ids';
const BUSINESSES_DATA_KEY = 'auth_businesses_data';
const ACTIVE_BUSINESS_KEY = 'auth_active_business';
const BUSINESS_COLORS_KEY = 'business_colors';

export interface BusinessColors {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
}

export interface BusinessData {
  id: number;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
}

export class TokenStorage {
  /**
   * Guarda el token en localStorage
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      console.log('🔐 TokenStorage.setToken - Guardando token:', token.substring(0, 50) + '...');
      localStorage.setItem(TOKEN_KEY, token);
      console.log('✅ TokenStorage.setToken - Token guardado exitosamente');
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  /**
   * Obtiene el token de localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log('🔍 TokenStorage.getToken - Token obtenido:', token ? token.substring(0, 50) + '...' : 'null');
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Elimina el token de localStorage
   */
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  /**
   * Verifica si existe un token
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Verifica si el token está expirado
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true; // Si no se puede decodificar, considerarlo expirado
    }
  }

  /**
   * Verifica si el token es válido (existe y no está expirado)
   */
  static isTokenValid(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  /**
   * Guarda datos del usuario en localStorage
   */
  static setUser(user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  }): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  }

  /**
   * Obtiene datos del usuario de localStorage
   */
  static getUser(): {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  } | null {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Elimina datos del usuario de localStorage
   */
  static removeUser(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  }

  /**
   * Guarda los IDs de los negocios del usuario
   */
  static setBusinessIds(businessIds: number[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BUSINESS_IDS_KEY, JSON.stringify(businessIds));
    } catch (error) {
      console.error('Error guardando IDs de negocios:', error);
    }
  }

  /**
   * Obtiene los IDs de los negocios del usuario
   */
  static getBusinessIds(): number[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const idsStr = localStorage.getItem(BUSINESS_IDS_KEY);
      return idsStr ? JSON.parse(idsStr) : null;
    } catch (error) {
      console.error('Error obteniendo IDs de negocios:', error);
      return null;
    }
  }

  /**
   * Elimina los IDs de negocios
   */
  static removeBusinessIds(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(BUSINESS_IDS_KEY);
    } catch (error) {
      console.error('Error eliminando IDs de negocios:', error);
    }
  }

  /**
   * Guarda los datos básicos de los negocios
   */
  static setBusinessesData(businesses: BusinessData[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BUSINESSES_DATA_KEY, JSON.stringify(businesses));
    } catch (error) {
      console.error('Error guardando datos de negocios:', error);
    }
  }

  /**
   * Obtiene los datos básicos de los negocios
   */
  static getBusinessesData(): BusinessData[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const dataStr = localStorage.getItem(BUSINESSES_DATA_KEY);
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (error) {
      console.error('Error obteniendo datos de negocios:', error);
      return null;
    }
  }

  /**
   * Elimina los datos de negocios
   */
  static removeBusinessesData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(BUSINESSES_DATA_KEY);
    } catch (error) {
      console.error('Error eliminando datos de negocios:', error);
    }
  }

  /**
   * Establece el negocio activo (sesión actual)
   */
  static setActiveBusiness(businessId: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_BUSINESS_KEY, String(businessId));
    } catch (error) {
      console.error('Error guardando negocio activo:', error);
    }
  }

  /**
   * Obtiene el ID del negocio activo
   */
  static getActiveBusiness(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const businessId = localStorage.getItem(ACTIVE_BUSINESS_KEY);
      return businessId ? parseInt(businessId, 10) : null;
    } catch (error) {
      console.error('Error obteniendo negocio activo:', error);
      return null;
    }
  }

  /**
   * Verifica si el negocio activo está en la lista de IDs
   */
  static isActiveBusinessValid(): boolean {
    const businessIds = this.getBusinessIds();
    const activeBusinessId = this.getActiveBusiness();
    
    if (!businessIds || !activeBusinessId) return false;
    
    return businessIds.includes(activeBusinessId);
  }

  /**
   * Elimina el negocio activo
   */
  static removeActiveBusiness(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACTIVE_BUSINESS_KEY);
    } catch (error) {
      console.error('Error eliminando negocio activo:', error);
    }
  }

  /**
   * Cambia el negocio activo (para uso futuro)
   * Verifica que el ID esté en la lista de negocios del usuario
   */
  static switchBusiness(businessId: number): boolean {
    const businessIds = this.getBusinessIds();
    
    if (!businessIds) {
      console.error('No hay negocios guardados');
      return false;
    }

    if (!businessIds.includes(businessId)) {
      console.error('Negocio no encontrado en la lista del usuario');
      return false;
    }

    this.setActiveBusiness(businessId);
    console.log('Negocio activo cambiado a ID:', businessId);
    return true;
  }

  /**
   * Guarda los colores del negocio activo
   */
  static setBusinessColors(colors: BusinessColors): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BUSINESS_COLORS_KEY, JSON.stringify(colors));
    } catch (error) {
      console.error('Error guardando colores del negocio:', error);
    }
  }

  /**
   * Obtiene los colores del negocio activo
   */
  static getBusinessColors(): BusinessColors | null {
    if (typeof window === 'undefined') return null;
    try {
      const colorsStr = localStorage.getItem(BUSINESS_COLORS_KEY);
      return colorsStr ? JSON.parse(colorsStr) : null;
    } catch (error) {
      console.error('Error obteniendo colores del negocio:', error);
      return null;
    }
  }

  /**
   * Elimina los colores del negocio
   */
  static removeBusinessColors(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(BUSINESS_COLORS_KEY);
    } catch (error) {
      console.error('Error eliminando colores del negocio:', error);
    }
  }

  /**
   * Limpia toda la sesión (token + usuario + business IDs + datos + negocio activo + colores)
   */
  static clearSession(): void {
    this.removeToken();
    this.removeUser();
    this.removeBusinessIds();
    this.removeBusinessesData();
    this.removeActiveBusiness();
    this.removeBusinessColors();
  }
}

