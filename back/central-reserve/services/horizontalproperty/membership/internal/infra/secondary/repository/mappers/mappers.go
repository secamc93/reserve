package mappers

import (
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

func MembershipToModel(m *entities.Membership) *models.Membership {
	return &models.Membership{
		PlanCode: m.PlanCode, MaxProperties: m.MaxProperties, OwnerUserID: m.OwnerUserID, Status: m.Status,
		Source: m.Source, StartsAt: m.StartsAt, EndsAt: m.EndsAt, Notes: m.Notes, CreatedByUserID: m.CreatedByUserID,
	}
}

// MembershipToDomain usa businessIDs si se pasan; si no, las propiedades precargadas del modelo.
func MembershipToDomain(m *models.Membership, businessIDs []uint) entities.Membership {
	if businessIDs == nil {
		businessIDs = make([]uint, len(m.Properties))
		for i, p := range m.Properties {
			businessIDs[i] = p.BusinessID
		}
	}
	return entities.Membership{
		ID: m.ID, PlanCode: m.PlanCode, MaxProperties: m.MaxProperties, OwnerUserID: m.OwnerUserID, Status: m.Status,
		Source: m.Source, StartsAt: m.StartsAt, EndsAt: m.EndsAt, Notes: m.Notes, CreatedByUserID: m.CreatedByUserID,
		BusinessIDs: businessIDs, CreatedAt: m.CreatedAt,
	}
}

func MembershipsToDomain(rows []models.Membership) []entities.Membership {
	out := make([]entities.Membership, len(rows))
	for i := range rows {
		out[i] = MembershipToDomain(&rows[i], nil)
	}
	return out
}

func PaymentToModel(p *entities.Payment) *models.MembershipPayment {
	return &models.MembershipPayment{
		MembershipID: p.MembershipID, Reference: p.Reference, AmountInCents: p.AmountInCents, Currency: p.Currency,
		Status: p.Status, ProviderTransactionID: p.ProviderTransactionID, PaymentMethodType: p.PaymentMethodType,
		PaidAt: p.PaidAt, CreatedByUserID: p.CreatedByUserID,
	}
}

func PaymentToDomain(m *models.MembershipPayment) entities.Payment {
	return entities.Payment{
		ID: m.ID, MembershipID: m.MembershipID, Reference: m.Reference, AmountInCents: m.AmountInCents, Currency: m.Currency,
		Status: m.Status, ProviderTransactionID: m.ProviderTransactionID, PaymentMethodType: m.PaymentMethodType,
		PaidAt: m.PaidAt, CreatedByUserID: m.CreatedByUserID,
	}
}
