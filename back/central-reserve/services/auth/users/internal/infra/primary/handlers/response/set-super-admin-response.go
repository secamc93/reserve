package response

// SetSuperAdminResponse confirma el cambio del rol de super admin.
type SetSuperAdminResponse struct {
	Success      bool   `json:"success" example:"true"`
	Message      string `json:"message" example:"El usuario ahora es super admin"`
	IsSuperAdmin bool   `json:"is_super_admin" example:"true"`
}
