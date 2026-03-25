import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IGroupsRepository, GetGroupsParams, GetGroupByIdParams, CreateGroupParams,
  UpdateGroupParams, AddPlayerToGroupParams, RemovePlayerFromGroupParams,
  GetGroupPlayersParams, GroupsPaginated, TrainingGroup, GroupPlayer,
} from '../../domain';
import {
  BackendGetGroupsResponse, BackendGetGroupByIdResponse, BackendCreateGroupResponse,
  BackendUpdateGroupResponse, BackendGetGroupPlayersResponse, BackendSimpleResponse,
  BackendTrainingGroup, BackendGroupPlayer,
} from './response/groups.response';

export class GroupsRepository implements IGroupsRepository {
  private baseUrl = env.API_BASE_URL;

  private mapGroup(g: BackendTrainingGroup): TrainingGroup {
    return {
      id: g.id, businessId: g.business_id, coachId: g.coach_id, coachName: g.coach_name,
      name: g.name, code: g.code, category: g.category, description: g.description,
      maxCapacity: g.max_capacity, currentCapacity: g.current_capacity,
      ageMin: g.age_min, ageMax: g.age_max,
      skillLevelId: g.skill_level_id, skillLevelName: g.skill_level_name,
      recurringSchedule: g.recurring_schedule, photoUrl: g.photo_url,
      isActive: g.is_active, createdAt: g.created_at, updatedAt: g.updated_at || '',
    };
  }

  private mapGroupPlayer(p: BackendGroupPlayer): GroupPlayer {
    return {
      playerId: p.player_id, firstName: p.first_name, lastName: p.last_name,
      enrollmentDate: p.enrollment_date, isActive: p.is_active,
    };
  }

  private async request<T>(url: string, method: string, token: string, body?: unknown): Promise<T> {
    const startTime = Date.now();
    logHttpRequest({ method, url, body });

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: 'no-store',
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error en la solicitud');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
      return data as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async getGroups(params: GetGroupsParams): Promise<GroupsPaginated> {
    const { businessId, token, page = 1, pageSize = 10 } = params;
    const qp = new URLSearchParams({
      business_id: businessId.toString(), page: page.toString(), page_size: pageSize.toString(),
    });
    const data = await this.request<BackendGetGroupsResponse>(
      `${this.baseUrl}/sport-training/groups?${qp}`, 'GET', token
    );
    return {
      data: data.data.map(this.mapGroup.bind(this)),
      total: data.total, page: data.page, pageSize: data.page_size, totalPages: data.total_pages,
    };
  }

  async getGroupById(params: GetGroupByIdParams): Promise<TrainingGroup> {
    const data = await this.request<BackendGetGroupByIdResponse>(
      `${this.baseUrl}/sport-training/groups/${params.groupId}?business_id=${params.businessId}`, 'GET', params.token
    );
    return this.mapGroup(data.data);
  }

  async createGroup(params: CreateGroupParams): Promise<TrainingGroup> {
    const d = params.data;
    const body: Record<string, unknown> = {
      business_id: d.businessId, coach_id: d.coachId, name: d.name, max_capacity: d.maxCapacity,
    };
    if (d.code !== undefined) body.code = d.code;
    if (d.category !== undefined) body.category = d.category;
    if (d.description !== undefined) body.description = d.description;
    if (d.ageMin !== undefined) body.age_min = d.ageMin;
    if (d.ageMax !== undefined) body.age_max = d.ageMax;
    if (d.skillLevelId !== undefined) body.skill_level_id = d.skillLevelId;
    if (d.recurringSchedule !== undefined) body.recurring_schedule = d.recurringSchedule;

    const data = await this.request<BackendCreateGroupResponse>(
      `${this.baseUrl}/sport-training/groups`, 'POST', params.token, body
    );
    return this.mapGroup(data.data);
  }

  async updateGroup(params: UpdateGroupParams): Promise<TrainingGroup> {
    const d = params.data;
    const body: Record<string, unknown> = { business_id: params.businessId };
    if (d.coachId !== undefined) body.coach_id = d.coachId;
    if (d.name !== undefined) body.name = d.name;
    if (d.code !== undefined) body.code = d.code;
    if (d.category !== undefined) body.category = d.category;
    if (d.description !== undefined) body.description = d.description;
    if (d.maxCapacity !== undefined) body.max_capacity = d.maxCapacity;
    if (d.ageMin !== undefined) body.age_min = d.ageMin;
    if (d.ageMax !== undefined) body.age_max = d.ageMax;
    if (d.skillLevelId !== undefined) body.skill_level_id = d.skillLevelId;
    if (d.recurringSchedule !== undefined) body.recurring_schedule = d.recurringSchedule;
    if (d.isActive !== undefined) body.is_active = d.isActive;

    const data = await this.request<BackendUpdateGroupResponse>(
      `${this.baseUrl}/sport-training/groups/${params.groupId}`, 'PUT', params.token, body
    );
    return this.mapGroup(data.data);
  }

  async addPlayer(params: AddPlayerToGroupParams): Promise<void> {
    const body: Record<string, unknown> = { player_id: params.data.playerId };
    if (params.data.notes) body.notes = params.data.notes;
    await this.request<BackendSimpleResponse>(
      `${this.baseUrl}/sport-training/groups/${params.groupId}/players`, 'POST', params.token, body
    );
  }

  async removePlayer(params: RemovePlayerFromGroupParams): Promise<void> {
    await this.request<BackendSimpleResponse>(
      `${this.baseUrl}/sport-training/groups/${params.groupId}/players/${params.playerId}`, 'DELETE', params.token
    );
  }

  async getGroupPlayers(params: GetGroupPlayersParams): Promise<GroupPlayer[]> {
    const data = await this.request<BackendGetGroupPlayersResponse>(
      `${this.baseUrl}/sport-training/groups/${params.groupId}/players?business_id=${params.businessId}`, 'GET', params.token
    );
    return data.data.map(this.mapGroupPlayer.bind(this));
  }
}
