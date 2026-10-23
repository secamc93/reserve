package mappers

import (
	"strings"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

// ToModel convierte una compra de días del dominio al modelo.
func ToModel(p *entities.DayPayment) *models.VotingDayPayment {
	return &models.VotingDayPayment{
		BusinessID:            p.BusinessID,
		Reference:             p.Reference,
		Source:                p.Source,
		Dates:                 strings.Join(p.Dates, ","),
		Days:                  len(p.Dates),
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

// ToDomain convierte el modelo a una compra de días del dominio.
func ToDomain(m *models.VotingDayPayment) entities.DayPayment {
	return entities.DayPayment{
		ID:                    m.ID,
		BusinessID:            m.BusinessID,
		Reference:             m.Reference,
		Source:                m.Source,
		Dates:                 SplitDates(m.Dates),
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

// SplitDates separa "2026-10-24,2026-10-25".
func SplitDates(s string) []string {
	if s == "" {
		return nil
	}
	return strings.Split(s, ",")
}
