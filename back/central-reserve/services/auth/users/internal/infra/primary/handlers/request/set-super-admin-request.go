package request

// SetSuperAdminRequest pide dar (true) o quitar (false) el rol de super admin.
type SetSuperAdminRequest struct {
	Enabled *bool `json:"enabled" binding:"required" example:"true"`
}
