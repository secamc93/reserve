package app_test

import (
	"context"
	"errors"
	"reflect"
	"testing"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

func grantRepo(saved **entities.DayPayment) *mocks.RepositoryMock {
	return &mocks.RepositoryMock{
		PurchasedDatesFn: func(context.Context, uint, string) ([]string, error) { return []string{"2026-10-24"}, nil },
		CreateGrantedDaysFn: func(_ context.Context, p *entities.DayPayment) (*entities.DayPayment, error) {
			*saved = p
			return p, nil
		},
	}
}

func TestGrantDays_CortesiaNoTieneValorYOmiteLasYaCompradas(t *testing.T) {
	var saved *entities.DayPayment
	_, err := newUseCase(grantRepo(&saved), enabled()).GrantDays(context.Background(), dtos.GrantDaysRequest{
		BusinessID: businessID, Dates: []string{"2026-10-24", "2026-10-25"}, Source: entities.SourceCourtesy, Notes: "demo", Now: now})
	if err != nil {
		t.Fatalf("GrantDays: %v", err)
	}
	if saved.AmountInCents != 0 || saved.Status != entities.StatusApproved || !reflect.DeepEqual(saved.Dates, []string{"2026-10-25"}) || saved.Reference[:9] != "CORTESIA-" {
		t.Fatalf("cortesía = %+v", saved)
	}
}

func TestGrantDays_ManualLlevaSuValor(t *testing.T) {
	var saved *entities.DayPayment
	_, err := newUseCase(grantRepo(&saved), enabled()).GrantDays(context.Background(), dtos.GrantDaysRequest{
		BusinessID: businessID, Dates: []string{"2026-10-25", "2026-10-26"}, Source: entities.SourceManual, Now: now})
	if err != nil {
		t.Fatalf("GrantDays: %v", err)
	}
	if saved.AmountInCents != 2*price*100 {
		t.Fatalf("monto = %d, se esperaba %d", saved.AmountInCents, 2*price*100)
	}
}

func TestGrantDays_OrigenInvalido(t *testing.T) {
	var saved *entities.DayPayment
	_, err := newUseCase(grantRepo(&saved), enabled()).GrantDays(context.Background(), dtos.GrantDaysRequest{BusinessID: businessID, Dates: []string{"2026-10-25"}, Source: "wompi", Now: now})
	if !errors.Is(err, domainerrors.ErrInvalidSource) {
		t.Fatalf("err = %v", err)
	}
}

func TestSetAdminExemption_UsuarioSinPropiedadesSeRechaza(t *testing.T) {
	stored := false
	repo := &mocks.RepositoryMock{SetUserExemptFn: func(context.Context, uint, bool, string, *uint) error { stored = true; return nil }}
	err := newUseCase(repo, enabled()).SetAdminExemption(context.Background(), dtos.AdminExemptionRequest{TargetUserID: 3, Exempt: true})
	if !errors.Is(err, domainerrors.ErrUserNotPropertyAdmin) || stored {
		t.Fatalf("err = %v, guardó = %v", err, stored)
	}
}

func TestSetAdminExemption_GuardaLaExencion(t *testing.T) {
	var got uint
	repo := &mocks.RepositoryMock{
		CountManagedPropertiesFn: func(context.Context, uint) (int64, error) { return 4, nil },
		SetUserExemptFn:          func(_ context.Context, id uint, e bool, _ string, _ *uint) error { got = id; return nil },
	}
	if err := newUseCase(repo, enabled()).SetAdminExemption(context.Background(), dtos.AdminExemptionRequest{TargetUserID: 3, Exempt: true}); err != nil || got != 3 {
		t.Fatalf("err = %v, usuario = %d", err, got)
	}
}
