package dtos

import "central_reserve/services/horizontalproperty/membership/internal/domain/entities"

// CheckoutRequest pide comprar un plan para unas propiedades.
type CheckoutRequest struct {
	UserID       uint
	IsSuperAdmin bool
	PlanCode     string
	BusinessIDs  []uint
	RedirectURL  string
}

// Checkout es la membresía pendiente, su pago y el enlace de la pasarela.
type Checkout struct {
	Membership  entities.Membership
	Payment     entities.Payment
	CheckoutURL string
}

// SyncRequest confirma un pago al volver de la pasarela.
type SyncRequest struct {
	UserID        uint
	IsSuperAdmin  bool
	TransactionID string
}

// GrantRequest activa una membresía sin pasarela (manual o cortesía). Super admin. Con PlanCode
// CUSTOM, MaxProperties es libre.
type GrantRequest struct {
	PlanCode      string
	MaxProperties int
	BusinessIDs   []uint
	Source        string
	Notes         string
	OwnerUserID   *uint
	ByUserID      *uint
}
