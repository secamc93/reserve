package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ListVotingsByGroupWithVoteStatus obtiene todas las votaciones de un grupo con estado de voto
// Incluye información de si la unidad ya votó en cada votación
func (r *Repository) ListVotingsByGroupWithVoteStatus(
	ctx context.Context,
	groupID uint,
	propertyUnitID uint,
) ([]domain.VotingWithStatusDTO, error) {
	var results []domain.VotingWithStatusDTO

	query := r.db.Conn(ctx).
		Table("horizontal_property.votings v").
		Select(`
			v.id,
			v.voting_group_id,
			v.title,
			v.description,
			v.voting_type,
			v.is_secret,
			v.allow_abstention,
			v.is_active,
			v.display_order,
			v.required_percentage,
			COUNT(DISTINCT vo.id) as options_count,
			CASE WHEN vt.id IS NOT NULL THEN true ELSE false END as has_voted
		`).
		Joins("LEFT JOIN horizontal_property.voting_options vo ON v.id = vo.voting_id AND vo.deleted_at IS NULL").
		Joins("LEFT JOIN horizontal_property.votes vt ON v.id = vt.voting_id AND vt.property_unit_id = ? AND vt.deleted_at IS NULL", propertyUnitID).
		Where("v.voting_group_id = ?", groupID).
		Where("v.deleted_at IS NULL").
		Group("v.id, vt.id").
		Order("v.display_order ASC")

	if err := query.Scan(&results).Error; err != nil {
		r.logger.Error().Err(err).
			Uint("group_id", groupID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error obteniendo votaciones del grupo con estado")
		return nil, fmt.Errorf("error obteniendo votaciones del grupo: %w", err)
	}

	r.logger.Info().
		Uint("group_id", groupID).
		Uint("property_unit_id", propertyUnitID).
		Int("count", len(results)).
		Msg("Votaciones del grupo obtenidas exitosamente")

	return results, nil
}
