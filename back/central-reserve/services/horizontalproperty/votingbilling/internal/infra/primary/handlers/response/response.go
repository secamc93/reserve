package response

import "time"

// ErrorResponse es la respuesta de error del módulo.
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// Payment es un pago de días de votación.
type Payment struct {
	ID                    uint       `json:"id"`
	Reference             string     `json:"reference"`
	Provider              string     `json:"provider"`
	Days                  int        `json:"days"`
	AmountInCents         int64      `json:"amount_in_cents"`
	Currency              string     `json:"currency"`
	Status                string     `json:"status"`
	ProviderTransactionID string     `json:"provider_transaction_id,omitempty"`
	PaymentMethodType     string     `json:"payment_method_type,omitempty"`
	PaidAt                *time.Time `json:"paid_at,omitempty"`
	Notes                 string     `json:"notes,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
}

// BillingStatus es el estado de cobro de un grupo de votación.
type BillingStatus struct {
	VotingGroupID    uint      `json:"voting_group_id"`
	BusinessID       uint      `json:"business_id"`
	RequiredDays     int       `json:"required_days"`
	PaidDays         int       `json:"paid_days"`
	DueDays          int       `json:"due_days"`
	PricePerDayCOP   int64     `json:"price_per_day_cop"`
	AmountDueInCents int64     `json:"amount_due_in_cents"`
	Exempt           bool      `json:"exempt"`
	Paid             bool      `json:"paid"`
	GatewayEnabled   bool      `json:"gateway_enabled"`
	Payments         []Payment `json:"payments"`
}

// Checkout es el pago creado y el enlace de la pasarela.
type Checkout struct {
	Payment     Payment `json:"payment"`
	CheckoutURL string  `json:"checkout_url"`
}

// Success envuelve una respuesta exitosa.
type Success struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}
