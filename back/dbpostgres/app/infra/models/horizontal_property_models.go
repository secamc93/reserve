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
	BusinessID  uint     `gorm:"not null;index;uniqueIndex:idx_business_unit_number,priority:1"`
	Number      string   `gorm:"size:20;not null;uniqueIndex:idx_business_unit_number,priority:2"` // Número de apartamento/casa
	Floor       *int     `gorm:"index"`                                                            // Piso (opcional para casas)
	Block       string   `gorm:"size:10"`                                                          // Bloque/Torre (ej. "A", "B")
	UnitType    string   `gorm:"size:20;not null;default:'apartment'"`                             // apartment, house, office, etc.
	Area        *float64 // Área en m²
	Bedrooms    *int     // Número de habitaciones
	Bathrooms   *int     // Número de baños
	Description string   `gorm:"size:500"`
	IsActive    bool     `gorm:"default:true"`

	// Relaciones
	Business  Business   `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Residents []Resident `gorm:"foreignKey:PropertyUnitID"`
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
	BusinessID       uint       `gorm:"not null;index;uniqueIndex:idx_business_resident_dni,priority:1"` // Propiedad horizontal
	PropertyUnitID   uint       `gorm:"not null;index;uniqueIndex:idx_unit_resident_email,priority:1"`   // Unidad de propiedad
	ResidentTypeID   uint       `gorm:"not null;index"`                                                  // Tipo de residente
	Name             string     `gorm:"size:255;not null"`                                               // Nombre completo
	Email            string     `gorm:"size:255;uniqueIndex:idx_unit_resident_email,priority:2"`         // Email (único por unidad)
	Phone            string     `gorm:"size:20"`                                                         // Teléfono
	Dni              string     `gorm:"size:30;uniqueIndex:idx_business_resident_dni,priority:2"`        // Documento de identidad (único por propiedad)
	EmergencyContact string     `gorm:"size:255"`                                                        // Contacto de emergencia
	IsMainResident   bool       `gorm:"default:false"`                                                   // Si es el residente principal
	IsActive         bool       `gorm:"default:true"`                                                    // Si está activo
	MoveInDate       *time.Time // Fecha de ingreso
	MoveOutDate      *time.Time // Fecha de salida (opcional)

	// Información específica para arrendatarios
	LeaseStartDate *time.Time // Fecha inicio de contrato (para arrendatarios)
	LeaseEndDate   *time.Time // Fecha fin de contrato (para arrendatarios)
	MonthlyRent    *float64   // Valor mensual del arriendo

	// Relaciones
	Business         Business          `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PropertyUnit     PropertyUnit      `gorm:"foreignKey:PropertyUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ResidentType     ResidentType      `gorm:"foreignKey:ResidentTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	CommitteeMembers []CommitteeMember `gorm:"foreignKey:ResidentID"` // Participación en comités
	Votes            []Vote            `gorm:"foreignKey:ResidentID"` // Votos emitidos por el residente
}

// TableName especifica el nombre de tabla con esquema para Resident
func (Resident) TableName() string {
	return "horizontal_property.residents"
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
	BusinessID     uint       `gorm:"not null;index;uniqueIndex:idx_business_staff_dni,priority:1"` // Propiedad horizontal
	StaffTypeID    uint       `gorm:"not null;index"`                                               // Tipo de empleado
	Name           string     `gorm:"size:255;not null"`                                            // Nombre completo
	Email          string     `gorm:"size:255;unique"`                                              // Email único
	Phone          string     `gorm:"size:20"`                                                      // Teléfono
	Dni            string     `gorm:"size:30;uniqueIndex:idx_business_staff_dni,priority:2"`        // Documento de identidad
	ProfessionalID *string    `gorm:"size:50"`                                                      // Número de matrícula profesional (para contadores, etc.)
	CompanyName    *string    `gorm:"size:255"`                                                     // Nombre de empresa (si es externo)
	Address        string     `gorm:"size:255"`                                                     // Dirección
	IsExternal     bool       `gorm:"default:false"`                                                // Si es empleado externo/contratista
	IsActive       bool       `gorm:"default:true"`                                                 // Si está activo
	HireDate       time.Time  `gorm:"not null"`                                                     // Fecha de contratación
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
	Business  Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedBy *User    `gorm:"foreignKey:CreatedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Votings   []Voting `gorm:"foreignKey:VotingGroupID"`
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
//	VOTES – Votos individuales de residentes
//
// ───────────────────────────────────────────
type Vote struct {
	gorm.Model
	VotingID       uint      `gorm:"not null;index;uniqueIndex:idx_voting_resident_vote,priority:1"` // Votación
	ResidentID     uint      `gorm:"not null;index;uniqueIndex:idx_voting_resident_vote,priority:2"` // Residente que vota
	VotingOptionID uint      `gorm:"not null;index"`                                                 // Opción seleccionada
	VotedAt        time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`                             // Fecha y hora del voto
	IPAddress      string    `gorm:"size:45"`                                                        // IP desde donde se votó (para auditoría)
	UserAgent      string    `gorm:"size:500"`                                                       // User agent (para auditoría)
	Notes          string    `gorm:"size:500"`                                                       // Notas adicionales

	// Relaciones
	Voting       Voting       `gorm:"foreignKey:VotingID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resident     Resident     `gorm:"foreignKey:ResidentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	VotingOption VotingOption `gorm:"foreignKey:VotingOptionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// TableName especifica el nombre de tabla con esquema para Vote
func (Vote) TableName() string {
	return "horizontal_property.votes"
}
