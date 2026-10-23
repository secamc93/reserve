package entities

import "time"

// Estados de un pago (los de Wompi). Los manuales y las cortesías nacen APPROVED.
const (
	StatusPending  = "PENDING"
	StatusApproved = "APPROVED"
	StatusDeclined = "DECLINED"
	StatusVoided   = "VOIDED"
	StatusError    = "ERROR"
)

// Origen de los días de votación.
const (
	SourceWompi    = "wompi"
	SourceManual   = "manual"
	SourceCourtesy = "cortesia"
)

// DayPayment es la compra de una o varias fechas de votación de una propiedad.
type DayPayment struct {
	ID                    uint
	BusinessID            uint
	Reference             string
	Source                string
	Dates                 []string // "2006-01-02", hora de Colombia
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

// ActiveMembership es la membresía vigente que cubre una propiedad.
type ActiveMembership struct {
	PlanCode string
	EndsAt   time.Time
}

// UpcomingAssembly es un grupo de votación (asamblea) que todavía no termina.
type UpcomingAssembly struct {
	GroupID uint
	Name    string
	Start   time.Time
	End     time.Time
}

// PropertyAdmin es un usuario que administra la propiedad (business_staff).
type PropertyAdmin struct {
	UserID uint
	Name   string
	Email  string
	Exempt bool
}
