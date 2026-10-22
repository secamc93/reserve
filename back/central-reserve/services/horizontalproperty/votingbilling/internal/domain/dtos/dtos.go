package dtos

import "central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"

// BillingStatus es el estado de cobro de un grupo de votación.
type BillingStatus struct {
	VotingGroupID    uint
	BusinessID       uint
	RequiredDays     int
	PaidDays         int
	DueDays          int
	PricePerDayCOP   int64
	AmountDueInCents int64
	Exempt           bool
	Paid             bool
	GatewayEnabled   bool
	Payments         []entities.Payment
}

// CheckoutRequest pide iniciar el pago de los días pendientes de un grupo.
type CheckoutRequest struct {
	BusinessID    uint
	VotingGroupID uint
	UserID        *uint
	RedirectURL   string
}

// Checkout es el pago creado y la URL de la pasarela donde se completa.
type Checkout struct {
	Payment     entities.Payment
	CheckoutURL string
}

// CheckoutParams es lo que la pasarela necesita para armar el enlace de pago.
type CheckoutParams struct {
	Reference     string
	AmountInCents int64
	Currency      string
	RedirectURL   string
}

// ManualPaymentRequest registra un pago recibido por fuera de la pasarela (super admin).
type ManualPaymentRequest struct {
	BusinessID    uint
	VotingGroupID uint
	UserID        *uint
	Notes         string
}

// ExemptionRequest marca o desmarca una propiedad como exenta del cobro (super admin).
type ExemptionRequest struct {
	BusinessID uint
	Exempt     bool
	UserID     *uint
}
