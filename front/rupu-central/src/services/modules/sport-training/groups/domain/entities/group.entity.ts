/**
 * Entidad: TrainingGroup (Grupo de Entrenamiento)
 */
export interface TrainingGroup {
  id: number;
  businessId: number;
  coachId: number;
  coachName: string;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  maxCapacity: number;
  currentCapacity: number;
  ageMin?: number;
  ageMax?: number;
  skillLevelId?: number;
  skillLevelName?: string;
  recurringSchedule?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupPlayer {
  playerId: number;
  firstName: string;
  lastName: string;
  enrollmentDate: string;
  isActive: boolean;
}

export interface CreateGroupDTO {
  businessId: number;
  coachId: number;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  maxCapacity: number;
  ageMin?: number;
  ageMax?: number;
  skillLevelId?: number;
  recurringSchedule?: string;
}

export interface UpdateGroupDTO {
  coachId?: number;
  name?: string;
  code?: string;
  category?: string;
  description?: string;
  maxCapacity?: number;
  ageMin?: number;
  ageMax?: number;
  skillLevelId?: number;
  recurringSchedule?: string;
  isActive?: boolean;
}

export interface AddPlayerToGroupDTO {
  playerId: number;
  notes?: string;
}
