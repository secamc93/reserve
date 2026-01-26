package domain

// LoginResult representa el resultado completo del login
type LoginResult struct {
	Token        string
	User         User
	Businesses   []Business
	Scope        string
	IsSuperAdmin bool
}

// User representa la información del usuario autenticado
type User struct {
	ID    uint
	Email string
	Name  string
}

// Business representa un negocio al que el usuario tiene acceso
type Business struct {
	ID             uint
	Name           string
	Code           string
	BusinessTypeID uint
}

// Credentials representa las credenciales de autenticación
type Credentials struct {
	Email    string
	Password string
}
