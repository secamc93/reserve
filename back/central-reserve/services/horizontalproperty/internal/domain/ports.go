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
}
