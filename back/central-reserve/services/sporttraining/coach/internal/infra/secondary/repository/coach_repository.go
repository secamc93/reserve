package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type CoachRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.CoachRepository {
	return &CoachRepository{
		db:     db,
		logger: logger,
	}
}

func (r *CoachRepository) Create(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
	model := &models.Coach{
		BusinessID:         coach.BusinessID,
		UserID:             coach.UserID,
		FirstName:          coach.FirstName,
		LastName:           coach.LastName,
		DocumentType:       coach.DocumentType,
		DocumentNumber:     coach.DocumentNumber,
		Email:              coach.Email,
		Phone:              coach.Phone,
		LicenseNumber:      coach.LicenseNumber,
		YearsOfExperience:  coach.YearsOfExperience,
		Biography:          coach.Biography,
		Certifications:     coach.Certifications,
		IsAvailable:        true,
		MaxSessionsPerDay:  coach.MaxSessionsPerDay,
		MaxSessionsPerWeek: coach.MaxSessionsPerWeek,
		HourlyRate:         coach.HourlyRate,
		PhotoURL:           coach.PhotoURL,
		Notes:              coach.Notes,
		IsActive:           true,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando entrenador: %w", err)
	}

	// Reload with relations
	if err := r.db.Conn(ctx).Preload("CoachSpecialtyAssignments.CoachSpecialty").First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones: %w", err)
	}

	return mappers.CoachToDomain(model), nil
}

func (r *CoachRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Coach, error) {
	var model models.Coach
	query := r.db.Conn(ctx).Preload("CoachSpecialtyAssignments.CoachSpecialty")

	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}

	if err := query.First(&model, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrCoachNotFound
		}
		return nil, fmt.Errorf("error obteniendo entrenador: %w", err)
	}

	return mappers.CoachToDomain(&model), nil
}

func (r *CoachRepository) Update(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
	// Verify existence
	var existing models.Coach
	query := r.db.Conn(ctx).Where("business_id = ?", coach.BusinessID)
	if err := query.First(&existing, coach.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrCoachNotFound
		}
		return nil, fmt.Errorf("error buscando entrenador: %w", err)
	}

	updates := map[string]interface{}{
		"first_name":           coach.FirstName,
		"last_name":            coach.LastName,
		"document_type":        coach.DocumentType,
		"document_number":      coach.DocumentNumber,
		"email":                coach.Email,
		"phone":                coach.Phone,
		"license_number":       coach.LicenseNumber,
		"years_of_experience":  coach.YearsOfExperience,
		"biography":            coach.Biography,
		"certifications":       coach.Certifications,
		"is_available":         coach.IsAvailable,
		"max_sessions_per_day": coach.MaxSessionsPerDay,
		"max_sessions_per_week": coach.MaxSessionsPerWeek,
		"hourly_rate":          coach.HourlyRate,
		"photo_url":            coach.PhotoURL,
		"notes":                coach.Notes,
		"is_active":            coach.IsActive,
	}

	if err := r.db.Conn(ctx).Model(&models.Coach{}).Where("id = ?", coach.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando entrenador: %w", err)
	}

	return r.GetByID(ctx, coach.ID, coach.BusinessID)
}

func (r *CoachRepository) List(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.Coach{})

	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}
	if filters.IsAvailable != nil {
		countQuery = countQuery.Where("is_available = ?", *filters.IsAvailable)
	}
	if filters.Name != "" {
		countQuery = countQuery.Where("first_name ILIKE ? OR last_name ILIKE ?", "%"+filters.Name+"%", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		countQuery = countQuery.Where("is_active = ?", *filters.IsActive)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando entrenadores: %w", err)
	}

	var coaches []models.Coach
	query := r.db.Conn(ctx)

	if filters.BusinessID != 0 {
		query = query.Where("business_id = ?", filters.BusinessID)
	}
	if filters.IsAvailable != nil {
		query = query.Where("is_available = ?", *filters.IsAvailable)
	}
	if filters.Name != "" {
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ?", "%"+filters.Name+"%", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(filters.PageSize).Find(&coaches).Error; err != nil {
		return nil, fmt.Errorf("error listando entrenadores: %w", err)
	}

	result := make([]domain.CoachListDTO, len(coaches))
	for i, c := range coaches {
		result[i] = domain.CoachListDTO{
			ID:                c.ID,
			FirstName:         c.FirstName,
			LastName:          c.LastName,
			DocumentNumber:    c.DocumentNumber,
			Email:             c.Email,
			Phone:             c.Phone,
			YearsOfExperience: c.YearsOfExperience,
			IsAvailable:       c.IsAvailable,
			IsActive:          c.IsActive,
			CreatedAt:         c.CreatedAt,
		}
	}

	return &domain.PaginatedCoachesDTO{
		Coaches:    result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

func (r *CoachRepository) AssignSpecialty(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
	// Verificar si ya existe la asignación
	var existing models.CoachSpecialtyAssignment
	err := r.db.Conn(ctx).
		Where("coach_id = ? AND coach_specialty_id = ?", dto.CoachID, dto.SpecialtyID).
		First(&existing).Error

	if err == nil {
		return domain.ErrSpecialtyAlreadyAssigned
	}

	if err != gorm.ErrRecordNotFound {
		return fmt.Errorf("error verificando especialidad: %w", err)
	}

	// Crear nueva asignación
	assignment := &models.CoachSpecialtyAssignment{
		CoachID:          dto.CoachID,
		CoachSpecialtyID: dto.SpecialtyID,
		ProficiencyLevel: dto.ProficiencyLevel,
	}

	if err := r.db.Conn(ctx).Create(assignment).Error; err != nil {
		return fmt.Errorf("error asignando especialidad: %w", err)
	}

	return nil
}

func (r *CoachRepository) GetSpecialties(ctx context.Context, coachID uint, businessID uint) ([]domain.SpecialtyAssignment, error) {
	// Primero verificar que el coach existe y pertenece al negocio
	var coach models.Coach
	query := r.db.Conn(ctx)
	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}

	if err := query.First(&coach, coachID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrCoachNotFound
		}
		return nil, fmt.Errorf("error verificando entrenador: %w", err)
	}

	// Obtener especialidades
	var assignments []models.CoachSpecialtyAssignment
	if err := r.db.Conn(ctx).
		Preload("CoachSpecialty").
		Where("coach_id = ?", coachID).
		Find(&assignments).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo especialidades: %w", err)
	}

	result := make([]domain.SpecialtyAssignment, len(assignments))
	for i, a := range assignments {
		result[i] = domain.SpecialtyAssignment{
			ID:               a.ID,
			CoachID:          a.CoachID,
			SpecialtyID:      a.CoachSpecialtyID,
			SpecialtyName:    a.CoachSpecialty.Name,
			SpecialtyCode:    a.CoachSpecialty.Code,
			ProficiencyLevel: a.ProficiencyLevel,
			CreatedAt:        a.CreatedAt,
		}
	}

	return result, nil
}
