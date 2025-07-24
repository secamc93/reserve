package usecases

import (
	"dbpostgres/internal/infra/models"
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
	permissionMigration := NewPermissionMigrationUseCase(uc.systemUseCase, uc.scopeUseCase, uc.logger)
	testBusinessMigration := NewTestBusinessMigrationUseCase(uc.systemUseCase, uc.scopeUseCase, uc.logger)
	reservationStatusMigration := NewReservationStatusMigrationUseCase(uc.systemUseCase, uc.logger)
	rolePermissionMigration := NewRolePermissionMigrationUseCase(uc.systemUseCase, uc.logger)
	superAdminMigration := NewSuperAdminMigrationUseCase(uc.systemUseCase, uc.logger, uc.config)

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

	uc.logger.Info().Msg("✅ Datos del sistema inicializados correctamente")
	return nil
}
