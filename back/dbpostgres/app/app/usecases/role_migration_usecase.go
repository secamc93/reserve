package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
	"fmt"
)

// RoleMigrationUseCase maneja la migración e inicialización de roles
type RoleMigrationUseCase struct {
	systemUseCase *SystemUseCase
	scopeUseCase  *ScopeUseCase
	logger        log.ILogger
}

// NewRoleMigrationUseCase crea una nueva instancia del caso de uso de migración de roles
func NewRoleMigrationUseCase(systemUseCase *SystemUseCase, scopeUseCase *ScopeUseCase, logger log.ILogger) *RoleMigrationUseCase {
	return &RoleMigrationUseCase{
		systemUseCase: systemUseCase,
		scopeUseCase:  scopeUseCase,
		logger:        logger,
	}
}

// Execute ejecuta la migración de roles
func (uc *RoleMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando roles del sistema...")

	// 1. Verificar que los scopes requeridos existen
	uc.logger.Debug().Msg("Verificando dependencias: scopes 'platform' y 'business'")

	platformScope, err := uc.scopeUseCase.GetScopeByCode("platform")
	if err != nil {
		uc.logger.Error().Err(err).Str("scope_code", "platform").Msg("❌ Error al obtener scope 'platform'")
		return err
	}
	if platformScope == nil {
		uc.logger.Error().Str("scope_code", "platform").Msg("❌ Scope 'platform' no encontrado. Asegúrate de ejecutar la migración de scopes primero")
		return fmt.Errorf("scope 'platform' no encontrado")
	}
	uc.logger.Debug().Uint("platform_scope_id", platformScope.ID).Msg("✅ Scope 'platform' encontrado")

	businessScope, err := uc.scopeUseCase.GetScopeByCode("business")
	if err != nil {
		uc.logger.Error().Err(err).Str("scope_code", "business").Msg("❌ Error al obtener scope 'business'")
		return err
	}
	if businessScope == nil {
		uc.logger.Error().Str("scope_code", "business").Msg("❌ Scope 'business' no encontrado. Asegúrate de ejecutar la migración de scopes primero")
		return fmt.Errorf("scope 'business' no encontrado")
	}
	uc.logger.Debug().Uint("business_scope_id", businessScope.ID).Msg("✅ Scope 'business' encontrado")

	// 2. Definir roles con IDs de scopes verificados
	roles := []models.Role{
		// Roles de plataforma
		{Name: "super_admin", Description: "Full access to entire platform", Level: 1, IsSystem: true, ScopeID: platformScope.ID},
		{Name: "platform_admin", Description: "Platform administrator", Level: 2, IsSystem: true, ScopeID: platformScope.ID},
		{Name: "platform_operator", Description: "Basic platform operations", Level: 3, IsSystem: true, ScopeID: platformScope.ID},

		// Roles de negocio
		{Name: "business_owner", Description: "Business owner", Level: 2, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "business_manager", Description: "Business manager", Level: 3, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "business_staff", Description: "General business staff", Level: 4, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "waiter", Description: "Business waiter", Level: 5, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "host", Description: "Business host", Level: 5, IsSystem: true, ScopeID: businessScope.ID},
	}

	// 3. Verificar si todos los roles ya existen
	uc.logger.Debug().Msg("Verificando si los roles ya existen...")
	allExist := true
	for _, role := range roles {
		existingRole, err := uc.systemUseCase.GetRoleByName(role.Name)
		if err != nil {
			uc.logger.Error().Err(err).Str("role_name", role.Name).Msg("❌ Error al verificar rol existente")
			return err
		}
		if existingRole == nil {
			uc.logger.Debug().Str("role_name", role.Name).Msg("Rol no existe, será creado")
			allExist = false
			break
		} else {
			uc.logger.Debug().Str("role_name", role.Name).Uint("role_id", existingRole.ID).Msg("Rol ya existe")
		}
	}

	if allExist {
		uc.logger.Info().Int("roles_count", len(roles)).Msg("✅ Roles del sistema ya existen, saltando migración de roles")
		return nil
	}

	// 4. Inicializar roles usando el caso de uso
	uc.logger.Info().Int("roles_count", len(roles)).Msg("Creando roles del sistema...")
	if err := uc.systemUseCase.InitializeRoles(roles); err != nil {
		uc.logger.Error().Err(err).Msg("❌ Error al inicializar roles")
		return err
	}

	uc.logger.Info().Int("roles_count", len(roles)).Msg("✅ Roles del sistema inicializados correctamente")
	return nil
}
