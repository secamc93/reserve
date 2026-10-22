package request

// CheckoutRequest inicia el pago de los días pendientes de un grupo.
type CheckoutRequest struct {
	RedirectURL string `json:"redirect_url" binding:"required"`
}

// SyncRequest pide confirmar una transacción de la pasarela al volver del pago.
type SyncRequest struct {
	TransactionID string `json:"transaction_id" binding:"required"`
}

// ManualPaymentRequest registra un pago recibido por fuera de la pasarela.
type ManualPaymentRequest struct {
	Notes string `json:"notes" binding:"max=500"`
}

// ExemptionRequest marca o desmarca la propiedad como exenta del cobro.
type ExemptionRequest struct {
	Exempt *bool `json:"exempt" binding:"required"`
}
