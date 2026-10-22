package mappers

import (
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"
)

// ToPayment convierte un pago del dominio a la respuesta HTTP.
func ToPayment(p entities.Payment) response.Payment {
	return response.Payment{
		ID:                    p.ID,
		Reference:             p.Reference,
		Provider:              p.Provider,
		Days:                  p.Days,
		AmountInCents:         p.AmountInCents,
		Currency:              p.Currency,
		Status:                p.Status,
		ProviderTransactionID: p.ProviderTransactionID,
		PaymentMethodType:     p.PaymentMethodType,
		PaidAt:                p.PaidAt,
		Notes:                 p.Notes,
		CreatedAt:             p.CreatedAt,
	}
}

// ToBillingStatus convierte el estado de cobro a la respuesta HTTP.
func ToBillingStatus(s *dtos.BillingStatus) response.BillingStatus {
	payments := make([]response.Payment, len(s.Payments))
	for i, p := range s.Payments {
		payments[i] = ToPayment(p)
	}
	return response.BillingStatus{
		VotingGroupID:    s.VotingGroupID,
		BusinessID:       s.BusinessID,
		RequiredDays:     s.RequiredDays,
		PaidDays:         s.PaidDays,
		DueDays:          s.DueDays,
		PricePerDayCOP:   s.PricePerDayCOP,
		AmountDueInCents: s.AmountDueInCents,
		Exempt:           s.Exempt,
		Paid:             s.Paid,
		GatewayEnabled:   s.GatewayEnabled,
		Payments:         payments,
	}
}

// ToCheckout convierte el checkout a la respuesta HTTP.
func ToCheckout(c *dtos.Checkout) response.Checkout {
	return response.Checkout{Payment: ToPayment(c.Payment), CheckoutURL: c.CheckoutURL}
}
