package entities

import "time"

// Estados de una membresía.
const (
	MembershipPending   = "PENDING"
	MembershipActive    = "ACTIVE"
	MembershipCancelled = "CANCELLED"
)

// Estados de un pago (los de Wompi).
const (
	PaymentPending  = "PENDING"
	PaymentApproved = "APPROVED"
)

// Origen de una membresía.
const (
	SourceWompi    = "wompi"
	SourceManual   = "manual"
	SourceCourtesy = "cortesia"
)

// Membership da votaciones ilimitadas en sus propiedades entre StartsAt y EndsAt.
type Membership struct {
	ID              uint
	PlanCode        string
	MaxProperties   int
	OwnerUserID     *uint
	Status          string
	Source          string
	StartsAt        *time.Time
	EndsAt          *time.Time
	Notes           string
	CreatedByUserID *uint
	BusinessIDs     []uint
	CreatedAt       time.Time
}

// Payment es el pago de una membresía por la pasarela.
type Payment struct {
	ID                    uint
	MembershipID          uint
	Reference             string
	AmountInCents         int64
	Currency              string
	Status                string
	ProviderTransactionID string
	PaymentMethodType     string
	PaidAt                *time.Time
	CreatedByUserID       *uint
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
