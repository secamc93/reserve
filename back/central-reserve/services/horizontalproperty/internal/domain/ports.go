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
	DeactivateVoting(ctx context.Context, id uint) error

	// Voting Options
	CreateVotingOption(ctx context.Context, option *VotingOption) (*VotingOption, error)
	ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]VotingOption, error)
	DeactivateVotingOption(ctx context.Context, id uint) error

	// Votes
	CreateVote(ctx context.Context, vote Vote) error
	HasResidentVoted(ctx context.Context, votingID uint, residentID uint) (bool, error)
	ListVotesByVoting(ctx context.Context, votingID uint) ([]Vote, error)
}

// VotingUseCase - Puerto para casos de uso de votaciones
type VotingUseCase interface {
	// Groups
	CreateVotingGroup(ctx context.Context, dto CreateVotingGroupDTO) (*VotingGroupDTO, error)
	ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]VotingGroupDTO, error)
	UpdateVotingGroup(ctx context.Context, id uint, dto CreateVotingGroupDTO) (*VotingGroupDTO, error)
	DeactivateVotingGroup(ctx context.Context, id uint) error

	// Votings
	CreateVoting(ctx context.Context, dto CreateVotingDTO) (*VotingDTO, error)
	ListVotingsByGroup(ctx context.Context, groupID uint) ([]VotingDTO, error)
	UpdateVoting(ctx context.Context, id uint, dto CreateVotingDTO) (*VotingDTO, error)
	DeactivateVoting(ctx context.Context, id uint) error

	// Options
	CreateVotingOption(ctx context.Context, dto CreateVotingOptionDTO) (*VotingOptionDTO, error)
	ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]VotingOptionDTO, error)
	DeactivateVotingOption(ctx context.Context, id uint) error

	// Votes
	CreateVote(ctx context.Context, dto CreateVoteDTO) (*VoteDTO, error)
	ListVotesByVoting(ctx context.Context, votingID uint) ([]VoteDTO, error)
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
}

// ResidentUseCase - Puerto para casos de uso de residentes
type ResidentUseCase interface {
	CreateResident(ctx context.Context, dto CreateResidentDTO) (*ResidentDetailDTO, error)
	GetResidentByID(ctx context.Context, id uint) (*ResidentDetailDTO, error)
	ListResidents(ctx context.Context, filters ResidentFiltersDTO) (*PaginatedResidentsDTO, error)
	UpdateResident(ctx context.Context, id uint, dto UpdateResidentDTO) (*ResidentDetailDTO, error)
	DeleteResident(ctx context.Context, id uint) error
}
