/**
 * Interfaces de request para get-users action
 */

export interface GetUsersInput {
  page?: number;
  page_size?: number;
  name?: string;
  email?: string;
  phone?: string;
  user_ids?: string;
  is_active?: boolean;
  role_id?: number;
  business_id?: number;
  created_at?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  token: string;
}
