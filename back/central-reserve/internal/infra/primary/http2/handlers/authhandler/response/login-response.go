package response

import "time"

// LoginResponse representa la respuesta simplificada del login
type LoginResponse struct {
	User                  UserInfo `json:"user"`
	Token                 string   `json:"token"`
	RequirePasswordChange bool     `json:"require_password_change"`
}

// UserInfo representa la información del usuario en la respuesta
type UserInfo struct {
	ID          uint       `json:"id"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	Phone       string     `json:"phone"`
	AvatarURL   string     `json:"avatar_url"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at"`
}

// RoleInfo representa la información del rol en la respuesta
type RoleInfo struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Level       int    `json:"level"`
	Scope       string `json:"scope"`
}

// PermissionInfo representa la información del permiso en la respuesta
type PermissionInfo struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Resource    string `json:"resource"`
	Action      string `json:"action"`
	Scope       string `json:"scope"`
}

// ResourcePermissions representa los permisos agrupados por recurso
type ResourcePermissions struct {
	Resource     string           `json:"resource"`
	ResourceName string           `json:"resource_name"`
	Actions      []PermissionInfo `json:"actions"`
}

// UserRolesPermissionsResponse representa la respuesta de roles y permisos del usuario
type UserRolesPermissionsResponse struct {
	IsSuper     bool                  `json:"is_super"`
	Roles       []RoleInfo            `json:"roles"`
	Permissions []PermissionInfo      `json:"permissions"` // Mantener para compatibilidad
	Resources   []ResourcePermissions `json:"resources"`   // Nuevo: permisos agrupados por recurso
}

// LoginSuccessResponse representa la respuesta exitosa del login para Swagger
type LoginSuccessResponse struct {
	Success bool          `json:"success"`
	Data    LoginResponse `json:"data"`
}

// UserRolesPermissionsSuccessResponse representa la respuesta exitosa de roles y permisos
type UserRolesPermissionsSuccessResponse struct {
	Success bool                         `json:"success"`
	Data    UserRolesPermissionsResponse `json:"data"`
}

// LoginErrorResponse representa la respuesta de error del login para Swagger
type LoginErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

// LoginBadRequestResponse representa la respuesta de error 400 para Swagger
type LoginBadRequestResponse struct {
	Error   string `json:"error"`
	Details string `json:"details"`
}
