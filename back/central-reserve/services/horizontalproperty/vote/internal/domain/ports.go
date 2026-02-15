package domain

import "context"

// VotingRepository - Puerto para repositorio de votaciones y grupos
type VotingRepository interface {
	// Voting groups
	CreateVotingGroup(ctx context.Context, group *VotingGroup) (*VotingGroup, error)
	GetVotingGroupByID(ctx context.Context, id uint) (*VotingGroup, error)
	ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]VotingGroup, error)
	UpdateVotingGroup(ctx context.Context, id uint, group *VotingGroup) (*VotingGroup, error)
	DeactivateVotingGroup(ctx context.Context, id uint) error
	DeleteVotingGroup(ctx context.Context, id uint) error

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
	GetVotingOptionByID(ctx context.Context, id uint) (*VotingOption, error)
	UpdateVotingOptionStatus(ctx context.Context, id uint, isActive bool) error
	DeleteVotingOption(ctx context.Context, id uint) error

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
	MarkUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint, markAttendance bool) error // ✅ NUEVO
	GetHorizontalPropertyBasicInfo(ctx context.Context, hpID uint) (*HorizontalPropertyDTO, error)
	ListPropertyUnits(ctx context.Context, filters PropertyUnitFiltersDTO) (*PaginatedPropertyUnitsDTO, error)

	// Resident methods (todo en el mismo repository)
	GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*ResidentBasicDTO, error)
}

// VotingCacheService - Puerto para servicio de cache de votaciones
type VotingCacheService interface {
	PublishVote(votingID uint, vote VoteDTO) error
	RemoveVote(votingID uint, voteID uint) error
	ClearVoting(votingID uint) error
	Subscribe(ctx context.Context, votingID uint) (<-chan VoteEvent, error)
	GetVotingState(votingID uint) ([]VoteDTO, error)
	InitializeVoting(votingID uint, votes []VoteDTO) error
}
