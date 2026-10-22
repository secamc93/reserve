package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
	"fmt"

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

	// Crear esquemas si no existen
	if err := uc.createHorizontalPropertySchema(); err != nil {
		return err
	}

	// Columnas de hora: el modelo las declara `time` ("08:00") pero bases creadas con una versión
	// anterior las tienen como timestamptz, y AutoMigrate no cambia el tipo; ahí no se puede guardar
	// ningún horario ni reserva. Se convierten solo si siguen en timestamptz.
	uc.fixTimeColumns()

	// El nombre de una zona común es único por propiedad solo entre las no borradas (el índice viejo
	// contaba las borradas y no dejaba reutilizar el nombre).
	if err := uc.db.Exec(`DROP INDEX IF EXISTS horizontal_property.idx_business_area_name`).Error; err != nil {
		uc.logger.Warn().Err(err).Msg("No se pudo borrar el índice viejo de nombres de zonas comunes")
	}

	// El índice único viejo (parking_slot_id, is_active) solo permitía UNA asignación liberada por
	// cupo en toda su historia; lo reemplaza idx_slot_one_active_assignment (parcial, solo activas).
	if err := uc.db.Exec(`DROP INDEX IF EXISTS horizontal_property.idx_slot_active_assignment`).Error; err != nil {
		uc.logger.Warn().Err(err).Msg("No se pudo borrar el índice viejo de asignaciones de parqueadero")
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
		&models.APIKey{},
		&models.Resource{},
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
		&models.VotingCredential{},
		// Modelos de Sistema de Visitas
		&models.VisitType{},
		&models.VisitStatus{},
		&models.Visitor{},
		&models.VisitorVehicle{},
		&models.Visit{},
		&models.VisitCompanion{},
		&models.VisitAsset{},
		&models.VisitBlacklist{},
		&models.VisitRecurringPattern{},
		&models.VisitRestriction{},
		// Modelos de Sistema de Paquetes
		&models.PackageStatus{},
		&models.Package{},
		&models.CommonAreaType{},
		&models.CommonArea{},
		&models.CommonAreaReservation{},
		&models.CommonAreaReservationStatus{},
		&models.CommonAreaSchedule{},
		&models.CommonAreaRestriction{},
		&models.RecurringReservationPattern{},
		// Modelos de Sistema de Parqueaderos
		&models.ParkingType{},
		&models.ParkingZone{},
		&models.ParkingSlot{},
		&models.ParkingAssignment{},
		&models.ParkingReservationStatus{},
		&models.ParkingReservation{},
		&models.ParkingOccupancy{},
		// Cobro por día de votación
		&models.VotingBillingSetting{},
		&models.VotingGroupPayment{},
	); err != nil {
		return err
	}

	if err := uc.exemptExistingPropertiesOnce(); err != nil {
		return err
	}

	// Seedear datos iniciales
	if err := uc.seedInitialData(); err != nil {
		return err
	}

	uc.logger.Info().Msg("✅ Migración de esquema completada exitosamente")
	return nil
}

// seedInitialData inserta datos iniciales necesarios para el sistema
func (uc *MigrationUseCase) seedInitialData() error {
	uc.logger.Info().Msg("Sembrando datos iniciales...")

	// Estados de paquete iniciales
	packageStatuses := []models.PackageStatus{
		{Code: "received", Name: "Recibido", Description: "Paquete recibido en portería", IsFinal: false, IsActive: true},
		{Code: "in_storage", Name: "En Almacén", Description: "Paquete en almacenamiento esperando entrega", IsFinal: false, IsActive: true},
		{Code: "notified", Name: "Notificado", Description: "Residente ha sido notificado de la llegada", IsFinal: false, IsActive: true},
		{Code: "delivered", Name: "Entregado", Description: "Paquete entregado al residente", IsFinal: true, IsActive: true},
		{Code: "returned", Name: "Retornado", Description: "Paquete retornado al remitente", IsFinal: true, IsActive: true},
		{Code: "lost", Name: "Perdido", Description: "Paquete reportado como perdido", IsFinal: true, IsActive: true},
	}

	for _, status := range packageStatuses {
		var existing models.PackageStatus
		result := uc.db.Where("code = ?", status.Code).First(&existing)
		if result.Error != nil {
			// Si no existe, crearlo
			if err := uc.db.Create(&status).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", status.Code).Msg("Error creando estado de paquete (puede ser que ya exista)")
			} else {
				uc.logger.Info().Str("code", status.Code).Msg("Estado de paquete creado")
			}
		} else {
			// Si existe, actualizarlo para asegurar que esté activo y tenga los valores correctos
			existing.Name = status.Name
			existing.Description = status.Description
			existing.IsFinal = status.IsFinal
			existing.IsActive = status.IsActive
			if err := uc.db.Save(&existing).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", status.Code).Msg("Error actualizando estado de paquete")
			}
		}
	}

	// Tipos de residente. Propietario va primero: en una base nueva queda con id 1, que es el que
	// asume la importación de residentes por Excel (bulk-create-residents-excel.go).
	residentTypes := []models.ResidentType{
		{Code: "owner", Name: "Propietario", Description: "Propietario de la unidad", IsActive: true},
		{Code: "tenant", Name: "Arrendatario", Description: "Arrendatario de la unidad", IsActive: true},
		{Code: "family", Name: "Familiar", Description: "Familiar del propietario o arrendatario", IsActive: true},
	}
	for _, rt := range residentTypes {
		var existing models.ResidentType
		if uc.db.Where("code = ?", rt.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&rt).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", rt.Code).Msg("Error creando tipo de residente")
			} else {
				uc.logger.Info().Str("code", rt.Code).Msg("Tipo de residente creado")
			}
		}
	}

	// Tipos de parqueadero y estados de reserva de parqueadero (catálogos por código; sin ellos no
	// se pueden crear cupos ni reservas).
	parkingTypes := []models.ParkingType{
		{Code: "car", Name: "Carro", Description: "Automóvil o camioneta", IsActive: true},
		{Code: "motorcycle", Name: "Moto", Description: "Motocicleta", IsActive: true},
		{Code: "bicycle", Name: "Bicicleta", Description: "Bicicleta o patineta", IsActive: true},
		{Code: "disabled", Name: "Discapacidad", Description: "Cupo para personas con movilidad reducida", IsActive: true},
	}
	for _, pt := range parkingTypes {
		var existing models.ParkingType
		if uc.db.Where("code = ?", pt.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&pt).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", pt.Code).Msg("Error creando tipo de parqueadero")
			}
		}
	}
	parkingStatuses := []models.ParkingReservationStatus{
		{Code: "pending", Name: "Pendiente", Description: "Pendiente de aprobación", IsActive: true},
		{Code: "confirmed", Name: "Confirmada", Description: "Reserva confirmada", IsActive: true},
		{Code: "checked_in", Name: "En uso", Description: "El vehículo está dentro", IsActive: true},
		{Code: "checked_out", Name: "Completada", Description: "El vehículo salió", IsFinal: true, IsActive: true},
		{Code: "cancelled", Name: "Cancelada", Description: "Reserva cancelada", IsFinal: true, IsActive: true},
		{Code: "expired", Name: "Expirada", Description: "No se usó en su horario", IsFinal: true, IsActive: true},
	}
	for _, st := range parkingStatuses {
		var existing models.ParkingReservationStatus
		if uc.db.Where("code = ?", st.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&st).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", st.Code).Msg("Error creando estado de reserva de parqueadero")
			}
		}
	}

	// Catálogos de visitas (antes solo estaban en migrations/002_visits_tables.sql, que no se aplica:
	// sin ellos no se puede crear ninguna visita).
	visitTypes := []models.VisitType{
		{Code: "family", Name: "Familiar", Description: "Visita de familiares", RequiresCompanions: true, DefaultDurationMinutes: intPtr(240), IsActive: true},
		{Code: "friend", Name: "Amigo", Description: "Visita de amigos", RequiresCompanions: true, DefaultDurationMinutes: intPtr(180), IsActive: true},
		{Code: "delivery", Name: "Domicilio", Description: "Entregas a domicilio", DefaultDurationMinutes: intPtr(20), IsActive: true},
		{Code: "technician", Name: "Servicio técnico", Description: "Personal de servicio técnico", RequiresAuthorization: true, RequiresAssetsTracking: true, DefaultDurationMinutes: intPtr(120), IsActive: true},
		{Code: "supplier", Name: "Proveedor", Description: "Proveedores y contratistas", RequiresAuthorization: true, RequiresVehicleRegistration: true, RequiresCompanions: true, RequiresAssetsTracking: true, DefaultDurationMinutes: intPtr(240), IsActive: true},
		{Code: "moving", Name: "Mudanza", Description: "Mudanza: activos y vehículo", RequiresAuthorization: true, RequiresVehicleRegistration: true, RequiresAssetsTracking: true, DefaultDurationMinutes: intPtr(480), IsActive: true},
		{Code: "other", Name: "Otro", Description: "Otros tipos de visita", DefaultDurationMinutes: intPtr(60), IsActive: true},
	}
	for _, vt := range visitTypes {
		var existing models.VisitType
		if uc.db.Where("code = ?", vt.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&vt).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", vt.Code).Msg("Error creando tipo de visita")
			}
		}
	}
	visitStatuses := []models.VisitStatus{
		{Code: "pending", Name: "Pendiente", Description: "Visita programada pendiente de autorización", IsActive: true},
		{Code: "authorized", Name: "Autorizada", Description: "Visita autorizada por el residente", IsActive: true},
		{Code: "in_progress", Name: "En curso", Description: "Visitante dentro del conjunto", IsActive: true},
		{Code: "completed", Name: "Completada", Description: "Visita finalizada", IsFinal: true, IsActive: true},
		{Code: "cancelled", Name: "Cancelada", Description: "Visita cancelada antes de realizarse", IsFinal: true, IsActive: true},
		{Code: "expired", Name: "Expirada", Description: "Visita expirada sin realizarse", IsFinal: true, IsActive: true},
		{Code: "rejected", Name: "Rechazada", Description: "Visita rechazada por el residente", IsFinal: true, IsActive: true},
	}
	for _, vs := range visitStatuses {
		var existing models.VisitStatus
		if uc.db.Where("code = ?", vs.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&vs).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", vs.Code).Msg("Error creando estado de visita")
			}
		}
	}

	// Catálogos de zonas comunes (sin ellos no se puede crear ninguna zona ni reserva).
	areaTypes := []models.CommonAreaType{
		{Code: "social_room", Name: "Salón social", Description: "Salón para eventos", DefaultMaxCapacity: intPtr(40), RequiresApproval: true, IsActive: true},
		{Code: "bbq", Name: "BBQ", Description: "Zona de asados", DefaultMaxCapacity: intPtr(15), RequiresApproval: true, IsActive: true},
		{Code: "sports_court", Name: "Cancha deportiva", Description: "Cancha múltiple", DefaultMaxCapacity: intPtr(20), AllowsRecurring: true, IsActive: true},
		{Code: "gym", Name: "Gimnasio", Description: "Gimnasio", DefaultMaxCapacity: intPtr(10), AllowsRecurring: true, IsActive: true},
		{Code: "pool", Name: "Piscina", Description: "Piscina", DefaultMaxCapacity: intPtr(30), IsActive: true},
		{Code: "meeting_room", Name: "Sala de juntas", Description: "Sala de reuniones", DefaultMaxCapacity: intPtr(12), IsActive: true},
		{Code: "terrace", Name: "Terraza", Description: "Terraza", DefaultMaxCapacity: intPtr(20), RequiresApproval: true, IsActive: true},
		{Code: "other", Name: "Otra", Description: "Otra zona común", IsActive: true},
	}
	for _, at := range areaTypes {
		var existing models.CommonAreaType
		if uc.db.Where("code = ?", at.Code).First(&existing).Error != nil {
			requiresApproval := at.RequiresApproval
			if err := uc.db.Create(&at).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", at.Code).Msg("Error creando tipo de zona común")
			} else if !requiresApproval {
				// default:true hace que GORM descarte el false al crear.
				uc.db.Model(&models.CommonAreaType{}).Where("id = ?", at.ID).Update("requires_approval", false)
			}
		}
	}
	areaStatuses := []models.CommonAreaReservationStatus{
		{Code: "pending", Name: "Pendiente", Description: "Pendiente de aprobación", IsActive: true},
		{Code: "approved", Name: "Aprobada", Description: "Aprobada por el administrador", IsActive: true},
		{Code: "rejected", Name: "Rechazada", Description: "Rechazada por el administrador", IsFinal: true, IsActive: true},
		{Code: "confirmed", Name: "Confirmada", Description: "Confirmada, con código de acceso", IsActive: true},
		{Code: "checked_in", Name: "En uso", Description: "El residente ingresó", IsActive: true},
		{Code: "checked_out", Name: "Finalizada", Description: "El residente salió", IsFinal: true, IsActive: true},
		{Code: "cancelled", Name: "Cancelada", Description: "Reserva cancelada", IsFinal: true, IsActive: true},
		{Code: "completed", Name: "Completada", Description: "Reserva completada", IsFinal: true, IsActive: true},
		{Code: "expired", Name: "Vencida", Description: "No se usó en su horario", IsFinal: true, IsActive: true},
	}
	for _, st := range areaStatuses {
		var existing models.CommonAreaReservationStatus
		if uc.db.Where("code = ?", st.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&st).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", st.Code).Msg("Error creando estado de reserva de zona común")
			}
		}
	}

	uc.logger.Info().Msg("✅ Datos iniciales sembrados correctamente")
	return nil
}

// timeColumnTables son las tablas cuyas columnas start_time / end_time son `time` en el modelo.
var timeColumnTables = []string{
	"common_area_schedules",
	"common_area_restrictions",
	"recurring_reservation_patterns",
	"common_area_reservations",
	"parking_reservations",
}

// fixTimeColumns convierte a `time` las columnas start_time / end_time que quedaron como timestamptz.
func (uc *MigrationUseCase) fixTimeColumns() {
	for _, table := range timeColumnTables {
		for _, column := range []string{"start_time", "end_time"} {
			var dataType string
			uc.db.Raw(`SELECT data_type FROM information_schema.columns WHERE table_schema = 'horizontal_property' AND table_name = ? AND column_name = ?`, table, column).Scan(&dataType)
			if dataType != "timestamp with time zone" {
				continue
			}
			sql := fmt.Sprintf(`ALTER TABLE horizontal_property.%s ALTER COLUMN %s TYPE time USING (%s AT TIME ZONE 'America/Bogota')::time`, table, column, column)
			if err := uc.db.Exec(sql).Error; err != nil {
				uc.logger.Warn().Err(err).Str("table", table).Str("column", column).Msg("No se pudo convertir la columna de hora a time")
				continue
			}
			uc.logger.Info().Str("table", table).Str("column", column).Msg("Columna de hora convertida de timestamptz a time")
		}
	}
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

// billingExemptionsMarker es el comentario de la tabla de configuración de cobro que indica que
// las exenciones iniciales ya se aplicaron en esta base.
const billingExemptionsMarker = "exenciones iniciales aplicadas"

// exemptExistingPropertiesOnce marca como exentas del cobro de votaciones a todas las propiedades
// que existen la primera vez que se migra con el cobro; las que se creen después pagan. Corre una
// sola vez por base: al terminar deja billingExemptionsMarker como comentario de la tabla (en la
// misma transacción, así que si falla se reintenta en la siguiente migración).
func (uc *MigrationUseCase) exemptExistingPropertiesOnce() error {
	var applied bool
	if err := uc.db.Raw(`SELECT COALESCE(obj_description('horizontal_property.voting_billing_settings'::regclass, 'pg_class'), '') = ?`,
		billingExemptionsMarker).Scan(&applied).Error; err != nil {
		return err
	}
	if applied {
		return nil
	}
	return uc.db.Transaction(func(tx *gorm.DB) error {
		res := tx.Exec(`
			INSERT INTO horizontal_property.voting_billing_settings (business_id, exempt, created_at, updated_at)
			SELECT id, true, NOW(), NOW() FROM business WHERE deleted_at IS NULL
			ON CONFLICT (business_id) DO NOTHING`)
		if res.Error != nil {
			return res.Error
		}
		if err := tx.Exec(`COMMENT ON TABLE horizontal_property.voting_billing_settings IS '` + billingExemptionsMarker + `'`).Error; err != nil {
			return err
		}
		uc.logger.Info().Int64("propiedades", res.RowsAffected).Msg("Propiedades existentes exentas del cobro por día de votación")
		return nil
	})
}

func intPtr(n int) *int { return &n }
