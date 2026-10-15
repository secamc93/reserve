package usecasevotinggroups_test

import (
	"context"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func boolPtr(b bool) *bool { return &b }

func grupoDTO(flag *bool) domain.CreateVotingGroupDTO {
	return domain.CreateVotingGroupDTO{
		BusinessID:                1,
		Name:                      "Asamblea 2026",
		VotingStartDate:           time.Now(),
		VotingEndDate:             time.Now().Add(time.Hour),
		RequireDocumentValidation: flag,
	}
}

// echoRepo devuelve lo que recibe (como la BD) y guarda la entidad para inspeccionarla.
func echoRepo(saved **domain.VotingGroup) *mocks.MockVotingRepository {
	repo := mocks.NewMockVotingRepository()
	repo.CreateVotingGroupFn = func(ctx context.Context, g *domain.VotingGroup) (*domain.VotingGroup, error) {
		*saved = g
		c := *g
		c.ID = 9
		return &c, nil
	}
	repo.UpdateVotingGroupFn = func(ctx context.Context, id uint, g *domain.VotingGroup) (*domain.VotingGroup, error) {
		*saved = g
		c := *g
		c.ID = id
		return &c, nil
	}
	return repo
}

func TestCreateVotingGroup_RequireDocumentValidation(t *testing.T) {
	casos := []struct {
		nombre string
		flag   *bool
		want   bool
	}{
		{"no enviado -> false", nil, false},
		{"true", boolPtr(true), true},
		{"false", boolPtr(false), false},
	}
	for _, tc := range casos {
		t.Run(tc.nombre, func(t *testing.T) {
			var saved *domain.VotingGroup
			uc := usecasevotinggroups.New(echoRepo(&saved), mocks.NewMockVotingCacheService(), mocks.NewMockLogger())
			got, err := uc.CreateVotingGroup(context.Background(), grupoDTO(tc.flag))
			if err != nil {
				t.Fatalf("error inesperado: %v", err)
			}
			if saved == nil || saved.RequireDocumentValidation != tc.want {
				t.Errorf("al repositorio llegó %+v, se esperaba bandera %v", saved, tc.want)
			}
			if got.RequireDocumentValidation != tc.want {
				t.Errorf("respuesta con bandera %v, se esperaba %v", got.RequireDocumentValidation, tc.want)
			}
		})
	}
}

func TestUpdateVotingGroup_RequireDocumentValidation(t *testing.T) {
	casos := []struct {
		nombre string
		actual bool
		flag   *bool
		want   bool
	}{
		{"no enviado conserva true", true, nil, true},
		{"no enviado conserva false", false, nil, false},
		{"true -> false", true, boolPtr(false), false},
		{"false -> true", false, boolPtr(true), true},
	}
	for _, tc := range casos {
		t.Run(tc.nombre, func(t *testing.T) {
			var saved *domain.VotingGroup
			repo := echoRepo(&saved)
			repo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
				return &domain.VotingGroup{ID: id, BusinessID: 1, RequireDocumentValidation: tc.actual}, nil
			}
			uc := usecasevotinggroups.New(repo, mocks.NewMockVotingCacheService(), mocks.NewMockLogger())
			got, err := uc.UpdateVotingGroup(context.Background(), 4, grupoDTO(tc.flag))
			if err != nil {
				t.Fatalf("error inesperado: %v", err)
			}
			if saved.RequireDocumentValidation != tc.want || got.RequireDocumentValidation != tc.want {
				t.Errorf("bandera guardada %v / respondida %v, se esperaba %v", saved.RequireDocumentValidation, got.RequireDocumentValidation, tc.want)
			}
		})
	}
}

func TestGetAndListVotingGroup_DevuelvenRequireDocumentValidation(t *testing.T) {
	repo := mocks.NewMockVotingRepository()
	repo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		return &domain.VotingGroup{ID: id, BusinessID: 1, RequireDocumentValidation: true}, nil
	}
	repo.ListVotingGroupsByBusinessFn = func(ctx context.Context, businessID uint) ([]domain.VotingGroup, error) {
		return []domain.VotingGroup{{ID: 1, RequireDocumentValidation: true}, {ID: 2}}, nil
	}
	uc := usecasevotinggroups.New(repo, mocks.NewMockVotingCacheService(), mocks.NewMockLogger())
	g, err := uc.GetVotingGroupByID(context.Background(), 1)
	if err != nil || !g.RequireDocumentValidation {
		t.Fatalf("GetVotingGroupByID: %+v, %v", g, err)
	}
	list, err := uc.ListVotingGroupsByBusiness(context.Background(), 1)
	if err != nil || len(list) != 2 || !list[0].RequireDocumentValidation || list[1].RequireDocumentValidation {
		t.Fatalf("ListVotingGroupsByBusiness: %+v, %v", list, err)
	}
}
