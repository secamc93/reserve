package request

// DaysCheckoutRequest pide pagar fechas de votación.
type DaysCheckoutRequest struct {
	Dates       []string `json:"dates" binding:"required,min=1,max=31"`
	RedirectURL string   `json:"redirect_url" binding:"required"`
}

// SyncRequest confirma una transacción al volver del pago.
type SyncRequest struct {
	TransactionID string `json:"transaction_id" binding:"required"`
}

// GrantDaysRequest otorga fechas pagadas por fuera (manual) o regaladas (cortesia).
type GrantDaysRequest struct {
	Dates  []string `json:"dates" binding:"required,min=1,max=31"`
	Source string   `json:"source" binding:"required,oneof=manual cortesia"`
	Notes  string   `json:"notes" binding:"max=500"`
}

// ExemptionRequest exenta o no a la propiedad.
type ExemptionRequest struct {
	Exempt *bool `json:"exempt" binding:"required"`
}

// AdminExemptionRequest exenta o no a un administrador (todas sus propiedades).
type AdminExemptionRequest struct {
	UserID uint   `json:"user_id" binding:"required"`
	Exempt *bool  `json:"exempt" binding:"required"`
	Notes  string `json:"notes" binding:"max=500"`
}
