package mappers

import (
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"
)

func ToPlans(plans []entities.Plan) []response.Plan {
	out := make([]response.Plan, len(plans))
	for i, p := range plans {
		out[i] = response.Plan{Code: p.Code, Name: p.Name, MaxProperties: p.MaxProperties, PriceCOP: p.PriceCOP, DurationDays: entities.DurationDays}
	}
	return out
}

func ToMembership(m entities.Membership) response.Membership {
	ids := m.BusinessIDs
	if ids == nil {
		ids = []uint{}
	}
	return response.Membership{ID: m.ID, PlanCode: m.PlanCode, MaxProperties: m.MaxProperties, OwnerUserID: m.OwnerUserID, Status: m.Status,
		Source: m.Source, StartsAt: m.StartsAt, EndsAt: m.EndsAt, Notes: m.Notes, BusinessIDs: ids, CreatedAt: m.CreatedAt}
}

func ToMemberships(ms []entities.Membership) []response.Membership {
	out := make([]response.Membership, len(ms))
	for i, m := range ms {
		out[i] = ToMembership(m)
	}
	return out
}
