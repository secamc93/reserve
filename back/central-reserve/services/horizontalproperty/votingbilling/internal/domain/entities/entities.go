package entities

import "time"

// Estados de un pago. Son los de Wompi; los pagos manuales nacen APPROVED.
const (
	StatusPending  = "PENDING"
	StatusApproved = "APPROVED"
	StatusDeclined = "DECLINED"
	StatusVoided   = "VOIDED"
	StatusError    = "ERROR"
)

// Proveedores de pago.
const (
	ProviderWompi  = "wompi"
	ProviderManual = "manual"
)

// VotingGroup es lo que el cobro necesita saber de un grupo de votación (asamblea).
type VotingGroup struct {
	ID              uint
	BusinessID      uint
	Name            string
	VotingStartDate time.Time
	VotingEndDate   time.Time
}

// Payment es un pago de días de votación de un grupo.
type Payment struct {
	ID                    uint
	BusinessID            uint
	VotingGroupID         uint
	Reference             string
	Provider              string
	Days                  int
	AmountInCents         int64
	Currency              string
	Status                string
	ProviderTransactionID string
	PaymentMethodType     string
	PaidAt                *time.Time
	CreatedByUserID       *uint
	Notes                 string
	CreatedAt             time.Time
}

// Transaction es una transacción tal como la reporta la pasarela.
type Transaction struct {
	ID                string
	Reference         string
	Status            string
	AmountInCents     int64
	Currency          string
	PaymentMethodType string
}
