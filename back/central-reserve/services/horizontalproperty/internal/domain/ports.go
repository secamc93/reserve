package domain

import "context"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY PORTS (Interfaces)
//
// ═══════════════════════════════════════════════════════════════════

// HorizontalPropertyRepository - Puerto para el repositorio consolidado de propiedades horizontales
type HorizontalPropertyRepository interface {
	// Métodos para propiedades horizontales
	CreateHorizontalProperty(ctx context.Context, property *HorizontalProperty) (*HorizontalProperty, error)
	GetHorizontalPropertyByID(ctx context.Context, id uint) (*HorizontalProperty, error)
	UpdateHorizontalProperty(ctx context.Context, id uint, property *HorizontalProperty) (*HorizontalProperty, error)
	DeleteHorizontalProperty(ctx context.Context, id uint) error
	ListHorizontalProperties(ctx context.Context, filters HorizontalPropertyFiltersDTO) (*PaginatedHorizontalPropertyDTO, error)
	ExistsHorizontalPropertyByCode(ctx context.Context, code string, excludeID *uint) (bool, error)
	ExistsCustomDomain(ctx context.Context, customDomain string, excludeID *uint) (bool, error)
	ParentBusinessExists(ctx context.Context, parentBusinessID uint) (bool, error)

	// Métodos para tipos de negocio
	GetBusinessTypeByID(ctx context.Context, id uint) (*BusinessType, error)
	GetHorizontalPropertyType(ctx context.Context) (*BusinessType, error)

	// Métodos para configuración inicial (setup)
	CreatePropertyUnits(ctx context.Context, businessID uint, units []PropertyUnitCreate) error
	CreateRequiredCommittees(ctx context.Context, businessID uint) error
	GetRequiredCommitteeTypes(ctx context.Context) ([]CommitteeTypeInfo, error)
}

// PropertyUnitCreate - DTO para crear unidades en bulk
type PropertyUnitCreate struct {
	Number      string
	Floor       *int
	Block       string
	UnitType    string
	Description string
}

// CommitteeTypeInfo - Info de tipos de comités requeridos
type CommitteeTypeInfo struct {
	ID                 uint
	Code               string
	Name               string
	TermDurationMonths *int
}

// HorizontalPropertyUseCase - Puerto para los casos de uso de propiedades horizontales
type HorizontalPropertyUseCase interface {
	CreateHorizontalProperty(ctx context.Context, dto CreateHorizontalPropertyDTO) (*HorizontalPropertyDTO, error)
	GetHorizontalPropertyByID(ctx context.Context, id uint) (*HorizontalPropertyDTO, error)
	UpdateHorizontalProperty(ctx context.Context, id uint, dto UpdateHorizontalPropertyDTO) (*HorizontalPropertyDTO, error)
	DeleteHorizontalProperty(ctx context.Context, id uint) error
	ListHorizontalProperties(ctx context.Context, filters HorizontalPropertyFiltersDTO) (*PaginatedHorizontalPropertyDTO, error)
}

// VotingRepository - Puerto para repositorio de votaciones y grupos
type VotingRepository interface {
	// Voting groups
	CreateVotingGroup(ctx context.Context, group *VotingGroup) (*VotingGroup, error)
	GetVotingGroupByID(ctx context.Context, id uint) (*VotingGroup, error)
	ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]VotingGroup, error)
	UpdateVotingGroup(ctx context.Context, id uint, group *VotingGroup) (*VotingGroup, error)
	DeactivateVotingGroup(ctx context.Context, id uint) error

	// Votings
	CreateVoting(ctx context.Context, voting *Voting) (*Voting, error)
	GetVotingByID(ctx context.Context, id uint) (*Voting, error)
	ListVotingsByGroup(ctx context.Context, groupID uint) ([]Voting, error)
	UpdateVoting(ctx context.Context, id uint, voting *Voting) (*Voting, error)
	ActivateVoting(ctx context.Context, id uint) error
	DeactivateVoting(ctx context.Context, id uint) error
	DeleteVoting(ctx context.Context, id uint) error

	// Voting Options
	CreateVotingOption(ctx context.Context, option *VotingOption) (*VotingOption, error)
	ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]VotingOption, error)
	DeactivateVotingOption(ctx context.Context, id uint) error

	// Votes
	CreateVote(ctx context.Context, vote Vote) (*Vote, error)
	GetVoteByID(ctx context.Context, voteID uint) (*Vote, error)
	DeleteVote(ctx context.Context, voteID uint) error
	HasUnitVoted(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error)
	GetUnitVote(ctx context.Context, votingID, propertyUnitID uint) (*Vote, error)
	GetVotingResults(ctx context.Context, votingID uint) ([]VotingResultDTO, error)
	GetVotingDetailsByUnit(ctx context.Context, votingID, hpID uint) ([]VotingDetailByUnitDTO, error)
	GetUnitsWithResidents(ctx context.Context, hpID uint) ([]UnitWithResidentDTO, error)
	ListVotesByVoting(ctx context.Context, votingID uint) ([]Vote, error)
	GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]UnvotedUnit, error)
	GetResidentMainUnitID(ctx context.Context, residentID uint) (uint, error)
	CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error)
}

// VotingUseCase - Puerto para casos de uso de votaciones
type VotingUseCase interface {
	// Groups
	CreateVotingGroup(ctx context.Context, dto CreateVotingGroupDTO) (*VotingGroupDTO, error)
	GetVotingGroupByID(ctx context.Context, id uint) (*VotingGroupDTO, error)
	ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]VotingGroupDTO, error)
	UpdateVotingGroup(ctx context.Context, id uint, dto CreateVotingGroupDTO) (*VotingGroupDTO, error)
	DeactivateVotingGroup(ctx context.Context, id uint) error

	// Votings
	CreateVoting(ctx context.Context, dto CreateVotingDTO) (*VotingDTO, error)
	GetVotingByID(ctx context.Context, hpID, groupID, votingID uint) (*VotingDTO, error)
	ListVotingsByGroup(ctx context.Context, groupID uint) ([]VotingDTO, error)
	UpdateVoting(ctx context.Context, id uint, dto CreateVotingDTO) (*VotingDTO, error)
	ActivateVoting(ctx context.Context, id uint) error
	DeactivateVoting(ctx context.Context, id uint) error
	DeleteVoting(ctx context.Context, id uint) error

	// Options
	CreateVotingOption(ctx context.Context, dto CreateVotingOptionDTO) (*VotingOptionDTO, error)
	ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]VotingOptionDTO, error)
	DeactivateVotingOption(ctx context.Context, id uint) error

	// Votes
	CreateVote(ctx context.Context, dto CreateVoteDTO) (*VoteDTO, error)
	DeleteVote(ctx context.Context, voteID uint) error
	ListVotesByVoting(ctx context.Context, votingID uint) ([]VoteDTO, error)
	HasUnitVoted(ctx context.Context, votingID, propertyUnitID uint) (bool, error)
	GetUnitVote(ctx context.Context, votingID, propertyUnitID uint) (*VoteDTO, error)
	GetVotingResults(ctx context.Context, votingID uint) ([]VotingResultDTO, error)
	GetVotingDetailsByUnit(ctx context.Context, votingID, hpID uint) ([]VotingDetailByUnitDTO, error)
	GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]UnvotedUnitDTO, error)

	// Public Voting
	ValidateResidentForVoting(ctx context.Context, hpID, propertyUnitID uint, dni string) (*ResidentBasicDTO, error)
	GetUnitsWithResidents(ctx context.Context, hpID uint) ([]UnitWithResidentDTO, error)
	CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error)
}

// ───────────────────────────────────────────
// PROPERTY UNIT PORTS
// ───────────────────────────────────────────

// PropertyUnitRepository - Puerto para repositorio de unidades de propiedad
type PropertyUnitRepository interface {
	CreatePropertyUnit(ctx context.Context, unit *PropertyUnit) (*PropertyUnit, error)
	GetPropertyUnitByID(ctx context.Context, id uint) (*PropertyUnit, error)
	ListPropertyUnits(ctx context.Context, filters PropertyUnitFiltersDTO) (*PaginatedPropertyUnitsDTO, error)
	UpdatePropertyUnit(ctx context.Context, id uint, unit *PropertyUnit) (*PropertyUnit, error)
	DeletePropertyUnit(ctx context.Context, id uint) error
	ExistsPropertyUnitByNumber(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error)
}

// PropertyUnitUseCase - Puerto para casos de uso de unidades de propiedad
type PropertyUnitUseCase interface {
	CreatePropertyUnit(ctx context.Context, dto CreatePropertyUnitDTO) (*PropertyUnitDetailDTO, error)
	GetPropertyUnitByID(ctx context.Context, id uint) (*PropertyUnitDetailDTO, error)
	ListPropertyUnits(ctx context.Context, filters PropertyUnitFiltersDTO) (*PaginatedPropertyUnitsDTO, error)
	UpdatePropertyUnit(ctx context.Context, id uint, dto UpdatePropertyUnitDTO) (*PropertyUnitDetailDTO, error)
	DeletePropertyUnit(ctx context.Context, id uint) error
	ImportPropertyUnitsFromExcel(ctx context.Context, businessID uint, filePath string) (*ImportPropertyUnitsResult, error)
}

// ───────────────────────────────────────────
// RESIDENT PORTS
// ───────────────────────────────────────────

// ResidentRepository - Puerto para repositorio de residentes
type ResidentRepository interface {
	CreateResident(ctx context.Context, resident *Resident) (*Resident, error)
	GetResidentByID(ctx context.Context, id uint) (*ResidentDetailDTO, error)
	ListResidents(ctx context.Context, filters ResidentFiltersDTO) (*PaginatedResidentsDTO, error)
	UpdateResident(ctx context.Context, id uint, resident *Resident) (*Resident, error)
	DeleteResident(ctx context.Context, id uint) error
	ExistsResidentByEmail(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error)
	ExistsResidentByDni(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error)
	GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*ResidentBasicDTO, error)
	GetPropertyUnitsByNumbers(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error) // Retorna map[number]unit_id
	CreateResidentsInBatch(ctx context.Context, residents []*Resident) error                                   // Crear múltiples residentes en transacción
	// Nuevos métodos para edición masiva eficiente
	GetMainResidentsByUnitIDs(ctx context.Context, businessID uint, unitIDs []uint) (map[uint]ResidentDetailDTO, error)
	UpdateResidentsInBatch(ctx context.Context, pairs []ResidentUpdatePair) error
	// Métodos para relación muchos-a-muchos resident-unidad
	GetResidentIDsByDni(ctx context.Context, businessID uint, dnis []string) (map[string]uint, error)
	CreateResidentUnitsInBatch(ctx context.Context, pivots []ResidentUnit) error
}

// ResidentUseCase - Puerto para casos de uso de residentes
type ResidentUseCase interface {
	CreateResident(ctx context.Context, dto CreateResidentDTO) (*ResidentDetailDTO, error)
	GetResidentByID(ctx context.Context, id uint) (*ResidentDetailDTO, error)
	ListResidents(ctx context.Context, filters ResidentFiltersDTO) (*PaginatedResidentsDTO, error)
	UpdateResident(ctx context.Context, id uint, dto UpdateResidentDTO) (*ResidentDetailDTO, error)
	DeleteResident(ctx context.Context, id uint) error
	ImportResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*ImportResidentsResult, error)
	BulkUpdateResidents(ctx context.Context, businessID uint, request BulkUpdateResidentsRequest) (*BulkUpdateResidentsResult, error)
	BulkUpdateResidentsFromExcel(ctx context.Context, businessID uint, filePath string) (*BulkUpdateResidentsResult, error)
}

// ============================================================================
// ATTENDANCE INTERFACES - Interfaces para gestión de asistencia
// ============================================================================

// AttendanceRepository - Repositorio para gestión de asistencia
type AttendanceRepository interface {
	// Attendance Lists
	CreateAttendanceList(ctx context.Context, attendanceList AttendanceList) (*AttendanceList, error)
	GetAttendanceListByID(ctx context.Context, id uint) (*AttendanceList, error)
	GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*AttendanceList, error)
	ListAttendanceLists(ctx context.Context, businessID uint, filters map[string]interface{}) ([]AttendanceList, error)
	UpdateAttendanceList(ctx context.Context, id uint, attendanceList AttendanceList) (*AttendanceList, error)
	DeleteAttendanceList(ctx context.Context, id uint) error

	// Proxies
	CreateProxy(ctx context.Context, proxy Proxy) (*Proxy, error)
	GetProxyByID(ctx context.Context, id uint) (*Proxy, error)
	GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]Proxy, error)
	GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]Proxy, error)
	ListProxies(ctx context.Context, businessID uint, filters map[string]interface{}) ([]Proxy, error)
	UpdateProxy(ctx context.Context, id uint, proxy Proxy) (*Proxy, error)
	DeleteProxy(ctx context.Context, id uint) error

	// Attendance Records
	CreateAttendanceRecord(ctx context.Context, record AttendanceRecord) (*AttendanceRecord, error)
	GetAttendanceRecordByID(ctx context.Context, id uint) (*AttendanceRecord, error)
	GetAttendanceRecordsByList(ctx context.Context, attendanceListID uint) ([]AttendanceRecord, error)
	// Paginado y filtros
	GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (records []AttendanceRecord, total int64, err error)
	GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*AttendanceRecord, error)
	UpdateAttendanceRecord(ctx context.Context, id uint, record AttendanceRecord) (*AttendanceRecord, error)
	UpdateAttendanceRecordSimple(ctx context.Context, id uint, attendedAsOwner, attendedAsProxy bool) (*AttendanceRecord, error)
	UpdateAttendanceRecordsByPropertyUnit(ctx context.Context, propertyUnitID uint, proxyID *uint) error
	DeleteAttendanceRecord(ctx context.Context, id uint) error

	// Bulk operations
	CreateAttendanceRecordsInBatch(ctx context.Context, records []AttendanceRecord) error
	GenerateAttendanceListForVotingGroup(ctx context.Context, votingGroupID uint) ([]AttendanceRecord, error)
	DeleteAttendanceRecordsByList(ctx context.Context, attendanceListID uint) error
	GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*AttendanceSummaryDTO, error)
	GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error)
}

// AttendanceUseCase - Caso de uso para gestión de asistencia
type AttendanceUseCase interface {
	// Attendance Lists
	CreateAttendanceList(ctx context.Context, dto CreateAttendanceListDTO) (*AttendanceListDTO, error)
	GetAttendanceListByID(ctx context.Context, id uint) (*AttendanceListDTO, error)
	GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*AttendanceListDTO, error)
	ListAttendanceLists(ctx context.Context, businessID uint, filters map[string]interface{}) ([]AttendanceListDTO, error)
	UpdateAttendanceList(ctx context.Context, id uint, dto UpdateAttendanceListDTO) (*AttendanceListDTO, error)
	DeleteAttendanceList(ctx context.Context, id uint) error
	GenerateAttendanceList(ctx context.Context, votingGroupID uint) (*AttendanceListDTO, error)

	// Proxies
	CreateProxy(ctx context.Context, dto CreateProxyDTO) (*ProxyDTO, error)
	GetProxyByID(ctx context.Context, id uint) (*ProxyDTO, error)
	GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]ProxyDTO, error)
	GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]ProxyDTO, error)
	ListProxies(ctx context.Context, businessID uint, filters map[string]interface{}) ([]ProxyDTO, error)
	UpdateProxy(ctx context.Context, id uint, dto UpdateProxyDTO) (*ProxyDTO, error)
	DeleteProxy(ctx context.Context, id uint) error

	// Attendance Records
	CreateAttendanceRecord(ctx context.Context, dto CreateAttendanceRecordDTO) (*AttendanceRecordDTO, error)
	GetAttendanceRecordByID(ctx context.Context, id uint) (*AttendanceRecordDTO, error)
	GetAttendanceRecordsByList(ctx context.Context, attendanceListID uint) ([]AttendanceRecordDTO, error)
	// Paginado y filtros
	GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (*PaginatedAttendanceRecordsDTO, error)
	GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*AttendanceRecordDTO, error)
	UpdateAttendanceRecord(ctx context.Context, id uint, dto UpdateAttendanceRecordDTO) (*AttendanceRecordDTO, error)
	DeleteAttendanceRecord(ctx context.Context, id uint) error

	// Special operations
	MarkAttendance(ctx context.Context, attendanceListID, propertyUnitID uint, residentID *uint, proxyID *uint, attendedAsOwner, attendedAsProxy bool, signature, signatureMethod string) (*AttendanceRecordDTO, error)
	MarkAttendanceSimple(ctx context.Context, recordID uint, attended bool) (*AttendanceRecordDTO, error)
	VerifyAttendance(ctx context.Context, recordID uint, verifiedBy uint, verificationNotes string) (*AttendanceRecordDTO, error)
	GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*AttendanceSummaryDTO, error)
	GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error)
}

// PaginatedAttendanceRecordsDTO - respuesta paginada de registros de asistencia
type PaginatedAttendanceRecordsDTO struct {
	Data       []AttendanceRecordDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}
