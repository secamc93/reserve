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

// coefficientsByOption devuelve, por opción, la suma de los coeficientes de participación de las
// unidades que la votaron, y el total de coeficientes de las unidades activas de la propiedad de la
// votación (denominador del porcentaje por coeficiente).
//
// Tabla consultada fuera del módulo: property_units (replicada localmente, ver repository-isolation.md).
func (r *Repository) coefficientsByOption(ctx context.Context, votingID uint) (map[uint]float64, float64, error) {
	conn := r.db.Conn(ctx)

	var rows []struct {
		VotingOptionID uint
		Coef           float64
	}
	if err := conn.Model(&models.Vote{}).
		Select("votes.voting_option_id, COALESCE(SUM(pu.participation_coefficient), 0) AS coef").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = votes.property_unit_id").
		Where("votes.voting_id = ?", votingID).
		Group("votes.voting_option_id").
		Scan(&rows).Error; err != nil {
		return nil, 0, fmt.Errorf("error sumando coeficientes por opción: %w", err)
	}
	byOption := make(map[uint]float64, len(rows))
	for _, row := range rows {
		byOption[row.VotingOptionID] = row.Coef
	}

	var voting models.Voting
	if err := conn.Select("id", "voting_group_id").Where("id = ?", votingID).First(&voting).Error; err != nil {
		return nil, 0, fmt.Errorf("error obteniendo votación: %w", err)
	}
	var group models.VotingGroup
	if err := conn.Select("id", "business_id").Where("id = ?", voting.VotingGroupID).First(&group).Error; err != nil {
		return nil, 0, fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}
	var total float64
	if err := conn.Model(&models.PropertyUnit{}).
		Select("COALESCE(SUM(participation_coefficient), 0)").
		Where("business_id = ? AND is_active = ?", group.BusinessID, true).
		Scan(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error sumando coeficientes de la propiedad: %w", err)
	}
	return byOption, total, nil
}
