package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"

	"gorm.io/gorm"
)

// ───────────────────────────────────────────
// Voting Groups
// ───────────────────────────────────────────

func (r *Repository) CreateVotingGroup(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error) {
	m := &models.VotingGroup{
		BusinessID:       group.BusinessID,
		Name:             group.Name,
		Description:      group.Description,
		VotingStartDate:  group.VotingStartDate,
		VotingEndDate:    group.VotingEndDate,
		IsActive:         true,
		RequiresQuorum:   group.RequiresQuorum,
		QuorumPercentage: group.QuorumPercentage,
		CreatedByUserID:  group.CreatedByUserID,
		Notes:            group.Notes,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando grupo de votación")
		return nil, fmt.Errorf("error creando grupo de votación: %w", err)
	}
	return r.mapVotingGroupToDomain(m), nil
}

func (r *Repository) GetVotingGroupByID(ctx context.Context, id uint) (*domain.VotingGroup, error) {
	var m models.VotingGroup
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("grupo de votación no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo grupo de votación")
		return nil, fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}
	return r.mapVotingGroupToDomain(&m), nil
}

func (r *Repository) ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]domain.VotingGroup, error) {
	var m []models.VotingGroup
	if err := r.db.Conn(ctx).Where("business_id = ?", businessID).Order("created_at DESC").Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error listando grupos de votación")
		return nil, fmt.Errorf("error listando grupos de votación: %w", err)
	}
	res := make([]domain.VotingGroup, len(m))
	for i := range m {
		d := r.mapVotingGroupToDomain(&m[i])
		res[i] = *d
	}
	return res, nil
}

func (r *Repository) UpdateVotingGroup(ctx context.Context, id uint, group *domain.VotingGroup) (*domain.VotingGroup, error) {
	// Ensure exists
	var existing models.VotingGroup
	if err := r.db.Conn(ctx).First(&existing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("grupo de votación no encontrado")
		}
		return nil, err
	}
	existing.Name = group.Name
	existing.Description = group.Description
	existing.VotingStartDate = group.VotingStartDate
	existing.VotingEndDate = group.VotingEndDate
	existing.RequiresQuorum = group.RequiresQuorum
	existing.QuorumPercentage = group.QuorumPercentage
	existing.Notes = group.Notes
	if err := r.db.Conn(ctx).Save(&existing).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando grupo de votación")
		return nil, fmt.Errorf("error actualizando grupo de votación: %w", err)
	}
	return r.mapVotingGroupToDomain(&existing), nil
}

func (r *Repository) DeactivateVotingGroup(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Model(&models.VotingGroup{}).Where("id = ?", id).Update("is_active", false).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error desactivando grupo de votación")
		return fmt.Errorf("error desactivando grupo de votación: %w", err)
	}
	return nil
}

// ───────────────────────────────────────────
// Votings
// ───────────────────────────────────────────

func (r *Repository) CreateVoting(ctx context.Context, voting *domain.Voting) (*domain.Voting, error) {
	m := &models.Voting{
		VotingGroupID:      voting.VotingGroupID,
		Title:              voting.Title,
		Description:        voting.Description,
		VotingType:         voting.VotingType,
		IsSecret:           voting.IsSecret,
		AllowAbstention:    voting.AllowAbstention,
		IsActive:           true,
		DisplayOrder:       voting.DisplayOrder,
		RequiredPercentage: voting.RequiredPercentage,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando votación")
		return nil, fmt.Errorf("error creando votación: %w", err)
	}
	return r.mapVotingToDomain(m), nil
}

func (r *Repository) GetVotingByID(ctx context.Context, id uint) (*domain.Voting, error) {
	var m models.Voting
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("votación no encontrada")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo votación")
		return nil, fmt.Errorf("error obteniendo votación: %w", err)
	}
	return r.mapVotingToDomain(&m), nil
}

func (r *Repository) ListVotingsByGroup(ctx context.Context, groupID uint) ([]domain.Voting, error) {
	var m []models.Voting
	if err := r.db.Conn(ctx).Where("voting_group_id = ?", groupID).Order("display_order ASC, created_at ASC").Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("group_id", groupID).Msg("Error listando votaciones")
		return nil, fmt.Errorf("error listando votaciones: %w", err)
	}
	res := make([]domain.Voting, len(m))
	for i := range m {
		res[i] = *r.mapVotingToDomain(&m[i])
	}
	return res, nil
}

func (r *Repository) UpdateVoting(ctx context.Context, id uint, voting *domain.Voting) (*domain.Voting, error) {
	var existing models.Voting
	if err := r.db.Conn(ctx).First(&existing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("votación no encontrada")
		}
		return nil, err
	}
	existing.Title = voting.Title
	existing.Description = voting.Description
	existing.VotingType = voting.VotingType
	existing.IsSecret = voting.IsSecret
	existing.AllowAbstention = voting.AllowAbstention
	existing.DisplayOrder = voting.DisplayOrder
	existing.RequiredPercentage = voting.RequiredPercentage
	if err := r.db.Conn(ctx).Save(&existing).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando votación")
		return nil, fmt.Errorf("error actualizando votación: %w", err)
	}
	return r.mapVotingToDomain(&existing), nil
}

func (r *Repository) DeactivateVoting(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Model(&models.Voting{}).Where("id = ?", id).Update("is_active", false).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error desactivando votación")
		return fmt.Errorf("error desactivando votación: %w", err)
	}
	return nil
}

func (r *Repository) ActivateVoting(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Model(&models.Voting{}).Where("id = ?", id).Update("is_active", true).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error activando votación")
		return fmt.Errorf("error activando votación: %w", err)
	}
	return nil
}

func (r *Repository) DeleteVoting(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.Voting{}, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando votación")
		return fmt.Errorf("error eliminando votación: %w", err)
	}
	return nil
}

// ───────────────────────────────────────────
// Voting Options
// ───────────────────────────────────────────

func (r *Repository) CreateVotingOption(ctx context.Context, option *domain.VotingOption) (*domain.VotingOption, error) {
	m := &models.VotingOption{
		VotingID:     option.VotingID,
		OptionText:   option.OptionText,
		OptionCode:   option.OptionCode,
		Color:        option.Color,
		DisplayOrder: option.DisplayOrder,
		IsActive:     true,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando opción de votación")
		return nil, fmt.Errorf("error creando opción de votación: %w", err)
	}
	return r.mapVotingOptionToDomain(m), nil
}

func (r *Repository) ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]domain.VotingOption, error) {
	var m []models.VotingOption
	if err := r.db.Conn(ctx).Where("voting_id = ?", votingID).Order("display_order ASC, id ASC").Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error listando opciones de votación")
		return nil, fmt.Errorf("error listando opciones de votación: %w", err)
	}
	res := make([]domain.VotingOption, len(m))
	for i := range m {
		res[i] = *r.mapVotingOptionToDomain(&m[i])
	}
	return res, nil
}

func (r *Repository) DeactivateVotingOption(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Model(&models.VotingOption{}).Where("id = ?", id).Update("is_active", false).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error desactivando opción de votación")
		return fmt.Errorf("error desactivando opción de votación: %w", err)
	}
	return nil
}

// ───────────────────────────────────────────
// Votes
// ───────────────────────────────────────────

func (r *Repository) CreateVote(ctx context.Context, vote domain.Vote) (*domain.Vote, error) {
	m := &models.Vote{
		VotingID:       vote.VotingID,
		ResidentID:     vote.ResidentID,
		VotingOptionID: vote.VotingOptionID,
		VotedAt:        time.Now(),
		IPAddress:      vote.IPAddress,
		UserAgent:      vote.UserAgent,
		Notes:          vote.Notes,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", vote.VotingID).Uint("resident_id", vote.ResidentID).Msg("Error creando voto")
		return nil, fmt.Errorf("error creando voto: %w", err)
	}

	// Obtener información de la opción de votación para incluir en el voto
	var option models.VotingOption
	if err := r.db.Conn(ctx).First(&option, vote.VotingOptionID).Error; err == nil {
		m.VotingOption = option
	}

	return r.mapVoteToDomain(m), nil
}

func (r *Repository) HasResidentVoted(ctx context.Context, votingID uint, residentID uint) (bool, error) {
	var count int64
	if err := r.db.Conn(ctx).Model(&models.Vote{}).Where("voting_id = ? AND resident_id = ?", votingID, residentID).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", votingID).Uint("resident_id", residentID).Msg("Error verificando voto existente")
		return false, fmt.Errorf("error verificando voto existente: %w", err)
	}
	return count > 0, nil
}

func (r *Repository) GetResidentVote(ctx context.Context, votingID, residentID uint) (*domain.Vote, error) {
	var m models.Vote
	if err := r.db.Conn(ctx).
		Preload("VotingOption").
		Where("voting_id = ? AND resident_id = ?", votingID, residentID).
		First(&m).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("voto no encontrado")
		}
		r.logger.Error().Err(err).Uint("voting_id", votingID).Uint("resident_id", residentID).Msg("Error obteniendo voto del residente")
		return nil, fmt.Errorf("error obteniendo voto del residente: %w", err)
	}
	return r.mapVoteToDomain(&m), nil
}

func (r *Repository) GetVotingResults(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error) {
	type ResultRow struct {
		VotingOptionID uint
		OptionText     string
		OptionCode     string
		VoteCount      int
		DisplayOrder   int
	}

	var results []ResultRow
	err := r.db.Conn(ctx).
		Table("horizontal_property.voting_options").
		Select("voting_options.id as voting_option_id, voting_options.option_text, voting_options.option_code, voting_options.display_order, COUNT(votes.id) as vote_count").
		Joins("LEFT JOIN horizontal_property.votes ON votes.voting_option_id = voting_options.id AND votes.voting_id = ?", votingID).
		Where("voting_options.voting_id = ? AND voting_options.is_active = ?", votingID, true).
		Group("voting_options.id, voting_options.option_text, voting_options.option_code, voting_options.display_order").
		Order("voting_options.display_order ASC").
		Scan(&results).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo resultados de votación")
		return nil, fmt.Errorf("error obteniendo resultados de votación: %w", err)
	}

	// Calcular total de votos y porcentajes
	totalVotes := 0
	for _, result := range results {
		totalVotes += result.VoteCount
	}

	// Construir DTOs con porcentajes
	dtos := make([]domain.VotingResultDTO, len(results))
	for i, result := range results {
		percentage := 0.0
		if totalVotes > 0 {
			percentage = (float64(result.VoteCount) / float64(totalVotes)) * 100
		}
		dtos[i] = domain.VotingResultDTO{
			VotingOptionID: result.VotingOptionID,
			OptionText:     result.OptionText,
			OptionCode:     result.OptionCode,
			VoteCount:      result.VoteCount,
			Percentage:     percentage,
		}
	}

	return dtos, nil
}

func (r *Repository) GetVotingDetailsByUnit(ctx context.Context, votingID, hpID uint) ([]domain.VotingDetailByUnitDTO, error) {
	// PASO 1: Obtener todas las unidades activas de la propiedad
	var units []models.PropertyUnit
	if err := r.db.Conn(ctx).
		Where("business_id = ? AND is_active = ?", hpID, true).
		Order("REGEXP_REPLACE(number, '[^0-9]', '', 'g') != '' DESC").
		Order("REGEXP_REPLACE(number, '[0-9]+', '', 'g') ASC").
		Order("COALESCE(NULLIF(REGEXP_REPLACE(number, '[^0-9]', '', 'g'), '')::integer, 0) ASC").
		Find(&units).Error; err != nil {
		r.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo unidades")
		return nil, fmt.Errorf("error obteniendo unidades: %w", err)
	}

	// PASO 2: Obtener todos los residentes principales de esas unidades
	unitIDs := make([]uint, len(units))
	for i, unit := range units {
		unitIDs[i] = unit.ID
	}

	var residents []models.Resident
	if len(unitIDs) > 0 {
		if err := r.db.Conn(ctx).
			Where("property_unit_id IN ? AND is_main_resident = ? AND is_active = ?", unitIDs, true, true).
			Find(&residents).Error; err != nil {
			r.logger.Error().Err(err).Msg("Error obteniendo residentes principales")
			return nil, fmt.Errorf("error obteniendo residentes: %w", err)
		}
	}

	// Crear mapa de unidad -> residente
	residentByUnit := make(map[uint]*models.Resident)
	for i := range residents {
		residentByUnit[residents[i].PropertyUnitID] = &residents[i]
	}

	// PASO 3: Obtener todos los votos de esta votación con las opciones
	residentIDs := make([]uint, 0, len(residents))
	for _, res := range residents {
		residentIDs = append(residentIDs, res.ID)
	}

	var votes []models.Vote
	if len(residentIDs) > 0 {
		if err := r.db.Conn(ctx).
			Preload("VotingOption").
			Where("voting_id = ? AND resident_id IN ?", votingID, residentIDs).
			Find(&votes).Error; err != nil {
			r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votos")
			return nil, fmt.Errorf("error obteniendo votos: %w", err)
		}
	}

	// Crear mapa de residente -> voto
	voteByResident := make(map[uint]*models.Vote)
	for i := range votes {
		voteByResident[votes[i].ResidentID] = &votes[i]
	}

	// PASO 4: Combinar todo en DTOs
	dtos := make([]domain.VotingDetailByUnitDTO, len(units))
	for i, unit := range units {
		dto := domain.VotingDetailByUnitDTO{
			PropertyUnitID:           unit.ID,
			PropertyUnitNumber:       unit.Number,
			ParticipationCoefficient: unit.ParticipationCoefficient,
			HasVoted:                 false,
		}

		// Agregar info del residente si existe
		if resident, hasResident := residentByUnit[unit.ID]; hasResident {
			dto.ResidentID = &resident.ID
			dto.ResidentName = &resident.Name

			// Agregar info del voto si existe
			if vote, hasVoted := voteByResident[resident.ID]; hasVoted {
				dto.HasVoted = true
				dto.VotingOptionID = &vote.VotingOptionID

				if vote.VotingOption.ID != 0 {
					dto.OptionText = &vote.VotingOption.OptionText
					dto.OptionCode = &vote.VotingOption.OptionCode
					dto.OptionColor = &vote.VotingOption.Color
				}

				votedAtStr := vote.VotedAt.Format("2006-01-02T15:04:05Z07:00")
				dto.VotedAt = &votedAtStr
			}
		}

		dtos[i] = dto
	}

	return dtos, nil
}

func (r *Repository) GetUnitsWithResidents(ctx context.Context, hpID uint) ([]domain.UnitWithResidentDTO, error) {
	// PASO 1: Obtener todas las unidades activas
	var units []models.PropertyUnit
	if err := r.db.Conn(ctx).
		Where("business_id = ? AND is_active = ?", hpID, true).
		Order("REGEXP_REPLACE(number, '[^0-9]', '', 'g') != '' DESC").
		Order("REGEXP_REPLACE(number, '[0-9]+', '', 'g') ASC").
		Order("COALESCE(NULLIF(REGEXP_REPLACE(number, '[^0-9]', '', 'g'), '')::integer, 0) ASC").
		Find(&units).Error; err != nil {
		r.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo unidades")
		return nil, fmt.Errorf("error obteniendo unidades: %w", err)
	}

	// PASO 2: Obtener residentes principales de esas unidades
	unitIDs := make([]uint, len(units))
	for i, unit := range units {
		unitIDs[i] = unit.ID
	}

	var residents []models.Resident
	if len(unitIDs) > 0 {
		if err := r.db.Conn(ctx).
			Where("property_unit_id IN ? AND is_main_resident = ? AND is_active = ?", unitIDs, true, true).
			Find(&residents).Error; err != nil {
			r.logger.Error().Err(err).Msg("Error obteniendo residentes")
			return nil, fmt.Errorf("error obteniendo residentes: %w", err)
		}
	}

	// PASO 3: Crear mapa de unidad -> residente
	residentByUnit := make(map[uint]*models.Resident)
	for i := range residents {
		residentByUnit[residents[i].PropertyUnitID] = &residents[i]
	}

	// PASO 4: Combinar en DTOs
	dtos := make([]domain.UnitWithResidentDTO, len(units))
	for i, unit := range units {
		dto := domain.UnitWithResidentDTO{
			PropertyUnitID:     unit.ID,
			PropertyUnitNumber: unit.Number,
		}

		// Agregar residente si existe
		if resident, hasResident := residentByUnit[unit.ID]; hasResident {
			dto.ResidentID = &resident.ID
			dto.ResidentName = &resident.Name
		}

		dtos[i] = dto
	}

	return dtos, nil
}

func (r *Repository) ListVotesByVoting(ctx context.Context, votingID uint) ([]domain.Vote, error) {
	var m []models.Vote
	if err := r.db.Conn(ctx).Where("voting_id = ?", votingID).Order("voted_at DESC").Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error listando votos")
		return nil, fmt.Errorf("error listando votos: %w", err)
	}
	res := make([]domain.Vote, len(m))
	for i := range m {
		res[i] = *r.mapVoteToDomain(&m[i])
	}
	return res, nil
}

// ───────────────────────────────────────────
// Mapping helpers
// ───────────────────────────────────────────

func (r *Repository) mapVotingGroupToDomain(m *models.VotingGroup) *domain.VotingGroup {
	return &domain.VotingGroup{
		ID:               m.ID,
		BusinessID:       m.BusinessID,
		Name:             m.Name,
		Description:      m.Description,
		VotingStartDate:  m.VotingStartDate,
		VotingEndDate:    m.VotingEndDate,
		IsActive:         m.IsActive,
		RequiresQuorum:   m.RequiresQuorum,
		QuorumPercentage: m.QuorumPercentage,
		CreatedByUserID:  m.CreatedByUserID,
		Notes:            m.Notes,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

func (r *Repository) mapVotingToDomain(m *models.Voting) *domain.Voting {
	return &domain.Voting{
		ID:                 m.ID,
		VotingGroupID:      m.VotingGroupID,
		Title:              m.Title,
		Description:        m.Description,
		VotingType:         m.VotingType,
		IsSecret:           m.IsSecret,
		AllowAbstention:    m.AllowAbstention,
		IsActive:           m.IsActive,
		DisplayOrder:       m.DisplayOrder,
		RequiredPercentage: m.RequiredPercentage,
		CreatedAt:          m.CreatedAt,
		UpdatedAt:          m.UpdatedAt,
	}
}

func (r *Repository) mapVotingOptionToDomain(m *models.VotingOption) *domain.VotingOption {
	return &domain.VotingOption{
		ID:           m.ID,
		VotingID:     m.VotingID,
		OptionText:   m.OptionText,
		OptionCode:   m.OptionCode,
		Color:        m.Color,
		DisplayOrder: m.DisplayOrder,
		IsActive:     m.IsActive,
	}
}

func (r *Repository) mapVoteToDomain(m *models.Vote) *domain.Vote {
	vote := &domain.Vote{
		ID:             m.ID,
		VotingID:       m.VotingID,
		ResidentID:     m.ResidentID,
		VotingOptionID: m.VotingOptionID,
		VotedAt:        m.VotedAt,
		IPAddress:      m.IPAddress,
		UserAgent:      m.UserAgent,
		Notes:          m.Notes,
	}

	// Agregar información de la opción si está cargada (Preload)
	if m.VotingOption.ID != 0 {
		vote.OptionText = m.VotingOption.OptionText
		vote.OptionCode = m.VotingOption.OptionCode
		vote.OptionColor = m.VotingOption.Color
	}

	return vote
}

		VotingID:     m.VotingID,
		OptionText:   m.OptionText,
		OptionCode:   m.OptionCode,
		Color:        m.Color,
		DisplayOrder: m.DisplayOrder,
		IsActive:     m.IsActive,
	}
}

func (r *Repository) mapVoteToDomain(m *models.Vote) *domain.Vote {
	vote := &domain.Vote{
		ID:             m.ID,
		VotingID:       m.VotingID,
		ResidentID:     m.ResidentID,
		VotingOptionID: m.VotingOptionID,
		VotedAt:        m.VotedAt,
		IPAddress:      m.IPAddress,
		UserAgent:      m.UserAgent,
		Notes:          m.Notes,
	}

	// Agregar información de la opción si está cargada (Preload)
	if m.VotingOption.ID != 0 {
		vote.OptionText = m.VotingOption.OptionText
		vote.OptionCode = m.VotingOption.OptionCode
		vote.OptionColor = m.VotingOption.Color
	}

	return vote
}

		VotingID:     m.VotingID,
		OptionText:   m.OptionText,
		OptionCode:   m.OptionCode,
		Color:        m.Color,
		DisplayOrder: m.DisplayOrder,
		IsActive:     m.IsActive,
	}
}

func (r *Repository) mapVoteToDomain(m *models.Vote) *domain.Vote {
	vote := &domain.Vote{
		ID:             m.ID,
		VotingID:       m.VotingID,
		ResidentID:     m.ResidentID,
		VotingOptionID: m.VotingOptionID,
		VotedAt:        m.VotedAt,
		IPAddress:      m.IPAddress,
		UserAgent:      m.UserAgent,
		Notes:          m.Notes,
	}

	// Agregar información de la opción si está cargada (Preload)
	if m.VotingOption.ID != 0 {
		vote.OptionText = m.VotingOption.OptionText
		vote.OptionCode = m.VotingOption.OptionCode
		vote.OptionColor = m.VotingOption.Color
	}

	return vote
}

		VotingID:     m.VotingID,
		OptionText:   m.OptionText,
		OptionCode:   m.OptionCode,
		Color:        m.Color,
		DisplayOrder: m.DisplayOrder,
		IsActive:     m.IsActive,
	}
}

func (r *Repository) mapVoteToDomain(m *models.Vote) *domain.Vote {
	vote := &domain.Vote{
		ID:             m.ID,
		VotingID:       m.VotingID,
		ResidentID:     m.ResidentID,
		VotingOptionID: m.VotingOptionID,
		VotedAt:        m.VotedAt,
		IPAddress:      m.IPAddress,
		UserAgent:      m.UserAgent,
		Notes:          m.Notes,
	}

	// Agregar información de la opción si está cargada (Preload)
	if m.VotingOption.ID != 0 {
		vote.OptionText = m.VotingOption.OptionText
		vote.OptionCode = m.VotingOption.OptionCode
		vote.OptionColor = m.VotingOption.Color
	}

	return vote
}
