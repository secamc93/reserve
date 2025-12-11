/**
 * Entidad: Estadísticas del Dashboard
 */

export interface DashboardSummary {
  business_id: number;
  business_name?: string;
  total_horizontal_properties: number;
  total_units: number;
  total_residents: number;
  total_voting_groups: number;
  active_votings: number;
  completed_votings: number;
  total_attendance_lists: number;
  active_attendance_lists: number;
  total_votes: number;
  total_proxies: number;
}

export interface VotingStatistics {
  total_votings: number;
  active_votings: number;
  completed_votings: number;
  pending_votings: number;
  total_votes: number;
  total_voting_groups: number;
  active_voting_groups: number;
}

export interface AttendanceStatistics {
  total_lists: number;
  active_lists: number;
  total_records: number;
  attended_records: number;
  pending_records: number;
  total_proxies: number;
}

export interface BusinessSummary {
  business_id: number;
  business_name: string;
  business_type_id?: number;
  logo_url?: string;
  total_horizontal_properties: number;
  total_units: number;
  total_residents: number;
  active_votings: number;
  active_attendance_lists: number;
  last_activity?: string;
}

export interface BusinessSummariesPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  voting_stats: VotingStatistics;
  attendance_stats: AttendanceStatistics;
  business_summaries?: BusinessSummary[];
  pagination?: BusinessSummariesPagination;
}
