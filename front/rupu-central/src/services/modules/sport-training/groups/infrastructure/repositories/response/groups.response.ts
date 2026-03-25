export interface BackendTrainingGroup {
  id: number;
  business_id: number;
  coach_id: number;
  coach_name: string;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  max_capacity: number;
  current_capacity: number;
  age_min?: number;
  age_max?: number;
  skill_level_id?: number;
  skill_level_name?: string;
  recurring_schedule?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendGroupPlayer {
  player_id: number;
  first_name: string;
  last_name: string;
  enrollment_date: string;
  is_active: boolean;
}

export interface BackendGetGroupsResponse {
  success: boolean;
  message: string;
  data: BackendTrainingGroup[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendGetGroupByIdResponse {
  success: boolean;
  message: string;
  data: BackendTrainingGroup;
}

export interface BackendCreateGroupResponse {
  success: boolean;
  message: string;
  data: BackendTrainingGroup;
}

export interface BackendUpdateGroupResponse {
  success: boolean;
  message: string;
  data: BackendTrainingGroup;
}

export interface BackendGetGroupPlayersResponse {
  success: boolean;
  message: string;
  data: BackendGroupPlayer[];
}

export interface BackendSimpleResponse {
  success: boolean;
  message: string;
}
