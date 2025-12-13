package response

// DashboardStatsResponse representa la respuesta de estadísticas del dashboard
type DashboardStatsResponse struct {
	Success bool               `json:"success" example:"true"`
	Data    DashboardStatsData `json:"data"`
}

// DashboardStatsData contiene todas las estadísticas
type DashboardStatsData struct {
	Users         UserStatsResponse         `json:"users"`
	Roles         RoleStatsResponse         `json:"roles"`
	Permissions   PermissionStatsResponse   `json:"permissions"`
	Resources     ResourceStatsResponse     `json:"resources"`
	Businesses    BusinessStatsResponse     `json:"businesses"`
	BusinessTypes BusinessTypeStatsResponse `json:"business_types"`
}

// UserStatsResponse representa las estadísticas de usuarios
type UserStatsResponse struct {
	Total      int64 `json:"total" example:"120"`
	Active     int64 `json:"active" example:"100"`
	Inactive   int64 `json:"inactive" example:"20"`
	SuperUsers int64 `json:"super_users" example:"5"`
}

// RoleStatsResponse representa las estadísticas de roles
type RoleStatsResponse struct {
	Total  int64 `json:"total" example:"15"`
	System int64 `json:"system" example:"5"`
	Custom int64 `json:"custom" example:"10"`
}

// PermissionStatsResponse representa las estadísticas de permisos
type PermissionStatsResponse struct {
	Total      int64 `json:"total" example:"250"`
	Assigned   int64 `json:"assigned" example:"200"`
	Unassigned int64 `json:"unassigned" example:"50"`
}

// ResourceStatsResponse representa las estadísticas de recursos
type ResourceStatsResponse struct {
	Total    int64 `json:"total" example:"30"`
	Active   int64 `json:"active" example:"25"`
	Inactive int64 `json:"inactive" example:"5"`
}

// BusinessStatsResponse representa las estadísticas de negocios
type BusinessStatsResponse struct {
	Total    int64 `json:"total" example:"50"`
	Active   int64 `json:"active" example:"45"`
	Inactive int64 `json:"inactive" example:"5"`
}

// BusinessTypeStatsResponse representa las estadísticas de tipos de negocio
type BusinessTypeStatsResponse struct {
	Total int64 `json:"total" example:"5"`
}

// DashboardErrorResponse representa la respuesta de error para dashboard
type DashboardErrorResponse struct {
	Error string `json:"error" example:"Error interno del servidor"`
}

