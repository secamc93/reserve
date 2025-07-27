package usecases

import (
	"dbpostgres/pkg/log"
	"fmt"
)

// RolePermissionMigrationUseCase maneja la migración e inicialización de asignación de permisos a roles
type RolePermissionMigrationUseCase struct {
	systemUseCase *SystemUseCase
	logger        log.ILogger
}

// NewRolePermissionMigrationUseCase crea una nueva instancia del caso de uso de migración de asignación de permisos a roles
func NewRolePermissionMigrationUseCase(systemUseCase *SystemUseCase, logger log.ILogger) *RolePermissionMigrationUseCase {
	return &RolePermissionMigrationUseCase{
		systemUseCase: systemUseCase,
		logger:        logger,
	}
}

// Execute ejecuta la migración de asignación de permisos a roles
func (uc *RolePermissionMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Asignando permisos a roles...")

	// 1. Verificar que los roles requeridos existen
	uc.logger.Debug().Msg("Verificando dependencias: roles del sistema")
	requiredRoles := []string{"super_admin", "platform_admin", "platform_operator", "business_owner", "business_manager", "business_staff", "waiter", "host"}

	for _, roleCode := range requiredRoles {
		role, err := uc.systemUseCase.GetRoleByCode(roleCode)
		if err != nil {
			uc.logger.Error().Err(err).Str("role_code", roleCode).Msg("❌ Error al verificar rol")
			return err
		}
		if role == nil {
			uc.logger.Error().Str("role_code", roleCode).Msg("❌ Rol no encontrado. Asegúrate de ejecutar la migración de roles primero")
			return fmt.Errorf("rol '%s' no encontrado", roleCode)
		}
		uc.logger.Debug().Str("role_code", roleCode).Uint("role_id", role.ID).Msg("✅ Rol encontrado")
	}

	// 2. Verificar que los permisos requeridos existen
	uc.logger.Debug().Msg("Verificando dependencias: permisos del sistema")
	requiredPermissions := []string{
		"businesses:manage", "businesses:read", "business_types:manage", "business_types:read",
		"scopes:manage", "scopes:read", "users:manage", "users:read", "roles:manage", "roles:read",
		"permissions:manage", "reports:read", "reservations:manage", "reservations:read",
		"tables:manage", "tables:read", "rooms:manage", "rooms:read", "clients:manage", "clients:read", "staff:manage", "staff:read",
		"business:configure", "business_reports:read",
	}

	for _, permissionCode := range requiredPermissions {
		permission, err := uc.systemUseCase.GetPermissionByCode(permissionCode)
		if err != nil {
			uc.logger.Error().Err(err).Str("permission_code", permissionCode).Msg("❌ Error al verificar permiso")
			return err
		}
		if permission == nil {
			uc.logger.Error().Str("permission_code", permissionCode).Msg("❌ Permiso no encontrado. Asegúrate de ejecutar la migración de permisos primero")
			return fmt.Errorf("permiso '%s' no encontrado", permissionCode)
		}
		uc.logger.Debug().Str("permission_code", permissionCode).Uint("permission_id", permission.ID).Msg("✅ Permiso encontrado")
	}

	// 3. Asignar permisos al Super Admin (todos los permisos)
	uc.logger.Info().Str("role_code", "super_admin").Msg("Asignando permisos al Super Admin...")
	superAdminPermissions := []string{
		// Permisos de plataforma
		"businesses:manage", "businesses:read",
		"business_types:manage", "business_types:read",
		"scopes:manage", "scopes:read",
		"users:manage", "users:read",
		"roles:manage", "roles:read",
		"permissions:manage",
		"reports:read",
		// Permisos de negocio
		"reservations:manage", "reservations:read",
		"tables:manage", "tables:read",
		"rooms:manage", "rooms:read",
		"clients:manage", "clients:read",
		"staff:manage", "staff:read",
		"business:configure", "business_reports:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("super_admin", superAdminPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "super_admin").Msg("❌ Error al asignar permisos al Super Admin")
		return err
	}
	uc.logger.Debug().Str("role_code", "super_admin").Int("permissions_count", len(superAdminPermissions)).Msg("✅ Permisos asignados al Super Admin")

	// 4. Asignar permisos al Platform Admin
	uc.logger.Info().Str("role_code", "platform_admin").Msg("Asignando permisos al Platform Admin...")
	platformAdminPermissions := []string{
		// Permisos de plataforma (sin gestionar scopes)
		"businesses:manage", "businesses:read",
		"business_types:manage", "business_types:read",
		"users:manage", "users:read",
		"roles:manage", "roles:read",
		"permissions:manage",
		"reports:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("platform_admin", platformAdminPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "platform_admin").Msg("❌ Error al asignar permisos al Platform Admin")
		return err
	}
	uc.logger.Debug().Str("role_code", "platform_admin").Int("permissions_count", len(platformAdminPermissions)).Msg("✅ Permisos asignados al Platform Admin")

	// 5. Asignar permisos al Platform Operator
	uc.logger.Info().Str("role_code", "platform_operator").Msg("Asignando permisos al Platform Operator...")
	platformOperatorPermissions := []string{
		// Solo lectura de plataforma
		"businesses:read",
		"business_types:read",
		"users:read",
		"roles:read",
		"reports:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("platform_operator", platformOperatorPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "platform_operator").Msg("❌ Error al asignar permisos al Platform Operator")
		return err
	}
	uc.logger.Debug().Str("role_code", "platform_operator").Int("permissions_count", len(platformOperatorPermissions)).Msg("✅ Permisos asignados al Platform Operator")

	// 6. Asignar permisos al Business Owner
	uc.logger.Info().Str("role_code", "business_owner").Msg("Asignando permisos al Business Owner...")
	businessOwnerPermissions := []string{
		// Permisos completos del negocio
		"reservations:manage", "reservations:read",
		"tables:manage", "tables:read",
		"rooms:manage", "rooms:read",
		"clients:manage", "clients:read",
		"staff:manage", "staff:read",
		"business:configure", "business_reports:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("business_owner", businessOwnerPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "business_owner").Msg("❌ Error al asignar permisos al Business Owner")
		return err
	}
	uc.logger.Debug().Str("role_code", "business_owner").Int("permissions_count", len(businessOwnerPermissions)).Msg("✅ Permisos asignados al Business Owner")

	// 7. Asignar permisos al Business Manager
	uc.logger.Info().Str("role_code", "business_manager").Msg("Asignando permisos al Business Manager...")
	businessManagerPermissions := []string{
		// Permisos de gestión del negocio (sin configuración)
		"staff:manage", "staff:read",
		"tables:manage", "tables:read",
		"rooms:manage", "rooms:read",
		"reservations:manage", "reservations:read",
		"clients:manage", "clients:read",
		"business_reports:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("business_manager", businessManagerPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "business_manager").Msg("❌ Error al asignar permisos al Business Manager")
		return err
	}
	uc.logger.Debug().Str("role_code", "business_manager").Int("permissions_count", len(businessManagerPermissions)).Msg("✅ Permisos asignados al Business Manager")

	// 8. Asignar permisos al Business Staff
	uc.logger.Info().Str("role_code", "business_staff").Msg("Asignando permisos al Business Staff...")
	businessStaffPermissions := []string{
		// Permisos básicos del negocio
		"tables:read",
		"rooms:read",
		"reservations:read",
		"clients:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("business_staff", businessStaffPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "business_staff").Msg("❌ Error al asignar permisos al Business Staff")
		return err
	}
	uc.logger.Debug().Str("role_code", "business_staff").Int("permissions_count", len(businessStaffPermissions)).Msg("✅ Permisos asignados al Business Staff")

	// 9. Asignar permisos al Waiter
	uc.logger.Info().Str("role_code", "waiter").Msg("Asignando permisos al Waiter...")
	waiterPermissions := []string{
		// Permisos de mesero
		"tables:read",
		"rooms:read",
		"reservations:read",
		"clients:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("waiter", waiterPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "waiter").Msg("❌ Error al asignar permisos al Waiter")
		return err
	}
	uc.logger.Debug().Str("role_code", "waiter").Int("permissions_count", len(waiterPermissions)).Msg("✅ Permisos asignados al Waiter")

	// 10. Asignar permisos al Host
	uc.logger.Info().Str("role_code", "host").Msg("Asignando permisos al Host...")
	hostPermissions := []string{
		// Permisos de anfitrión
		"tables:read",
		"rooms:read",
		"reservations:manage", "reservations:read",
		"clients:manage", "clients:read",
	}

	if err := uc.systemUseCase.AssignPermissionsToRole("host", hostPermissions); err != nil {
		uc.logger.Error().Err(err).Str("role_code", "host").Msg("❌ Error al asignar permisos al Host")
		return err
	}
	uc.logger.Debug().Str("role_code", "host").Int("permissions_count", len(hostPermissions)).Msg("✅ Permisos asignados al Host")

	uc.logger.Info().Msg("✅ Permisos asignados a roles correctamente")
	return nil
}
