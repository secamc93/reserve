package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/attendance/internal/app"
	"central_reserve/services/horizontalproperty/attendance/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
)

func repoConLista() *mocks.AttendanceRepositoryMock {
	repo := &mocks.AttendanceRepositoryMock{}
	repo.GetAttendanceListBusinessIDFn = func(ctx context.Context, l uint) (uint, error) {
		if l == lista {
			return propiedad, nil
		}
		return 0, nil
	}
	repo.GetAttendanceListByIDFn = func(ctx context.Context, id uint) (*domain.AttendanceList, error) {
		if id != lista {
			return nil, errors.New("lista de asistencia no encontrada")
		}
		return &domain.AttendanceList{ID: lista, VotingGroupID: 255, Title: "Asamblea"}, nil
	}
	return repo
}

func TestGetAttendanceListByID_DeLaPropiedad(t *testing.T) {
	uc := app.NewAttendanceUseCase(repoConLista(), mocks.NewMockLogger())
	got, err := uc.GetAttendanceListByID(context.Background(), propiedad, lista)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if got == nil || got.ID != lista || got.VotingGroupID != 255 || got.Title != "Asamblea" {
		t.Fatalf("lista inesperada: %+v", got)
	}
}

func TestGetAttendanceListByID_SuperAdminSinRestriccion(t *testing.T) {
	uc := app.NewAttendanceUseCase(repoConLista(), mocks.NewMockLogger())
	got, err := uc.GetAttendanceListByID(context.Background(), 0, lista)
	if err != nil || got == nil || got.ID != lista {
		t.Fatalf("el super admin debe ver la lista: %+v, %v", got, err)
	}
}

func TestGetAttendanceListByID_OtraPropiedadNoLaVe(t *testing.T) {
	uc := app.NewAttendanceUseCase(repoConLista(), mocks.NewMockLogger())
	_, err := uc.GetAttendanceListByID(context.Background(), propiedad+1, lista)
	if !errors.Is(err, domain.ErrAttendanceListNotFound) {
		t.Fatalf("esperaba ErrAttendanceListNotFound, obtuve %v", err)
	}
}

func TestGetAttendanceListByID_Inexistente(t *testing.T) {
	uc := app.NewAttendanceUseCase(repoConLista(), mocks.NewMockLogger())
	_, err := uc.GetAttendanceListByID(context.Background(), 0, 999)
	if !errors.Is(err, domain.ErrAttendanceListNotFound) {
		t.Fatalf("esperaba ErrAttendanceListNotFound, obtuve %v", err)
	}
}
