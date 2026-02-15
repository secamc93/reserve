package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/services/sporttraining/player/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type PlayerRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.PlayerRepository {
	return &PlayerRepository{
		db:     db,
		logger: logger,
	}
}

func (r *PlayerRepository) Create(ctx context.Context, player *domain.Player) (*domain.Player, error) {
	model := &models.STPlayer{
		BusinessID:          player.BusinessID,
		UserID:              player.UserID,
		FirstName:           player.FirstName,
		LastName:            player.LastName,
		DocumentType:        player.DocumentType,
		DocumentNumber:      player.DocumentNumber,
		DateOfBirth:         player.DateOfBirth,
		Gender:              player.Gender,
		Email:               player.Email,
		Phone:               player.Phone,
		Address:             player.Address,
		City:                player.City,
		State:               player.State,
		Country:             player.Country,
		SkillLevelID:        player.SkillLevelID,
		PreferredPosition:   player.PreferredPosition,
		Height:              player.Height,
		Weight:              player.Weight,
		JerseyNumber:        player.JerseyNumber,
		BloodType:           player.BloodType,
		HasAllergies:        player.HasAllergies,
		AllergyDetails:      player.AllergyDetails,
		HasMedicalCondition: player.HasMedicalCondition,
		MedicalDetails:      player.MedicalDetails,
		EmergencyContact:    player.EmergencyContact,
		EmergencyPhone:      player.EmergencyPhone,
		PhotoURL:            player.PhotoURL,
		Notes:               player.Notes,
		IsActive:            true,
		IsMinor:             player.IsMinor,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando jugador: %w", err)
	}

	// Reload with relations
	if err := r.db.Conn(ctx).Preload("SkillLevel").First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones: %w", err)
	}

	return mappers.PlayerToDomain(model), nil
}

func (r *PlayerRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Player, error) {
	var model models.STPlayer
	query := r.db.Conn(ctx).Preload("SkillLevel")

	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}

	if err := query.First(&model, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPlayerNotFound
		}
		return nil, fmt.Errorf("error obteniendo jugador: %w", err)
	}

	return mappers.PlayerToDomain(&model), nil
}

func (r *PlayerRepository) Update(ctx context.Context, player *domain.Player) (*domain.Player, error) {
	// Verify existence
	var existing models.STPlayer
	query := r.db.Conn(ctx).Where("business_id = ?", player.BusinessID)
	if err := query.First(&existing, player.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPlayerNotFound
		}
		return nil, fmt.Errorf("error buscando jugador: %w", err)
	}

	updates := map[string]interface{}{
		"first_name":            player.FirstName,
		"last_name":             player.LastName,
		"document_type":         player.DocumentType,
		"document_number":       player.DocumentNumber,
		"date_of_birth":         player.DateOfBirth,
		"gender":                player.Gender,
		"email":                 player.Email,
		"phone":                 player.Phone,
		"address":               player.Address,
		"city":                  player.City,
		"state":                 player.State,
		"country":               player.Country,
		"skill_level_id":        player.SkillLevelID,
		"preferred_position":    player.PreferredPosition,
		"height":                player.Height,
		"weight":                player.Weight,
		"jersey_number":         player.JerseyNumber,
		"blood_type":            player.BloodType,
		"has_allergies":         player.HasAllergies,
		"allergy_details":       player.AllergyDetails,
		"has_medical_condition": player.HasMedicalCondition,
		"medical_details":       player.MedicalDetails,
		"emergency_contact":     player.EmergencyContact,
		"emergency_phone":       player.EmergencyPhone,
		"photo_url":             player.PhotoURL,
		"notes":                 player.Notes,
		"is_active":             player.IsActive,
		"is_minor":              player.IsMinor,
	}

	if err := r.db.Conn(ctx).Model(&models.STPlayer{}).Where("id = ?", player.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando jugador: %w", err)
	}

	return r.GetByID(ctx, player.ID, player.BusinessID)
}

func (r *PlayerRepository) Delete(ctx context.Context, id uint, businessID uint) error {
	query := r.db.Conn(ctx).Where("business_id = ?", businessID)
	result := query.Delete(&models.STPlayer{}, id)
	if result.Error != nil {
		return fmt.Errorf("error eliminando jugador: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return domain.ErrPlayerNotFound
	}
	return nil
}

func (r *PlayerRepository) List(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.STPlayer{})

	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}
	if filters.IsMinor != nil {
		countQuery = countQuery.Where("is_minor = ?", *filters.IsMinor)
	}
	if filters.SkillLevelID != nil {
		countQuery = countQuery.Where("skill_level_id = ?", *filters.SkillLevelID)
	}
	if filters.Name != "" {
		countQuery = countQuery.Where("first_name ILIKE ? OR last_name ILIKE ?", "%"+filters.Name+"%", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		countQuery = countQuery.Where("is_active = ?", *filters.IsActive)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando jugadores: %w", err)
	}

	type row struct {
		ID                uint
		FirstName         string
		LastName          string
		DocumentNumber    string
		DateOfBirth       interface{}
		Gender            string
		Email             *string
		Phone             *string
		PreferredPosition string
		SkillLevelName    string
		IsMinor           bool
		IsActive          bool
		CreatedAt         interface{}
	}

	var players []models.STPlayer
	query := r.db.Conn(ctx).Preload("SkillLevel")

	if filters.BusinessID != 0 {
		query = query.Where("business_id = ?", filters.BusinessID)
	}
	if filters.IsMinor != nil {
		query = query.Where("is_minor = ?", *filters.IsMinor)
	}
	if filters.SkillLevelID != nil {
		query = query.Where("skill_level_id = ?", *filters.SkillLevelID)
	}
	if filters.Name != "" {
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ?", "%"+filters.Name+"%", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(filters.PageSize).Find(&players).Error; err != nil {
		return nil, fmt.Errorf("error listando jugadores: %w", err)
	}

	result := make([]domain.PlayerListDTO, len(players))
	for i, p := range players {
		var skillLevelName string
		if p.SkillLevel != nil {
			skillLevelName = p.SkillLevel.Name
		}
		result[i] = domain.PlayerListDTO{
			ID:                p.ID,
			FirstName:         p.FirstName,
			LastName:          p.LastName,
			DocumentNumber:    p.DocumentNumber,
			DateOfBirth:       p.DateOfBirth,
			Gender:            p.Gender,
			Email:             p.Email,
			Phone:             p.Phone,
			PreferredPosition: p.PreferredPosition,
			SkillLevelName:    skillLevelName,
			IsMinor:           p.IsMinor,
			IsActive:          p.IsActive,
			CreatedAt:         p.CreatedAt,
		}
	}

	return &domain.PaginatedPlayersDTO{
		Players:    result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}
