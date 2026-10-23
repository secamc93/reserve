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

// DayPayment es una compra de días.
type DayPayment struct {
	ID                uint       `json:"id"`
	Reference         string     `json:"reference"`
	Source            string     `json:"source"`
	Dates             []string   `json:"dates"`
	AmountInCents     int64      `json:"amount_in_cents"`
	Currency          string     `json:"currency"`
	Status            string     `json:"status"`
	PaymentMethodType string     `json:"payment_method_type,omitempty"`
	PaidAt            *time.Time `json:"paid_at,omitempty"`
	Notes             string     `json:"notes,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
}

// Membership es la membresía vigente.
type Membership struct {
	PlanCode string    `json:"plan_code"`
	EndsAt   time.Time `json:"ends_at"`
}

// Assembly es la cobertura de una asamblea próxima.
type Assembly struct {
	GroupID        uint     `json:"group_id"`
	Name           string   `json:"name"`
	Dates          []string `json:"dates"`
	UncoveredDates []string `json:"uncovered_dates"`
}

// Coverage es la cobertura de días de votación de la propiedad.
type Coverage struct {
	BusinessID      uint         `json:"business_id"`
	Today           string       `json:"today"`
	TodayCovered    bool         `json:"today_covered"`
	PropertyExempt  bool         `json:"property_exempt"`
	AdminExempt     bool         `json:"admin_exempt"`
	Membership      *Membership  `json:"membership"`
	PurchasedDates  []string     `json:"purchased_dates"`
	Assemblies      []Assembly   `json:"assemblies"`
	PricePerDayCOP  int64        `json:"price_per_day_cop"`
	GatewayEnabled  bool         `json:"gateway_enabled"`
	RecentPurchases []DayPayment `json:"recent_purchases"`
}

// Checkout es la compra creada y el enlace de pago.
type Checkout struct {
	Payment     DayPayment `json:"payment"`
	CheckoutURL string     `json:"checkout_url"`
}

// PropertyAdmin es un administrador de la propiedad.
type PropertyAdmin struct {
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Exempt bool   `json:"exempt"`
}
