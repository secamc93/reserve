package usecasepublic_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasepublic"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

const (
	hpID    = uint(7)
	groupID = uint(3)
	unitID  = uint(101)
)

// repoConGrupo arma un repo mock con un grupo de la propiedad hpID y la bandera indicada.
// Las unidades de otra propiedad no se encuentran (como en el repositorio real).
func repoConGrupo(requireDoc bool, unit *domain.PublicVoterUnitDTO) *mocks.MockVotingRepository {
	repo := mocks.NewMockVotingRepository()
	repo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		if id != groupID {
			return nil, domain.ErrVotingGroupNotFound
		}
		return &domain.VotingGroup{ID: groupID, BusinessID: hpID, RequireDocumentValidation: requireDoc}, nil
	}
	repo.GetResidentByUnitAndDniFn = func(ctx context.Context, hp, pu uint, dni string) (*domain.ResidentBasicDTO, error) {
		if hp == hpID && pu == unitID && dni == "1010" {
			return &domain.ResidentBasicDTO{ID: 55, Name: "Ana Pérez", PropertyUnitID: unitID, PropertyUnitNumber: "101"}, nil
		}
		return nil, domain.ErrResidentNotFound
	}
	repo.GetPublicVoterUnitFn = func(ctx context.Context, hp, pu uint) (*domain.PublicVoterUnitDTO, error) {
		if hp != hpID || unit == nil || pu != unit.PropertyUnitID {
			return nil, domain.ErrPropertyUnitNotFound
		}
		return unit, nil
	}
	return repo
}

func nuevoUC(repo *mocks.MockVotingRepository) *usecasepublic.PublicUseCase {
	return usecasepublic.New(repo, mocks.NewMockVotingCacheService(), mocks.NewMockLogger())
}

func TestValidateResident_ConDocumento_SinDniEsDocumentoRequerido(t *testing.T) {
	repo := repoConGrupo(true, nil)
	llamado := false
	repo.GetResidentByUnitAndDniFn = func(ctx context.Context, hp, pu uint, dni string) (*domain.ResidentBasicDTO, error) {
		llamado = true
		return nil, nil
	}
	for _, dni := range []string{"", "   "} {
		_, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, dni)
		if !errors.Is(err, domain.ErrDocumentRequired) {
			t.Fatalf("dni %q: se esperaba ErrDocumentRequired, got %v", dni, err)
		}
	}
	if llamado {
		t.Error("sin documento no se debe consultar el residente")
	}
}

func TestValidateResident_ConDocumento_DniCorrecto(t *testing.T) {
	v, err := nuevoUC(repoConGrupo(true, nil)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, " 1010 ")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if v.ResidentID != 55 || v.ResidentName != "Ana Pérez" || v.PropertyUnitID != unitID || !v.RequireDocumentValidation {
		t.Errorf("votante inesperado: %+v", v)
	}
}

func TestValidateResident_ConDocumento_DniAjenoRechazado(t *testing.T) {
	_, err := nuevoUC(repoConGrupo(true, nil)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "9999")
	if !errors.Is(err, domain.ErrResidentNotFound) {
		t.Fatalf("se esperaba ErrResidentNotFound, got %v", err)
	}
}

func TestValidateResident_SinDocumento_IgnoraDniYUsaResidente(t *testing.T) {
	repo := repoConGrupo(false, &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "101", IsActive: true, ResidentID: 55, ResidentName: "Ana Pérez"})
	repo.GetResidentByUnitAndDniFn = func(ctx context.Context, hp, pu uint, dni string) (*domain.ResidentBasicDTO, error) {
		t.Error("sin la bandera no se debe validar el documento")
		return nil, domain.ErrResidentNotFound
	}
	// Un dni cualquiera (incluso erróneo) se ignora.
	v, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "no-importa")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if v.ResidentID != 55 || v.ResidentName != "Ana Pérez" || v.RequireDocumentValidation {
		t.Errorf("votante inesperado: %+v", v)
	}
}

func TestValidateResident_SinDocumento_UnidadSinResidentePuedeVotar(t *testing.T) {
	repo := repoConGrupo(false, &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "T1-101", IsActive: true})
	v, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "")
	if err != nil {
		t.Fatalf("una unidad sin residentes debe poder votar si el grupo no exige documento: %v", err)
	}
	if v.ResidentID != 0 || v.ResidentName != "Unidad T1-101" || v.PropertyUnitID != unitID || v.PropertyUnitNumber != "T1-101" {
		t.Errorf("votante inesperado: %+v", v)
	}
}

func TestValidateResident_SinDocumento_UnidadDeOtraPropiedadRechazada(t *testing.T) {
	repo := repoConGrupo(false, &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "101", IsActive: true})
	_, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID, groupID, 999, "")
	if !errors.Is(err, domain.ErrPropertyUnitNotFound) {
		t.Fatalf("se esperaba ErrPropertyUnitNotFound, got %v", err)
	}
}

func TestValidateResident_SinDocumento_UnidadInactivaRechazada(t *testing.T) {
	repo := repoConGrupo(false, &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "101", IsActive: false, ResidentID: 55, ResidentName: "Ana"})
	_, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "")
	if !errors.Is(err, domain.ErrPropertyUnitInactive) {
		t.Fatalf("se esperaba ErrPropertyUnitInactive, got %v", err)
	}
}

func TestValidateResident_GrupoDeOtraPropiedadRechazado(t *testing.T) {
	repo := repoConGrupo(false, &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "101", IsActive: true})
	_, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID+1, groupID, unitID, "")
	if !errors.Is(err, domain.ErrVotingGroupNotFound) {
		t.Fatalf("se esperaba ErrVotingGroupNotFound, got %v", err)
	}
}

func TestValidateResident_UnidadRequerida(t *testing.T) {
	_, err := nuevoUC(repoConGrupo(false, nil)).ValidateResidentForVoting(context.Background(), hpID, groupID, 0, "")
	if !errors.Is(err, domain.ErrPropertyUnitRequired) {
		t.Fatalf("se esperaba ErrPropertyUnitRequired, got %v", err)
	}
}
