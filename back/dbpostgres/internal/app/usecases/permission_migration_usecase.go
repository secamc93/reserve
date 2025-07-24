package usecases

import (
	"dbpostgres/internal/infra/models"
	"dbpostgres/pkg/log"
	"fmt"
)

// PermissionMigrationUseCase maneja la migración e inicialización de permisos
type PermissionMigrationUseCase struct {
	systemUseCase *SystemUseCase
	scopeUseCase  *ScopeUseCase
	logger        log.ILogger
}

// NewPermissionMigrationUseCase crea una nueva instancia del caso de uso de migración de permisos
func NewPermissionMigrationUseCase(systemUseCase *SystemUseCase, scopeUseCase *ScopeUseCase, logger log.ILogger) *PermissionMigrationUseCase {
	return &PermissionMigrationUseCase{
		systemUseCase: systemUseCase,
		scopeUseCase:  scopeUseCase,
		logger:        logger,
	}
}

// Execute ejecuta la migración de permisos
func (uc *PermissionMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando permisos del sistema...")

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

	// 2. Definir permisos con IDs de scopes verificados
	permissions := []models.Permission{
		// Permisos de plataforma
		{Name: "Gestionar Negocios", Code: "businesses:manage", Description: "Crear, editar y eliminar negocios", Resource: "businesses", Action: models.ACTION_MANAGE, ScopeID: platformScope.ID},
		{Name: "Ver Negocios", Code: "businesses:read", Description: "Ver información de negocios", Resource: "businesses", Action: models.ACTION_READ, ScopeID: platformScope.ID},
		{Name: "Gestionar Tipos de Negocio", Code: "business_types:manage", Description: "Gestionar tipos de negocio", Resource: "business_types", Action: models.ACTION_MANAGE, ScopeID: platformScope.ID},
		{Name: "Ver Tipos de Negocio", Code: "business_types:read", Description: "Ver tipos de negocio", Resource: "business_types", Action: models.ACTION_READ, ScopeID: platformScope.ID},
		{Name: "Gestionar Usuarios", Code: "users:manage", Description: "Crear, editar y eliminar usuarios", Resource: "users", Action: models.ACTION_MANAGE, ScopeID: platformScope.ID},
		{Name: "Ver Usuarios", Code: "users:read", Description: "Ver información de usuarios", Resource: "users", Action: models.ACTION_READ, ScopeID: platformScope.ID},
		{Name: "Gestionar Roles", Code: "roles:manage", Description: "Gestionar roles del sistema", Resource: "roles", Action: models.ACTION_MANAGE, ScopeID: platformScope.ID},
		{Name: "Ver Roles", Code: "roles:read", Description: "Ver roles del sistema", Resource: "roles", Action: models.ACTION_READ, ScopeID: platformScope.ID},
		{Name: "Gestionar Permisos", Code: "permissions:manage", Description: "Gestionar permisos del sistema", Resource: "permissions", Action: models.ACTION_MANAGE, ScopeID: platformScope.ID},
		{Name: "Ver Permisos", Code: "permissions:read", Description: "Ver permisos del sistema", Resource: "permissions", Action: models.ACTION_READ, ScopeID: platformScope.ID},
		{Name: "Gestionar Scopes", Code: "scopes:manage", Description: "Gestionar scopes del sistema", Resource: "scopes", Action: models.ACTION_MANAGE, ScopeID: platformScope.ID},
		{Name: "Ver Scopes", Code: "scopes:read", Description: "Ver scopes del sistema", Resource: "scopes", Action: models.ACTION_READ, ScopeID: platformScope.ID},
		{Name: "Ver Reportes", Code: "reports:read", Description: "Ver reportes de la plataforma", Resource: "reports", Action: models.ACTION_READ, ScopeID: platformScope.ID},

		// Permisos de negocio
		{Name: "Gestionar Personal", Code: "staff:manage", Description: "Gestionar personal del negocio", Resource: "users", Action: models.ACTION_MANAGE, ScopeID: businessScope.ID},
		{Name: "Ver Personal", Code: "staff:read", Description: "Ver personal del negocio", Resource: "users", Action: models.ACTION_READ, ScopeID: businessScope.ID},
		{Name: "Gestionar Configuración", Code: "business:configure", Description: "Configurar negocio (marca blanca)", Resource: "businesses", Action: models.ACTION_UPDATE, ScopeID: businessScope.ID},
		{Name: "Gestionar Mesas", Code: "tables:manage", Description: "Gestionar mesas del negocio", Resource: "tables", Action: models.ACTION_MANAGE, ScopeID: businessScope.ID},
		{Name: "Ver Mesas", Code: "tables:read", Description: "Ver mesas del negocio", Resource: "tables", Action: models.ACTION_READ, ScopeID: businessScope.ID},
		{Name: "Gestionar Salas", Code: "rooms:manage", Description: "Gestionar salas del negocio", Resource: "rooms", Action: models.ACTION_MANAGE, ScopeID: businessScope.ID},
		{Name: "Ver Salas", Code: "rooms:read", Description: "Ver salas del negocio", Resource: "rooms", Action: models.ACTION_READ, ScopeID: businessScope.ID},
		{Name: "Gestionar Reservas", Code: "reservations:manage", Description: "Gestionar reservas del negocio", Resource: "reservations", Action: models.ACTION_MANAGE, ScopeID: businessScope.ID},
		{Name: "Ver Reservas", Code: "reservations:read", Description: "Ver reservas del negocio", Resource: "reservations", Action: models.ACTION_READ, ScopeID: businessScope.ID},
		{Name: "Gestionar Clientes", Code: "clients:manage", Description: "Gestionar clientes del negocio", Resource: "clients", Action: models.ACTION_MANAGE, ScopeID: businessScope.ID},
		{Name: "Ver Clientes", Code: "clients:read", Description: "Ver clientes del negocio", Resource: "clients", Action: models.ACTION_READ, ScopeID: businessScope.ID},
		{Name: "Ver Reportes del Negocio", Code: "business_reports:read", Description: "Ver reportes del negocio", Resource: "reports", Action: models.ACTION_READ, ScopeID: businessScope.ID},
	}

	// 3. Verificar si todos los permisos ya existen
	uc.logger.Debug().Msg("Verificando si los permisos ya existen...")
	allExist := true
	for _, permission := range permissions {
		existingPermission, err := uc.systemUseCase.GetPermissionByCode(permission.Code)
		if err != nil {
			uc.logger.Error().Err(err).Str("permission_code", permission.Code).Msg("❌ Error al verificar permiso existente")
			return err
		}
		if existingPermission == nil {
			uc.logger.Debug().Str("permission_code", permission.Code).Msg("Permiso no existe, será creado")
			allExist = false
			break
		} else {
			uc.logger.Debug().Str("permission_code", permission.Code).Uint("permission_id", existingPermission.ID).Msg("Permiso ya existe")
		}
	}

	if allExist {
		uc.logger.Info().Int("permissions_count", len(permissions)).Msg("✅ Permisos del sistema ya existen, saltando migración de permisos")
		return nil
	}

	// 4. Inicializar permisos usando el caso de uso
	uc.logger.Info().Int("permissions_count", len(permissions)).Msg("Creando permisos del sistema...")
	if err := uc.systemUseCase.InitializePermissions(permissions); err != nil {
		uc.logger.Error().Err(err).Msg("❌ Error al inicializar permisos")
		return err
	}

	uc.logger.Info().Int("permissions_count", len(permissions)).Msg("✅ Permisos del sistema inicializados correctamente")
	return nil
}
