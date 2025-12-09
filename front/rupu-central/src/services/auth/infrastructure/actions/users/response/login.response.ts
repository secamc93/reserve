/**
 * Interfaces de response para login action
 */

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

export interface LoginActionResult {
  success: boolean;
  data?: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    token: string;
    businesses: BusinessData[];
    scope: string;
    is_super_admin: boolean;
  };
  error?: string;
}
