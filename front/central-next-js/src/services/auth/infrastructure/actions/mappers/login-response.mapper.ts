/**
 * Mapper para la respuesta del login
 * Convierte del backend (snake_case) al dominio (camelCase)
 * 
 * RESUELVE EL PROBLEMA REAL:
 * - avatar_url → avatarURL
 * - is_active → isActive
 * - logo_url → logoURL
 */

import type { LoginData } from '../response/login';
import type { LoginData as DomainLoginData } from '@/services/auth/domain/entities/loging_response';

/**
 * Convierte la respuesta del login del backend al dominio
 */
export function mapLoginResponseToDomain(
  backendResponse: LoginData
): DomainLoginData {
  return {
    user: {
      id: backendResponse.user.id,
      name: backendResponse.user.name,
      email: backendResponse.user.email,
      phone: backendResponse.user.phone,
      avatarURL: backendResponse.user.avatar_url,        // ← snake_case → camelCase
      isActive: backendResponse.user.is_active,          // ← snake_case → camelCase
      lastLoginAt: backendResponse.user.last_login_at    // ← snake_case → camelCase
    },
    token: backendResponse.token,
    requirePasswordChange: backendResponse.require_password_change,  // ← snake_case → camelCase
    businesses: backendResponse.businesses.map(business => ({
      id: business.id,
      name: business.name,
      code: business.code,
      businessTypeId: business.business_type_id,        // ← snake_case → camelCase
      businessType: {
        id: business.business_type.id,
        name: business.business_type.name,
        code: business.business_type.code,
        description: business.business_type.description,
        icon: business.business_type.icon
      },
      timezone: business.timezone,
      address: business.address,
      description: business.description,
      logoURL: business.logo_url,                      // ← snake_case → camelCase
      primaryColor: business.primary_color,            // ← snake_case → camelCase
      secondaryColor: business.secondary_color,        // ← snake_case → camelCase
      tertiaryColor: business.tertiary_color,          // ← snake_case → camelCase
      quaternaryColor: business.quaternary_color,      // ← snake_case → camelCase
      navbarImageURL: business.navbar_image_url,       // ← snake_case → camelCase
      customDomain: business.custom_domain,            // ← snake_case → camelCase
      isActive: business.is_active,                    // ← snake_case → camelCase
      enableDelivery: business.enable_delivery,        // ← snake_case → camelCase
      enablePickup: business.enable_pickup,            // ← snake_case → camelCase
      enableReservations: business.enable_reservations // ← snake_case → camelCase
    }))
  };
} 