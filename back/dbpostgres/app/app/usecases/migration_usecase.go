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

	// Crear esquemas si no existen
	if err := uc.createHorizontalPropertySchema(); err != nil {
		return err
	}
	if err := uc.createSportTrainingSchema(); err != nil {
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
		// Modelos de Entrenamiento Deportivo
		&models.PlayerSkillLevel{},
		&models.CoachSpecialty{},
		&models.TrainingSessionType{},
		&models.STBookingStatus{},
		&models.STAttendanceStatus{},
		&models.STPlayer{},
		&models.STGuardian{},
		&models.PlayerGuardian{},
		&models.Coach{},
		&models.CoachSpecialtyAssignment{},
		&models.TrainingGroup{},
		&models.GroupPlayer{},
		&models.TrainingSession{},
		&models.SessionBooking{},
		&models.STAttendanceRecord{},
	); err != nil {
		return err
	}

	// Seedear datos iniciales
	if err := uc.seedInitialData(); err != nil {
		return err
	}

	// Seedear datos iniciales de sport training
	if err := uc.seedSportTrainingData(); err != nil {
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

	uc.logger.Info().Msg("✅ Datos iniciales sembrados correctamente")
	return nil
}

// createSportTrainingSchema crea el esquema sport_training si no existe
func (uc *MigrationUseCase) createSportTrainingSchema() error {
	uc.logger.Info().Msg("Creando esquema sport_training...")

	sql := `CREATE SCHEMA IF NOT EXISTS sport_training;`
	if err := uc.db.Exec(sql).Error; err != nil {
		uc.logger.Error().Err(err).Msg("Error creando esquema sport_training")
		return err
	}

	commentSQL := `COMMENT ON SCHEMA sport_training IS 'Esquema para el dominio de entrenamiento deportivo (academias de fútbol, clubs deportivos)';`
	if err := uc.db.Exec(commentSQL).Error; err != nil {
		uc.logger.Warn().Err(err).Msg("No se pudo agregar comentario al esquema sport_training (no crítico)")
	}

	uc.logger.Info().Msg("✅ Esquema sport_training creado correctamente")
	return nil
}

// seedSportTrainingData inserta datos iniciales para sport training
func (uc *MigrationUseCase) seedSportTrainingData() error {
	uc.logger.Info().Msg("Sembrando datos iniciales de sport training...")

	// Niveles de habilidad
	skillLevels := []models.PlayerSkillLevel{
		{Name: "Principiante", Code: "beginner", Description: "Jugador que está empezando", Level: 1, Color: "#94a3b8", IsActive: true},
		{Name: "Intermedio", Code: "intermediate", Description: "Jugador con conocimientos básicos", Level: 2, Color: "#3b82f6", IsActive: true},
		{Name: "Avanzado", Code: "advanced", Description: "Jugador con buen nivel técnico", Level: 3, Color: "#f59e0b", IsActive: true},
		{Name: "Profesional", Code: "professional", Description: "Jugador de nivel profesional", Level: 4, Color: "#ef4444", IsActive: true},
	}
	for _, sl := range skillLevels {
		var existing models.PlayerSkillLevel
		if uc.db.Where("code = ?", sl.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&sl).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", sl.Code).Msg("Error creando nivel de habilidad")
			}
		}
	}

	// Especialidades de entrenadores
	specialties := []models.CoachSpecialty{
		{Name: "Portería", Code: "goalkeeper", Description: "Especialista en entrenamiento de porteros", Icon: "shield", IsActive: true},
		{Name: "Técnica Individual", Code: "individual_technique", Description: "Trabajo de control, pase y regate", Icon: "target", IsActive: true},
		{Name: "Táctica", Code: "tactics", Description: "Estrategia y posicionamiento en campo", Icon: "map", IsActive: true},
		{Name: "Preparación Física", Code: "physical", Description: "Acondicionamiento físico y resistencia", Icon: "activity", IsActive: true},
		{Name: "Preparación Psicológica", Code: "psychological", Description: "Mentalidad y concentración deportiva", Icon: "brain", IsActive: true},
		{Name: "Fundamentos", Code: "fundamentals", Description: "Bases del fútbol para principiantes", Icon: "book", IsActive: true},
		{Name: "Estrategia de Juego", Code: "game_strategy", Description: "Esquemas de juego y análisis táctico", Icon: "layout", IsActive: true},
	}
	for _, s := range specialties {
		var existing models.CoachSpecialty
		if uc.db.Where("code = ?", s.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&s).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", s.Code).Msg("Error creando especialidad")
			}
		}
	}

	// Tipos de sesión de entrenamiento
	sessionTypes := []models.TrainingSessionType{
		{Name: "Sesión Técnica", Code: "technical", Description: "Entrenamiento de habilidades técnicas", DefaultDuration: 60, AllowsIndividual: true, AllowsGroup: true, Icon: "target", Color: "#3b82f6", IsActive: true},
		{Name: "Sesión Física", Code: "physical", Description: "Preparación física y acondicionamiento", DefaultDuration: 60, AllowsIndividual: true, AllowsGroup: true, Icon: "activity", Color: "#ef4444", IsActive: true},
		{Name: "Sesión Táctica", Code: "tactical", Description: "Trabajo táctico y de posicionamiento", DefaultDuration: 90, AllowsIndividual: false, AllowsGroup: true, Icon: "map", Color: "#10b981", IsActive: true},
		{Name: "Sesión Psicológica", Code: "psychological", Description: "Preparación mental y concentración", DefaultDuration: 45, AllowsIndividual: true, AllowsGroup: false, Icon: "brain", Color: "#8b5cf6", IsActive: true},
		{Name: "Sesión de Fundamentos", Code: "fundamentals", Description: "Trabajo de fundamentos básicos del fútbol", DefaultDuration: 60, AllowsIndividual: true, AllowsGroup: true, Icon: "book", Color: "#f59e0b", IsActive: true},
		{Name: "Práctica de Juego", Code: "game_practice", Description: "Partidos de práctica y simulación de juego", DefaultDuration: 90, AllowsIndividual: false, AllowsGroup: true, Icon: "play", Color: "#06b6d4", IsActive: true},
	}
	for _, st := range sessionTypes {
		var existing models.TrainingSessionType
		if uc.db.Where("code = ?", st.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&st).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", st.Code).Msg("Error creando tipo de sesión")
			}
		}
	}

	// Estados de reserva
	bookingStatuses := []models.STBookingStatus{
		{Name: "Pendiente", Code: "pending", Description: "Reserva pendiente de aprobación", Color: "#f59e0b", Icon: "clock", IsFinal: false, IsActive: true},
		{Name: "Aprobada", Code: "approved", Description: "Reserva aprobada por el profesor", Color: "#10b981", Icon: "check-circle", IsFinal: false, IsActive: true},
		{Name: "Rechazada", Code: "rejected", Description: "Reserva rechazada por el profesor", Color: "#ef4444", Icon: "x-circle", IsFinal: true, IsActive: true},
		{Name: "Completada", Code: "completed", Description: "Sesión completada exitosamente", Color: "#3b82f6", Icon: "check", IsFinal: true, IsActive: true},
		{Name: "Cancelada", Code: "cancelled", Description: "Reserva cancelada", Color: "#6b7280", Icon: "slash", IsFinal: true, IsActive: true},
	}
	for _, bs := range bookingStatuses {
		var existing models.STBookingStatus
		if uc.db.Where("code = ?", bs.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&bs).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", bs.Code).Msg("Error creando estado de reserva")
			}
		}
	}

	// Estados de asistencia
	attendanceStatuses := []models.STAttendanceStatus{
		{Name: "Asistió", Code: "attended", Description: "El jugador asistió a la sesión", Color: "#10b981", Icon: "check", IsActive: true},
		{Name: "Ausente", Code: "absent", Description: "El jugador no asistió a la sesión", Color: "#ef4444", Icon: "x", IsActive: true},
		{Name: "Tardanza", Code: "late", Description: "El jugador llegó tarde a la sesión", Color: "#f59e0b", Icon: "clock", IsActive: true},
		{Name: "Justificado", Code: "excused", Description: "Ausencia justificada", Color: "#3b82f6", Icon: "file-text", IsActive: true},
	}
	for _, as := range attendanceStatuses {
		var existing models.STAttendanceStatus
		if uc.db.Where("code = ?", as.Code).First(&existing).Error != nil {
			if err := uc.db.Create(&as).Error; err != nil {
				uc.logger.Warn().Err(err).Str("code", as.Code).Msg("Error creando estado de asistencia")
			}
		}
	}

	uc.logger.Info().Msg("✅ Datos iniciales de sport training sembrados correctamente")
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
