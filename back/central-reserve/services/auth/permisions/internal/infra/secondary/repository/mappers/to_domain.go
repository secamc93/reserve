package mappers

import (
	"central_reserve/services/auth/permisions/internal/domain"
	"dbpostgres/app/infra/models"
)

// PermissionToDomain convierte un modelo de GORM a entidad de dominio
// Función principal para conversión individual de permissions
func PermissionToDomain(permission models.Permission) domain.Permission {
	businessTypeID := uint(0)
	businessTypeName := ""
	if permission.BusinessTypeID != nil {
		businessTypeID = *permission.BusinessTypeID
		if permission.BusinessType != nil {
			businessTypeName = permission.BusinessType.Name
		}
	}

	scopeName := ""
	scopeCode := ""
	if permission.Scope.ID > 0 {
		scopeName = permission.Scope.Name
		scopeCode = permission.Scope.Code
	}

	return domain.Permission{
		ID:               permission.Model.ID,
		Name:             permission.Name,
		Code:             "", // Code no existe en el modelo, debe generarse o venir de otra fuente
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

// PermissionToDomainPtr convierte un modelo de GORM a puntero de entidad de dominio
func PermissionToDomainPtr(permission models.Permission) *domain.Permission {
	domainPermission := PermissionToDomain(permission)
	return &domainPermission
}

// PermissionsToDomain convierte un slice de modelos GORM a slice de entidades de dominio
func PermissionsToDomain(permissions []models.Permission) []domain.Permission {
	domainPermissions := make([]domain.Permission, len(permissions))
	for i, permission := range permissions {
		domainPermissions[i] = PermissionToDomain(permission)
	}
	return domainPermissions
}
