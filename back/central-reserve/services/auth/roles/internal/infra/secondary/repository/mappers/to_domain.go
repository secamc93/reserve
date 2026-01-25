package mappers

import (
	"central_reserve/services/auth/roles/internal/domain"
	"dbpostgres/app/infra/models"
)

// RoleToDomain convierte un modelo de GORM a entidad de dominio
// Función principal para conversión individual de roles
func RoleToDomain(role models.Role) domain.Role {
	businessTypeID := uint(0)
	businessTypeName := ""
	scopeName := ""
	scopeCode := ""

	if role.BusinessTypeID != nil {
		businessTypeID = *role.BusinessTypeID
	}
	if role.BusinessType != nil {
		businessTypeName = role.BusinessType.Name
	}
	if role.ScopeID > 0 && role.Scope.Name != "" {
		scopeName = role.Scope.Name
		scopeCode = role.Scope.Code
	}

	return domain.Role{
		ID:               role.ID,
		Name:             role.Name,
		Description:      role.Description,
		Level:            role.Level,
		IsSystem:         role.IsSystem,
		ScopeID:          role.ScopeID,
		ScopeName:        scopeName,
		ScopeCode:        scopeCode,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        role.CreatedAt,
		UpdatedAt:        role.UpdatedAt,
	}
}

// RoleToDomainPtr convierte un modelo de GORM a puntero de entidad de dominio
func RoleToDomainPtr(role models.Role) *domain.Role {
	domainRole := RoleToDomain(role)
	return &domainRole
}

// RolesToDomain convierte un slice de modelos GORM a slice de entidades de dominio
func RolesToDomain(roles []models.Role) []domain.Role {
	domainRoles := make([]domain.Role, len(roles))
	for i, role := range roles {
		domainRoles[i] = RoleToDomain(role)
	}
	return domainRoles
}

// PermissionToDomain convierte un permiso de GORM a entidad de dominio
func PermissionToDomain(permission models.Permission) domain.Permission {
	businessTypeID := uint(0)
	businessTypeName := ""
	if permission.BusinessTypeID != nil {
		businessTypeID = *permission.BusinessTypeID
	}

	scopeName := ""
	scopeCode := ""
	if permission.ScopeID > 0 && permission.Scope.Name != "" {
		scopeName = permission.Scope.Name
		scopeCode = permission.Scope.Code
	}

	return domain.Permission{
		ID:               permission.Model.ID,
		Name:             permission.Name,
		Description:      permission.Description,
		Resource:         permission.Resource.Name,
		Action:           permission.Action.Name,
		ResourceID:       permission.ResourceID,
		ActionID:         permission.ActionID,
		ScopeID:          permission.ScopeID,
		ScopeName:        scopeName,
		ScopeCode:        scopeCode,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
	}
}

// PermissionsToDomain convierte un slice de permisos GORM a slice de entidades de dominio
func PermissionsToDomain(permissions []models.Permission) []domain.Permission {
	domainPermissions := make([]domain.Permission, len(permissions))
	for i, permission := range permissions {
		domainPermissions[i] = PermissionToDomain(permission)
	}
	return domainPermissions
}
