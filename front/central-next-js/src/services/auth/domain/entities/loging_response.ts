/**
 * Entidades del dominio para la respuesta del login
 * Estas son las interfaces que se usan en el dominio (camelCase)
 */

export interface LoginUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarURL: string;        // ← camelCase del dominio
  isActive: boolean;        // ← camelCase del dominio
  lastLoginAt: string;
}

export interface LoginBusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
}

export interface LoginBusiness {
  id: number;
  name: string;
  code: string;
  businessTypeId: number;
  businessType: LoginBusinessType;
  timezone: string;
  address: string;
  description: string;
  logoURL: string;          // ← camelCase del dominio
  primaryColor: string;     // ← camelCase del dominio
  secondaryColor: string;
  tertiaryColor: string;
  quaternaryColor: string;
  navbarImageURL: string;
  customDomain: string;
  isActive: boolean;        // ← camelCase del dominio
  enableDelivery: boolean;
  enablePickup: boolean;
  enableReservations: boolean;
}

export interface LoginData {
  user: LoginUser;
  token: string;
  requirePasswordChange: boolean;
  businesses: LoginBusiness[];
}

export interface LoginResponse {
  success: boolean;
  data?: LoginData;
  message?: string;
}
  