/**
 * Puerto del repositorio de Dashboard
 */

import { DashboardStats } from '../entities';

export interface GetDashboardStatsParams {
  token: string;
  business_type_id?: number;
  business_id?: number;
}

export interface IDashboardRepository {
  getDashboardStats(params: GetDashboardStatsParams): Promise<DashboardStats>;
}

