package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// MockVotingRepository - Mock del repositorio de votaciones
type MockVotingRepository struct {
	// Voting Groups
	CreateVotingGroupFn          func(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error)
	GetVotingGroupByIDFn         func(ctx context.Context, id uint) (*domain.VotingGroup, error)
	ListVotingGroupsByBusinessFn func(ctx context.Context, businessID uint) ([]domain.VotingGroup, error)
	UpdateVotingGroupFn          func(ctx context.Context, id uint, group *domain.VotingGroup) (*domain.VotingGroup, error)
	DeactivateVotingGroupFn      func(ctx context.Context, id uint) error
	DeleteVotingGroupFn          func(ctx context.Context, id uint) error

	// Votings
	CreateVotingFn      func(ctx context.Context, voting *domain.Voting) (*domain.Voting, error)
	GetVotingByIDFn     func(ctx context.Context, id uint) (*domain.Voting, error)
	ListVotingsByGroupFn func(ctx context.Context, groupID uint) ([]domain.Voting, error)
	UpdateVotingFn      func(ctx context.Context, id uint, voting *domain.Voting) (*domain.Voting, error)
	ActivateVotingFn    func(ctx context.Context, id uint) error
	DeactivateVotingFn  func(ctx context.Context, id uint) error
	DeleteVotingFn      func(ctx context.Context, id uint) error

	// Voting Options
	CreateVotingOptionFn          func(ctx context.Context, option *domain.VotingOption) (*domain.VotingOption, error)
	ListVotingOptionsByVotingFn   func(ctx context.Context, votingID uint) ([]domain.VotingOption, error)
	GetVotingOptionByIDFn         func(ctx context.Context, id uint) (*domain.VotingOption, error)
	UpdateVotingOptionStatusFn    func(ctx context.Context, id uint, isActive bool) error
	DeleteVotingOptionFn          func(ctx context.Context, id uint) error

	// Votes
	CreateVoteFn                      func(ctx context.Context, vote domain.Vote) (*domain.Vote, error)
	GetVoteByIDFn                     func(ctx context.Context, voteID uint) (*domain.Vote, error)
	DeleteVoteFn                      func(ctx context.Context, voteID uint) error
	HasUnitVotedFn                    func(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error)
	GetUnitVoteFn                     func(ctx context.Context, votingID, propertyUnitID uint) (*domain.Vote, error)
	GetVotingResultsFn                func(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error)
	GetVotingDetailsByUnitFn          func(ctx context.Context, votingID, hpID uint) ([]domain.VotingDetailByUnitDTO, error)
	GetUnitsWithResidentsFn           func(ctx context.Context, hpID uint) ([]domain.UnitWithResidentDTO, error)
	ListVotesByVotingFn               func(ctx context.Context, votingID uint) ([]domain.Vote, error)
	GetUnvotedUnitsByVotingFn         func(ctx context.Context, votingID uint, unitNumberFilter string) ([]domain.UnvotedUnit, error)
	GetResidentMainUnitIDFn           func(ctx context.Context, residentID uint) (uint, error)
	CheckUnitAttendanceForVotingFn    func(ctx context.Context, votingID, propertyUnitID uint) (bool, error)
	MarkUnitAttendanceForVotingFn     func(ctx context.Context, votingID, propertyUnitID uint, markAttendance bool) error
	GetHorizontalPropertyBasicInfoFn  func(ctx context.Context, hpID uint) (*domain.HorizontalPropertyDTO, error)
	ListPropertyUnitsFn               func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error)
	GetResidentByUnitAndDniFn         func(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error)
}

// NewMockVotingRepository crea una nueva instancia del mock del repositorio
func NewMockVotingRepository() *MockVotingRepository {
	return &MockVotingRepository{}
}

// Voting Groups
func (m *MockVotingRepository) CreateVotingGroup(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error) {
	if m.CreateVotingGroupFn != nil {
		return m.CreateVotingGroupFn(ctx, group)
	}
	return group, nil
}

func (m *MockVotingRepository) GetVotingGroupByID(ctx context.Context, id uint) (*domain.VotingGroup, error) {
	if m.GetVotingGroupByIDFn != nil {
		return m.GetVotingGroupByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockVotingRepository) ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]domain.VotingGroup, error) {
	if m.ListVotingGroupsByBusinessFn != nil {
		return m.ListVotingGroupsByBusinessFn(ctx, businessID)
	}
	return []domain.VotingGroup{}, nil
}

func (m *MockVotingRepository) UpdateVotingGroup(ctx context.Context, id uint, group *domain.VotingGroup) (*domain.VotingGroup, error) {
	if m.UpdateVotingGroupFn != nil {
		return m.UpdateVotingGroupFn(ctx, id, group)
	}
	return group, nil
}

func (m *MockVotingRepository) DeactivateVotingGroup(ctx context.Context, id uint) error {
	if m.DeactivateVotingGroupFn != nil {
		return m.DeactivateVotingGroupFn(ctx, id)
	}
	return nil
}

func (m *MockVotingRepository) DeleteVotingGroup(ctx context.Context, id uint) error {
	if m.DeleteVotingGroupFn != nil {
		return m.DeleteVotingGroupFn(ctx, id)
	}
	return nil
}

// Votings
func (m *MockVotingRepository) CreateVoting(ctx context.Context, voting *domain.Voting) (*domain.Voting, error) {
	if m.CreateVotingFn != nil {
		return m.CreateVotingFn(ctx, voting)
	}
	return voting, nil
}

func (m *MockVotingRepository) GetVotingByID(ctx context.Context, id uint) (*domain.Voting, error) {
	if m.GetVotingByIDFn != nil {
		return m.GetVotingByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockVotingRepository) ListVotingsByGroup(ctx context.Context, groupID uint) ([]domain.Voting, error) {
	if m.ListVotingsByGroupFn != nil {
		return m.ListVotingsByGroupFn(ctx, groupID)
	}
	return []domain.Voting{}, nil
}

func (m *MockVotingRepository) UpdateVoting(ctx context.Context, id uint, voting *domain.Voting) (*domain.Voting, error) {
	if m.UpdateVotingFn != nil {
		return m.UpdateVotingFn(ctx, id, voting)
	}
	return voting, nil
}

func (m *MockVotingRepository) ActivateVoting(ctx context.Context, id uint) error {
	if m.ActivateVotingFn != nil {
		return m.ActivateVotingFn(ctx, id)
	}
	return nil
}

func (m *MockVotingRepository) DeactivateVoting(ctx context.Context, id uint) error {
	if m.DeactivateVotingFn != nil {
		return m.DeactivateVotingFn(ctx, id)
	}
	return nil
}

func (m *MockVotingRepository) DeleteVoting(ctx context.Context, id uint) error {
	if m.DeleteVotingFn != nil {
		return m.DeleteVotingFn(ctx, id)
	}
	return nil
}

// Voting Options
func (m *MockVotingRepository) CreateVotingOption(ctx context.Context, option *domain.VotingOption) (*domain.VotingOption, error) {
	if m.CreateVotingOptionFn != nil {
		return m.CreateVotingOptionFn(ctx, option)
	}
	return option, nil
}

func (m *MockVotingRepository) ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]domain.VotingOption, error) {
	if m.ListVotingOptionsByVotingFn != nil {
		return m.ListVotingOptionsByVotingFn(ctx, votingID)
	}
	return []domain.VotingOption{}, nil
}

func (m *MockVotingRepository) GetVotingOptionByID(ctx context.Context, id uint) (*domain.VotingOption, error) {
	if m.GetVotingOptionByIDFn != nil {
		return m.GetVotingOptionByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *MockVotingRepository) UpdateVotingOptionStatus(ctx context.Context, id uint, isActive bool) error {
	if m.UpdateVotingOptionStatusFn != nil {
		return m.UpdateVotingOptionStatusFn(ctx, id, isActive)
	}
	return nil
}

func (m *MockVotingRepository) DeleteVotingOption(ctx context.Context, id uint) error {
	if m.DeleteVotingOptionFn != nil {
		return m.DeleteVotingOptionFn(ctx, id)
	}
	return nil
}

// Votes
func (m *MockVotingRepository) CreateVote(ctx context.Context, vote domain.Vote) (*domain.Vote, error) {
	if m.CreateVoteFn != nil {
		return m.CreateVoteFn(ctx, vote)
	}
	return &vote, nil
}

func (m *MockVotingRepository) GetVoteByID(ctx context.Context, voteID uint) (*domain.Vote, error) {
	if m.GetVoteByIDFn != nil {
		return m.GetVoteByIDFn(ctx, voteID)
	}
	return nil, nil
}

func (m *MockVotingRepository) DeleteVote(ctx context.Context, voteID uint) error {
	if m.DeleteVoteFn != nil {
		return m.DeleteVoteFn(ctx, voteID)
	}
	return nil
}

func (m *MockVotingRepository) HasUnitVoted(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
	if m.HasUnitVotedFn != nil {
		return m.HasUnitVotedFn(ctx, votingID, propertyUnitID)
	}
	return false, nil
}

func (m *MockVotingRepository) GetUnitVote(ctx context.Context, votingID, propertyUnitID uint) (*domain.Vote, error) {
	if m.GetUnitVoteFn != nil {
		return m.GetUnitVoteFn(ctx, votingID, propertyUnitID)
	}
	return nil, nil
}

func (m *MockVotingRepository) GetVotingResults(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error) {
	if m.GetVotingResultsFn != nil {
		return m.GetVotingResultsFn(ctx, votingID)
	}
	return []domain.VotingResultDTO{}, nil
}

func (m *MockVotingRepository) GetVotingDetailsByUnit(ctx context.Context, votingID, hpID uint) ([]domain.VotingDetailByUnitDTO, error) {
	if m.GetVotingDetailsByUnitFn != nil {
		return m.GetVotingDetailsByUnitFn(ctx, votingID, hpID)
	}
	return []domain.VotingDetailByUnitDTO{}, nil
}

func (m *MockVotingRepository) GetUnitsWithResidents(ctx context.Context, hpID uint) ([]domain.UnitWithResidentDTO, error) {
	if m.GetUnitsWithResidentsFn != nil {
		return m.GetUnitsWithResidentsFn(ctx, hpID)
	}
	return []domain.UnitWithResidentDTO{}, nil
}

func (m *MockVotingRepository) ListVotesByVoting(ctx context.Context, votingID uint) ([]domain.Vote, error) {
	if m.ListVotesByVotingFn != nil {
		return m.ListVotesByVotingFn(ctx, votingID)
	}
	return []domain.Vote{}, nil
}

func (m *MockVotingRepository) GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]domain.UnvotedUnit, error) {
	if m.GetUnvotedUnitsByVotingFn != nil {
		return m.GetUnvotedUnitsByVotingFn(ctx, votingID, unitNumberFilter)
	}
	return []domain.UnvotedUnit{}, nil
}

func (m *MockVotingRepository) GetResidentMainUnitID(ctx context.Context, residentID uint) (uint, error) {
	if m.GetResidentMainUnitIDFn != nil {
		return m.GetResidentMainUnitIDFn(ctx, residentID)
	}
	return 0, nil
}

func (m *MockVotingRepository) CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
	if m.CheckUnitAttendanceForVotingFn != nil {
		return m.CheckUnitAttendanceForVotingFn(ctx, votingID, propertyUnitID)
	}
	return false, nil
}

func (m *MockVotingRepository) MarkUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint, markAttendance bool) error {
	if m.MarkUnitAttendanceForVotingFn != nil {
		return m.MarkUnitAttendanceForVotingFn(ctx, votingID, propertyUnitID, markAttendance)
	}
	return nil
}

func (m *MockVotingRepository) GetHorizontalPropertyBasicInfo(ctx context.Context, hpID uint) (*domain.HorizontalPropertyDTO, error) {
	if m.GetHorizontalPropertyBasicInfoFn != nil {
		return m.GetHorizontalPropertyBasicInfoFn(ctx, hpID)
	}
	return nil, nil
}

func (m *MockVotingRepository) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	if m.ListPropertyUnitsFn != nil {
		return m.ListPropertyUnitsFn(ctx, filters)
	}
	return &domain.PaginatedPropertyUnitsDTO{}, nil
}

func (m *MockVotingRepository) GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	if m.GetResidentByUnitAndDniFn != nil {
		return m.GetResidentByUnitAndDniFn(ctx, hpID, propertyUnitID, dni)
	}
	return nil, nil
}
