/**
 * Interfaces de response para get-users action
 */

export interface GetUsersResult {
  success: boolean;
  data?: {
    users: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      avatar_url?: string;
      is_active: boolean;
      last_login_at?: string;
      roles: Array<{
        id: number;
        name: string;
        description: string;
        level: number;
        is_system: boolean;
        scope_id: number;
      }>;
      businesses: Array<{
        id: number;
        name: string;
        logo_url: string;
        business_type_id: number;
        business_type_name: string;
      }>;
      created_at: string;
      updated_at: string;
    }>;
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  error?: string;
}
