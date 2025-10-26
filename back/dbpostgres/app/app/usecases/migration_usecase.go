package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// MigrationUseCase maneja la lógica de migración de esquema
type MigrationUseCase struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewMigrationUseCase crea una nueva instancia del caso de uso de migración
func NewMigrationUseCase(db *gorm.DB, logger log.ILogger) *MigrationUseCase {
	return &MigrationUseCase{
		db:     db,
		logger: logger,
	}
}

// MigrateDB ejecuta las migraciones de esquema únicamente
func (uc *MigrationUseCase) MigrateDB() error {
	uc.logger.Info().Msg("Iniciando migración de esquema de base de datos...")

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
		&models.ResidentUnit{},
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
		&models.Proxy{},
		&models.AttendanceRecord{},
		&models.AttendanceList{},
	); err != nil {
		return err
	}

	uc.logger.Info().Msg("✅ Migración de esquema completada exitosamente")
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
