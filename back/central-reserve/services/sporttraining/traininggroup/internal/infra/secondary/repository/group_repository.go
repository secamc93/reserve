package repository

import (
	"context"
	"fmt"
	"math"
	"time"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type GroupRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.GroupRepository {
	return &GroupRepository{
		db:     db,
		logger: logger,
	}
}

func (r *GroupRepository) Create(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
	model := &models.TrainingGroup{
		BusinessID:        group.BusinessID,
		CoachID:           group.CoachID,
		Name:              group.Name,
		Code:              group.Code,
		Category:          group.Category,
		Description:       group.Description,
		MaxCapacity:       group.MaxCapacity,
		CurrentCapacity:   0,
		AgeMin:            group.AgeMin,
		AgeMax:            group.AgeMax,
		SkillLevelID:      group.SkillLevelID,
		RecurringSchedule: group.RecurringSchedule,
		PhotoURL:          group.PhotoURL,
		IsActive:          true,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando grupo de entrenamiento: %w", err)
	}

	// Reload with relations
	if err := r.db.Conn(ctx).Preload("Coach").Preload("SkillLevel").First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones: %w", err)
	}

	return mappers.GroupToDomain(model), nil
}

func (r *GroupRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error) {
	var model models.TrainingGroup
	query := r.db.Conn(ctx).Preload("Coach").Preload("SkillLevel")

	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}

	if err := query.First(&model, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrGroupNotFound
		}
		return nil, fmt.Errorf("error obteniendo grupo de entrenamiento: %w", err)
	}

	return mappers.GroupToDomain(&model), nil
}

func (r *GroupRepository) Update(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
	// Verify existence
	var existing models.TrainingGroup
	query := r.db.Conn(ctx).Where("business_id = ?", group.BusinessID)
	if err := query.First(&existing, group.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrGroupNotFound
		}
		return nil, fmt.Errorf("error buscando grupo de entrenamiento: %w", err)
	}

	updates := map[string]interface{}{
		"coach_id":           group.CoachID,
		"name":               group.Name,
		"code":               group.Code,
		"category":           group.Category,
		"description":        group.Description,
		"max_capacity":       group.MaxCapacity,
		"age_min":            group.AgeMin,
		"age_max":            group.AgeMax,
		"skill_level_id":     group.SkillLevelID,
		"recurring_schedule": group.RecurringSchedule,
		"photo_url":          group.PhotoURL,
		"is_active":          group.IsActive,
	}

	if err := r.db.Conn(ctx).Model(&models.TrainingGroup{}).Where("id = ?", group.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando grupo de entrenamiento: %w", err)
	}

	return r.GetByID(ctx, group.ID, group.BusinessID)
}

func (r *GroupRepository) List(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.TrainingGroup{})

	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}
	if filters.CoachID != nil {
		countQuery = countQuery.Where("coach_id = ?", *filters.CoachID)
	}
	if filters.Category != "" {
		countQuery = countQuery.Where("category = ?", filters.Category)
	}
	if filters.SkillLevelID != nil {
		countQuery = countQuery.Where("skill_level_id = ?", *filters.SkillLevelID)
	}
	if filters.Name != "" {
		countQuery = countQuery.Where("name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		countQuery = countQuery.Where("is_active = ?", *filters.IsActive)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando grupos de entrenamiento: %w", err)
	}

	var groups []models.TrainingGroup
	query := r.db.Conn(ctx).Preload("Coach").Preload("SkillLevel")

	if filters.BusinessID != 0 {
		query = query.Where("business_id = ?", filters.BusinessID)
	}
	if filters.CoachID != nil {
		query = query.Where("coach_id = ?", *filters.CoachID)
	}
	if filters.Category != "" {
		query = query.Where("category = ?", filters.Category)
	}
	if filters.SkillLevelID != nil {
		query = query.Where("skill_level_id = ?", *filters.SkillLevelID)
	}
	if filters.Name != "" {
		query = query.Where("name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(filters.PageSize).Find(&groups).Error; err != nil {
		return nil, fmt.Errorf("error listando grupos de entrenamiento: %w", err)
	}

	result := make([]domain.GroupListDTO, len(groups))
	for i, g := range groups {
		var coachName, skillLevelName string
		if g.Coach.ID != 0 {
			coachName = g.Coach.FirstName + " " + g.Coach.LastName
		}
		if g.SkillLevel != nil {
			skillLevelName = g.SkillLevel.Name
		}
		result[i] = domain.GroupListDTO{
			ID:              g.ID,
			Name:            g.Name,
			Code:            g.Code,
			Category:        g.Category,
			CoachName:       coachName,
			MaxCapacity:     g.MaxCapacity,
			CurrentCapacity: g.CurrentCapacity,
			SkillLevelName:  skillLevelName,
			IsActive:        g.IsActive,
			CreatedAt:       g.CreatedAt,
		}
	}

	return &domain.PaginatedGroupsDTO{
		Groups:     result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

func (r *GroupRepository) AddPlayer(ctx context.Context, dto domain.AddPlayerDTO) error {
	// Verify group exists and check capacity
	var group models.TrainingGroup
	if err := r.db.Conn(ctx).First(&group, dto.GroupID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return domain.ErrGroupNotFound
		}
		return fmt.Errorf("error buscando grupo: %w", err)
	}

	// Check if group is full
	if group.CurrentCapacity >= group.MaxCapacity {
		return domain.ErrGroupFull
	}

	// Check if player is already in group
	var existingEnrollment models.GroupPlayer
	err := r.db.Conn(ctx).
		Where("training_group_id = ? AND st_player_id = ? AND is_active = ?", dto.GroupID, dto.PlayerID, true).
		First(&existingEnrollment).Error

	if err == nil {
		return domain.ErrPlayerAlreadyInGroup
	}
	if err != gorm.ErrRecordNotFound {
		return fmt.Errorf("error verificando inscripción: %w", err)
	}

	// Create enrollment
	enrollment := &models.GroupPlayer{
		TrainingGroupID: dto.GroupID,
		STPlayerID:      dto.PlayerID,
		EnrollmentDate:  time.Now(),
		IsActive:        true,
		Notes:           dto.Notes,
	}

	if err := r.db.Conn(ctx).Create(enrollment).Error; err != nil {
		return fmt.Errorf("error creando inscripción: %w", err)
	}

	// Increment current capacity
	if err := r.db.Conn(ctx).Model(&models.TrainingGroup{}).
		Where("id = ?", dto.GroupID).
		UpdateColumn("current_capacity", gorm.Expr("current_capacity + ?", 1)).Error; err != nil {
		return fmt.Errorf("error actualizando capacidad: %w", err)
	}

	return nil
}

func (r *GroupRepository) RemovePlayer(ctx context.Context, groupID uint, playerID uint, businessID uint) error {
	// Verify group exists and belongs to business
	var group models.TrainingGroup
	query := r.db.Conn(ctx).Where("business_id = ?", businessID)
	if err := query.First(&group, groupID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return domain.ErrGroupNotFound
		}
		return fmt.Errorf("error buscando grupo: %w", err)
	}

	// Find active enrollment
	var enrollment models.GroupPlayer
	err := r.db.Conn(ctx).
		Where("training_group_id = ? AND st_player_id = ? AND is_active = ?", groupID, playerID, true).
		First(&enrollment).Error

	if err == gorm.ErrRecordNotFound {
		return domain.ErrPlayerNotInGroup
	}
	if err != nil {
		return fmt.Errorf("error buscando inscripción: %w", err)
	}

	// Soft delete enrollment and set exit date
	now := time.Now()
	updates := map[string]interface{}{
		"is_active": false,
		"exit_date": &now,
	}

	if err := r.db.Conn(ctx).Model(&models.GroupPlayer{}).Where("id = ?", enrollment.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error eliminando inscripción: %w", err)
	}

	// Decrement current capacity
	if err := r.db.Conn(ctx).Model(&models.TrainingGroup{}).
		Where("id = ?", groupID).
		UpdateColumn("current_capacity", gorm.Expr("current_capacity - ?", 1)).Error; err != nil {
		return fmt.Errorf("error actualizando capacidad: %w", err)
	}

	return nil
}

func (r *GroupRepository) GetGroupPlayers(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error) {
	// Verify group exists and belongs to business
	var group models.TrainingGroup
	query := r.db.Conn(ctx).Where("business_id = ?", businessID)
	if err := query.First(&group, groupID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrGroupNotFound
		}
		return nil, fmt.Errorf("error buscando grupo: %w", err)
	}

	// Get active enrollments with player info
	var enrollments []models.GroupPlayer
	err := r.db.Conn(ctx).
		Preload("Player").
		Where("training_group_id = ? AND is_active = ?", groupID, true).
		Find(&enrollments).Error

	if err != nil {
		return nil, fmt.Errorf("error obteniendo jugadores del grupo: %w", err)
	}

	result := make([]domain.GroupPlayerDTO, len(enrollments))
	for i, e := range enrollments {
		result[i] = domain.GroupPlayerDTO{
			PlayerID:       e.Player.ID,
			FirstName:      e.Player.FirstName,
			LastName:       e.Player.LastName,
			EnrollmentDate: e.EnrollmentDate,
			IsActive:       e.IsActive,
		}
	}

	return result, nil
}
