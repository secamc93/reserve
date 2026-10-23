package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"

	"dbpostgres/app/infra/models"
)

// GetVotingCoverage trae los hechos de cobro de la propiedad de la votación en el instante at:
// exención de la propiedad o de alguno de sus administradores, membresía vigente y día comprado.
// No decide nada (eso es domain.VotingCoverage.Covered()).
//
// Tablas consultadas: voting_billing_settings, voting_billing_user_exemptions y voting_days
// (módulo votingbilling), memberships y membership_properties (módulo membership) y
// business_staff (módulo de auth). Consultas replicadas localmente, ver repository-isolation.md.
func (r *Repository) GetVotingCoverage(ctx context.Context, votingID uint, at time.Time) (domain.VotingCoverage, error) {
	var cov domain.VotingCoverage
	conn := r.db.Conn(ctx)

	var voting models.Voting
	if err := conn.Select("id", "voting_group_id").Where("id = ?", votingID).Limit(1).Find(&voting).Error; err != nil {
		return cov, fmt.Errorf("error obteniendo votación: %w", err)
	}
	if voting.ID == 0 {
		return cov, nil
	}
	var group models.VotingGroup
	if err := conn.Select("id", "business_id").Where("id = ?", voting.VotingGroupID).Limit(1).Find(&group).Error; err != nil {
		return cov, fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}
	if group.ID == 0 {
		return cov, nil
	}
	cov.Found = true
	businessID := group.BusinessID

	checks := []struct {
		name  string
		into  *bool
		count func() (int64, error)
	}{
		{"exención de la propiedad", &cov.PropertyExempt, func() (int64, error) {
			var n int64
			err := conn.Model(&models.VotingBillingSetting{}).Where("business_id = ? AND exempt = ?", businessID, true).Count(&n).Error
			return n, err
		}},
		{"exención de administradores", &cov.AdminExempt, func() (int64, error) {
			var n int64
			admins := conn.Model(&models.BusinessStaff{}).Select("user_id").Where("business_id = ?", businessID)
			err := conn.Model(&models.VotingBillingUserExemption{}).Where("exempt = ? AND user_id IN (?)", true, admins).Count(&n).Error
			return n, err
		}},
		{"membresía vigente", &cov.HasMembership, func() (int64, error) {
			var n int64
			err := conn.Model(&models.Membership{}).
				Joins("JOIN horizontal_property.membership_properties mp ON mp.membership_id = horizontal_property.memberships.id AND mp.deleted_at IS NULL").
				Where("mp.business_id = ? AND horizontal_property.memberships.status = ? AND horizontal_property.memberships.starts_at <= ? AND horizontal_property.memberships.ends_at > ?", businessID, "ACTIVE", at, at).
				Count(&n).Error
			return n, err
		}},
		{"día comprado", &cov.HasDay, func() (int64, error) {
			var n int64
			err := conn.Model(&models.VotingDay{}).Where("business_id = ? AND voting_date = ?", businessID, domain.VotingDate(at)).Count(&n).Error
			return n, err
		}},
	}
	for _, c := range checks {
		n, err := c.count()
		if err != nil {
			if isMissingTable(err) {
				r.logger.Warn().Err(err).Uint("voting_id", votingID).Msg("Tablas del cobro sin migrar: el voto no se bloquea por pago")
				return domain.VotingCoverage{Found: true, Unavailable: true}, nil
			}
			return cov, fmt.Errorf("error leyendo %s: %w", c.name, err)
		}
		*c.into = n > 0
	}
	return cov, nil
}

// isMissingTable reconoce el error de Postgres "la tabla no existe" (SQLSTATE 42P01). Producción no
// corre el migrador en el deploy: si el código del cobro llega antes que sus tablas, las votaciones
// no pueden quedar bloqueadas por eso (pasó el 2026-10-22).
func isMissingTable(err error) bool {
	return err != nil && strings.Contains(err.Error(), "SQLSTATE 42P01")
}
