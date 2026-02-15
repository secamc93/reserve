package models

import (
	"time"

	"gorm.io/gorm"
)

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DOMAIN MODELS
//	Schema: horizontal_property
//
//	Este archivo contiene todos los modelos relacionados con el dominio
//	de propiedades horizontales (condominios, edificios, etc.).
//
//	Tablas en esquema 'horizontal_property':
//	- property_units: Unidades de propiedad (apartamentos/casas)
//	- resident_types: Tipos de residentes (propietario/arrendatario)
//	- residents: Residentes de las propiedades
//	- committee_types: Tipos de comités (Consejo, Comité de Convivencia, etc.)
//	- committee_positions: Cargos dentro de comités (Presidente, Secretario, etc.)
//	- committees: Comités específicos de cada propiedad
//	- committee_members: Miembros de los comités
//	- property_staff: Empleados/staff de la propiedad
//	- voting_groups: Grupos de votaciones (Asambleas, etc.)
//	- votings: Votaciones individuales
//	- voting_options: Opciones de cada votación (Sí, No, etc.)
//	- votes: Votos individuales de residentes
//	- visitors: Visitantes (maestro)
//	- visit_types: Tipos de visita (Familiar, Amigo, Proveedor, etc.)
//	- visit_statuses: Estados de visita (Pendiente, Autorizada, En Curso, etc.)
//	- visitor_vehicles: Vehículos de visitantes
//	- visits: Visitas
//	- visit_companions: Acompañantes de visitas
//	- visit_assets: Equipos y herramientas de visitas
//	- visit_blacklist: Lista negra de visitantes
//	- visit_recurring_patterns: Patrones de visitas recurrentes
//	- visit_restrictions: Restricciones de visitas
//	- common_area_types: Tipos de zonas comunes (maestro)
//	- common_areas: Zonas comunes por propiedad
//	- common_area_schedules: Horarios de disponibilidad
//	- common_area_restrictions: Restricciones temporales
//	- common_area_reservations: Reservas de zonas comunes
//	- reservation_statuses: Estados de reserva
//	- recurring_reservation_patterns: Patrones de reservas recurrentes
//
//	NOTA: staff_types está en el esquema 'public' ya que es genérico para todos los dominios
//
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────
//
//	PROPERTY UNITS – Unidades de propiedad (apartamentos/casas)
//
// ───────────────────────────────────────────
type PropertyUnit struct {
	gorm.Model
	BusinessID               uint     `gorm:"not null;index;uniqueIndex:idx_business_unit_number,priority:1"`
	Number                   string   `gorm:"size:20;not null;uniqueIndex:idx_business_unit_number,priority:2"` // Número de apartamento/casa
	Floor                    *int     `gorm:"index"`                                                            // Piso (opcional para casas)
	Block                    string   `gorm:"size:10"`                                                          // Bloque/Torre (ej. "A", "B")
	UnitType                 string   `gorm:"size:20;not null;default:'apartment'"`                             // apartment, house, office, etc.
	Area                     *float64 // Área en m²
	Bedrooms                 *int     // Número de habitaciones
	Bathrooms                *int     // Número de baños
	ParticipationCoefficient *float64 `gorm:"type:decimal(10,6)"` // Coeficiente de participación para votaciones
	Description              string   `gorm:"size:500"`
	IsActive                 bool     `gorm:"default:true"`

	// Relaciones
	Business                     Business                      `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Residents                    []Resident                    `gorm:"many2many:horizontal_property.resident_units"`
	Votes                        []Vote                        `gorm:"foreignKey:PropertyUnitID"` // Votos emitidos por la unidad
	Proxies                      []Proxy                       `gorm:"foreignKey:PropertyUnitID"` // Apoderados de la unidad
	AttendanceRecords            []AttendanceRecord            `gorm:"foreignKey:PropertyUnitID"` // Registros de asistencia de la unidad
	Visits                       []Visit                       `gorm:"foreignKey:PropertyUnitID"` // Visitas a la unidad
	VisitRecurringPatterns       []VisitRecurringPattern       `gorm:"foreignKey:PropertyUnitID"` // Patrones de visitas recurrentes
	CommonAreaReservations       []CommonAreaReservation       `gorm:"foreignKey:PropertyUnitID"` // Reservas de zonas comunes
	RecurringReservationPatterns []RecurringReservationPattern `gorm:"foreignKey:PropertyUnitID"` // Patrones de reservas recurrentes
	ParkingAssignments           []ParkingAssignment           `gorm:"foreignKey:PropertyUnitID"` // Asignaciones de parqueaderos
	ParkingReservations          []ParkingReservation          `gorm:"foreignKey:PropertyUnitID"` // Reservas de parqueaderos
}

// TableName especifica el nombre de tabla con esquema para PropertyUnit
func (PropertyUnit) TableName() string {
	return "horizontal_property.property_units"
}

// ───────────────────────────────────────────
//
//	RESIDENT TYPES – Tipos de residentes
//
// ───────────────────────────────────────────
type ResidentType struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"` // Propietario, Arrendatario, Familiar, etc.
	Code        string `gorm:"size:20;not null;unique"` // owner, tenant, family, etc.
	Description string `gorm:"size:255"`
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	Residents []Resident `gorm:"foreignKey:ResidentTypeID"`
}

// TableName especifica el nombre de tabla con esquema para ResidentType
func (ResidentType) TableName() string {
	return "horizontal_property.resident_types"
}

// ───────────────────────────────────────────
//
//	RESIDENTS – Residentes de las propiedades horizontales
//
// ───────────────────────────────────────────
type Resident struct {
	gorm.Model
	BusinessID       uint       `gorm:"not null;index;uniqueIndex:idx_business_resident_dni,priority:1"`       // Propiedad horizontal
	ResidentTypeID   uint       `gorm:"not null;index"`                                                        // Tipo de residente
	Name             string     `gorm:"size:255;not null"`                                                     // Nombre completo
	Email            string     `gorm:"size:255;uniqueIndex:idx_business_resident_email,priority:2"`           // Email (único por negocio)
	Phone            string     `gorm:"size:20"`                                                               // Teléfono
	Dni              string     `gorm:"size:30;uniqueIndex:idx_business_resident_dni,priority:2;default:null"` // Documento de identidad (puede ser nulo, único por propiedad cuando existe)
	EmergencyContact string     `gorm:"size:255"`                                                              // Contacto de emergencia
	IsActive         bool       `gorm:"default:true"`                                                          // Si está activo
	MoveInDate       *time.Time // Fecha de ingreso (compatibilidad: nivel residente)
	MoveOutDate      *time.Time // Fecha de salida (opcional, compatibilidad)

	// Información específica para arrendatarios (compatibilidad: idealmente por unidad)
	LeaseStartDate *time.Time // Fecha inicio de contrato (para arrendatarios)
	LeaseEndDate   *time.Time // Fecha fin de contrato (para arrendatarios)
	MonthlyRent    *float64   // Valor mensual del arriendo

	// Relaciones
	Business                     Business                      `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ResidentType                 ResidentType                  `gorm:"foreignKey:ResidentTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	PropertyUnits                []PropertyUnit                `gorm:"many2many:horizontal_property.resident_units"`
	CommitteeMembers             []CommitteeMember             `gorm:"foreignKey:ResidentID"`             // Participación en comités
	AttendanceRecords            []AttendanceRecord            `gorm:"foreignKey:ResidentID"`             // Registros de asistencia del residente
	AuthorizedVisits             []Visit                       `gorm:"foreignKey:AuthorizedByResidentID"` // Visitas autorizadas por el residente
	ReceivedVisits               []Visit                       `gorm:"foreignKey:ResidentID"`             // Visitas recibidas por el residente
	VisitRecurringPatterns       []VisitRecurringPattern       `gorm:"foreignKey:ResidentID"`             // Patrones de visitas recurrentes
	CommonAreaReservations       []CommonAreaReservation       `gorm:"foreignKey:ResidentID"`             // Reservas de zonas comunes
	RecurringReservationPatterns []RecurringReservationPattern `gorm:"foreignKey:ResidentID"`             // Patrones de reservas recurrentes
	ParkingAssignments           []ParkingAssignment           `gorm:"foreignKey:ResidentID"`             // Asignaciones de parqueaderos
	ParkingReservations          []ParkingReservation          `gorm:"foreignKey:ResidentID"`             // Reservas de parqueaderos
}

// TableName especifica el nombre de tabla con esquema para Resident
func (Resident) TableName() string {
	return "horizontal_property.residents"
}

// ───────────────────────────────────────────
//
//	RESIDENT UNITS – Relación muchos-a-muchos Resident <-> PropertyUnit
//
// ───────────────────────────────────────────
type ResidentUnit struct {
	gorm.Model
	BusinessID     uint       `gorm:"not null;index"`
	ResidentID     uint       `gorm:"not null;index;uniqueIndex:idx_resident_property_unit,priority:1"`
	PropertyUnitID uint       `gorm:"not null;index;uniqueIndex:idx_resident_property_unit,priority:2"`
	IsMainResident bool       `gorm:"default:false"` // Bandera por unidad
	MoveInDate     *time.Time // Período por unidad
	MoveOutDate    *time.Time
	LeaseStartDate *time.Time
	LeaseEndDate   *time.Time
	MonthlyRent    *float64 `gorm:"type:decimal(12,2)"`

	// Relaciones
	Resident     Resident     `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit PropertyUnit `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Business     Business     `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema para ResidentUnit
func (ResidentUnit) TableName() string {
	return "horizontal_property.resident_units"
}

// ───────────────────────────────────────────
//
//	COMMITTEE TYPES – Tipos de comités/consejos
//
// ───────────────────────────────────────────
type CommitteeType struct {
	gorm.Model
	Name               string `gorm:"size:100;not null;unique"` // Consejo de Administración, Comité de Convivencia, etc.
	Code               string `gorm:"size:30;not null;unique"`  // admin_council, coexistence_committee, etc.
	Description        string `gorm:"size:500"`
	IsRequired         bool   `gorm:"default:true"` // Si es obligatorio por ley
	MaxMembers         *int   `gorm:"default:null"` // Máximo número de miembros (null = sin límite)
	MinMembers         int    `gorm:"default:1"`    // Mínimo número de miembros
	RequiresOwnership  bool   `gorm:"default:true"` // Si requiere ser propietario
	TermDurationMonths *int   `gorm:"default:24"`   // Duración del período en meses
	IsActive           bool   `gorm:"default:true"`

	// Relaciones
	Committees []Committee `gorm:"foreignKey:CommitteeTypeID"`
}

// TableName especifica el nombre de tabla con esquema para CommitteeType
func (CommitteeType) TableName() string {
	return "horizontal_property.committee_types"
}

// ───────────────────────────────────────────
//
//	COMMITTEES – Comités/Consejos específicos de una propiedad
//
// ───────────────────────────────────────────
type Committee struct {
	gorm.Model
	BusinessID      uint       `gorm:"not null;index;uniqueIndex:idx_business_committee_type,priority:1"` // Propiedad horizontal
	CommitteeTypeID uint       `gorm:"not null;index;uniqueIndex:idx_business_committee_type,priority:2"` // Tipo de comité
	Name            string     `gorm:"size:150;not null"`                                                 // Nombre específico (ej. "Consejo de Administración 2024-2026")
	StartDate       time.Time  `gorm:"not null"`                                                          // Fecha de inicio del período
	EndDate         *time.Time // Fecha de fin del período (null si está activo)
	IsActive        bool       `gorm:"default:true"` // Si está actualmente activo
	Notes           string     `gorm:"size:1000"`    // Notas adicionales

	// Relaciones
	Business         Business          `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CommitteeType    CommitteeType     `gorm:"foreignKey:CommitteeTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	CommitteeMembers []CommitteeMember `gorm:"foreignKey:CommitteeID"`
}

// TableName especifica el nombre de tabla con esquema para Committee
func (Committee) TableName() string {
	return "horizontal_property.committees"
}

// ───────────────────────────────────────────
//
//	COMMITTEE POSITIONS – Cargos dentro de los comités
//
// ───────────────────────────────────────────
type CommitteePosition struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"` // Presidente, Vicepresidente, Secretario, etc.
	Code        string `gorm:"size:20;not null;unique"` // president, vicepresident, secretary, etc.
	Description string `gorm:"size:255"`
	Level       int    `gorm:"default:1"` // Nivel jerárquico (1=más alto)
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	CommitteeMembers []CommitteeMember `gorm:"foreignKey:PositionID"`
}

// TableName especifica el nombre de tabla con esquema para CommitteePosition
func (CommitteePosition) TableName() string {
	return "horizontal_property.committee_positions"
}

// ───────────────────────────────────────────
//
//	COMMITTEE MEMBERS – Miembros de comités/consejos
//
// ───────────────────────────────────────────
type CommitteeMember struct {
	gorm.Model
	CommitteeID     uint       `gorm:"not null;index"` // Comité al que pertenece
	ResidentID      *uint      `gorm:"index"`          // Residente que es miembro (opcional)
	PropertyStaffID *uint      `gorm:"index"`          // Empleado que es miembro (opcional)
	PositionID      *uint      `gorm:"index"`          // Cargo dentro del comité (opcional)
	StartDate       time.Time  `gorm:"not null"`       // Fecha de inicio en el cargo
	EndDate         *time.Time // Fecha de fin en el cargo (null si está activo)
	IsActive        bool       `gorm:"default:true"` // Si está actualmente activo
	Notes           string     `gorm:"size:500"`     // Notas sobre la participación

	// Relaciones
	Committee     Committee          `gorm:"foreignKey:CommitteeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident      *Resident          `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyStaff *PropertyStaff     `gorm:"foreignKey:PropertyStaffID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Position      *CommitteePosition `gorm:"foreignKey:PositionID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para CommitteeMember
func (CommitteeMember) TableName() string {
	return "horizontal_property.committee_members"
}

// ───────────────────────────────────────────
//
//	PROPERTY STAFF – Empleados/staff de la propiedad horizontal
//
// ───────────────────────────────────────────
type PropertyStaff struct {
	gorm.Model
	BusinessID     uint       `gorm:"not null;index;uniqueIndex:idx_business_staff_dni,priority:1"`       // Propiedad horizontal
	StaffTypeID    uint       `gorm:"not null;index"`                                                     // Tipo de empleado
	Name           string     `gorm:"size:255;not null"`                                                  // Nombre completo
	Email          string     `gorm:"size:255;unique"`                                                    // Email único
	Phone          string     `gorm:"size:20"`                                                            // Teléfono
	Dni            string     `gorm:"size:30;uniqueIndex:idx_business_staff_dni,priority:2;default:null"` // Documento de identidad (puede ser nulo)
	ProfessionalID *string    `gorm:"size:50"`                                                            // Número de matrícula profesional (para contadores, etc.)
	CompanyName    *string    `gorm:"size:255"`                                                           // Nombre de empresa (si es externo)
	Address        string     `gorm:"size:255"`                                                           // Dirección
	IsExternal     bool       `gorm:"default:false"`                                                      // Si es empleado externo/contratista
	IsActive       bool       `gorm:"default:true"`                                                       // Si está activo
	HireDate       time.Time  `gorm:"not null"`                                                           // Fecha de contratación
	EndDate        *time.Time // Fecha de terminación (null si está activo)
	MonthlySalary  *float64   `gorm:"type:decimal(12,2)"` // Salario mensual
	Notes          string     `gorm:"size:1000"`          // Notas adicionales

	// Relaciones
	Business         Business          `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	StaffType        StaffType         `gorm:"foreignKey:StaffTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	CommitteeMembers []CommitteeMember `gorm:"foreignKey:PropertyStaffID"` // Participación en comités (para revisor fiscal, etc.)
}

// TableName especifica el nombre de tabla con esquema para PropertyStaff
func (PropertyStaff) TableName() string {
	return "horizontal_property.property_staff"
}

// ───────────────────────────────────────────
//
//	VOTING GROUPS – Grupos de votaciones (Asambleas, etc.)
//
// ───────────────────────────────────────────
type VotingGroup struct {
	gorm.Model
	BusinessID       uint      `gorm:"not null;index"`                  // Propiedad horizontal
	Name             string    `gorm:"size:150;not null"`               // Nombre del grupo (ej. "Asamblea Ordinaria 2024")
	Description      string    `gorm:"size:1000"`                       // Descripción detallada
	VotingStartDate  time.Time `gorm:"not null"`                        // Fecha de inicio de votaciones
	VotingEndDate    time.Time `gorm:"not null"`                        // Fecha de cierre de votaciones
	IsActive         bool      `gorm:"default:true"`                    // Si está activo
	RequiresQuorum   bool      `gorm:"default:true"`                    // Si requiere quórum
	QuorumPercentage *float64  `gorm:"type:decimal(5,2);default:50.00"` // Porcentaje de quórum requerido
	CreatedByUserID  *uint     `gorm:"index"`                           // Usuario que creó el grupo
	Notes            string    `gorm:"size:2000"`                       // Notas adicionales

	// Relaciones
	Business        Business         `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedBy       *User            `gorm:"foreignKey:CreatedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Votings         []Voting         `gorm:"foreignKey:VotingGroupID"`
	AttendanceLists []AttendanceList `gorm:"foreignKey:VotingGroupID"`
}

// TableName especifica el nombre de tabla con esquema para VotingGroup
func (VotingGroup) TableName() string {
	return "horizontal_property.voting_groups"
}

// ───────────────────────────────────────────
//
//	VOTINGS – Votaciones individuales
//
// ───────────────────────────────────────────
type Voting struct {
	gorm.Model
	VotingGroupID   uint   `gorm:"not null;index"`                    // Grupo de votaciones al que pertenece
	Title           string `gorm:"size:200;not null"`                 // Título de la votación
	Description     string `gorm:"size:2000;not null"`                // Descripción completa de lo que se vota
	VotingType      string `gorm:"size:20;not null;default:'simple'"` // simple, majority, unanimity, etc.
	IsSecret        bool   `gorm:"default:false"`                     // Si es votación secreta
	AllowAbstention bool   `gorm:"default:true"`                      // Si permite abstención
	IsActive        bool   `gorm:"default:true"`                      // Si está activa
	DisplayOrder    int    `gorm:"default:1"`                         // Orden de visualización

	// Configuración de mayorías
	RequiredPercentage *float64 `gorm:"type:decimal(5,2);default:50.00"` // Porcentaje requerido para aprobar

	// Relaciones
	VotingGroup   VotingGroup    `gorm:"foreignKey:VotingGroupID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	VotingOptions []VotingOption `gorm:"foreignKey:VotingID"`
	Votes         []Vote         `gorm:"foreignKey:VotingID"`
}

// TableName especifica el nombre de tabla con esquema para Voting
func (Voting) TableName() string {
	return "horizontal_property.votings"
}

// ───────────────────────────────────────────
//
//	VOTING OPTIONS – Opciones de votación
//
// ───────────────────────────────────────────
type VotingOption struct {
	gorm.Model
	VotingID     uint   `gorm:"not null;index;uniqueIndex:idx_voting_option_text,priority:1"`    // Votación a la que pertenece
	OptionText   string `gorm:"size:100;not null;uniqueIndex:idx_voting_option_text,priority:2"` // Texto de la opción (Sí, No, Abstención, etc.)
	OptionCode   string `gorm:"size:20;not null"`                                                // Código interno (yes, no, abstention, etc.)
	Color        string `gorm:"size:20;not null;default:'#3b82f6'"`                              // Color hexadecimal para la opción (ej. #22c55e para verde)
	DisplayOrder int    `gorm:"default:1"`                                                       // Orden de visualización
	IsActive     bool   `gorm:"default:true"`                                                    // Si está activa

	// Relaciones
	Voting Voting `gorm:"foreignKey:VotingID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Votes  []Vote `gorm:"foreignKey:VotingOptionID"`
}

// TableName especifica el nombre de tabla con esquema para VotingOption
func (VotingOption) TableName() string {
	return "horizontal_property.voting_options"
}

// ───────────────────────────────────────────
//
//	VOTES – Votos por unidades residenciales
//
// ───────────────────────────────────────────
type Vote struct {
	gorm.Model
	VotingID       uint      `gorm:"not null;index;uniqueIndex:idx_voting_property_unit_vote,priority:1"` // Votación
	PropertyUnitID uint      `gorm:"not null;index;uniqueIndex:idx_voting_property_unit_vote,priority:2"` // Unidad que vota
	VotingOptionID uint      `gorm:"not null;index"`                                                      // Opción seleccionada
	VotedAt        time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`                                  // Fecha y hora del voto
	IPAddress      string    `gorm:"size:45"`                                                             // IP desde donde se votó (para auditoría)
	UserAgent      string    `gorm:"size:500"`                                                            // User agent (para auditoría)
	Notes          string    `gorm:"size:500"`                                                            // Notas adicionales

	// Relaciones
	Voting       Voting       `gorm:"foreignKey:VotingID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit PropertyUnit `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	VotingOption VotingOption `gorm:"foreignKey:VotingOptionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema para Vote
func (Vote) TableName() string {
	return "horizontal_property.votes"
}

// ───────────────────────────────────────────
//
//	ATTENDANCE LISTS – Listas de asistencia para grupos de votación
//
// ───────────────────────────────────────────
type AttendanceList struct {
	gorm.Model
	VotingGroupID   uint   `gorm:"not null;index;uniqueIndex:idx_voting_group_attendance"` // Grupo de votación
	Title           string `gorm:"size:200;not null"`                                      // Título de la lista (ej. "Asistencia Asamblea Ordinaria 2024")
	Description     string `gorm:"size:1000"`                                              // Descripción de la lista
	IsActive        bool   `gorm:"default:true"`                                           // Si está activa
	CreatedByUserID *uint  `gorm:"index"`                                                  // Usuario que creó la lista
	Notes           string `gorm:"size:2000"`                                              // Notas adicionales

	// Relaciones
	VotingGroup       VotingGroup        `gorm:"foreignKey:VotingGroupID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedBy         *User              `gorm:"foreignKey:CreatedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	AttendanceRecords []AttendanceRecord `gorm:"foreignKey:AttendanceListID"`
}

// TableName especifica el nombre de tabla con esquema para AttendanceList
func (AttendanceList) TableName() string {
	return "horizontal_property.attendance_lists"
}

// ───────────────────────────────────────────
//
//	PROXIES – Apoderados para representar unidades en votaciones
//
// ───────────────────────────────────────────
type Proxy struct {
	gorm.Model
	BusinessID      uint       `gorm:"not null;index"`                      // Propiedad horizontal
	PropertyUnitID  uint       `gorm:"not null;index"`                      // Unidad que representa
	ProxyName       string     `gorm:"size:255;not null"`                   // Nombre completo del apoderado
	ProxyDni        string     `gorm:"size:30;not null"`                    // DNI del apoderado
	ProxyEmail      string     `gorm:"size:255"`                            // Email del apoderado
	ProxyPhone      string     `gorm:"size:20"`                             // Teléfono del apoderado
	ProxyAddress    string     `gorm:"size:500"`                            // Dirección del apoderado
	ProxyType       string     `gorm:"size:20;not null;default:'external'"` // external, resident, family
	IsActive        bool       `gorm:"default:true"`                        // Si está activo
	StartDate       time.Time  `gorm:"not null"`                            // Fecha de inicio del poder
	EndDate         *time.Time // Fecha de fin del poder (null si no tiene límite)
	PowerOfAttorney string     `gorm:"size:1000"` // Descripción del poder otorgado
	Notes           string     `gorm:"size:1000"` // Notas adicionales

	// Relaciones
	Business          Business           `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit      PropertyUnit       `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	AttendanceRecords []AttendanceRecord `gorm:"foreignKey:ProxyID"`
}

// TableName especifica el nombre de tabla con esquema para Proxy
func (Proxy) TableName() string {
	return "horizontal_property.proxies"
}

// ───────────────────────────────────────────
//
//	ATTENDANCE RECORDS – Registros de asistencia por unidad
//
// ───────────────────────────────────────────
type AttendanceRecord struct {
	gorm.Model
	AttendanceListID uint  `gorm:"not null;index"` // Lista de asistencia
	PropertyUnitID   uint  `gorm:"not null;index"` // Unidad residencial
	ResidentID       *uint `gorm:"index"`          // Residente que asiste (opcional)
	ProxyID          *uint `gorm:"index"`          // Apoderado que asiste (opcional)

	// Marcas de asistencia
	AttendedAsOwner bool `gorm:"default:false"` // Asistió como propietario
	AttendedAsProxy bool `gorm:"default:false"` // Asistió como apoderado

	// Información de firma
	Signature       string     `gorm:"size:500"` // Firma digital o texto
	SignatureDate   *time.Time // Fecha y hora de la firma
	SignatureMethod string     `gorm:"size:50"` // digital, handwritten, electronic

	// Información de verificación
	VerifiedBy        *uint      `gorm:"index"` // Usuario que verificó la asistencia
	VerificationDate  *time.Time // Fecha de verificación
	VerificationNotes string     `gorm:"size:500"` // Notas de verificación

	// Información adicional
	Notes   string `gorm:"size:1000"`     // Notas adicionales
	IsValid bool   `gorm:"default:false"` // Si el registro es válido

	// Relaciones
	AttendanceList AttendanceList `gorm:"foreignKey:AttendanceListID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit   PropertyUnit   `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident       *Resident      `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Proxy          *Proxy         `gorm:"foreignKey:ProxyID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	VerifiedByUser *User          `gorm:"foreignKey:VerifiedBy;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para AttendanceRecord
func (AttendanceRecord) TableName() string {
	return "horizontal_property.attendance_records"
}

// ───────────────────────────────────────────
//
//	VISITOR – Visitantes (Maestro)
//
// ───────────────────────────────────────────
type Visitor struct {
	gorm.Model
	BusinessID   *uint      `gorm:"index;uniqueIndex:idx_business_visitor_dni,priority:1"`            // Propiedad horizontal (nullable para visitantes globales)
	DNI          string     `gorm:"size:30;not null;uniqueIndex:idx_business_visitor_dni,priority:2"` // Documento de identidad (único por business o global)
	FullName     string     `gorm:"size:255;not null;index"`                                          // Nombre completo del visitante
	Phone        string     `gorm:"size:20"`                                                          // Teléfono de contacto
	Email        string     `gorm:"size:255"`                                                         // Email del visitante
	PhotoURL     string     `gorm:"size:500"`                                                         // URL de foto del visitante (útil para seguridad visual)
	HasBlacklist bool       `gorm:"default:false;index"`                                              // Flag rápido para UI (calculado desde VisitBlacklist)
	IsVerified   bool       `gorm:"default:false"`                                                    // Si ya validaron su identidad físicamente alguna vez
	LastVisitAt  *time.Time // Última fecha de visita (para estadísticas)
	TotalVisits  int        `gorm:"default:0"` // Contador de visitas totales
	Notes        string     `gorm:"size:1000"` // Notas generales sobre el visitante

	// Relaciones
	Business            *Business            `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Visits              []Visit              `gorm:"foreignKey:VisitorID"`
	VisitorVehicles     []VisitorVehicle     `gorm:"foreignKey:VisitorID"`
	BlacklistEntry      *VisitBlacklist      `gorm:"foreignKey:VisitorID"`
	ParkingReservations []ParkingReservation `gorm:"foreignKey:VisitorID"`
}

// TableName especifica el nombre de tabla con esquema para Visitor
func (Visitor) TableName() string {
	return "horizontal_property.visitors"
}

// ───────────────────────────────────────────
//
//	VISIT TYPE – Tipos de visita
//
// ───────────────────────────────────────────
type VisitType struct {
	gorm.Model
	Name                        string `gorm:"size:50;not null;unique"` // Familiar, Amigo, Proveedor, Servicio Técnico, Delivery, etc.
	Code                        string `gorm:"size:20;not null;unique"` // family, friend, supplier, technician, delivery
	Description                 string `gorm:"size:255"`
	RequiresAuthorization       bool   `gorm:"default:false"` // Si requiere autorización previa del residente
	RequiresVehicleRegistration bool   `gorm:"default:false"` // Si requiere registro de vehículo
	RequiresCompanions          bool   `gorm:"default:false"` // Si permite/solicita registro de acompañantes
	RequiresAssetsTracking      bool   `gorm:"default:false"` // Si requiere control de equipos/herramientas
	MaxDurationHours            *int   // Duración máxima permitida en horas
	DefaultDurationMinutes      *int   // Duración por defecto en minutos (ej: 15 min para delivery, 240 min para familiar)
	IsActive                    bool   `gorm:"default:true"`

	// Relaciones
	Visits            []Visit            `gorm:"foreignKey:VisitTypeID"`
	VisitRestrictions []VisitRestriction `gorm:"foreignKey:VisitTypeID"`
}

// TableName especifica el nombre de tabla con esquema para VisitType
func (VisitType) TableName() string {
	return "horizontal_property.visit_types"
}

// ───────────────────────────────────────────
//
//	VISIT STATUS – Estados de visita
//
// ───────────────────────────────────────────
type VisitStatus struct {
	gorm.Model
	Code        string `gorm:"size:20;not null;unique"` // pending, authorized, in_progress, completed, cancelled, expired, rejected
	Name        string `gorm:"size:50;not null"`        // Pendiente, Autorizada, En Curso, Completada, etc.
	Description string `gorm:"size:255"`
	IsFinal     bool   `gorm:"default:false"` // Si es un estado final (completed, cancelled, rejected, expired)
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	Visits []Visit `gorm:"foreignKey:VisitStatusID"`
}

// TableName especifica el nombre de tabla con esquema para VisitStatus
func (VisitStatus) TableName() string {
	return "horizontal_property.visit_statuses"
}

// ───────────────────────────────────────────
//
//	VISITOR VEHICLE – Vehículos de visitantes
//
// ───────────────────────────────────────────
type VisitorVehicle struct {
	gorm.Model
	BusinessID    uint   `gorm:"not null;index;uniqueIndex:idx_business_vehicle_plate,priority:1"`
	VisitorID     *uint  `gorm:"index"`                                                              // Visitante propietario del vehículo (nullable)
	Plate         string `gorm:"size:20;not null;uniqueIndex:idx_business_vehicle_plate,priority:2"` // Placa del vehículo
	Brand         string `gorm:"size:50"`                                                            // Marca del vehículo
	VehicleModel  string `gorm:"size:50;column:model"`                                               // Modelo del vehículo (column:model para mantener nombre en BD)
	Color         string `gorm:"size:30"`                                                            // Color del vehículo
	Year          *int   // Año del vehículo
	ParkingSlotID *uint  `gorm:"index"`         // Parqueadero asignado (si existe módulo de parqueaderos)
	ParkingNumber string `gorm:"size:20"`       // Número de parqueadero asignado (fallback si no hay ParkingSlot)
	ParkingZone   string `gorm:"size:20"`       // Zona de parqueo (ej: "A", "B", "Visitas")
	IsOccupied    bool   `gorm:"default:false"` // Si el parqueadero está ocupado actualmente
	IsActive      bool   `gorm:"default:true"`

	// Relaciones
	Business            Business             `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Visitor             *Visitor             `gorm:"foreignKey:VisitorID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Visits              []Visit              `gorm:"foreignKey:VisitorVehicleID"`
	ParkingSlot         *ParkingSlot         `gorm:"foreignKey:ParkingSlotID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ParkingReservations []ParkingReservation `gorm:"foreignKey:VisitorVehicleID"`
}

// TableName especifica el nombre de tabla con esquema para VisitorVehicle
func (VisitorVehicle) TableName() string {
	return "horizontal_property.visitor_vehicles"
}

// ───────────────────────────────────────────
//
//	VISIT – Visitas
//
// ───────────────────────────────────────────
type Visit struct {
	gorm.Model
	BusinessID       uint  `gorm:"not null;index"`
	VisitorID        uint  `gorm:"not null;index"` // FK a Visitor (maestro de visitantes)
	PropertyUnitID   uint  `gorm:"not null;index"`
	ResidentID       *uint `gorm:"index"` // Residente que recibe la visita
	VisitTypeID      uint  `gorm:"not null;index"`
	VisitStatusID    uint  `gorm:"not null;index"`
	VisitorVehicleID *uint `gorm:"index"`

	// Fechas y horarios
	ScheduledDate      time.Time  `gorm:"not null;index"`
	ScheduledStartTime time.Time  `gorm:"not null"`
	ScheduledEndTime   *time.Time `json:"scheduled_end_time,omitempty"`
	ActualEntryTime    *time.Time `json:"actual_entry_time,omitempty"` // Se setea automáticamente al registrar entrada
	ActualExitTime     *time.Time `json:"actual_exit_time,omitempty"`
	DurationMinutes    *int       `json:"duration_minutes,omitempty"` // Duración calculada en minutos

	// Autorización y seguridad
	AuthorizationCode      string     `gorm:"size:50;uniqueIndex"`
	QRCode                 string     `gorm:"size:500"`
	QRCodeExpiresAt        *time.Time `json:"qr_code_expires_at,omitempty"`
	AuthorizedByResidentID *uint      `gorm:"index"`
	AuthorizationDate      *time.Time `json:"authorization_date,omitempty"`
	AuthorizationExpiresAt *time.Time `json:"authorization_expires_at,omitempty"`

	// Control de acceso
	RegisteredByUserID      *uint  `gorm:"index"`
	EntryRegisteredByUserID *uint  `gorm:"index"`
	ExitRegisteredByUserID  *uint  `gorm:"index"`
	EntryGate               string `gorm:"size:20"`
	ExitGate                string `gorm:"size:20"`
	EntryMethod             string `gorm:"size:20"` // qr_code, manual, ocr, lpr

	// Información adicional
	Purpose            string `gorm:"size:500"`
	NumberOfVisitors   int    `gorm:"default:1"` // Número total de personas (incluyendo acompañantes)
	HasCompanions      bool   `gorm:"default:false"`
	HasAssets          bool   `gorm:"default:false"`
	Notes              string `gorm:"size:1000"`
	IsRecurring        bool   `gorm:"default:false"`
	RecurringPatternID *uint  `gorm:"index"`
	ParentVisitID      *uint  `gorm:"index"`

	// Alertas y validaciones
	DurationExceeded   bool       `gorm:"default:false"`
	DurationExceededAt *time.Time `json:"duration_exceeded_at,omitempty"`
	AlertSent          bool       `gorm:"default:false"`

	// Notificaciones
	NotifyResident     bool       `gorm:"default:true"`
	NotifySecurity     bool       `gorm:"default:true"`
	NotificationSentAt *time.Time `json:"notification_sent_at,omitempty"`

	// Relaciones
	Business              Business               `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Visitor               Visitor                `gorm:"foreignKey:VisitorID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	PropertyUnit          PropertyUnit           `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident              *Resident              `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	VisitType             VisitType              `gorm:"foreignKey:VisitTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	VisitStatus           VisitStatus            `gorm:"foreignKey:VisitStatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	VisitorVehicle        *VisitorVehicle        `gorm:"foreignKey:VisitorVehicleID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	AuthorizedByResident  *Resident              `gorm:"foreignKey:AuthorizedByResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	RegisteredByUser      *User                  `gorm:"foreignKey:RegisteredByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	EntryRegisteredByUser *User                  `gorm:"foreignKey:EntryRegisteredByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ExitRegisteredByUser  *User                  `gorm:"foreignKey:ExitRegisteredByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ParentVisit           *Visit                 `gorm:"foreignKey:ParentVisitID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ChildVisits           []Visit                `gorm:"foreignKey:ParentVisitID"`
	VisitCompanions       []VisitCompanion       `gorm:"foreignKey:VisitID"`
	VisitAssets           []VisitAsset           `gorm:"foreignKey:VisitID"`
	RecurringPattern      *VisitRecurringPattern `gorm:"foreignKey:RecurringPatternID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para Visit
func (Visit) TableName() string {
	return "horizontal_property.visits"
}

// ───────────────────────────────────────────
//
//	VISIT COMPANION – Acompañantes de visitas
//
// ───────────────────────────────────────────
type VisitCompanion struct {
	gorm.Model
	VisitID        uint   `gorm:"not null;index"`
	VisitorID      *uint  `gorm:"index"`    // Si el acompañante ya existe en el maestro
	CompanionName  string `gorm:"size:255"` // Nombre del acompañante (si no está en Visitor)
	CompanionDNI   string `gorm:"size:30;index"`
	CompanionPhone string `gorm:"size:20"`
	IsMinor        bool   `gorm:"default:false"` // Si es menor de edad
	Relationship   string `gorm:"size:50"`       // Relación con visitante principal (ej: "Ayudante", "Familiar")
	Notes          string `gorm:"size:500"`

	// Relaciones
	Visit   Visit    `gorm:"foreignKey:VisitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Visitor *Visitor `gorm:"foreignKey:VisitorID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para VisitCompanion
func (VisitCompanion) TableName() string {
	return "horizontal_property.visit_companions"
}

// ───────────────────────────────────────────
//
//	VISIT ASSET – Equipos y herramientas
//
// ───────────────────────────────────────────
type VisitAsset struct {
	gorm.Model
	VisitID               uint   `gorm:"not null;index"`
	AssetName             string `gorm:"size:255;not null"` // Nombre del equipo/herramienta (ej: "Router", "Escalera", "Taladro")
	AssetDescription      string `gorm:"size:500"`
	AssetSerial           string `gorm:"size:100"` // Número de serie si aplica
	AssetBrand            string `gorm:"size:50"`  // Marca del equipo
	EntryRegistered       bool   `gorm:"default:false"`
	EntryRegisteredAt     *time.Time
	ExitRegistered        bool `gorm:"default:false"`
	ExitRegisteredAt      *time.Time
	EntryVerifiedByUserID *uint  `gorm:"index"`
	ExitVerifiedByUserID  *uint  `gorm:"index"`
	Notes                 string `gorm:"size:500"`

	// Relaciones
	Visit               Visit `gorm:"foreignKey:VisitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	EntryVerifiedByUser *User `gorm:"foreignKey:EntryVerifiedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ExitVerifiedByUser  *User `gorm:"foreignKey:ExitVerifiedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para VisitAsset
func (VisitAsset) TableName() string {
	return "horizontal_property.visit_assets"
}

// ───────────────────────────────────────────
//
//	VISIT BLACKLIST – Lista negra de visitantes
//
// ───────────────────────────────────────────
type VisitBlacklist struct {
	gorm.Model
	BusinessID        uint      `gorm:"not null;index;uniqueIndex:idx_business_blacklist_visitor,priority:1"`
	VisitorID         uint      `gorm:"not null;index;uniqueIndex:idx_business_blacklist_visitor,priority:2"` // FK a Visitor (maestro)
	Reason            string    `gorm:"size:1000;not null"`                                                   // Razón del bloqueo
	BlockedByUserID   uint      `gorm:"not null;index"`
	BlockedAt         time.Time `gorm:"not null"`
	UnblockedAt       *time.Time
	UnblockedByUserID *uint  `gorm:"index"`
	UnblockReason     string `gorm:"size:500"` // Razón del desbloqueo
	IsActive          bool   `gorm:"default:true"`
	Notes             string `gorm:"size:1000"`

	// Relaciones
	Business        Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Visitor         Visitor  `gorm:"foreignKey:VisitorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	BlockedByUser   User     `gorm:"foreignKey:BlockedByUserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	UnblockedByUser *User    `gorm:"foreignKey:UnblockedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para VisitBlacklist
func (VisitBlacklist) TableName() string {
	return "horizontal_property.visit_blacklist"
}

// ───────────────────────────────────────────
//
//	VISIT RECURRING PATTERN – Patrones de visitas recurrentes
//
// ───────────────────────────────────────────
type VisitRecurringPattern struct {
	gorm.Model
	BusinessID       uint      `gorm:"not null;index"`
	PropertyUnitID   uint      `gorm:"not null;index"`
	ResidentID       *uint     `gorm:"index"`
	VisitTypeID      uint      `gorm:"not null;index"`
	VisitorID        uint      `gorm:"not null;index"` // FK a Visitor (maestro)
	VisitorVehicleID *uint     `gorm:"index"`
	PatternType      string    `gorm:"size:20;not null"` // daily, weekly, monthly, custom
	DayOfWeek        *int      // Para patrones semanales (0=domingo, 6=sábado)
	DayOfMonth       *int      // Para patrones mensuales (1-31)
	StartDate        time.Time `gorm:"not null"`
	EndDate          *time.Time
	StartTime        time.Time `gorm:"not null"`
	EndTime          *time.Time
	IsActive         bool   `gorm:"default:true"`
	AutoAuthorize    bool   `gorm:"default:false"` // Si se autoriza automáticamente
	Notes            string `gorm:"size:1000"`

	// Relaciones
	Business       Business        `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit   PropertyUnit    `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident       *Resident       `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	VisitType      VisitType       `gorm:"foreignKey:VisitTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Visitor        Visitor         `gorm:"foreignKey:VisitorID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	VisitorVehicle *VisitorVehicle `gorm:"foreignKey:VisitorVehicleID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Visits         []Visit         `gorm:"foreignKey:RecurringPatternID"`
}

// TableName especifica el nombre de tabla con esquema para VisitRecurringPattern
func (VisitRecurringPattern) TableName() string {
	return "horizontal_property.visit_recurring_patterns"
}

// ───────────────────────────────────────────
//
//	VISIT RESTRICTION – Restricciones de visitas
//
// ───────────────────────────────────────────
type VisitRestriction struct {
	gorm.Model
	BusinessID       uint       `gorm:"not null;index"`
	RestrictionType  string     `gorm:"size:20;not null"` // time_window, visit_type, property_unit, visitor
	VisitTypeID      *uint      `gorm:"index"`
	PropertyUnitID   *uint      `gorm:"index"`
	StartTime        *time.Time // Hora inicio de restricción
	EndTime          *time.Time // Hora fin de restricción
	DaysOfWeek       string     `gorm:"size:20"` // "1,2,3,4,5" para lunes-viernes
	MaxVisitsPerDay  *int       // Máximo de visitas por día
	MaxVisitsPerWeek *int       // Máximo de visitas por semana
	IsActive         bool       `gorm:"default:true"`
	Description      string     `gorm:"size:500"`

	// Relaciones
	Business     Business      `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	VisitType    *VisitType    `gorm:"foreignKey:VisitTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	PropertyUnit *PropertyUnit `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para VisitRestriction
func (VisitRestriction) TableName() string {
	return "horizontal_property.visit_restrictions"
}

// ───────────────────────────────────────────
//
//	COMMON AREA TYPE – Tipos de zona común (Maestro)
//
// ───────────────────────────────────────────
type CommonAreaType struct {
	gorm.Model
	Name               string `gorm:"size:100;not null;unique"` // Piscina, Gimnasio, Salón Social, Cancha Deportiva, BBQ, Terraza, etc.
	Code               string `gorm:"size:50;not null;unique"`  // pool, gym, social_room, sports_court, bbq, terrace
	Description        string `gorm:"size:500"`
	Icon               string `gorm:"size:100"` // Nombre de icono o URL de imagen
	DefaultMaxCapacity *int   // Capacidad máxima por defecto
	RequiresApproval   bool   `gorm:"default:true"`  // Si requiere aprobación por defecto
	AllowsRecurring    bool   `gorm:"default:false"` // Si permite reservas recurrentes
	IsActive           bool   `gorm:"default:true"`

	// Relaciones
	CommonAreas []CommonArea `gorm:"foreignKey:CommonAreaTypeID"`
}

// TableName especifica el nombre de tabla con esquema para CommonAreaType
func (CommonAreaType) TableName() string {
	return "horizontal_property.common_area_types"
}

// ───────────────────────────────────────────
//
//	COMMON AREA – Zonas comunes por propiedad
//
// ───────────────────────────────────────────
type CommonArea struct {
	gorm.Model
	BusinessID           uint     `gorm:"not null;index;uniqueIndex:idx_business_area_name,priority:1"`
	CommonAreaTypeID     uint     `gorm:"not null;index"`
	Name                 string   `gorm:"size:150;not null;uniqueIndex:idx_business_area_name,priority:2"` // Nombre específico (ej: "Piscina Principal", "Gimnasio Piso 2")
	Description          string   `gorm:"size:1000"`
	Location             string   `gorm:"size:255"` // Ubicación física (ej: "Piso 1, Bloque A")
	MaxCapacity          int      `gorm:"not null"` // Capacidad máxima de personas
	AreaSqm              *float64 // Área en metros cuadrados
	HasEquipment         bool     `gorm:"default:false"`      // Si tiene equipos/herramientas
	EquipmentDescription string   `gorm:"size:500"`           // Descripción de equipos disponibles
	HourlyRate           *float64 `gorm:"type:decimal(10,2)"` // Tarifa por hora (si aplica)
	RequiresApproval     bool     `gorm:"default:true"`       // Si requiere aprobación (puede sobrescribir el tipo)
	RequiresDeposit      bool     `gorm:"default:false"`      // Si requiere depósito
	DepositAmount        *float64 `gorm:"type:decimal(10,2)"` // Monto del depósito
	AllowsRecurring      bool     `gorm:"default:false"`      // Si permite reservas recurrentes
	IsActive             bool     `gorm:"default:true"`
	ImageURLs            string   `gorm:"size:1000"` // JSON array de URLs de imágenes

	// Relaciones
	Business       Business                `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CommonAreaType CommonAreaType          `gorm:"foreignKey:CommonAreaTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Reservations   []CommonAreaReservation `gorm:"foreignKey:CommonAreaID"`
	Schedules      []CommonAreaSchedule    `gorm:"foreignKey:CommonAreaID"`
	Restrictions   []CommonAreaRestriction `gorm:"foreignKey:CommonAreaID"`
}

// TableName especifica el nombre de tabla con esquema para CommonArea
func (CommonArea) TableName() string {
	return "horizontal_property.common_areas"
}

// ───────────────────────────────────────────
//
//	COMMON AREA SCHEDULE – Horarios de disponibilidad
//
// ───────────────────────────────────────────
type CommonAreaSchedule struct {
	gorm.Model
	CommonAreaID uint   `gorm:"not null;index;uniqueIndex:idx_area_day,priority:1"`
	DayOfWeek    int    `gorm:"not null;uniqueIndex:idx_area_day,priority:2"` // 0=Domingo, 1=Lunes, ..., 6=Sábado
	StartTime    string `gorm:"type:time;not null"`                           // Hora de inicio (ej: "08:00")
	EndTime      string `gorm:"type:time;not null"`                           // Hora de fin (ej: "22:00")
	IsActive     bool   `gorm:"default:true"`

	// Relaciones
	CommonArea CommonArea `gorm:"foreignKey:CommonAreaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema para CommonAreaSchedule
func (CommonAreaSchedule) TableName() string {
	return "horizontal_property.common_area_schedules"
}

// ───────────────────────────────────────────
//
//	COMMON AREA RESTRICTION – Restricciones de reserva
//
// ───────────────────────────────────────────
type CommonAreaRestriction struct {
	gorm.Model
	CommonAreaID    uint      `gorm:"not null;index"`
	RestrictionType string    `gorm:"size:20;not null"`   // maintenance, event, blocked, holiday
	StartDate       time.Time `gorm:"type:date;not null"` // Fecha inicio
	EndDate         time.Time `gorm:"type:date;not null"` // Fecha fin
	StartTime       *string   `gorm:"type:time"`          // Hora inicio (si aplica)
	EndTime         *string   `gorm:"type:time"`          // Hora fin (si aplica)
	Reason          string    `gorm:"size:500"`           // Razón de la restricción
	CreatedByUserID uint      `gorm:"not null;index"`
	IsActive        bool      `gorm:"default:true"`

	// Relaciones
	CommonArea    CommonArea `gorm:"foreignKey:CommonAreaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedByUser User       `gorm:"foreignKey:CreatedByUserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// TableName especifica el nombre de tabla con esquema para CommonAreaRestriction
func (CommonAreaRestriction) TableName() string {
	return "horizontal_property.common_area_restrictions"
}

// ───────────────────────────────────────────
//
//	COMMON AREA RESERVATION STATUS – Estados de reserva de zonas comunes
//
// ───────────────────────────────────────────
type CommonAreaReservationStatus struct {
	gorm.Model
	Code        string `gorm:"size:20;not null;unique"` // pending, approved, rejected, confirmed, checked_in, checked_out, cancelled, completed, expired
	Name        string `gorm:"size:50;not null"`        // Pendiente, Aprobada, Rechazada, Confirmada, etc.
	Description string `gorm:"size:255"`
	IsFinal     bool   `gorm:"default:false"` // Si es estado final
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	Reservations []CommonAreaReservation `gorm:"foreignKey:ReservationStatusID"`
}

// TableName especifica el nombre de tabla con esquema para CommonAreaReservationStatus
func (CommonAreaReservationStatus) TableName() string {
	return "horizontal_property.common_area_reservation_statuses"
}

// ───────────────────────────────────────────
//
//	RECURRING RESERVATION PATTERN – Patrones de reservas recurrentes
//
// ───────────────────────────────────────────
type RecurringReservationPattern struct {
	gorm.Model
	BusinessID     uint       `gorm:"not null;index"`
	CommonAreaID   uint       `gorm:"not null;index"`
	PropertyUnitID uint       `gorm:"not null;index"`
	ResidentID     *uint      `gorm:"index"`
	PatternType    string     `gorm:"size:20;not null"` // daily, weekly, monthly, custom
	DayOfWeek      *int       // Para patrones semanales (0-6)
	DayOfMonth     *int       // Para patrones mensuales (1-31)
	StartDate      time.Time  `gorm:"type:date;not null"` // Fecha inicio del patrón
	EndDate        *time.Time `gorm:"type:date"`          // Fecha fin del patrón
	StartTime      string     `gorm:"type:time;not null"` // Hora de inicio
	EndTime        string     `gorm:"type:time;not null"` // Hora de fin
	IsActive       bool       `gorm:"default:true"`
	AutoApprove    bool       `gorm:"default:false"` // Si se aprueban automáticamente

	// Relaciones
	Business     Business                `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CommonArea   CommonArea              `gorm:"foreignKey:CommonAreaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit PropertyUnit            `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident     *Resident               `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Reservations []CommonAreaReservation `gorm:"foreignKey:RecurringPatternID"`
}

// TableName especifica el nombre de tabla con esquema para RecurringReservationPattern
func (RecurringReservationPattern) TableName() string {
	return "horizontal_property.recurring_reservation_patterns"
}

// ───────────────────────────────────────────
//
//	COMMON AREA RESERVATION – Reservas de zonas comunes
//
// ───────────────────────────────────────────
type CommonAreaReservation struct {
	gorm.Model
	BusinessID          uint  `gorm:"not null;index"`
	CommonAreaID        uint  `gorm:"not null;index"`
	PropertyUnitID      uint  `gorm:"not null;index"`
	ResidentID          *uint `gorm:"index"`
	ReservationStatusID uint  `gorm:"not null;index"`

	// Fechas y horarios
	ReservationDate time.Time `gorm:"type:date;not null;index"` // Fecha de la reserva
	StartTime       string    `gorm:"type:time;not null"`       // Hora de inicio
	EndTime         string    `gorm:"type:time;not null"`       // Hora de fin
	DurationHours   float64   `gorm:"type:decimal(4,2)"`        // Duración calculada en horas

	// Aprobación
	RequiresApproval bool  `gorm:"default:true"` // Si requiere aprobación
	ApprovedByUserID *uint `gorm:"index"`
	ApprovedAt       *time.Time
	RejectedByUserID *uint `gorm:"index"`
	RejectedAt       *time.Time
	RejectionReason  string `gorm:"size:500"` // Razón del rechazo

	// Información adicional
	NumberOfGuests      int    `gorm:"default:1"`     // Número de invitados
	Purpose             string `gorm:"size:500"`      // Propósito de la reserva
	SpecialRequests     string `gorm:"size:1000"`     // Solicitudes especiales
	IsRecurring         bool   `gorm:"default:false"` // Si es reserva recurrente
	RecurringPatternID  *uint  `gorm:"index"`
	ParentReservationID *uint  `gorm:"index"` // Reserva padre si es recurrente

	// Pagos y depósitos
	TotalAmount       *float64 `gorm:"type:decimal(10,2)"` // Monto total a pagar
	DepositAmount     *float64 `gorm:"type:decimal(10,2)"` // Depósito requerido
	DepositPaid       bool     `gorm:"default:false"`      // Si se pagó el depósito
	DepositPaidAt     *time.Time
	FullPaymentPaid   bool `gorm:"default:false"` // Si se pagó el monto completo
	FullPaymentPaidAt *time.Time

	// Control de acceso
	QRCode             string     `gorm:"size:500"` // Código QR para acceso
	AccessCode         string     `gorm:"size:20"`  // Código de acceso alternativo
	CheckedInAt        *time.Time // Hora de ingreso real
	CheckedOutAt       *time.Time // Hora de salida real
	CheckedInByUserID  *uint      `gorm:"index"`
	CheckedOutByUserID *uint      `gorm:"index"`

	// Notificaciones
	NotifyResident     bool `gorm:"default:true"`
	NotifyAdmin        bool `gorm:"default:true"`
	NotificationSentAt *time.Time
	ReminderSentAt     *time.Time

	// Cancelación
	CancelledAt        *time.Time
	CancelledByUserID  *uint    `gorm:"index"`
	CancellationReason string   `gorm:"size:500"`
	RefundAmount       *float64 `gorm:"type:decimal(10,2)"` // Monto reembolsado

	// Notas
	Notes         string `gorm:"size:1000"` // Notas administrativas
	ResidentNotes string `gorm:"size:1000"` // Notas del residente

	// Relaciones
	Business          Business                     `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CommonArea        CommonArea                   `gorm:"foreignKey:CommonAreaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit      PropertyUnit                 `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident          *Resident                    `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ReservationStatus CommonAreaReservationStatus  `gorm:"foreignKey:ReservationStatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ApprovedByUser    *User                        `gorm:"foreignKey:ApprovedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	RejectedByUser    *User                        `gorm:"foreignKey:RejectedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CheckedInByUser   *User                        `gorm:"foreignKey:CheckedInByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CheckedOutByUser  *User                        `gorm:"foreignKey:CheckedOutByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CancelledByUser   *User                        `gorm:"foreignKey:CancelledByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	RecurringPattern  *RecurringReservationPattern `gorm:"foreignKey:RecurringPatternID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ParentReservation *CommonAreaReservation       `gorm:"foreignKey:ParentReservationID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ChildReservations []CommonAreaReservation      `gorm:"foreignKey:ParentReservationID"`
}

// TableName especifica el nombre de tabla con esquema para CommonAreaReservation
func (CommonAreaReservation) TableName() string {
	return "horizontal_property.common_area_reservations"
}

// ───────────────────────────────────────────
//
//	PARKING TYPE – Tipos de parqueadero (Maestro)
//
// ───────────────────────────────────────────
type ParkingType struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"` // Residente, Visitante, Comercial, Discapacitado, Motocicleta, etc.
	Code        string `gorm:"size:20;not null;unique"` // resident, visitor, commercial, disabled, motorcycle
	Description string `gorm:"size:255"`
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	ParkingSlots []ParkingSlot `gorm:"foreignKey:ParkingTypeID"`
}

// TableName especifica el nombre de tabla con esquema para ParkingType
func (ParkingType) TableName() string {
	return "horizontal_property.parking_types"
}

// ───────────────────────────────────────────
//
//	PARKING ZONE – Zonas de parqueo
//
// ───────────────────────────────────────────
type ParkingZone struct {
	gorm.Model
	BusinessID  uint   `gorm:"not null;index;uniqueIndex:idx_business_zone_name,priority:1"`
	Name        string `gorm:"size:150;not null;uniqueIndex:idx_business_zone_name,priority:2"` // Visitas, Residentes, Comercial, etc.
	Code        string `gorm:"size:50;not null"`                                                // Código interno
	Description string `gorm:"size:500"`
	Location    string `gorm:"size:255"`  // Ubicación física (ej: "Nivel -1", "Exterior Norte")
	TotalSlots  int    `gorm:"default:0"` // Total de espacios en la zona (calculado)
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	Business     Business      `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ParkingSlots []ParkingSlot `gorm:"foreignKey:ParkingZoneID"`
}

// TableName especifica el nombre de tabla con esquema para ParkingZone
func (ParkingZone) TableName() string {
	return "horizontal_property.parking_zones"
}

// ───────────────────────────────────────────
//
//	PARKING SLOT – Espacios individuales de parqueo
//
// ───────────────────────────────────────────
type ParkingSlot struct {
	gorm.Model
	ParkingZoneID uint     `gorm:"not null;index;uniqueIndex:idx_zone_slot_number,priority:1"`
	ParkingTypeID uint     `gorm:"not null;index"`
	SlotNumber    string   `gorm:"size:20;not null;uniqueIndex:idx_zone_slot_number,priority:2"` // Número del espacio (ej: "A-01", "B-15")
	IsCovered     bool     `gorm:"default:false"`                                                // Si está cubierto
	Width         *float64 `gorm:"type:decimal(5,2)"`                                            // Ancho en metros
	Length        *float64 `gorm:"type:decimal(5,2)"`                                            // Largo en metros
	Height        *float64 `gorm:"type:decimal(5,2)"`                                            // Alto en metros (si aplica)
	HasCharger    bool     `gorm:"default:false"`                                                // Si tiene cargador eléctrico
	IsActive      bool     `gorm:"default:true"`

	// Relaciones
	ParkingZone  ParkingZone          `gorm:"foreignKey:ParkingZoneID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ParkingType  ParkingType          `gorm:"foreignKey:ParkingTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Assignments  []ParkingAssignment  `gorm:"foreignKey:ParkingSlotID"`
	Reservations []ParkingReservation `gorm:"foreignKey:ParkingSlotID"`
	Occupancies  []ParkingOccupancy   `gorm:"foreignKey:ParkingSlotID"`
}

// TableName especifica el nombre de tabla con esquema para ParkingSlot
func (ParkingSlot) TableName() string {
	return "horizontal_property.parking_slots"
}

// ───────────────────────────────────────────
//
//	PARKING ASSIGNMENT – Asignaciones permanentes de parqueaderos
//
// ───────────────────────────────────────────
type ParkingAssignment struct {
	gorm.Model
	BusinessID       uint       `gorm:"not null;index"`
	ParkingSlotID    uint       `gorm:"not null;index;uniqueIndex:idx_slot_active_assignment"` // Espacio asignado
	PropertyUnitID   *uint      `gorm:"index"`                                                 // Unidad propietaria (opcional)
	ResidentID       *uint      `gorm:"index"`                                                 // Residente asignado (opcional)
	VehiclePlate     string     `gorm:"size:20;not null;index"`                                // Placa del vehículo
	VehicleBrand     string     `gorm:"size:50"`                                               // Marca del vehículo
	VehicleModel     string     `gorm:"size:50"`                                               // Modelo del vehículo
	VehicleColor     string     `gorm:"size:30"`                                               // Color del vehículo
	StartDate        time.Time  `gorm:"not null"`                                              // Fecha de inicio de asignación
	EndDate          *time.Time // Fecha de fin (null si es permanente)
	IsActive         bool       `gorm:"default:true;uniqueIndex:idx_slot_active_assignment"` // Solo una asignación activa por slot
	Notes            string     `gorm:"size:1000"`                                           // Notas adicionales
	AssignedByUserID *uint      `gorm:"index"`                                               // Usuario que realizó la asignación

	// Relaciones
	Business       Business      `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ParkingSlot    ParkingSlot   `gorm:"foreignKey:ParkingSlotID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit   *PropertyUnit `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Resident       *Resident     `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	AssignedByUser *User         `gorm:"foreignKey:AssignedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para ParkingAssignment
func (ParkingAssignment) TableName() string {
	return "horizontal_property.parking_assignments"
}

// ───────────────────────────────────────────
//
//	PARKING RESERVATION STATUS – Estados de reserva (Maestro)
//
// ───────────────────────────────────────────
type ParkingReservationStatus struct {
	gorm.Model
	Code        string `gorm:"size:20;not null;unique"` // pending, confirmed, checked_in, checked_out, cancelled, expired
	Name        string `gorm:"size:50;not null"`        // Pendiente, Confirmada, En Uso, Completada, Cancelada, Expirada
	Description string `gorm:"size:255"`
	IsFinal     bool   `gorm:"default:false"` // Si es un estado final
	IsActive    bool   `gorm:"default:true"`

	// Relaciones
	Reservations []ParkingReservation `gorm:"foreignKey:ReservationStatusID"`
}

// TableName especifica el nombre de tabla con esquema para ParkingReservationStatus
func (ParkingReservationStatus) TableName() string {
	return "horizontal_property.parking_reservation_statuses"
}

// ───────────────────────────────────────────
//
//	PARKING RESERVATION – Reservas temporales de parqueaderos
//
// ───────────────────────────────────────────
type ParkingReservation struct {
	gorm.Model
	BusinessID          uint  `gorm:"not null;index"`
	ParkingSlotID       uint  `gorm:"not null;index"`
	PropertyUnitID      *uint `gorm:"index"` // Unidad que reserva (opcional)
	ResidentID          *uint `gorm:"index"` // Residente que reserva (opcional)
	VisitorID           *uint `gorm:"index"` // Visitante que reserva (opcional)
	VisitorVehicleID    *uint `gorm:"index"` // Vehículo de visitante (opcional)
	ReservationStatusID uint  `gorm:"not null;index"`

	// Fechas y horarios
	ReservationDate time.Time `gorm:"type:date;not null;index"` // Fecha de la reserva
	StartTime       string    `gorm:"type:time;not null"`       // Hora de inicio
	EndTime         string    `gorm:"type:time;not null"`       // Hora de fin
	DurationHours   float64   `gorm:"type:decimal(4,2)"`        // Duración calculada en horas

	// Información del vehículo
	VehiclePlate string `gorm:"size:20;not null;index"` // Placa del vehículo
	VehicleBrand string `gorm:"size:50"`
	VehicleModel string `gorm:"size:50"`
	VehicleColor string `gorm:"size:30"`

	// Control de acceso
	QRCode             string     `gorm:"size:500"` // Código QR para acceso
	AccessCode         string     `gorm:"size:20"`  // Código de acceso alternativo
	CheckedInAt        *time.Time // Hora de ingreso real
	CheckedOutAt       *time.Time // Hora de salida real
	CheckedInByUserID  *uint      `gorm:"index"`
	CheckedOutByUserID *uint      `gorm:"index"`

	// Aprobación (si aplica)
	RequiresApproval bool  `gorm:"default:false"`
	ApprovedByUserID *uint `gorm:"index"`
	ApprovedAt       *time.Time
	RejectedByUserID *uint `gorm:"index"`
	RejectedAt       *time.Time
	RejectionReason  string `gorm:"size:500"`

	// Notificaciones
	NotifyResident     bool `gorm:"default:true"`
	NotifyAdmin        bool `gorm:"default:true"`
	NotificationSentAt *time.Time
	ReminderSentAt     *time.Time

	// Cancelación
	CancelledAt        *time.Time
	CancelledByUserID  *uint  `gorm:"index"`
	CancellationReason string `gorm:"size:500"`

	// Notas
	Notes         string `gorm:"size:1000"` // Notas administrativas
	ResidentNotes string `gorm:"size:1000"` // Notas del residente

	// Relaciones
	Business          Business                 `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ParkingSlot       ParkingSlot              `gorm:"foreignKey:ParkingSlotID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit      *PropertyUnit            `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Resident          *Resident                `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Visitor           *Visitor                 `gorm:"foreignKey:VisitorID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	VisitorVehicle    *VisitorVehicle          `gorm:"foreignKey:VisitorVehicleID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ReservationStatus ParkingReservationStatus `gorm:"foreignKey:ReservationStatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	CheckedInByUser   *User                    `gorm:"foreignKey:CheckedInByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CheckedOutByUser  *User                    `gorm:"foreignKey:CheckedOutByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ApprovedByUser    *User                    `gorm:"foreignKey:ApprovedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	RejectedByUser    *User                    `gorm:"foreignKey:RejectedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CancelledByUser   *User                    `gorm:"foreignKey:CancelledByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para ParkingReservation
func (ParkingReservation) TableName() string {
	return "horizontal_property.parking_reservations"
}

// ───────────────────────────────────────────
//
//	PARKING OCCUPANCY – Registro de ocupación en tiempo real
//
// ───────────────────────────────────────────
type ParkingOccupancy struct {
	gorm.Model
	ParkingSlotID        uint       `gorm:"not null;index"`
	ParkingReservationID *uint      `gorm:"index"` // Reserva asociada (si aplica)
	VehiclePlate         string     `gorm:"size:20;not null;index"`
	EntryTime            time.Time  `gorm:"not null;index"`
	ExitTime             *time.Time // Null si aún está ocupado
	IsActive             bool       `gorm:"default:true;index"` // Solo una ocupación activa por slot
	EntryMethod          string     `gorm:"size:20"`            // qr_code, manual, ocr, lpr
	EntryGate            string     `gorm:"size:20"`
	ExitGate             string     `gorm:"size:20"`
	RegisteredByUserID   *uint      `gorm:"index"`
	Notes                string     `gorm:"size:500"`

	// Relaciones
	ParkingSlot        ParkingSlot         `gorm:"foreignKey:ParkingSlotID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ParkingReservation *ParkingReservation `gorm:"foreignKey:ParkingReservationID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	RegisteredByUser   *User               `gorm:"foreignKey:RegisteredByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para ParkingOccupancy
func (ParkingOccupancy) TableName() string {
	return "horizontal_property.parking_occupancies"
}

// ───────────────────────────────────────────
//
//	PACKAGE STATUS – Estados de paquete (maestro)
//
// ───────────────────────────────────────────
type PackageStatus struct {
	gorm.Model
	Code        string `gorm:"size:20;not null;unique"` // received, in_storage, delivered, returned, etc.
	Name        string `gorm:"size:50;not null;unique"` // Recibido, En Almacén, Entregado, Retornado, etc.
	Description string `gorm:"size:255"`
	IsFinal     bool   `gorm:"default:false"` // Si es estado final (entregado, retornado)
	IsActive    bool   `gorm:"default:true"`
}

// TableName especifica el nombre de tabla con esquema para PackageStatus
func (PackageStatus) TableName() string {
	return "horizontal_property.package_statuses"
}

// ───────────────────────────────────────────
//
//	PACKAGE – Paquetes recibidos y entregados
//
// ───────────────────────────────────────────
type Package struct {
	gorm.Model
	BusinessID      uint   `gorm:"not null;index"`
	PropertyUnitID  uint   `gorm:"not null;index"`
	ResidentID      *uint  `gorm:"index"`
	PackageStatusID uint   `gorm:"not null;index"`
	Carrier         string `gorm:"size:100"`       // Empresa de envío (DHL, FedEx, etc.)
	TrackingNumber  string `gorm:"size:100;index"` // Número de tracking
	QRCode          string `gorm:"size:500;index"` // Código QR único para tracking

	// Información de recepción
	ReceivedByUserID *uint      `gorm:"index"`
	ReceivedAt       *time.Time `gorm:"index"`

	// Información de entrega
	DeliveredByUserID *uint      `gorm:"index"`
	DeliveredAt       *time.Time `gorm:"index"`

	// Información adicional
	Description string `gorm:"size:500"`
	Notes       string `gorm:"size:1000"` // Notas administrativas

	// Notificaciones
	NotifyResident     bool `gorm:"default:true"`
	NotificationSentAt *time.Time

	// Relaciones
	Business        Business      `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit    PropertyUnit  `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident        *Resident     `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	PackageStatus   PackageStatus `gorm:"foreignKey:PackageStatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ReceivedByUser  *User         `gorm:"foreignKey:ReceivedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	DeliveredByUser *User         `gorm:"foreignKey:DeliveredByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// TableName especifica el nombre de tabla con esquema para Package
func (Package) TableName() string {
	return "horizontal_property.packages"
}
