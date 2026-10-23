package repository

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

const upcomingAssembliesLimit = 20

// ActiveMembership trae la membresía vigente que cubre la propiedad (la que vence más tarde).
//
// Tablas consultadas: memberships y membership_properties (módulo membership). Replicado localmente.
func (r *repository) ActiveMembership(ctx context.Context, businessID uint, at time.Time) (*entities.ActiveMembership, error) {
	var m models.Membership
	err := r.db.Conn(ctx).Model(&models.Membership{}).
		Joins("JOIN horizontal_property.membership_properties mp ON mp.membership_id = horizontal_property.memberships.id AND mp.deleted_at IS NULL").
		Where("mp.business_id = ? AND horizontal_property.memberships.status = ? AND horizontal_property.memberships.starts_at <= ? AND horizontal_property.memberships.ends_at > ?", businessID, "ACTIVE", at, at).
		Order("horizontal_property.memberships.ends_at DESC").Limit(1).Find(&m).Error
	if err != nil {
		return nil, fmt.Errorf("error leyendo membresía vigente: %w", err)
	}
	if m.ID == 0 || m.EndsAt == nil {
		return nil, nil
	}
	return &entities.ActiveMembership{PlanCode: m.PlanCode, EndsAt: *m.EndsAt}, nil
}

// PurchasedDates lista las fechas compradas de la propiedad desde una fecha (AAAA-MM-DD).
func (r *repository) PurchasedDates(ctx context.Context, businessID uint, from string) ([]string, error) {
	var dates []string
	err := r.db.Conn(ctx).Model(&models.VotingDay{}).
		Select("to_char(voting_date, 'YYYY-MM-DD')").
		Where("business_id = ? AND voting_date >= ?", businessID, from).
		Order("voting_date").Scan(&dates).Error
	if err != nil {
		return nil, fmt.Errorf("error listando días comprados: %w", err)
	}
	return dates, nil
}

// UpcomingAssemblies lista los grupos de votación activos que todavía no terminan.
//
// Tabla consultada: voting_groups (módulo de votaciones). Replicado localmente.
func (r *repository) UpcomingAssemblies(ctx context.Context, businessID uint, now time.Time) ([]entities.UpcomingAssembly, error) {
	var groups []models.VotingGroup
	err := r.db.Conn(ctx).Select("id", "name", "voting_start_date", "voting_end_date").
		Where("business_id = ? AND is_active = ? AND voting_end_date >= ?", businessID, true, now).
		Order("voting_start_date").Limit(upcomingAssembliesLimit).Find(&groups).Error
	if err != nil {
		return nil, fmt.Errorf("error listando asambleas próximas: %w", err)
	}
	out := make([]entities.UpcomingAssembly, len(groups))
	for i, g := range groups {
		out[i] = entities.UpcomingAssembly{GroupID: g.ID, Name: g.Name, Start: g.VotingStartDate, End: g.VotingEndDate}
	}
	return out, nil
}
