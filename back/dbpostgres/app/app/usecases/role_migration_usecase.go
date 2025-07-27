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
		{Name: "Super Administrador", Code: "super_admin", Description: "Acceso completo a toda la plataforma", Level: 1, IsSystem: true, ScopeID: platformScope.ID},
		{Name: "Administrador de Plataforma", Code: "platform_admin", Description: "Administrador de la plataforma", Level: 2, IsSystem: true, ScopeID: platformScope.ID},
		{Name: "Operador de Plataforma", Code: "platform_operator", Description: "Operaciones básicas de plataforma", Level: 3, IsSystem: true, ScopeID: platformScope.ID},

		// Roles de negocio
		{Name: "Dueño del Negocio", Code: "business_owner", Description: "Dueño del negocio", Level: 2, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "Gerente del Negocio", Code: "business_manager", Description: "Gerente del negocio", Level: 3, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "Personal del Negocio", Code: "business_staff", Description: "Personal general del negocio", Level: 4, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "Mesero", Code: "waiter", Description: "Mesero del negocio", Level: 5, IsSystem: true, ScopeID: businessScope.ID},
		{Name: "Anfitrión", Code: "host", Description: "Anfitrión del negocio", Level: 5, IsSystem: true, ScopeID: businessScope.ID},
	}

	// 3. Verificar si todos los roles ya existen
	uc.logger.Debug().Msg("Verificando si los roles ya existen...")
	allExist := true
	for _, role := range roles {
		existingRole, err := uc.systemUseCase.GetRoleByCode(role.Code)
		if err != nil {
			uc.logger.Error().Err(err).Str("role_code", role.Code).Msg("❌ Error al verificar rol existente")
			return err
		}
		if existingRole == nil {
			uc.logger.Debug().Str("role_code", role.Code).Msg("Rol no existe, será creado")
			allExist = false
			break
		} else {
			uc.logger.Debug().Str("role_code", role.Code).Uint("role_id", existingRole.ID).Msg("Rol ya existe")
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
