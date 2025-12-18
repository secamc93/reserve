package domain

// DashboardStats representa las estadísticas del dashboard IAM
type DashboardStats struct {
	Users         UserStats
	Roles         RoleStats
	Permissions   PermissionStats
	Resources     ResourceStats
	Businesses    BusinessStats
	BusinessTypes BusinessTypeStats
}

// UserStats representa las estadísticas de usuarios
type UserStats struct {
	Total      int64
	Active     int64
	Inactive   int64
	SuperUsers int64
}

// RoleStats representa las estadísticas de roles
type RoleStats struct {
	Total  int64
	System int64
	Custom int64
}

// PermissionStats representa las estadísticas de permisos
type PermissionStats struct {
	Total      int64
	Assigned   int64
	Unassigned int64
}

// ResourceStats representa las estadísticas de recursos
type ResourceStats struct {
	Total    int64
	Active   int64
	Inactive int64
}

// BusinessStats representa las estadísticas de negocios
type BusinessStats struct {
	Total    int64
	Active   int64
	Inactive int64
}

// BusinessTypeStats representa las estadísticas de tipos de negocio
type BusinessTypeStats struct {
	Total int64
}


