package repository

import (
	"context"
	"errors"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"

	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// ValidateVoteTarget verifica, antes de registrar un voto, que la opción pertenezca a la votación
// y que la unidad pertenezca a la misma propiedad (business) que el grupo de la votación.
//
// Tablas consultadas: votings, voting_groups, voting_options (de este módulo) y property_units
// (gestionada por el módulo unit; consulta replicada localmente, ver repository-isolation.md).
func (r *Repository) ValidateVoteTarget(ctx context.Context, votingID, propertyUnitID, votingOptionID uint) error {
	conn := r.db.Conn(ctx)

	var option models.VotingOption
	if err := conn.Select("id", "voting_id").Where("id = ?", votingOptionID).First(&option).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.ErrVotingOptionNotFound
		}
		return fmt.Errorf("error obteniendo opción de votación: %w", err)
	}
	if option.VotingID != votingID {
		return domain.ErrOptionNotInVoting
	}

	var voting models.Voting
	if err := conn.Select("id", "voting_group_id").Where("id = ?", votingID).First(&voting).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.ErrVotingNotFound
		}
		return fmt.Errorf("error obteniendo votación: %w", err)
	}

	var group models.VotingGroup
	if err := conn.Select("id", "business_id").Where("id = ?", voting.VotingGroupID).First(&group).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.ErrVotingGroupNotFound
		}
		return fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}

	var unit models.PropertyUnit
	if err := conn.Select("id", "business_id").Where("id = ?", propertyUnitID).First(&unit).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.ErrUnitNotInVotingBusiness
		}
		return fmt.Errorf("error obteniendo unidad: %w", err)
	}
	if unit.BusinessID != group.BusinessID {
		return domain.ErrUnitNotInVotingBusiness
	}
	return nil
}
