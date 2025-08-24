package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// UserContext contiene la información del usuario autenticado
type UserContext struct {
	UserID      uint
	Email       string
	BusinessIDs []uint // Lista de IDs de negocios a los que pertenece
	Roles       []string
	Permissions []string
}

// AuthService maneja la autenticación y autorización
type AuthService struct {
	db *gorm.DB
}

// NewAuthService crea una nueva instancia del servicio de autenticación
func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

// AuthenticateUser autentica un usuario y retorna su contexto
func (as *AuthService) AuthenticateUser(email, password string) (*UserContext, error) {
	var user models.User
	err := as.db.Preload("Roles.Permissions").Preload("Businesses").Where("email = ? AND is_active = ?", email, true).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("usuario no encontrado o inactivo")
		}
		return nil, err
	}

	// TODO: Implementar verificación de contraseña con bcrypt
	// if !CheckPasswordHash(password, user.Password) {
	//     return nil, errors.New("contraseña incorrecta")
	// }

	// Construir contexto del usuario
	userContext := &UserContext{
		UserID:      user.ID,
		Email:       user.Email,
		BusinessIDs: make([]uint, 0),
		Roles:       make([]string, 0),
		Permissions: make([]string, 0),
	}

	// Extraer IDs de negocios
	for _, business := range user.Businesses {
		userContext.BusinessIDs = append(userContext.BusinessIDs, business.ID)
	}

	// Extraer roles y permisos
	permissionSet := make(map[string]bool)
	for _, role := range user.Roles {
		userContext.Roles = append(userContext.Roles, role.Name)
		for _, permission := range role.Permissions {
			permissionKey := fmt.Sprintf("%s:%s", permission.Resource.Name, permission.Action.Name)
			if !permissionSet[permissionKey] {
				permissionSet[permissionKey] = true
				userContext.Permissions = append(userContext.Permissions, permissionKey)
			}
		}
	}

	return userContext, nil
}

// HasPermission verifica si un usuario tiene un permiso específico
func (as *AuthService) HasPermission(userCtx *UserContext, resource, action string) bool {
	permissionKey := fmt.Sprintf("%s:%s", resource, action)
	for _, permission := range userCtx.Permissions {
		if permission == permissionKey {
			return true
		}
	}
	return false
}

// HasRole verifica si un usuario tiene un rol específico
func (as *AuthService) HasRole(userCtx *UserContext, roleCode string) bool {
	for _, role := range userCtx.Roles {
		if role == roleCode {
			return true
		}
	}
	return false
}

// HasAnyRole verifica si un usuario tiene al menos uno de los roles especificados
func (as *AuthService) HasAnyRole(userCtx *UserContext, roleCodes ...string) bool {
	for _, roleCode := range roleCodes {
		if as.HasRole(userCtx, roleCode) {
			return true
		}
	}
	return false
}

// IsSuperUser verifica si el usuario es un super usuario
func (as *AuthService) IsSuperUser(userCtx *UserContext) bool {
	// Verificar si el usuario tiene rol de super admin o platform admin
	return as.HasAnyRole(userCtx, "super_admin", "platform_admin")
}

// IsBusinessUser verifica si el usuario pertenece a algún negocio
func (as *AuthService) IsBusinessUser(userCtx *UserContext) bool {
	return len(userCtx.BusinessIDs) > 0
}

// CanAccessBusiness verifica si el usuario puede acceder a un negocio específico
func (as *AuthService) CanAccessBusiness(userCtx *UserContext, businessID uint) bool {
	// Super usuarios pueden acceder a cualquier negocio
	if as.IsSuperUser(userCtx) {
		return true
	}

	// Usuarios de negocio solo pueden acceder a sus negocios
	if as.IsBusinessUser(userCtx) {
		for _, id := range userCtx.BusinessIDs {
			if id == businessID {
				return true
			}
		}
	}

	return false
}

// GetUserBusinessIDs retorna los IDs de los negocios del usuario
func (as *AuthService) GetUserBusinessIDs(userCtx *UserContext) []uint {
	return userCtx.BusinessIDs
}

// ContextKey es la clave para almacenar el contexto del usuario
type ContextKey string

const UserContextKey ContextKey = "user_context"

// GetUserFromContext obtiene el contexto del usuario desde el contexto HTTP
func GetUserFromContext(ctx context.Context) (*UserContext, bool) {
	userCtx, ok := ctx.Value(UserContextKey).(*UserContext)
	return userCtx, ok
}

// SetUserInContext establece el contexto del usuario en el contexto HTTP
func SetUserInContext(ctx context.Context, userCtx *UserContext) context.Context {
	return context.WithValue(ctx, UserContextKey, userCtx)
}

// RequirePermission middleware que requiere un permiso específico
func (as *AuthService) RequirePermission(resource, action string) func(*UserContext) error {
	return func(userCtx *UserContext) error {
		if !as.HasPermission(userCtx, resource, action) {
			return fmt.Errorf("permiso requerido: %s:%s", resource, action)
		}
		return nil
	}
}

// RequireRole middleware que requiere un rol específico
func (as *AuthService) RequireRole(roleCode string) func(*UserContext) error {
	return func(userCtx *UserContext) error {
		if !as.HasRole(userCtx, roleCode) {
			return fmt.Errorf("rol requerido: %s", roleCode)
		}
		return nil
	}
}

// RequireAnyRole middleware que requiere al menos uno de los roles especificados
func (as *AuthService) RequireAnyRole(roleCodes ...string) func(*UserContext) error {
	return func(userCtx *UserContext) error {
		if !as.HasAnyRole(userCtx, roleCodes...) {
			return fmt.Errorf("se requiere al menos uno de los roles: %s", strings.Join(roleCodes, ", "))
		}
		return nil
	}
}

// RequireSuperUser middleware que requiere ser super usuario
func (as *AuthService) RequireSuperUser() func(*UserContext) error {
	return func(userCtx *UserContext) error {
		if !as.IsSuperUser(userCtx) {
			return errors.New("se requiere ser super usuario")
		}
		return nil
	}
}

// RequireBusinessAccess middleware que requiere acceso a un negocio específico
func (as *AuthService) RequireBusinessAccess(businessID uint) func(*UserContext) error {
	return func(userCtx *UserContext) error {
		if !as.CanAccessBusiness(userCtx, businessID) {
			return fmt.Errorf("sin acceso al negocio %d", businessID)
		}
		return nil
	}
}
