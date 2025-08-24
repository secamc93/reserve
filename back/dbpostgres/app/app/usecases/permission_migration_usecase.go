package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
	"fmt"

	"dbpostgres/app/domain"

	"gorm.io/gorm"
)

// PermissionMigrationUseCase maneja la migración e inicialización de permisos y recursos
type PermissionMigrationUseCase struct {
	systemUseCase  *SystemUseCase
	scopeUseCase   *ScopeUseCase
	db             *gorm.DB
	permissionRepo domain.PermissionRepository // AGREGAR: Repositorio de permisos
	logger         log.ILogger
}

// NewPermissionMigrationUseCase crea una nueva instancia del caso de uso de migración de permisos
func NewPermissionMigrationUseCase(systemUseCase *SystemUseCase, scopeUseCase *ScopeUseCase, db *gorm.DB, permissionRepo domain.PermissionRepository, logger log.ILogger) *PermissionMigrationUseCase {
	return &PermissionMigrationUseCase{
		systemUseCase:  systemUseCase,
		scopeUseCase:   scopeUseCase,
		db:             db,
		permissionRepo: permissionRepo, // AGREGAR
		logger:         logger,
	}
}

// Execute ejecuta la migración de permisos, recursos y relaciones
func (uc *PermissionMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando permisos, recursos, acciones y relaciones del sistema...")

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

	// 2. Crear acciones del sistema y obtener sus IDs
	actionIDs, err := uc.initializeActions()
	if err != nil {
		return err
	}

	// 3. Crear recursos del sistema y obtener sus IDs
	resourceIDs, err := uc.initializeResources()
	if err != nil {
		return err
	}

	// 4. Crear relaciones permitidas para todos los tipos de negocio
	if err := uc.initializeBusinessTypeResourcesPermitted(); err != nil {
		return err
	}

	// 5. Definir permisos con IDs de scopes, recursos y acciones verificados
	permissions := []models.Permission{
		// Permisos de plataforma
		{ResourceID: resourceIDs["businesses"], ActionID: actionIDs["Manage"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["businesses"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["business_types"], ActionID: actionIDs["Manage"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["business_types"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["users"], ActionID: actionIDs["Manage"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["users"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["roles"], ActionID: actionIDs["Manage"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["roles"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["permissions"], ActionID: actionIDs["Manage"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["permissions"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["scopes"], ActionID: actionIDs["Manage"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["scopes"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},
		{ResourceID: resourceIDs["reports"], ActionID: actionIDs["Read"], ScopeID: platformScope.ID},

		// Permisos de negocio
		{ResourceID: resourceIDs["staff"], ActionID: actionIDs["Manage"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["staff"], ActionID: actionIDs["Read"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["businesses"], ActionID: actionIDs["Update"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["tables"], ActionID: actionIDs["Manage"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["tables"], ActionID: actionIDs["Read"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["rooms"], ActionID: actionIDs["Manage"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["rooms"], ActionID: actionIDs["Read"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["reservations"], ActionID: actionIDs["Manage"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["reservations"], ActionID: actionIDs["Read"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["clients"], ActionID: actionIDs["Manage"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["clients"], ActionID: actionIDs["Read"], ScopeID: businessScope.ID},
		{ResourceID: resourceIDs["reports"], ActionID: actionIDs["Read"], ScopeID: businessScope.ID},
	}

	// 6. Verificar si todos los permisos ya existen
	uc.logger.Debug().Msg("Verificando si los permisos ya existen...")
	allExist := true
	for _, permission := range permissions {
		// Verificar si el permiso ya existe usando ResourceID, ActionID y ScopeID
		existingPermission, err := uc.permissionRepo.GetByResourceActionScope(permission.ResourceID, permission.ActionID, permission.ScopeID)
		if err != nil {
			uc.logger.Error().Err(err).
				Uint("resource_id", permission.ResourceID).
				Uint("action_id", permission.ActionID).
				Uint("scope_id", permission.ScopeID).
				Msg("❌ Error al verificar permiso existente")
			return err
		}
		if existingPermission == nil {
			uc.logger.Debug().
				Uint("resource_id", permission.ResourceID).
				Uint("action_id", permission.ActionID).
				Uint("scope_id", permission.ScopeID).
				Msg("Permiso no existe, será creado")
			allExist = false
			break
		} else {
			uc.logger.Debug().
				Uint("resource_id", permission.ResourceID).
				Uint("action_id", permission.ActionID).
				Uint("scope_id", permission.ScopeID).
				Uint("permission_id", existingPermission.ID).
				Msg("Permiso ya existe")
		}
	}

	if allExist {
		uc.logger.Info().Int("permissions_count", len(permissions)).Msg("✅ Permisos del sistema ya existen, saltando migración de permisos")
		return nil
	}

	// 7. Inicializar permisos usando el caso de uso
	uc.logger.Info().Int("permissions_count", len(permissions)).Msg("Creando permisos del sistema...")
	if err := uc.systemUseCase.InitializePermissions(permissions); err != nil {
		uc.logger.Error().Err(err).Msg("❌ Error al inicializar permisos")
		return err
	}

	uc.logger.Info().Int("permissions_count", len(permissions)).Msg("✅ Permisos del sistema inicializados correctamente")
	return nil
}

// initializeActions crea las acciones del sistema y retorna un mapa con sus IDs
func (uc *PermissionMigrationUseCase) initializeActions() (map[string]uint, error) {
	uc.logger.Info().Msg("Inicializando acciones del sistema...")

	actions := []models.Action{
		// Acciones básicas del sistema
		{Name: "Create", Description: "Create new records"},
		{Name: "Read", Description: "Read/view information"},
		{Name: "Update", Description: "Modify existing records"},
		{Name: "Delete", Description: "Delete records"},
		{Name: "Manage", Description: "Full control (includes all actions)"},

		// Acciones específicas del negocio
		{Name: "Approve", Description: "Approve requests or documents"},
		{Name: "Reject", Description: "Reject requests or documents"},
		{Name: "Assign", Description: "Assign resources or tasks"},
		{Name: "Schedule", Description: "Schedule events or tasks"},
		{Name: "Report", Description: "Generate reports"},

		// Acciones administrativas
		{Name: "Configure", Description: "Configure system parameters"},
		{Name: "Audit", Description: "Audit system actions"},
		{Name: "Migrate", Description: "Execute data migrations"},
	}

	actionIDs := make(map[string]uint)

	// Verificar si todas las acciones ya existen
	allExist := true
	for _, action := range actions {
		var existingAction models.Action
		if err := uc.db.Where("name = ?", action.Name).First(&existingAction).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				uc.logger.Debug().Str("action_name", action.Name).Msg("Acción no existe, será creada")
				allExist = false
				break
			}
			uc.logger.Error().Err(err).Str("action_name", action.Name).Msg("❌ Error al verificar acción existente")
			return nil, err
		} else {
			uc.logger.Debug().Str("action_name", action.Name).Uint("action_id", existingAction.ID).Msg("Acción ya existe")
			actionIDs[action.Name] = existingAction.ID
		}
	}

	if allExist {
		uc.logger.Info().Int("actions_count", len(actions)).Msg("✅ Acciones del sistema ya existen, saltando migración de acciones")
		return actionIDs, nil
	}

	// Crear acciones que no existen
	for _, action := range actions {
		var existingAction models.Action
		if err := uc.db.Where("name = ?", action.Name).First(&existingAction).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := uc.db.Create(&action).Error; err != nil {
					uc.logger.Error().Err(err).Str("action_name", action.Name).Msg("❌ Error al crear acción")
					return nil, err
				}
				uc.logger.Debug().Str("action_name", action.Name).Uint("action_id", action.ID).Msg("✅ Acción creada")
				actionIDs[action.Name] = action.ID
			} else {
				uc.logger.Error().Err(err).Str("action_name", action.Name).Msg("❌ Error al verificar acción")
				return nil, err
			}
		} else {
			actionIDs[action.Name] = existingAction.ID
		}
	}

	uc.logger.Info().Int("actions_count", len(actions)).Msg("✅ Acciones del sistema inicializadas correctamente")
	return actionIDs, nil
}

// initializeResources crea los recursos del sistema y retorna un mapa con sus IDs
func (uc *PermissionMigrationUseCase) initializeResources() (map[string]uint, error) {
	uc.logger.Info().Msg("Inicializando recursos del sistema...")

	resources := []models.Resource{
		{Name: "businesses", Description: "Business management"},
		{Name: "business_types", Description: "Business types"},
		{Name: "users", Description: "System users"},
		{Name: "roles", Description: "System roles"},
		{Name: "permissions", Description: "System permissions"},
		{Name: "scopes", Description: "System scopes"},
		{Name: "reports", Description: "System reports"},
		{Name: "tables", Description: "Business tables"},
		{Name: "rooms", Description: "Business rooms"},
		{Name: "reservations", Description: "Business reservations"},
		{Name: "clients", Description: "Business clients"},
		{Name: "staff", Description: "Business staff"},
		{Name: "delivery", Description: "Delivery service"},
		{Name: "pickup", Description: "Pickup service"},
		{Name: "branding", Description: "Brand customization"},
		{Name: "analytics", Description: "Analytics and metrics"},
		{Name: "notifications", Description: "Notification system"},
		{Name: "integrations", Description: "External integrations"},
	}

	resourceIDs := make(map[string]uint)

	// Verificar si todos los recursos ya existen
	allExist := true
	for _, resource := range resources {
		var existingResource models.Resource
		if err := uc.db.Where("name = ?", resource.Name).First(&existingResource).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				uc.logger.Debug().Str("resource_name", resource.Name).Msg("Recurso no existe, será creado")
				allExist = false
				break
			}
			uc.logger.Error().Err(err).Str("resource_name", resource.Name).Msg("❌ Error al verificar recurso existente")
			return nil, err
		} else {
			uc.logger.Debug().Str("resource_name", resource.Name).Uint("resource_id", existingResource.ID).Msg("Recurso ya existe")
			resourceIDs[resource.Name] = existingResource.ID
		}
	}

	if allExist {
		uc.logger.Info().Int("resources_count", len(resources)).Msg("✅ Recursos del sistema ya existen, saltando migración de recursos")
		return resourceIDs, nil
	}

	// Crear recursos que no existen
	for _, resource := range resources {
		var existingResource models.Resource
		if err := uc.db.Where("name = ?", resource.Name).First(&existingResource).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := uc.db.Create(&resource).Error; err != nil {
					uc.logger.Error().Err(err).Str("resource_name", resource.Name).Msg("❌ Error al crear recurso")
					return nil, err
				}
				uc.logger.Debug().Str("resource_name", resource.Name).Uint("resource_id", resource.ID).Msg("✅ Recurso creado")
				resourceIDs[resource.Name] = resource.ID
			} else {
				uc.logger.Error().Err(err).Str("resource_name", resource.Name).Msg("❌ Error al verificar recurso")
				return nil, err
			}
		} else {
			resourceIDs[resource.Name] = existingResource.ID
		}
	}

	uc.logger.Info().Int("resources_count", len(resources)).Msg("✅ Recursos del sistema inicializados correctamente")
	return resourceIDs, nil
}

// getResourceNameByID obtiene el nombre del recurso por su ID
func getResourceNameByID(resourceIDs map[string]uint, resourceID uint) string {
	for name, id := range resourceIDs {
		if id == resourceID {
			return name
		}
	}
	return "unknown"
}

// initializeBusinessTypeResourcesPermitted crea las relaciones permitidas para todos los tipos de negocio
func (uc *PermissionMigrationUseCase) initializeBusinessTypeResourcesPermitted() error {
	uc.logger.Info().Msg("Inicializando relaciones permitidas de recursos por tipo de negocio...")

	// Obtener todos los tipos de negocio
	var businessTypes []models.BusinessType
	if err := uc.db.Find(&businessTypes).Error; err != nil {
		uc.logger.Error().Err(err).Msg("❌ Error al obtener tipos de negocio")
		return err
	}

	// Obtener todos los recursos
	var resources []models.Resource
	if err := uc.db.Find(&resources).Error; err != nil {
		uc.logger.Error().Err(err).Msg("❌ Error al obtener recursos")
		return err
	}

	// Mapeo de recursos por tipo de negocio
	// Por ahora, todos los tipos de negocio tendrán acceso a todos los recursos
	// En el futuro, esto se puede personalizar por tipo de negocio
	for _, businessType := range businessTypes {
		for _, resource := range resources {
			// Verificar si la relación ya existe
			var existingRelation models.BusinessTypeResourcePermitted
			if err := uc.db.Where("business_type_id = ? AND resource_id = ?", businessType.ID, resource.ID).First(&existingRelation).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					// Crear la relación permitida (sin BusinessID por ahora)
					// El BusinessID se asignará cuando se configure para un negocio específico
					relation := models.BusinessTypeResourcePermitted{
						BusinessTypeID: businessType.ID,
						ResourceID:     resource.ID,
						// BusinessID se dejará como 0 por ahora
					}

					if err := uc.db.Create(&relation).Error; err != nil {
						uc.logger.Error().Err(err).
							Str("business_type", businessType.Name).
							Str("resource", resource.Name).
							Msg("❌ Error al crear relación permitida")
						return err
					}

					uc.logger.Debug().
						Str("business_type", businessType.Name).
						Str("resource", resource.Name).
						Msg("✅ Relación permitida creada")
				} else {
					uc.logger.Error().Err(err).
						Str("business_type", businessType.Name).
						Str("resource", resource.Name).
						Msg("❌ Error al verificar relación existente")
					return err
				}
			} else {
				uc.logger.Debug().
					Str("business_type", businessType.Name).
					Str("resource", resource.Name).
					Msg("Relación permitida ya existe")
			}
		}
	}

	uc.logger.Info().
		Int("business_types_count", len(businessTypes)).
		Int("resources_count", len(resources)).
		Msg("✅ Relaciones permitidas de recursos inicializadas correctamente")
	return nil
}

// CreateBusinessResourceConfigurations crea las configuraciones de recursos para un negocio específico
// Este método se debe llamar después de crear un negocio
func (uc *PermissionMigrationUseCase) CreateBusinessResourceConfigurations(businessID uint, businessTypeID uint) error {
	uc.logger.Info().
		Uint("business_id", businessID).
		Uint("business_type_id", businessTypeID).
		Msg("Creando configuraciones de recursos para el negocio...")

	// Obtener las relaciones permitidas para este tipo de negocio
	var permittedResources []models.BusinessTypeResourcePermitted
	if err := uc.db.Where("business_type_id = ?", businessTypeID).Find(&permittedResources).Error; err != nil {
		uc.logger.Error().Err(err).
			Uint("business_type_id", businessTypeID).
			Msg("❌ Error al obtener recursos permitidos para el tipo de negocio")
		return err
	}

	// Crear configuraciones para cada recurso permitido
	for _, permittedResource := range permittedResources {
		// Verificar si la configuración ya existe
		var existingConfig models.BusinessResourceConfigured
		if err := uc.db.Where("business_id = ? AND business_type_resource_permitted_id = ?", businessID, permittedResource.ID).First(&existingConfig).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Crear la configuración
				config := models.BusinessResourceConfigured{
					BusinessID:                      businessID,
					BusinessTypeResourcePermittedID: permittedResource.ID,
					BusinessTypeID:                  businessTypeID,
				}

				if err := uc.db.Create(&config).Error; err != nil {
					uc.logger.Error().Err(err).
						Uint("business_id", businessID).
						Uint("permitted_resource_id", permittedResource.ID).
						Msg("❌ Error al crear configuración de recurso")
					return err
				}

				uc.logger.Debug().
					Uint("business_id", businessID).
					Uint("permitted_resource_id", permittedResource.ID).
					Msg("✅ Configuración de recurso creada")
			} else {
				uc.logger.Error().Err(err).
					Uint("business_id", businessID).
					Uint("permitted_resource_id", permittedResource.ID).
					Msg("❌ Error al verificar configuración existente")
				return err
			}
		} else {
			uc.logger.Debug().
				Uint("business_id", businessID).
				Uint("permitted_resource_id", permittedResource.ID).
				Msg("Configuración de recurso ya existe")
		}
	}

	uc.logger.Info().
		Uint("business_id", businessID).
		Int("resources_count", len(permittedResources)).
		Msg("✅ Configuraciones de recursos del negocio creadas correctamente")
	return nil
}
