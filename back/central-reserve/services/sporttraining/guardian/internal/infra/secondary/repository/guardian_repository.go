package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/services/sporttraining/guardian/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type GuardianRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.GuardianRepository {
	return &GuardianRepository{
		db:     db,
		logger: logger,
	}
}

func (r *GuardianRepository) Create(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
	model := &models.STGuardian{
		BusinessID:       guardian.BusinessID,
		UserID:           guardian.UserID,
		FirstName:        guardian.FirstName,
		LastName:         guardian.LastName,
		DocumentType:     guardian.DocumentType,
		DocumentNumber:   guardian.DocumentNumber,
		Email:            guardian.Email,
		Phone:            guardian.Phone,
		SecondaryPhone:   guardian.SecondaryPhone,
		Address:          guardian.Address,
		City:             guardian.City,
		State:            guardian.State,
		Country:          guardian.Country,
		Relationship:     guardian.Relationship,
		PhotoURL:         guardian.PhotoURL,
		Notes:            guardian.Notes,
		CanBookSessions:  guardian.CanBookSessions,
		CanAccessRecords: guardian.CanAccessRecords,
		IsActive:         true,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando tutor: %w", err)
	}

	return mappers.GuardianToDomain(model), nil
}

func (r *GuardianRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error) {
	var model models.STGuardian
	query := r.db.Conn(ctx)

	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}

	if err := query.First(&model, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrGuardianNotFound
		}
		return nil, fmt.Errorf("error obteniendo tutor: %w", err)
	}

	return mappers.GuardianToDomain(&model), nil
}

func (r *GuardianRepository) Update(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
	// Verify existence
	var existing models.STGuardian
	query := r.db.Conn(ctx).Where("business_id = ?", guardian.BusinessID)
	if err := query.First(&existing, guardian.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrGuardianNotFound
		}
		return nil, fmt.Errorf("error buscando tutor: %w", err)
	}

	updates := map[string]interface{}{
		"first_name":         guardian.FirstName,
		"last_name":          guardian.LastName,
		"document_type":      guardian.DocumentType,
		"document_number":    guardian.DocumentNumber,
		"email":              guardian.Email,
		"phone":              guardian.Phone,
		"secondary_phone":    guardian.SecondaryPhone,
		"address":            guardian.Address,
		"city":               guardian.City,
		"state":              guardian.State,
		"country":            guardian.Country,
		"relationship":       guardian.Relationship,
		"photo_url":          guardian.PhotoURL,
		"notes":              guardian.Notes,
		"can_book_sessions":  guardian.CanBookSessions,
		"can_access_records": guardian.CanAccessRecords,
		"is_active":          guardian.IsActive,
	}

	if err := r.db.Conn(ctx).Model(&models.STGuardian{}).Where("id = ?", guardian.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando tutor: %w", err)
	}

	return r.GetByID(ctx, guardian.ID, guardian.BusinessID)
}

func (r *GuardianRepository) List(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.STGuardian{})

	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}
	if filters.Name != "" {
		countQuery = countQuery.Where("first_name ILIKE ? OR last_name ILIKE ?", "%"+filters.Name+"%", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		countQuery = countQuery.Where("is_active = ?", *filters.IsActive)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando tutores: %w", err)
	}

	var guardians []models.STGuardian
	query := r.db.Conn(ctx)

	if filters.BusinessID != 0 {
		query = query.Where("business_id = ?", filters.BusinessID)
	}
	if filters.Name != "" {
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ?", "%"+filters.Name+"%", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(filters.PageSize).Find(&guardians).Error; err != nil {
		return nil, fmt.Errorf("error listando tutores: %w", err)
	}

	result := make([]domain.GuardianListDTO, len(guardians))
	for i, g := range guardians {
		result[i] = domain.GuardianListDTO{
			ID:             g.ID,
			FirstName:      g.FirstName,
			LastName:       g.LastName,
			DocumentNumber: g.DocumentNumber,
			Email:          g.Email,
			Phone:          g.Phone,
			Relationship:   g.Relationship,
			IsActive:       g.IsActive,
			CreatedAt:      g.CreatedAt,
		}
	}

	return &domain.PaginatedGuardiansDTO{
		Guardians:  result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

func (r *GuardianRepository) AssignToPlayer(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error {
	// Verificar que el tutor existe
	var guardian models.STGuardian
	if err := r.db.Conn(ctx).First(&guardian, assignment.GuardianID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return domain.ErrGuardianNotFound
		}
		return fmt.Errorf("error verificando tutor: %w", err)
	}

	// Verificar que el jugador existe
	var player models.STPlayer
	if err := r.db.Conn(ctx).First(&player, assignment.PlayerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return domain.ErrPlayerNotFound
		}
		return fmt.Errorf("error verificando jugador: %w", err)
	}

	// Verificar si ya existe la asignación
	var existing models.PlayerGuardian
	if err := r.db.Conn(ctx).Where("st_player_id = ? AND st_guardian_id = ?", assignment.PlayerID, assignment.GuardianID).First(&existing).Error; err == nil {
		return domain.ErrGuardianAlreadyAssigned
	}

	// Crear la asignación
	model := &models.PlayerGuardian{
		STPlayerID:          assignment.PlayerID,
		STGuardianID:        assignment.GuardianID,
		RelationshipType:    assignment.RelationshipType,
		IsPrimaryGuardian:   assignment.IsPrimaryGuardian,
		CanPickup:           assignment.CanPickup,
		CanBookSessions:     assignment.CanBookSessions,
		HasMedicalAuthority: assignment.HasMedicalAuthority,
		StartDate:           assignment.StartDate,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("error asignando tutor a jugador: %w", err)
	}

	return nil
}

func (r *GuardianRepository) GetPlayerGuardians(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
	// Verificar que el jugador existe y pertenece al negocio
	var player models.STPlayer
	query := r.db.Conn(ctx)
	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}
	if err := query.First(&player, playerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPlayerNotFound
		}
		return nil, fmt.Errorf("error verificando jugador: %w", err)
	}

	// Obtener tutores del jugador
	var assignments []models.PlayerGuardian
	if err := r.db.Conn(ctx).
		Preload("Guardian").
		Where("st_player_id = ?", playerID).
		Find(&assignments).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo tutores del jugador: %w", err)
	}

	result := make([]domain.PlayerGuardianDTO, len(assignments))
	for i, a := range assignments {
		result[i] = domain.PlayerGuardianDTO{
			ID:                  a.Guardian.ID,
			FirstName:           a.Guardian.FirstName,
			LastName:            a.Guardian.LastName,
			DocumentNumber:      a.Guardian.DocumentNumber,
			Email:               a.Guardian.Email,
			Phone:               a.Guardian.Phone,
			RelationshipType:    a.RelationshipType,
			IsPrimaryGuardian:   a.IsPrimaryGuardian,
			CanPickup:           a.CanPickup,
			CanBookSessions:     a.CanBookSessions,
			HasMedicalAuthority: a.HasMedicalAuthority,
			StartDate:           a.StartDate,
		}
	}

	return result, nil
}
