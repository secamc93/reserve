package dtos

import (
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

// AssemblyCoverage dice qué fechas de una asamblea próxima están cubiertas.
type AssemblyCoverage struct {
	GroupID        uint
	Name           string
	Dates          []string
	UncoveredDates []string
}

// Coverage es la cobertura de días de votación de una propiedad.
type Coverage struct {
	BusinessID      uint
	Today           string
	TodayCovered    bool
	PropertyExempt  bool
	AdminExempt     bool
	Membership      *entities.ActiveMembership
	PurchasedDates  []string // desde hoy
	Assemblies      []AssemblyCoverage
	PricePerDayCOP  int64
	GatewayEnabled  bool
	RecentPurchases []entities.DayPayment
}

// DaysCheckoutRequest pide pagar fechas de votación por la pasarela.
type DaysCheckoutRequest struct {
	BusinessID  uint
	Dates       []string
	UserID      *uint
	RedirectURL string
	Now         time.Time
}

// Checkout es el pago creado y la URL de la pasarela.
type Checkout struct {
	Payment     entities.DayPayment
	CheckoutURL string
}

// GrantDaysRequest registra fechas pagadas por fuera (manual) o regaladas (cortesía). Super admin.
type GrantDaysRequest struct {
	BusinessID uint
	Dates      []string
	Source     string
	Notes      string
	UserID     *uint
	Now        time.Time
}

// PropertyExemptionRequest exenta o no a una propiedad. Super admin.
type PropertyExemptionRequest struct {
	BusinessID uint
	Exempt     bool
	UserID     *uint
}

// AdminExemptionRequest exenta o no a un administrador (todas sus propiedades). Super admin.
type AdminExemptionRequest struct {
	TargetUserID uint
	Exempt       bool
	Notes        string
	ByUserID     *uint
}
