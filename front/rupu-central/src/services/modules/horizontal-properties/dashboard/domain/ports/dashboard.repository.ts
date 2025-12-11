/**
 * Puerto: Repositorio de Dashboard
 */

import { DashboardStats } from '../entities';

export interface GetDashboardParams {
  token: string;
  businessId?: number; // Opcional para super admin
  page?: number;
  page_size?: number;
}

export interface IDashboardRepository {
  getDashboard(params: GetDashboardParams): Promise<DashboardStats>;
}
