package request

// CheckoutRequest pide comprar un plan para unas propiedades.
type CheckoutRequest struct {
	PlanCode    string `json:"plan_code" binding:"required"`
	BusinessIDs []uint `json:"business_ids" binding:"required,min=1,max=200"`
	RedirectURL string `json:"redirect_url" binding:"required"`
}

// SyncRequest confirma un pago al volver de la pasarela.
type SyncRequest struct {
	TransactionID string `json:"transaction_id" binding:"required"`
}

// GrantRequest otorga una membresía sin pasarela (super admin).
type GrantRequest struct {
	PlanCode      string `json:"plan_code" binding:"required"`
	MaxProperties int    `json:"max_properties"`
	BusinessIDs   []uint `json:"business_ids" binding:"required,min=1,max=500"`
	Source        string `json:"source" binding:"required,oneof=manual cortesia"`
	Notes         string `json:"notes" binding:"max=500"`
	OwnerUserID   *uint  `json:"owner_user_id"`
}
