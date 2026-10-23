package app_test

import (
	"context"
	"reflect"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

func assemblyRepo(start, end time.Time) *mocks.RepositoryMock {
	return &mocks.RepositoryMock{
		UpcomingAssembliesFn: func(context.Context, uint, time.Time) ([]entities.UpcomingAssembly, error) {
			return []entities.UpcomingAssembly{{GroupID: 3, Name: "Ordinaria", Start: start, End: end}}, nil
		},
	}
}

func TestGetCoverage_DiaCompradoCubreSoloEseDia(t *testing.T) {
	repo := assemblyRepo(time.Date(2026, 10, 24, 8, 0, 0, 0, cot), time.Date(2026, 10, 25, 18, 0, 0, 0, cot))
	repo.PurchasedDatesFn = func(context.Context, uint, string) ([]string, error) { return []string{"2026-10-24"}, nil }

	cov, err := newUseCase(repo, enabled()).GetCoverage(context.Background(), businessID, now)
	if err != nil {
		t.Fatalf("GetCoverage: %v", err)
	}
	if cov.TodayCovered {
		t.Fatal("hoy no está comprado")
	}
	a := cov.Assemblies[0]
	if !reflect.DeepEqual(a.Dates, []string{"2026-10-24", "2026-10-25"}) || !reflect.DeepEqual(a.UncoveredDates, []string{"2026-10-25"}) {
		t.Fatalf("asamblea = %+v, se esperaba solo el 25 sin cubrir", a)
	}
}

func TestGetCoverage_MembresiaCubreHastaQueVence(t *testing.T) {
	repo := assemblyRepo(time.Date(2026, 11, 20, 8, 0, 0, 0, cot), time.Date(2026, 11, 22, 18, 0, 0, 0, cot))
	repo.ActiveMembershipFn = func(context.Context, uint, time.Time) (*entities.ActiveMembership, error) {
		return &entities.ActiveMembership{PlanCode: "MONTH_1", EndsAt: time.Date(2026, 11, 21, 9, 30, 0, 0, cot)}, nil
	}

	cov, err := newUseCase(repo, enabled()).GetCoverage(context.Background(), businessID, now)
	if err != nil {
		t.Fatalf("GetCoverage: %v", err)
	}
	if !cov.TodayCovered {
		t.Fatal("hoy está dentro de la membresía")
	}
	if got := cov.Assemblies[0].UncoveredDates; !reflect.DeepEqual(got, []string{"2026-11-22"}) {
		t.Fatalf("sin cubrir = %v, se esperaba solo el 22 (la membresía vence el 21)", got)
	}
}

func TestGetCoverage_AdministradoraExentaCubreTodo(t *testing.T) {
	repo := assemblyRepo(time.Date(2026, 10, 24, 8, 0, 0, 0, cot), time.Date(2026, 10, 26, 18, 0, 0, 0, cot))
	repo.IsAdminExemptFn = func(context.Context, uint) (bool, error) { return true, nil }

	cov, err := newUseCase(repo, enabled()).GetCoverage(context.Background(), businessID, now)
	if err != nil {
		t.Fatalf("GetCoverage: %v", err)
	}
	if !cov.TodayCovered || !cov.AdminExempt || len(cov.Assemblies[0].UncoveredDates) != 0 {
		t.Fatalf("cobertura = %+v, una administradora exenta no debe nada", cov)
	}
}

func TestGetCoverage_AsambleaYaEmpezadaCuentaDesdeHoy(t *testing.T) {
	repo := assemblyRepo(time.Date(2026, 10, 19, 8, 0, 0, 0, cot), time.Date(2026, 10, 23, 18, 0, 0, 0, cot))

	cov, err := newUseCase(repo, enabled()).GetCoverage(context.Background(), businessID, now)
	if err != nil {
		t.Fatalf("GetCoverage: %v", err)
	}
	if got := cov.Assemblies[0].Dates; !reflect.DeepEqual(got, []string{"2026-10-22", "2026-10-23"}) {
		t.Fatalf("fechas = %v, se esperaba desde hoy", got)
	}
}
