package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/env"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// MigrationUseCase maneja la lógica de migración e inicialización del sistema
type MigrationUseCase struct {
	systemUseCase *SystemUseCase
	scopeUseCase  *ScopeUseCase
	db            *gorm.DB
	logger        log.ILogger
	config        env.IConfig
}

// NewMigrationUseCase crea una nueva instancia del caso de uso de migración
func NewMigrationUseCase(
	systemUseCase *SystemUseCase,
	scopeUseCase *ScopeUseCase,
	db *gorm.DB,
	logger log.ILogger,
	config env.IConfig,
) *MigrationUseCase {
	return &MigrationUseCase{
		systemUseCase: systemUseCase,
		scopeUseCase:  scopeUseCase,
		db:            db,
		logger:        logger,
		config:        config,
	}
}

// MigrateDB ejecuta las migraciones y inicializa los datos del sistema
func (uc *MigrationUseCase) MigrateDB() error {
	uc.logger.Info().Msg("Iniciando migración de base de datos...")

	// Crear esquema horizontal_property si no existe
	if err := uc.createHorizontalPropertySchema(); err != nil {
		return err
	}

	// Auto-migrar todos los modelos
	if err := uc.db.AutoMigrate(
		&models.BusinessType{},
		&models.Scope{},
		&models.Business{},
		&models.Role{},
		&models.Permission{},
		&models.User{},
		&models.BusinessStaff{},
		&models.Client{},
		&models.Table{},
		&models.ReservationStatus{},
		&models.Reservation{},
		&models.ReservationStatusHistory{},
		&models.Room{},
		&models.APIKey{},
		&models.Resource{},
		&models.BusinessTypeResourcePermitted{},
		&models.BusinessResourceConfigured{},
		&models.Action{},
		&models.StaffType{}, // Genérico para todos los dominios
		// Modelos de Propiedad Horizontal
		&models.PropertyUnit{},
		&models.ResidentType{},
		&models.Resident{},
		// Modelos de Gobernanza de Propiedad Horizontal
		&models.CommitteeType{},
		&models.CommitteePosition{},
		&models.Committee{},
		&models.CommitteeMember{},
		// Modelos de Staff/Empleados de Propiedad Horizontal
		&models.PropertyStaff{},
		// Modelos de Sistema de Votaciones
		&models.VotingGroup{},
		&models.Voting{},
		&models.VotingOption{},
		&models.Vote{},
	); err != nil {
		return err
	}

	uc.logger.Info().Msg("✅ Migración de esquema completada")

	// Inicializar datos del sistema
	if err := uc.InitializeSystemData(); err != nil {
		return err
	}

	uc.logger.Info().Msg("✅ Migración completada exitosamente")
	return nil
}

// InitializeSystemData inicializa todos los datos del sistema
func (uc *MigrationUseCase) InitializeSystemData() error {
	uc.logger.Info().Msg("Inicializando datos del sistema...")

	// Crear casos de uso específicos para cada migración
	scopeMigration := NewScopeMigrationUseCase(uc.scopeUseCase, uc.logger)
	businessTypeMigration := NewBusinessTypeMigrationUseCase(uc.scopeUseCase, uc.logger)
	roleMigration := NewRoleMigrationUseCase(uc.systemUseCase, uc.scopeUseCase, uc.logger)
	permissionMigration := NewPermissionMigrationUseCase(uc.systemUseCase, uc.scopeUseCase, uc.db, uc.systemUseCase.permissionRepo, uc.logger) // AGREGAR: uc.systemUseCase.permissionRepo
	testBusinessMigration := NewTestBusinessMigrationUseCase(uc.systemUseCase, uc.scopeUseCase, permissionMigration, uc.logger)                // AGREGAR: permissionMigration
	reservationStatusMigration := NewReservationStatusMigrationUseCase(uc.systemUseCase, uc.logger)
	rolePermissionMigration := NewRolePermissionMigrationUseCase(uc.systemUseCase, uc.db, uc.logger) // AGREGAR: uc.db
	superAdminMigration := NewSuperAdminMigrationUseCase(uc.systemUseCase, uc.logger, uc.config)
	horizontalPropertyMigration := NewHorizontalPropertyMigrationUseCase(uc.systemUseCase, uc.scopeUseCase, uc.db, uc.logger)

	// 1. Inicializar scopes (INDEPENDIENTE)
	if err := scopeMigration.Execute(); err != nil {
		return err
	}

	// 2. Inicializar tipos de negocio (INDEPENDIENTE)
	if err := businessTypeMigration.Execute(); err != nil {
		return err
	}

	// 3. Inicializar roles (DEPENDE DE: Scopes)
	if err := roleMigration.Execute(); err != nil {
		return err
	}

	// 4. Inicializar permisos (DEPENDE DE: Scopes)
	if err := permissionMigration.Execute(); err != nil {
		return err
	}

	// 5. Asignar permisos a roles (DEPENDE DE: Roles + Permissions)
	if err := rolePermissionMigration.Execute(); err != nil {
		return err
	}

	// 6. Crear usuario administrador súper (DEPENDE DE: Roles)
	if err := superAdminMigration.Execute(); err != nil {
		return err
	}

	// 7. Inicializar estados de reserva (INDEPENDIENTE)
	if err := reservationStatusMigration.Execute(); err != nil {
		return err
	}

	// 8. Crear negocio de prueba (DEPENDE DE: Business Types)
	if err := testBusinessMigration.Execute(); err != nil {
		return err
	}

	// 9. Inicializar datos de propiedad horizontal (DEPENDE DE: Business Types)
	if err := horizontalPropertyMigration.Execute(); err != nil {
		return err
	}

	uc.logger.Info().Msg("✅ Datos del sistema inicializados correctamente")
	return nil
}

// createHorizontalPropertySchema crea el esquema horizontal_property si no existe
func (uc *MigrationUseCase) createHorizontalPropertySchema() error {
	uc.logger.Info().Msg("Creando esquema horizontal_property...")

	// Crear el esquema si no existe
	sql := `CREATE SCHEMA IF NOT EXISTS horizontal_property;`
	if err := uc.db.Exec(sql).Error; err != nil {
		uc.logger.Error().Err(err).Msg("Error creando esquema horizontal_property")
		return err
	}

	// Agregar comentario al esquema
	commentSQL := `COMMENT ON SCHEMA horizontal_property IS 'Esquema para el dominio de propiedades horizontales (condominios, edificios, etc.)';`
	if err := uc.db.Exec(commentSQL).Error; err != nil {
		uc.logger.Warn().Err(err).Msg("No se pudo agregar comentario al esquema (no crítico)")
		// No retornamos error porque el comentario no es crítico
	}

	uc.logger.Info().Msg("✅ Esquema horizontal_property creado correctamente")
	return nil
}
