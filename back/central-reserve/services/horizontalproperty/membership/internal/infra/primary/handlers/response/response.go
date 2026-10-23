package response

import "time"

// ErrorResponse es la respuesta de error del módulo.
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// Success envuelve una respuesta exitosa.
type Success struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

// Plan es un plan a la venta.
type Plan struct {
	Code          string `json:"code"`
	Name          string `json:"name"`
	MaxProperties int    `json:"max_properties"`
	PriceCOP      int64  `json:"price_cop"`
	DurationDays  int    `json:"duration_days"`
}

// Membership es una membresía.
type Membership struct {
	ID            uint       `json:"id"`
	PlanCode      string     `json:"plan_code"`
	MaxProperties int        `json:"max_properties"`
	OwnerUserID   *uint      `json:"owner_user_id,omitempty"`
	Status        string     `json:"status"`
	Source        string     `json:"source"`
	StartsAt      *time.Time `json:"starts_at,omitempty"`
	EndsAt        *time.Time `json:"ends_at,omitempty"`
	Notes         string     `json:"notes,omitempty"`
	BusinessIDs   []uint     `json:"business_ids"`
	CreatedAt     time.Time  `json:"created_at"`
}

// Checkout es la membresía pendiente y el enlace de pago.
type Checkout struct {
	Membership    Membership `json:"membership"`
	Reference     string     `json:"reference"`
	AmountInCents int64      `json:"amount_in_cents"`
	CheckoutURL   string     `json:"checkout_url"`
}
