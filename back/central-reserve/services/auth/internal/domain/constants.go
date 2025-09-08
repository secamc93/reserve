package domain

const (
	// SuperAdministrator es el rol con más privilegios (ID: 1)
	SuperAdministrator = 1

	// Administrator es el rol de administrador (ID: 2)
	Administrator = 2

	// Manager es el rol de gerente (ID: 3)
	Manager = 3

	// User es el rol de usuario básico (ID: 4)
	User = 4

	// APIUser es el rol para usuarios de API (ID: 5)
	APIUser = 5
)

// RoleNames mapea los IDs de roles a nombres
var RoleNames = map[int]string{
	SuperAdministrator: "super_administrator",
	Administrator:      "administrator",
	Manager:            "manager",
	User:               "user",
	APIUser:            "api_user",
}

// RoleCodes mapea los IDs de roles a códigos
var RoleCodes = map[int]string{
	SuperAdministrator: "SUPER_ADMIN",
	Administrator:      "ADMIN",
	Manager:            "MANAGER",
	User:               "USER",
	APIUser:            "API_USER",
}
