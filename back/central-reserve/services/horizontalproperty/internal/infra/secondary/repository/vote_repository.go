package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"regexp"
	"strings"
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
		PropertyUnitID: vote.PropertyUnitID,
		VotingOptionID: vote.VotingOptionID,
		VotedAt:        time.Now(),
		IPAddress:      vote.IPAddress,
		UserAgent:      vote.UserAgent,
		Notes:          vote.Notes,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", vote.VotingID).Uint("property_unit_id", vote.PropertyUnitID).Msg("Error creando voto")
		return nil, fmt.Errorf("error creando voto: %w", err)
	}

	// Obtener información de la opción de votación para incluir en el voto
	var option models.VotingOption
	if err := r.db.Conn(ctx).First(&option, vote.VotingOptionID).Error; err == nil {
		m.VotingOption = option
	}

	return r.mapVoteToDomain(m), nil
}

func (r *Repository) GetVoteByID(ctx context.Context, voteID uint) (*domain.Vote, error) {
	var m models.Vote
	if err := r.db.Conn(ctx).Preload("VotingOption").First(&m, voteID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("voto no encontrado")
		}
		r.logger.Error().Err(err).Uint("vote_id", voteID).Msg("Error obteniendo voto por ID")
		return nil, fmt.Errorf("error obteniendo voto: %w", err)
	}

	return r.mapVoteToDomain(&m), nil
}

func (r *Repository) DeleteVote(ctx context.Context, voteID uint) error {
	fmt.Printf("🗑️ [REPOSITORY] DeleteVote - Iniciando eliminación\n")
	fmt.Printf("   Vote ID: %d\n", voteID)

	// Verificar que el voto existe antes de eliminar
	var existingVote models.Vote
	if err := r.db.Conn(ctx).First(&existingVote, voteID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			fmt.Printf("❌ [REPOSITORY] DeleteVote - Voto no encontrado: %d\n", voteID)
			return fmt.Errorf("voto no encontrado")
		}
		fmt.Printf("❌ [REPOSITORY] DeleteVote - Error verificando voto: %v\n", err)
		return fmt.Errorf("error verificando voto: %w", err)
	}

	fmt.Printf("✅ [REPOSITORY] DeleteVote - Voto encontrado\n")
	fmt.Printf("   ID: %d\n", existingVote.ID)
	fmt.Printf("   Voting ID: %d\n", existingVote.VotingID)
	fmt.Printf("   Property Unit ID: %d\n", existingVote.PropertyUnitID)
	fmt.Printf("   Eliminando permanentemente...\n")

	// Hard delete - eliminar permanentemente de la base de datos
	result := r.db.Conn(ctx).Unscoped().Delete(&models.Vote{}, voteID)
	if result.Error != nil {
		fmt.Printf("❌ [REPOSITORY] DeleteVote - Error eliminando: %v\n", result.Error)
		r.logger.Error().Err(result.Error).Uint("vote_id", voteID).Msg("Error eliminando voto")
		return fmt.Errorf("error eliminando voto: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		fmt.Printf("⚠️ [REPOSITORY] DeleteVote - No se eliminó ningún registro\n")
		return fmt.Errorf("no se eliminó ningún voto")
	}

	fmt.Printf("✅ [REPOSITORY] DeleteVote - Voto eliminado exitosamente\n")
	fmt.Printf("   Rows affected: %d\n", result.RowsAffected)

	r.logger.Info().Uint("vote_id", voteID).Int64("rows_affected", result.RowsAffected).Msg("Voto eliminado permanentemente")
	return nil
}

func (r *Repository) HasUnitVoted(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
	var count int64
	if err := r.db.Conn(ctx).Model(&models.Vote{}).Where("voting_id = ? AND property_unit_id = ?", votingID, propertyUnitID).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", votingID).Uint("property_unit_id", propertyUnitID).Msg("Error verificando voto existente")
		return false, fmt.Errorf("error verificando voto existente: %w", err)
	}
	return count > 0, nil
}

func (r *Repository) GetUnitVote(ctx context.Context, votingID, propertyUnitID uint) (*domain.Vote, error) {
	var m models.Vote
	if err := r.db.Conn(ctx).
		Preload("VotingOption").
		Where("voting_id = ? AND property_unit_id = ?", votingID, propertyUnitID).
		First(&m).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("voto no encontrado")
		}
		r.logger.Error().Err(err).Uint("voting_id", votingID).Uint("property_unit_id", propertyUnitID).Msg("Error obteniendo voto de la unidad")
		return nil, fmt.Errorf("error obteniendo voto de la unidad: %w", err)
	}
	return r.mapVoteToDomain(&m), nil
}

func (r *Repository) GetVotingResults(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error) {
	type ResultRow struct {
		VotingOptionID uint
		OptionText     string
		OptionCode     string
		Color          string
		VoteCount      int
		DisplayOrder   int
	}

	var results []ResultRow
	err := r.db.Conn(ctx).
		Table("horizontal_property.voting_options").
		Select("voting_options.id as voting_option_id, voting_options.option_text, voting_options.option_code, voting_options.color, voting_options.display_order, COUNT(votes.id) as vote_count").
		Joins("LEFT JOIN horizontal_property.votes ON votes.voting_option_id = voting_options.id AND votes.voting_id = ?", votingID).
		Where("voting_options.voting_id = ? AND voting_options.is_active = ?", votingID, true).
		Group("voting_options.id, voting_options.option_text, voting_options.option_code, voting_options.color, voting_options.display_order").
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
			Color:          result.Color,
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

	// Obtener TODOS los residentes por unidad vía tabla pivote (marcando principal si existe)
	type residentRow struct {
		UnitID         uint
		ResidentID     uint
		ResidentName   string
		IsMainResident bool
	}
	residentRows := []residentRow{}
	if len(unitIDs) > 0 {
		if err := r.db.Conn(ctx).
			Table("horizontal_property.resident_units ru").
			Select("ru.property_unit_id as unit_id, r.id as resident_id, r.name as resident_name, ru.is_main_resident").
			Joins("JOIN horizontal_property.residents r ON r.id = ru.resident_id").
			Where("ru.property_unit_id IN ? AND ru.is_main_resident = ? AND r.is_active = ?", unitIDs, true, true).
			Or("ru.property_unit_id IN ? AND r.is_active = ?", unitIDs, true).
			Scan(&residentRows).Error; err != nil {
			r.logger.Error().Err(err).Msg("Error obteniendo residentes principales")
			return nil, fmt.Errorf("error obteniendo residentes: %w", err)
		}
	}

	// Crear mapa de unidad -> datos de residente
	type residentInfo struct {
		ID     uint
		Name   string
		IsMain bool
	}
	residentByUnit := make(map[uint][]residentInfo)
	for _, rw := range residentRows {
		residentByUnit[rw.UnitID] = append(residentByUnit[rw.UnitID], residentInfo{ID: rw.ResidentID, Name: rw.ResidentName, IsMain: rw.IsMainResident})
	}

	// PASO 3: Obtener todos los votos de esta votación con las opciones
	var votes []models.Vote
	if len(unitIDs) > 0 {
		if err := r.db.Conn(ctx).
			Preload("VotingOption").
			Where("voting_id = ? AND property_unit_id IN ?", votingID, unitIDs).
			Find(&votes).Error; err != nil {
			r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votos")
			return nil, fmt.Errorf("error obteniendo votos: %w", err)
		}
	}

	// Crear mapa de unidad -> voto
	voteByUnit := make(map[uint]*models.Vote)
	for i := range votes {
		voteByUnit[votes[i].PropertyUnitID] = &votes[i]
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

		// Verificar si la unidad ha votado
		if vote, hasVoted := voteByUnit[unit.ID]; hasVoted {
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

		// Agregar info del residente si existe
		if infos, hasResident := residentByUnit[unit.ID]; hasResident && len(infos) > 0 {
			// Elegir principal si existe; si no, el primero
			chosen := infos[0]
			for _, inf := range infos {
				if inf.IsMain {
					chosen = inf
					break
				}
			}
			dto.ResidentID = &chosen.ID
			dto.ResidentName = &chosen.Name
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

	// PASO 3: Obtener todos los residentes por unidad vía pivote
	type residentRow2 struct {
		UnitID         uint
		ResidentID     uint
		ResidentName   string
		IsMainResident bool
	}
	rows := []residentRow2{}
	if len(unitIDs) > 0 {
		if err := r.db.Conn(ctx).
			Table("horizontal_property.resident_units ru").
			Select("ru.property_unit_id as unit_id, r.id as resident_id, r.name as resident_name, ru.is_main_resident").
			Joins("JOIN horizontal_property.residents r ON r.id = ru.resident_id").
			Where("ru.property_unit_id IN ? AND r.is_active = ?", unitIDs, true).
			Scan(&rows).Error; err != nil {
			r.logger.Error().Err(err).Msg("Error obteniendo residentes")
			return nil, fmt.Errorf("error obteniendo residentes: %w", err)
		}
	}

	residentByUnit := make(map[uint][]residentRow2)
	for _, rw := range rows {
		residentByUnit[rw.UnitID] = append(residentByUnit[rw.UnitID], rw)
	}

	// PASO 4: Combinar en DTOs
	dtos := make([]domain.UnitWithResidentDTO, len(units))
	for i, unit := range units {
		dto := domain.UnitWithResidentDTO{
			PropertyUnitID:     unit.ID,
			PropertyUnitNumber: unit.Number,
		}

		// Agregar residente si existe
		if list, hasResident := residentByUnit[unit.ID]; hasResident && len(list) > 0 {
			chosen := list[0]
			for _, rinfo := range list {
				if rinfo.IsMainResident {
					chosen = rinfo
					break
				}
			}
			dto.ResidentID = &chosen.ResidentID
			dto.ResidentName = &chosen.ResidentName
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
		PropertyUnitID: m.PropertyUnitID,
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

// GetUnvotedUnitsByVoting - Obtiene las unidades que no han votado en una votación específica
func (r *Repository) GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]domain.UnvotedUnit, error) {
	// PASO 1: Obtener el business_id de la votación
	businessID, err := r.getBusinessIDByVotingID(ctx, votingID)
	if err != nil {
		return nil, err
	}

	// PASO 2: Obtener todas las unidades activas del negocio
	units, err := r.getActivePropertyUnits(ctx, businessID, unitNumberFilter)
	if err != nil {
		return nil, err
	}

	// PASO 3: Obtener residentes principales de esas unidades
	unitsWithResidents, err := r.getMainResidentsByUnits(ctx, units)
	if err != nil {
		return nil, err
	}

	// PASO 4: Obtener unidades que ya han votado
	votedUnitIDs, err := r.getVotedUnitIDs(ctx, votingID)
	if err != nil {
		return nil, err
	}

	// PASO 5: Filtrar unidades que no han votado y construir resultado
	unvotedUnits := r.filterUnvotedUnits(unitsWithResidents, votedUnitIDs, units)

	r.logger.Info().Uint("voting_id", votingID).Int("count", len(unvotedUnits)).Msg("Unidades sin votar obtenidas")
	return unvotedUnits, nil
}

// getBusinessIDByVotingID - Obtiene el business_id de una votación
func (r *Repository) getBusinessIDByVotingID(ctx context.Context, votingID uint) (uint, error) {
	var voting models.Voting
	if err := r.db.Conn(ctx).First(&voting, votingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, fmt.Errorf("votación no encontrada")
		}
		r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votación")
		return 0, fmt.Errorf("error obteniendo votación: %w", err)
	}

	// Obtener el business_id a través del grupo de votación
	var votingGroup models.VotingGroup
	if err := r.db.Conn(ctx).First(&votingGroup, voting.VotingGroupID).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_group_id", voting.VotingGroupID).Msg("Error obteniendo grupo de votación")
		return 0, fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}

	return votingGroup.BusinessID, nil
}

// getActivePropertyUnits - Obtiene todas las unidades activas de un negocio
func (r *Repository) getActivePropertyUnits(ctx context.Context, businessID uint, unitNumberFilter string) ([]models.PropertyUnit, error) {
	var units []models.PropertyUnit
	query := r.db.Conn(ctx).Where("business_id = ? AND is_active = ?", businessID, true)

	// Aplicar filtro por número de unidad si se proporciona
	if unitNumberFilter != "" {
		// Normalizar el filtro: convertir a mayúsculas y agregar espacios si es necesario
		normalizedFilter := strings.ToUpper(strings.TrimSpace(unitNumberFilter))

		// Si es solo un número, buscar en cualquier parte del número de unidad
		if matched, _ := regexp.MatchString(`^\d+$`, normalizedFilter); matched {
			query = query.Where("UPPER(number) LIKE ?", "%"+normalizedFilter+"%")
		} else {
			// Si contiene letras, buscar que empiece con el término
			query = query.Where("UPPER(number) LIKE ?", normalizedFilter+"%")
		}
	}

	if err := query.Order("number ASC").Find(&units).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Str("unit_filter", unitNumberFilter).Msg("Error obteniendo unidades activas")
		return nil, fmt.Errorf("error obteniendo unidades activas: %w", err)
	}
	return units, nil
}

// getMainResidentsByUnits - Obtiene los residentes principales de las unidades
func (r *Repository) getMainResidentsByUnits(ctx context.Context, units []models.PropertyUnit) (map[uint]*models.Resident, error) {
	if len(units) == 0 {
		return make(map[uint]*models.Resident), nil
	}

	unitIDs := make([]uint, len(units))
	for i, unit := range units {
		unitIDs[i] = unit.ID
	}

	var residentUnits []models.ResidentUnit
	if err := r.db.Conn(ctx).
		Preload("Resident").
		Where("property_unit_id IN ? AND is_main_resident = ?", unitIDs, true).
		Find(&residentUnits).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo residentes principales")
		return nil, fmt.Errorf("error obteniendo residentes principales: %w", err)
	}

	// Crear mapa de unit_id -> resident
	unitToResident := make(map[uint]*models.Resident)
	for i := range residentUnits {
		if residentUnits[i].Resident.IsActive {
			unitToResident[residentUnits[i].PropertyUnitID] = &residentUnits[i].Resident
		}
	}

	return unitToResident, nil
}

// getVotedUnitIDs - Obtiene los IDs de las unidades que ya han votado
func (r *Repository) getVotedUnitIDs(ctx context.Context, votingID uint) (map[uint]bool, error) {
	// Obtener todos los votos de esta votación
	var votes []models.Vote
	if err := r.db.Conn(ctx).
		Where("voting_id = ?", votingID).
		Find(&votes).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votos")
		return nil, fmt.Errorf("error obteniendo votos: %w", err)
	}

	// Obtener los IDs de las unidades que votaron
	unitIDs := make([]uint, len(votes))
	for i, vote := range votes {
		unitIDs[i] = vote.PropertyUnitID
	}

	if len(unitIDs) == 0 {
		return make(map[uint]bool), nil
	}

	// Crear mapa de unit_id -> true para las unidades que ya votaron
	votedUnits := make(map[uint]bool)
	for _, unitID := range unitIDs {
		votedUnits[unitID] = true
	}

	return votedUnits, nil
}

// GetResidentMainUnitID - Obtiene el ID de la unidad principal de un residente
func (r *Repository) GetResidentMainUnitID(ctx context.Context, residentID uint) (uint, error) {
	var residentUnit models.ResidentUnit
	if err := r.db.Conn(ctx).
		Where("resident_id = ? AND is_main_resident = ?", residentID, true).
		First(&residentUnit).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, fmt.Errorf("residente no tiene unidad principal asignada")
		}
		r.logger.Error().Err(err).Uint("resident_id", residentID).Msg("Error obteniendo unidad principal del residente")
		return 0, fmt.Errorf("error obteniendo unidad principal: %w", err)
	}
	return residentUnit.PropertyUnitID, nil
}

// filterUnvotedUnits - Filtra las unidades que no han votado y construye el resultado final
func (r *Repository) filterUnvotedUnits(unitsWithResidents map[uint]*models.Resident, votedUnitIDs map[uint]bool, allUnits []models.PropertyUnit) []domain.UnvotedUnit {
	var unvotedUnits []domain.UnvotedUnit

	// Incluir TODAS las unidades del negocio, con o sin residente
	for _, unit := range allUnits {
		// Solo incluir si la unidad no ha votado
		if !votedUnitIDs[unit.ID] {
			unvotedUnit := domain.UnvotedUnit{
				UnitID:       unit.ID,
				UnitNumber:   unit.Number,
				ResidentID:   0, // Sin residente por defecto
				ResidentName: "Sin residente asignado",
			}

			// Si tiene residente asociado, usar esa información
			if resident, hasResident := unitsWithResidents[unit.ID]; hasResident {
				unvotedUnit.ResidentID = resident.ID
				unvotedUnit.ResidentName = resident.Name
			}

			unvotedUnits = append(unvotedUnits, unvotedUnit)
		}
	}

	return unvotedUnits
}

// CheckUnitAttendanceForVoting - Verifica si una unidad tiene asistencia marcada para una votación
func (r *Repository) CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
	// Primero obtener el voting_group_id de la votación
	var voting models.Voting
	if err := r.db.Conn(ctx).
		Select("voting_group_id").
		Where("id = ?", votingID).
		First(&voting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, fmt.Errorf("votación no encontrada")
		}
		r.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votación")
		return false, fmt.Errorf("error obteniendo votación: %w", err)
	}

	// Buscar si existe una lista de asistencia para este grupo de votación
	var attendanceList models.AttendanceList
	if err := r.db.Conn(ctx).
		Where("voting_group_id = ? AND is_active = ?", voting.VotingGroupID, true).
		First(&attendanceList).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Si no hay lista de asistencia, permitir votar (no hay restricción)
			return true, nil
		}
		r.logger.Error().Err(err).Uint("voting_group_id", voting.VotingGroupID).Msg("Error obteniendo lista de asistencia")
		return false, fmt.Errorf("error obteniendo lista de asistencia: %w", err)
	}

	// Verificar si la unidad tiene asistencia marcada en la lista
	var attendanceRecord models.AttendanceRecord
	if err := r.db.Conn(ctx).
		Where("attendance_list_id = ? AND property_unit_id = ? AND (attended_as_owner = ? OR attended_as_proxy = ?)",
			attendanceList.ID, propertyUnitID, true, true).
		First(&attendanceRecord).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// No tiene asistencia marcada
			return false, nil
		}
		r.logger.Error().Err(err).
			Uint("attendance_list_id", attendanceList.ID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error verificando asistencia de la unidad")
		return false, fmt.Errorf("error verificando asistencia: %w", err)
	}

	// Tiene asistencia marcada
	return true, nil
}
