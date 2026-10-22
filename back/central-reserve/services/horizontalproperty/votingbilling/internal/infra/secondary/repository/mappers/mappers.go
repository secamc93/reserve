package mappers

import (
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

// PaymentToModel convierte un pago del dominio al modelo de base de datos.
func PaymentToModel(p *entities.Payment) *models.VotingGroupPayment {
	return &models.VotingGroupPayment{
		BusinessID:            p.BusinessID,
		VotingGroupID:         p.VotingGroupID,
		Reference:             p.Reference,
		Provider:              p.Provider,
		Days:                  p.Days,
		AmountInCents:         p.AmountInCents,
		Currency:              p.Currency,
		Status:                p.Status,
		ProviderTransactionID: p.ProviderTransactionID,
		PaymentMethodType:     p.PaymentMethodType,
		PaidAt:                p.PaidAt,
		CreatedByUserID:       p.CreatedByUserID,
		Notes:                 p.Notes,
	}
}

// PaymentToDomain convierte el modelo de base de datos a un pago del dominio.
func PaymentToDomain(m *models.VotingGroupPayment) entities.Payment {
	return entities.Payment{
		ID:                    m.ID,
		BusinessID:            m.BusinessID,
		VotingGroupID:         m.VotingGroupID,
		Reference:             m.Reference,
		Provider:              m.Provider,
		Days:                  m.Days,
		AmountInCents:         m.AmountInCents,
		Currency:              m.Currency,
		Status:                m.Status,
		ProviderTransactionID: m.ProviderTransactionID,
		PaymentMethodType:     m.PaymentMethodType,
		PaidAt:                m.PaidAt,
		CreatedByUserID:       m.CreatedByUserID,
		Notes:                 m.Notes,
		CreatedAt:             m.CreatedAt,
	}
}

// PaymentsToDomain convierte una lista de modelos.
func PaymentsToDomain(rows []models.VotingGroupPayment) []entities.Payment {
	out := make([]entities.Payment, len(rows))
	for i := range rows {
		out[i] = PaymentToDomain(&rows[i])
	}
	return out
}
