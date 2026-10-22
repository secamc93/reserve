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
	// IsVotingPaymentPending: el grupo de la votación debe días de votación (cobro de Rupü)
	IsVotingPaymentPending(ctx context.Context, votingID uint) (bool, error)
	MarkUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint, markAttendance bool) error // ✅ NUEVO
	GetHorizontalPropertyBasicInfo(ctx context.Context, hpID uint) (*HorizontalPropertyDTO, error)
	ListPropertyUnits(ctx context.Context, filters PropertyUnitFiltersDTO) (*PaginatedPropertyUnitsDTO, error)

	// Reset voting
	DeleteAllVotesByVoting(ctx context.Context, votingID uint) (int64, error)
	// ValidateVoteTarget verifica que la opción sea de la votación y que la unidad sea de la misma
	// propiedad (business) que la votación. Devuelve ErrOptionNotInVoting o ErrUnitNotInVotingBusiness.
	ValidateVoteTarget(ctx context.Context, votingID, propertyUnitID, votingOptionID uint) error

	// Previous voting
	GetPreviousVoting(ctx context.Context, votingID uint, groupID uint) (*Voting, error)
	GetVotedUnitIDsByVoting(ctx context.Context, votingID uint) ([]uint, error)

	// Resident methods (todo en el mismo repository)
	GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*ResidentBasicDTO, error)
	// GetPublicVoterUnit obtiene una unidad de la propiedad hpID con su residente (principal
	// primero). Devuelve ErrPropertyUnitNotFound si la unidad no existe o es de otra propiedad.
	GetPublicVoterUnit(ctx context.Context, hpID, propertyUnitID uint) (*PublicVoterUnitDTO, error)

	// Voting credentials (contraseña por unidad y grupo)
	// ListActiveUnitIDsByBusiness devuelve los IDs de las unidades activas de la propiedad.
	ListActiveUnitIDsByBusiness(ctx context.Context, businessID uint) ([]uint, error)
	// ListVotingCredentialUnitIDs devuelve las unidades que ya tienen contraseña en el grupo.
	ListVotingCredentialUnitIDs(ctx context.Context, groupID uint) ([]uint, error)
	// SaveVotingCredentials guarda las contraseñas; si replaceAll, antes borra todas las del grupo.
	SaveVotingCredentials(ctx context.Context, groupID uint, credentials []VotingCredential, replaceAll bool) error
	CountVotingCredentials(ctx context.Context, groupID uint) (int64, error)
	// GetVotingCredentialPassword devuelve la contraseña de la unidad en el grupo ("" si no tiene).
	GetVotingCredentialPassword(ctx context.Context, groupID, propertyUnitID uint) (string, error)
	ListVotingCredentials(ctx context.Context, groupID uint, page, pageSize int) ([]VotingCredentialDTO, int64, error)

	// Group voting methods (para QR por grupo)
	ListVotingsByGroupWithVoteStatus(ctx context.Context, groupID uint, propertyUnitID uint) ([]VotingWithStatusDTO, error)
}

// VotingCacheService - Puerto para servicio de cache de votaciones
type VotingCacheService interface {
	PublishVote(votingID uint, vote VoteDTO) error
	RemoveVote(votingID uint, voteID uint) error
	ClearVoting(votingID uint) error
	// ResetVotes vacía los votos de una votación y avisa a los suscriptores con un evento
	// "votes_reset" sin cerrar sus conexiones (a diferencia de ClearVoting).
	ResetVotes(votingID uint) error
	Subscribe(ctx context.Context, votingID uint) (<-chan VoteEvent, error)
	GetVotingState(votingID uint) ([]VoteDTO, error)
	InitializeVoting(votingID uint, votes []VoteDTO) error
}
