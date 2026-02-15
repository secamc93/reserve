package models

import (
	"time"

	"gorm.io/gorm"
)

// ═══════════════════════════════════════════════════════════════════
//
//	SPORT TRAINING DOMAIN MODELS
//	Schema: sport_training
//
//	Este archivo contiene todos los modelos relacionados con el dominio
//	de entrenamiento deportivo (academias de fútbol, clubs deportivos).
//
//	Tablas en esquema 'sport_training':
//	- player_skill_levels: Niveles de habilidad (maestro)
//	- coach_specialties: Especialidades de entrenadores (maestro)
//	- training_session_types: Tipos de sesión (maestro)
//	- st_booking_statuses: Estados de reserva (maestro)
//	- st_attendance_statuses: Estados de asistencia (maestro)
//	- players: Jugadores (menores y adultos)
//	- guardians: Tutores/padres de jugadores menores
//	- player_guardians: Relación N:N jugadores-tutores
//	- coaches: Profesores/entrenadores
//	- coach_specialty_assignments: Asignación de especialidades
//	- training_groups: Grupos de entrenamiento
//	- group_players: Relación N:N grupos-jugadores
//	- training_sessions: Sesiones de entrenamiento
//	- session_bookings: Reservas de sesiones
//	- st_attendance_records: Registros de asistencia
//
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────
//
//	PLAYER SKILL LEVELS – Niveles de habilidad de jugadores (Maestro)
//
// ───────────────────────────────────────────
type PlayerSkillLevel struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"`  // Principiante, Intermedio, Avanzado, Profesional
	Code        string `gorm:"size:30;not null;unique"`  // beginner, intermediate, advanced, professional
	Description string `gorm:"size:255"`
	Level       int    `gorm:"not null;unique"`          // 1, 2, 3, 4 (orden numérico)
	Color       string `gorm:"size:7;default:'#6b7280'"` // Color hex para UI
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	STPlayers       []STPlayer       `gorm:"foreignKey:SkillLevelID"`
	TrainingGroups []TrainingGroup `gorm:"foreignKey:SkillLevelID"`
}

// TableName especifica el nombre de tabla con esquema
func (PlayerSkillLevel) TableName() string {
	return "sport_training.player_skill_levels"
}

// ───────────────────────────────────────────
//
//	COACH SPECIALTIES – Especialidades de entrenadores (Maestro)
//
// ───────────────────────────────────────────
type CoachSpecialty struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"` // Portería, Técnica Individual, Táctica, etc.
	Code        string `gorm:"size:50;not null;unique"`  // goalkeeper, individual_technique, tactics, etc.
	Description string `gorm:"size:500"`
	Icon        string `gorm:"size:100"` // Icono para UI
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	CoachSpecialtyAssignments []CoachSpecialtyAssignment `gorm:"foreignKey:CoachSpecialtyID"`
}

// TableName especifica el nombre de tabla con esquema
func (CoachSpecialty) TableName() string {
	return "sport_training.coach_specialties"
}

// ───────────────────────────────────────────
//
//	TRAINING SESSION TYPES – Tipos de sesión de entrenamiento (Maestro)
//
// ───────────────────────────────────────────
type TrainingSessionType struct {
	gorm.Model
	Name             string   `gorm:"size:100;not null;unique"`           // Sesión Técnica, Sesión Física, etc.
	Code             string   `gorm:"size:50;not null;unique"`            // technical, physical, tactical, etc.
	Description      string   `gorm:"size:500"`
	DefaultDuration  int      `gorm:"not null;default:60"`               // Duración por defecto en minutos
	DefaultPrice     *float64 `gorm:"type:decimal(10,2)"`                // Precio por defecto
	AllowsIndividual bool     `gorm:"default:true"`                      // Permite sesiones individuales
	AllowsGroup      bool     `gorm:"default:true"`                      // Permite sesiones grupales
	Icon             string   `gorm:"size:100"`
	Color            string   `gorm:"size:7;default:'#3b82f6'"` // Color hex para UI
	IsActive         bool     `gorm:"default:true"`

	// Relaciones
	TrainingSessions []TrainingSession `gorm:"foreignKey:TrainingSessionTypeID"`
}

// TableName especifica el nombre de tabla con esquema
func (TrainingSessionType) TableName() string {
	return "sport_training.training_session_types"
}

// ───────────────────────────────────────────
//
//	ST BOOKING STATUSES – Estados de reserva (Maestro)
//
// ───────────────────────────────────────────
type STBookingStatus struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"`  // Pendiente, Aprobada, Rechazada, etc.
	Code        string `gorm:"size:30;not null;unique"`  // pending, approved, rejected, completed, cancelled
	Description string `gorm:"size:255"`
	Color       string `gorm:"size:7;default:'#6b7280'"` // Color hex para UI
	Icon        string `gorm:"size:100"`
	IsFinal     bool   `gorm:"default:false"` // Si es estado final
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	SessionBookings []SessionBooking `gorm:"foreignKey:BookingStatusID"`
}

// TableName especifica el nombre de tabla con esquema
func (STBookingStatus) TableName() string {
	return "sport_training.st_booking_statuses"
}

// ───────────────────────────────────────────
//
//	ST ATTENDANCE STATUSES – Estados de asistencia (Maestro)
//
// ───────────────────────────────────────────
type STAttendanceStatus struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"`  // Asistió, Ausente, Tardanza, Justificado
	Code        string `gorm:"size:30;not null;unique"`  // attended, absent, late, excused
	Description string `gorm:"size:255"`
	Color       string `gorm:"size:7;default:'#6b7280'"` // Color hex para UI
	Icon        string `gorm:"size:100"`
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	STAttendanceRecords []STAttendanceRecord `gorm:"foreignKey:AttendanceStatusID"`
}

// TableName especifica el nombre de tabla con esquema
func (STAttendanceStatus) TableName() string {
	return "sport_training.st_attendance_statuses"
}

// ───────────────────────────────────────────
//
//	ST PLAYER – Jugadores (menores y adultos)
//
// ───────────────────────────────────────────
type STPlayer struct {
	gorm.Model
	BusinessID     uint      `gorm:"not null;index;uniqueIndex:idx_st_business_player_doc,priority:1"`
	UserID         *uint     `gorm:"index"` // Usuario asociado (si es adulto y tiene cuenta)
	FirstName      string    `gorm:"size:100;not null"`
	LastName       string    `gorm:"size:100;not null"`
	DocumentType   string    `gorm:"size:20;not null"` // DNI, Passport, BirthCertificate, etc.
	DocumentNumber string    `gorm:"size:50;not null;uniqueIndex:idx_st_business_player_doc,priority:2"`
	DateOfBirth    time.Time `gorm:"not null;index"`
	Gender         string    `gorm:"size:10;not null"` // male, female, other
	Email          *string   `gorm:"size:150;index"`
	Phone          *string   `gorm:"size:20"`

	// Dirección
	Address string `gorm:"size:255"`
	City    string `gorm:"size:100"`
	State   string `gorm:"size:100"`
	Country string `gorm:"size:100;default:'Colombia'"`

	// Información de Jugador
	SkillLevelID      *uint    `gorm:"index"`             // Nivel de habilidad
	PreferredPosition string   `gorm:"size:50"`           // Delantero, Medio, Defensa, Portero
	Height            *float64 `gorm:"type:decimal(5,2)"` // Altura en cm
	Weight            *float64 `gorm:"type:decimal(5,2)"` // Peso en kg
	JerseyNumber      *int     // Número de camiseta preferido

	// Información Médica Básica
	BloodType           string `gorm:"size:5"`          // O+, A+, B+, AB+, O-, A-, B-, AB-
	HasAllergies        bool   `gorm:"default:false"`
	AllergyDetails      string `gorm:"size:500"`
	HasMedicalCondition bool   `gorm:"default:false"`
	MedicalDetails      string `gorm:"size:500"`
	EmergencyContact    string `gorm:"size:200"`
	EmergencyPhone      string `gorm:"size:20"`

	// Metadata
	PhotoURL string `gorm:"size:500"`
	Notes    string `gorm:"type:text"`
	IsActive bool   `gorm:"default:true"`
	IsMinor  bool   `gorm:"not null;index"` // Calculado según edad

	// Relaciones
	Business          Business          `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	User              *User             `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	SkillLevel        *PlayerSkillLevel `gorm:"foreignKey:SkillLevelID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Guardians         []STGuardian      `gorm:"many2many:sport_training.player_guardians"`
	Groups            []TrainingGroup   `gorm:"many2many:sport_training.group_players"`
	SessionBookings   []SessionBooking  `gorm:"foreignKey:PlayerID"`
	STAttendanceRecords []STAttendanceRecord `gorm:"foreignKey:PlayerID"`
}

// TableName especifica el nombre de tabla con esquema
func (STPlayer) TableName() string {
	return "sport_training.players"
}

// ───────────────────────────────────────────
//
//	ST GUARDIAN – Tutores/padres de jugadores menores
//
// ───────────────────────────────────────────
type STGuardian struct {
	gorm.Model
	BusinessID     uint    `gorm:"not null;index;uniqueIndex:idx_st_business_guardian_doc,priority:1"`
	UserID         *uint   `gorm:"index"` // Usuario asociado (si tiene cuenta)
	FirstName      string  `gorm:"size:100;not null"`
	LastName       string  `gorm:"size:100;not null"`
	DocumentType   string  `gorm:"size:20;not null"` // DNI, Passport, etc.
	DocumentNumber string  `gorm:"size:50;not null;uniqueIndex:idx_st_business_guardian_doc,priority:2"`
	Email          string  `gorm:"size:150;not null;index"`
	Phone          string  `gorm:"size:20;not null"`
	SecondaryPhone *string `gorm:"size:20"`

	// Dirección
	Address string `gorm:"size:255"`
	City    string `gorm:"size:100"`
	State   string `gorm:"size:100"`
	Country string `gorm:"size:100;default:'Colombia'"`

	// Metadata
	Relationship     string `gorm:"size:50"` // Padre, Madre, Abuelo, Tío, Tutor Legal, etc.
	PhotoURL         string `gorm:"size:500"`
	Notes            string `gorm:"type:text"`
	CanBookSessions  bool   `gorm:"default:true"` // Autorizado para reservar sesiones
	CanAccessRecords bool   `gorm:"default:true"` // Autorizado para ver registros del menor
	IsActive         bool   `gorm:"default:true"`

	// Relaciones
	Business Business   `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	User     *User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Players  []STPlayer `gorm:"many2many:sport_training.player_guardians"`
}

// TableName especifica el nombre de tabla con esquema
func (STGuardian) TableName() string {
	return "sport_training.guardians"
}

// ───────────────────────────────────────────
//
//	PLAYER GUARDIANS – Relación N:N jugadores-tutores
//
// ───────────────────────────────────────────
type PlayerGuardian struct {
	gorm.Model
	STPlayerID          uint   `gorm:"not null;index;uniqueIndex:idx_st_player_guardian,priority:1;column:st_player_id"`
	STGuardianID        uint   `gorm:"not null;index;uniqueIndex:idx_st_player_guardian,priority:2;column:st_guardian_id"`
	RelationshipType    string `gorm:"size:50;not null"` // Padre, Madre, Tutor Legal, etc.
	IsPrimaryGuardian   bool   `gorm:"default:false"`    // Tutor principal
	CanPickup           bool   `gorm:"default:true"`     // Autorizado para recoger al menor
	CanBookSessions     bool   `gorm:"default:true"`     // Autorizado para reservar sesiones
	HasMedicalAuthority bool   `gorm:"default:false"`    // Autorizado para decisiones médicas
	StartDate           time.Time `gorm:"not null"`
	EndDate             *time.Time
	Notes               string `gorm:"type:text"`

	// Relaciones
	Player   STPlayer   `gorm:"foreignKey:STPlayerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Guardian STGuardian `gorm:"foreignKey:STGuardianID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema
func (PlayerGuardian) TableName() string {
	return "sport_training.player_guardians"
}

// ───────────────────────────────────────────
//
//	COACH – Profesores/entrenadores
//
// ───────────────────────────────────────────
type Coach struct {
	gorm.Model
	BusinessID     uint   `gorm:"not null;index;uniqueIndex:idx_st_business_coach_doc,priority:1"`
	UserID         uint   `gorm:"not null;index"` // Usuario asociado (obligatorio)
	FirstName      string `gorm:"size:100;not null"`
	LastName       string `gorm:"size:100;not null"`
	DocumentType   string `gorm:"size:20;not null"`
	DocumentNumber string `gorm:"size:50;not null;uniqueIndex:idx_st_business_coach_doc,priority:2"`
	Email          string `gorm:"size:150;not null;index"`
	Phone          string `gorm:"size:20;not null"`

	// Información Profesional
	LicenseNumber     *string `gorm:"size:100"` // Número de licencia de entrenador
	YearsOfExperience *int
	Biography         string `gorm:"type:text"`
	Certifications    string `gorm:"type:text"` // Certificaciones

	// Disponibilidad
	IsAvailable        bool `gorm:"default:true"` // Disponible para nuevas sesiones
	MaxSessionsPerDay  *int `gorm:"default:8"`    // Máximo de sesiones por día
	MaxSessionsPerWeek *int `gorm:"default:40"`   // Máximo de sesiones por semana

	// Configuración de Precios
	HourlyRate *float64 `gorm:"type:decimal(10,2)"` // Tarifa por hora

	// Metadata
	PhotoURL string `gorm:"size:500"`
	Notes    string `gorm:"type:text"`
	IsActive bool   `gorm:"default:true"`

	// Relaciones
	Business                  Business                   `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	User                      User                       `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CoachSpecialtyAssignments []CoachSpecialtyAssignment `gorm:"foreignKey:CoachID"`
	TrainingGroups            []TrainingGroup            `gorm:"foreignKey:CoachID"`
	TrainingSessions          []TrainingSession          `gorm:"foreignKey:CoachID"`
}

// TableName especifica el nombre de tabla con esquema
func (Coach) TableName() string {
	return "sport_training.coaches"
}

// ───────────────────────────────────────────
//
//	COACH SPECIALTY ASSIGNMENTS – Asignación de especialidades a profesores
//
// ───────────────────────────────────────────
type CoachSpecialtyAssignment struct {
	gorm.Model
	CoachID          uint `gorm:"not null;index;uniqueIndex:idx_st_coach_specialty,priority:1"`
	CoachSpecialtyID uint `gorm:"not null;index;uniqueIndex:idx_st_coach_specialty,priority:2"`
	ProficiencyLevel int  `gorm:"default:3"` // 1-5 (1: Básico, 5: Experto)

	// Relaciones
	Coach          Coach          `gorm:"foreignKey:CoachID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CoachSpecialty CoachSpecialty `gorm:"foreignKey:CoachSpecialtyID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema
func (CoachSpecialtyAssignment) TableName() string {
	return "sport_training.coach_specialty_assignments"
}

// ───────────────────────────────────────────
//
//	TRAINING GROUPS – Grupos de entrenamiento
//
// ───────────────────────────────────────────
type TrainingGroup struct {
	gorm.Model
	BusinessID      uint   `gorm:"not null;index;uniqueIndex:idx_st_business_group_name,priority:1"`
	CoachID         uint   `gorm:"not null;index"`
	Name            string `gorm:"size:150;not null;uniqueIndex:idx_st_business_group_name,priority:2"`
	Code            string `gorm:"size:50"`                 // Código interno
	Category        string `gorm:"size:50"`                 // Sub-10, Sub-12, Sub-15, Sub-17, Adultos, etc.
	Description     string `gorm:"size:500"`
	MaxCapacity     int    `gorm:"not null;default:20"`     // Capacidad máxima de jugadores
	CurrentCapacity int    `gorm:"default:0"`               // Jugadores actuales inscritos
	AgeMin          *int   // Edad mínima
	AgeMax          *int   // Edad máxima
	SkillLevelID    *uint  `gorm:"index"` // Nivel de habilidad requerido

	// Horarios Recurrentes
	RecurringSchedule string `gorm:"type:text"` // Ej: "Lunes 16:00-18:00, Miércoles 16:00-18:00"

	// Metadata
	PhotoURL string `gorm:"size:500"`
	IsActive bool   `gorm:"default:true"`

	// Relaciones
	Business         Business          `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Coach            Coach             `gorm:"foreignKey:CoachID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	SkillLevel       *PlayerSkillLevel `gorm:"foreignKey:SkillLevelID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Players          []STPlayer        `gorm:"many2many:sport_training.group_players"`
	TrainingSessions []TrainingSession `gorm:"foreignKey:TrainingGroupID"`
}

// TableName especifica el nombre de tabla con esquema
func (TrainingGroup) TableName() string {
	return "sport_training.training_groups"
}

// ───────────────────────────────────────────
//
//	GROUP PLAYERS – Relación N:N grupos-jugadores
//
// ───────────────────────────────────────────
type GroupPlayer struct {
	gorm.Model
	TrainingGroupID uint      `gorm:"not null;index;uniqueIndex:idx_st_group_player,priority:1"`
	STPlayerID      uint      `gorm:"not null;index;uniqueIndex:idx_st_group_player,priority:2;column:st_player_id"`
	EnrollmentDate  time.Time `gorm:"not null"`
	ExitDate        *time.Time
	IsActive        bool   `gorm:"default:true"`
	Notes           string `gorm:"type:text"`

	// Relaciones
	TrainingGroup TrainingGroup `gorm:"foreignKey:TrainingGroupID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Player        STPlayer      `gorm:"foreignKey:STPlayerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema
func (GroupPlayer) TableName() string {
	return "sport_training.group_players"
}

// ───────────────────────────────────────────
//
//	TRAINING SESSIONS – Sesiones de entrenamiento
//
// ───────────────────────────────────────────
type TrainingSession struct {
	gorm.Model
	BusinessID            uint  `gorm:"not null;index"`
	TrainingSessionTypeID uint  `gorm:"not null;index"`
	CoachID               uint  `gorm:"not null;index"`
	TrainingGroupID       *uint `gorm:"index"` // Si es sesión grupal
	SessionMode           string `gorm:"size:20;not null;index"` // individual, group

	// Fecha y Hora
	ScheduledDate time.Time `gorm:"not null;index"`
	StartTime     time.Time `gorm:"not null"`
	EndTime       time.Time `gorm:"not null"`
	Duration      int       `gorm:"not null"` // Duración en minutos

	// Ubicación
	Location string `gorm:"size:255"`
	Field    string `gorm:"size:100"` // Cancha 1, Cancha 2, etc.

	// Configuración
	MaxParticipants     *int     `gorm:"default:1"` // Para individuales: 1, para grupales: N
	CurrentParticipants int      `gorm:"default:0"`
	Price               *float64 `gorm:"type:decimal(10,2)"`

	// Estado
	Status      string `gorm:"size:30;not null;default:'scheduled'"` // scheduled, in_progress, completed, cancelled
	IsRecurring bool   `gorm:"default:false"`                        // Si es sesión recurrente del grupo

	// Notas
	CoachNotes         string `gorm:"type:text"` // Notas privadas del profesor
	PublicNotes        string `gorm:"type:text"` // Notas públicas
	CancellationReason string `gorm:"type:text"`

	// Relaciones
	Business            Business             `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	TrainingSessionType TrainingSessionType  `gorm:"foreignKey:TrainingSessionTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Coach               Coach                `gorm:"foreignKey:CoachID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	TrainingGroup       *TrainingGroup       `gorm:"foreignKey:TrainingGroupID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	SessionBookings     []SessionBooking     `gorm:"foreignKey:TrainingSessionID"`
	STAttendanceRecords []STAttendanceRecord `gorm:"foreignKey:TrainingSessionID"`
}

// TableName especifica el nombre de tabla con esquema
func (TrainingSession) TableName() string {
	return "sport_training.training_sessions"
}

// ───────────────────────────────────────────
//
//	SESSION BOOKINGS – Reservas de sesiones
//
// ───────────────────────────────────────────
type SessionBooking struct {
	gorm.Model
	TrainingSessionID uint `gorm:"not null;index"`
	PlayerID          uint `gorm:"not null;index"`
	BookedByUserID    uint `gorm:"not null;index"` // Usuario que hizo la reserva (tutor o jugador adulto)
	BookingStatusID   uint `gorm:"not null;index"`

	// Información de Reserva
	BookingDate  time.Time `gorm:"not null"`
	RequestNotes string    `gorm:"type:text"` // Notas del solicitante

	// Respuesta del Profesor
	ReviewedAt        *time.Time
	ReviewedByCoachID *uint  `gorm:"index"` // Profesor que revisó
	ResponseNotes     string `gorm:"type:text"`

	// Cancelación
	CancelledAt        *time.Time
	CancelledByUserID  *uint  `gorm:"index"`
	CancellationReason string `gorm:"type:text"`

	// Pago
	Price         *float64 `gorm:"type:decimal(10,2)"`
	IsPaid        bool     `gorm:"default:false"`
	PaymentDate   *time.Time
	PaymentMethod string `gorm:"size:50"` // cash, card, transfer, etc.

	// Relaciones
	TrainingSession TrainingSession `gorm:"foreignKey:TrainingSessionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Player          STPlayer        `gorm:"foreignKey:PlayerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	BookedByUser    User            `gorm:"foreignKey:BookedByUserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	BookingStatus   STBookingStatus `gorm:"foreignKey:BookingStatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ReviewedByCoach *Coach          `gorm:"foreignKey:ReviewedByCoachID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CancelledByUser *User           `gorm:"foreignKey:CancelledByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema
func (SessionBooking) TableName() string {
	return "sport_training.session_bookings"
}

// ───────────────────────────────────────────
//
//	ST ATTENDANCE RECORDS – Registros de asistencia
//
// ───────────────────────────────────────────
type STAttendanceRecord struct {
	gorm.Model
	TrainingSessionID  uint `gorm:"not null;index;uniqueIndex:idx_st_session_player_attendance,priority:1"`
	PlayerID           uint `gorm:"not null;index;uniqueIndex:idx_st_session_player_attendance,priority:2"`
	AttendanceStatusID uint `gorm:"not null;index"`

	// Información de Asistencia
	CheckInTime       *time.Time // Hora de llegada
	CheckOutTime      *time.Time // Hora de salida
	RecordedByCoachID uint       `gorm:"not null;index"` // Profesor que registró
	RecordedAt        time.Time  `gorm:"not null"`

	// Evaluación
	PerformanceRating *int   // 1-5
	CoachFeedback     string `gorm:"type:text"` // Retroalimentación del profesor
	PlayerNotes       string `gorm:"type:text"` // Notas sobre el jugador

	// Justificación (para ausencias)
	JustificationReason string `gorm:"type:text"`
	JustificationProof  string `gorm:"size:500"` // URL de documento de justificación

	// Relaciones
	TrainingSession  TrainingSession  `gorm:"foreignKey:TrainingSessionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Player           STPlayer         `gorm:"foreignKey:PlayerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	AttendanceStatus STAttendanceStatus `gorm:"foreignKey:AttendanceStatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	RecordedByCoach  Coach            `gorm:"foreignKey:RecordedByCoachID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// TableName especifica el nombre de tabla con esquema
func (STAttendanceRecord) TableName() string {
	return "sport_training.st_attendance_records"
}
