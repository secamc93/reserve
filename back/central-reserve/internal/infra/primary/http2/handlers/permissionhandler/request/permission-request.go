package request

// CreatePermissionRequest representa la solicitud para crear un permiso
type CreatePermissionRequest struct {
	Name        string `json:"name" binding:"required" example:"Crear usuarios"`
	Code        string `json:"code" binding:"required" example:"users:create"`
	Description string `json:"description" example:"Permite crear nuevos usuarios en el sistema"`
	Resource    string `json:"resource" binding:"required" example:"users"`
	Action      string `json:"action" binding:"required" example:"create"`
	ScopeID     uint   `json:"scope_id" binding:"required" example:"1"`
}

// UpdatePermissionRequest representa la solicitud para actualizar un permiso
type UpdatePermissionRequest struct {
	Name        string `json:"name" binding:"required" example:"Crear usuarios"`
	Code        string `json:"code" binding:"required" example:"users:create"`
	Description string `json:"description" example:"Permite crear nuevos usuarios en el sistema"`
	Resource    string `json:"resource" binding:"required" example:"users"`
	Action      string `json:"action" binding:"required" example:"create"`
	ScopeID     uint   `json:"scope_id" binding:"required" example:"1"`
}
