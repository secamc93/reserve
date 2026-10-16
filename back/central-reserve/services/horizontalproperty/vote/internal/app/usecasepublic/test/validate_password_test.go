package usecasepublic_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestValidateResident_GrupoConContrasenas(t *testing.T) {
	unit := &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "126", IsActive: true, ResidentID: 9, ResidentName: "Sebastián"}
	creds := map[uint]string{unitID: "K7M2QX"}

	nuevoRepo := func(requireDoc bool) *mocks.MockVotingRepository {
		repo := repoConGrupo(requireDoc, unit)
		repo.CountVotingCredentialsFn = func(ctx context.Context, g uint) (int64, error) {
			if g != groupID {
				return 0, nil
			}
			return int64(len(creds)), nil
		}
		repo.GetVotingCredentialPasswordFn = func(ctx context.Context, g, pu uint) (string, error) {
			if g != groupID {
				return "", nil
			}
			return creds[pu], nil
		}
		return repo
	}

	t.Run("sin contraseña es contraseña requerida", func(t *testing.T) {
		_, err := nuevoUC(nuevoRepo(false)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "", "   ")
		if !errors.Is(err, domain.ErrPasswordRequired) {
			t.Fatalf("esperaba ErrPasswordRequired, obtuve %v", err)
		}
	})

	t.Run("contraseña de otra unidad es incorrecta", func(t *testing.T) {
		_, err := nuevoUC(nuevoRepo(false)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "", "AAAAAA")
		if !errors.Is(err, domain.ErrInvalidPassword) {
			t.Fatalf("esperaba ErrInvalidPassword, obtuve %v", err)
		}
	})

	t.Run("unidad sin contraseña en el grupo no puede votar", func(t *testing.T) {
		otra := uint(202)
		_, err := nuevoUC(nuevoRepo(false)).ValidateResidentForVoting(context.Background(), hpID, groupID, otra, "", "K7M2QX")
		if !errors.Is(err, domain.ErrInvalidPassword) {
			t.Fatalf("esperaba ErrInvalidPassword, obtuve %v", err)
		}
	})

	t.Run("contraseña correcta, sin importar mayúsculas ni espacios", func(t *testing.T) {
		v, err := nuevoUC(nuevoRepo(false)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "", " k7m 2qx ")
		if err != nil {
			t.Fatalf("error inesperado: %v", err)
		}
		if !v.RequirePassword || v.PropertyUnitID != unitID {
			t.Fatalf("votante inesperado: %+v", v)
		}
	})

	t.Run("con documento exige contraseña y documento", func(t *testing.T) {
		_, err := nuevoUC(nuevoRepo(true)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "1010", "")
		if !errors.Is(err, domain.ErrPasswordRequired) {
			t.Fatalf("esperaba ErrPasswordRequired, obtuve %v", err)
		}
		v, err := nuevoUC(nuevoRepo(true)).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "1010", "K7M2QX")
		if err != nil || v.ResidentID != 55 || !v.RequirePassword {
			t.Fatalf("esperaba residente 55 validado con contraseña, obtuve %+v, %v", v, err)
		}
	})
}

func TestValidateResident_GrupoSinContrasenas_NoLasPide(t *testing.T) {
	unit := &domain.PublicVoterUnitDTO{PropertyUnitID: unitID, PropertyUnitNumber: "126", IsActive: true}
	repo := repoConGrupo(false, unit)
	consultada := false
	repo.GetVotingCredentialPasswordFn = func(ctx context.Context, g, pu uint) (string, error) {
		consultada = true
		return "", nil
	}
	v, err := nuevoUC(repo).ValidateResidentForVoting(context.Background(), hpID, groupID, unitID, "", "")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if v.RequirePassword || consultada {
		t.Fatalf("un grupo sin contraseñas no debe pedirlas (require=%v, consultada=%v)", v.RequirePassword, consultada)
	}
}

func TestGroupRequiresPassword(t *testing.T) {
	repo := repoConGrupo(false, nil)
	repo.CountVotingCredentialsFn = func(ctx context.Context, g uint) (int64, error) { return 3, nil }
	ok, err := nuevoUC(repo).GroupRequiresPassword(context.Background(), groupID)
	if err != nil || !ok {
		t.Fatalf("esperaba true, obtuve %v, %v", ok, err)
	}
}
