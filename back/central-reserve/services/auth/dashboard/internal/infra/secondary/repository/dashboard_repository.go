package repository

import (
	"central_reserve/services/auth/dashboard/internal/domain"
	"context"
	"dbpostgres/app/infra/models"
)

// GetDashboardStats obtiene las estadísticas del dashboard
func (r *Repository) GetDashboardStats(ctx context.Context, businessTypeID *uint, businessID *uint) (*domain.DashboardStats, error) {
	db := r.database.Conn(ctx)

	stats := &domain.DashboardStats{}

	// Estadísticas de Usuarios
	var userStats domain.UserStats
	userQuery := db.Model(&models.User{})

	if businessID != nil {
		// Usuarios asociados a un negocio específico a través de business_staff
		subquery := db.Table("business_staff").
			Select("user_id").
			Where("business_id = ?", *businessID)
		userQuery = userQuery.Where("id IN (?)", subquery)
	}

	if err := userQuery.Count(&userStats.Total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar usuarios")
		return nil, err
	}

	if err := userQuery.Where("is_active = ?", true).Count(&userStats.Active).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar usuarios activos")
		return nil, err
	}
	userStats.Inactive = userStats.Total - userStats.Active

	// Contar super usuarios (usuarios con rol de scope platform a través de business_staff)
	if businessID == nil {
		// Solo contar super usuarios si no hay filtro de business
		// Usar GORM con modelos para contar usuarios con roles de scope platform
		// Obtener business_staff que tengan roles de scope platform
		// Usar Preload para cargar la relación Role y luego filtrar
		var staffWithPlatformRoles []models.BusinessStaff
		err := db.Model(&models.BusinessStaff{}).
			Preload("Role").
			Where("role_id IS NOT NULL").
			Find(&staffWithPlatformRoles).Error

		if err != nil {
			r.logger.Error().Err(err).Msg("Error al obtener business_staff para super usuarios")
			return nil, err
		}

		// Filtrar en memoria los que tienen scope_id = 1 (Platform)
		uniqueUserIDs := make(map[uint]bool)
		for _, staff := range staffWithPlatformRoles {
			if staff.Role.ID > 0 && staff.Role.ScopeID == 1 {
				uniqueUserIDs[staff.UserID] = true
			}
		}

		userStats.SuperUsers = int64(len(uniqueUserIDs))
	}

	stats.Users = userStats

	// Estadísticas de Roles
	var roleStats domain.RoleStats
	roleQuery := db.Model(&models.Role{})

	if businessTypeID != nil {
		roleQuery = roleQuery.Where("business_type_id = ?", *businessTypeID)
	}

	if err := roleQuery.Count(&roleStats.Total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar roles")
		return nil, err
	}

	if err := roleQuery.Where("is_system = ?", true).Count(&roleStats.System).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar roles del sistema")
		return nil, err
	}
	roleStats.Custom = roleStats.Total - roleStats.System

	stats.Roles = roleStats

	// Estadísticas de Permisos
	var permissionStats domain.PermissionStats
	permissionQuery := db.Model(&models.Permission{})

	if businessTypeID != nil {
		permissionQuery = permissionQuery.Where("business_type_id = ?", *businessTypeID)
	}

	if err := permissionQuery.Count(&permissionStats.Total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar permisos")
		return nil, err
	}

	// Contar permisos asignados (que tienen relación con roles a través de role_permissions)
	// Obtener todos los permisos y verificar cuáles tienen roles asignados
	var allPermissions []models.Permission
	assignedPermissionQuery := db.Model(&models.Permission{})
	if businessTypeID != nil {
		assignedPermissionQuery = assignedPermissionQuery.Where("business_type_id = ?", *businessTypeID)
	}
	if err := assignedPermissionQuery.Preload("Roles").Find(&allPermissions).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener permisos con roles")
		return nil, err
	}

	// Contar cuántos permisos tienen al menos un rol asignado
	assignedCount := 0
	for _, perm := range allPermissions {
		if len(perm.Roles) > 0 {
			assignedCount++
		}
	}
	permissionStats.Assigned = int64(assignedCount)
	permissionStats.Unassigned = permissionStats.Total - permissionStats.Assigned

	stats.Permissions = permissionStats

	// Estadísticas de Recursos
	var resourceStats domain.ResourceStats
	resourceQuery := db.Model(&models.Resource{})

	if businessTypeID != nil {
		resourceQuery = resourceQuery.Where("business_type_id = ?", *businessTypeID)
	}

	if err := resourceQuery.Count(&resourceStats.Total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar recursos")
		return nil, err
	}

	// Resource no tiene campo is_active, todos están activos
	// Los recursos inactivos se manejan a través de BusinessResourceConfigured
	resourceStats.Active = resourceStats.Total
	resourceStats.Inactive = 0

	stats.Resources = resourceStats

	// Estadísticas de Negocios
	var businessStats domain.BusinessStats
	businessQuery := db.Model(&models.Business{})

	if businessTypeID != nil {
		businessQuery = businessQuery.Where("business_type_id = ?", *businessTypeID)
	}

	if err := businessQuery.Count(&businessStats.Total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar negocios")
		return nil, err
	}

	// Business tiene campo IsActive
	if err := businessQuery.Where("is_active = ?", true).Count(&businessStats.Active).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar negocios activos")
		return nil, err
	}
	businessStats.Inactive = businessStats.Total - businessStats.Active

	stats.Businesses = businessStats

	// Estadísticas de Tipos de Negocio
	var businessTypeStats domain.BusinessTypeStats
	if err := db.Model(&models.BusinessType{}).Count(&businessTypeStats.Total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar tipos de negocio")
		return nil, err
	}

	stats.BusinessTypes = businessTypeStats

	return stats, nil
}

