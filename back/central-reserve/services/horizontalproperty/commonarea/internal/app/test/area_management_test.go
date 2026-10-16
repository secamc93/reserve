package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

func ptrF(v float64) *float64 { return &v }
func ptrB(v bool) *bool       { return &v }
func ptrS(v string) *string   { return &v }

func newUC(area *mocks.MockCommonAreaRepository, sched *mocks.MockScheduleRepository, restr *mocks.MockRestrictionRepository, res *mocks.MockReservationRepository) domain.CommonAreaUseCase {
	if area == nil {
		area = &mocks.MockCommonAreaRepository{}
	}
	if sched == nil {
		sched = &mocks.MockScheduleRepository{}
	}
	if restr == nil {
		restr = &mocks.MockRestrictionRepository{}
	}
	if res == nil {
		res = &mocks.MockReservationRepository{}
	}
	return app.New(area, sched, restr, res, mocks.NewMockLogger())
}

func existingArea() *mocks.MockCommonAreaRepository {
	return &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{ID: id, BusinessID: 1, Name: "Salón", CommonAreaTypeID: 1, MaxCapacity: 20, IsActive: true}, nil
		},
	}
}

// ---------- UpdateCommonArea ----------

func TestUpdateCommonArea_AppliesChangesAndClearsDepositWhenNotRequired(t *testing.T) {
	var saved *domain.CommonArea
	repo := existingArea()
	repo.UpdateCommonAreaFunc = func(ctx context.Context, a *domain.CommonArea) error {
		saved = a
		return nil
	}
	uc := newUC(repo, nil, nil, nil)

	_, err := uc.UpdateCommonArea(context.Background(), domain.UpdateCommonAreaDTO{
		ID: 3, CommonAreaTypeID: 2, Name: "BBQ Norte", MaxCapacity: 12,
		HourlyRate: ptrF(30000), RequiresDeposit: false, DepositAmount: ptrF(100000), IsActive: false,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if saved == nil || saved.Name != "BBQ Norte" || saved.MaxCapacity != 12 || saved.CommonAreaTypeID != 2 {
		t.Fatalf("cambios no aplicados: %+v", saved)
	}
	if saved.IsActive {
		t.Error("debe quedar inactiva")
	}
	if saved.DepositAmount != nil {
		t.Error("sin depósito requerido el monto debe borrarse")
	}
	if saved.HourlyRate == nil || *saved.HourlyRate != 30000 {
		t.Error("tarifa no aplicada")
	}
}

func TestUpdateCommonArea_Validations(t *testing.T) {
	cases := map[string]domain.UpdateCommonAreaDTO{
		"sin nombre":         {ID: 1, CommonAreaTypeID: 1, MaxCapacity: 5},
		"sin tipo":           {ID: 1, Name: "X", MaxCapacity: 5},
		"capacidad 0":        {ID: 1, Name: "X", CommonAreaTypeID: 1},
		"depósito sin monto": {ID: 1, Name: "X", CommonAreaTypeID: 1, MaxCapacity: 5, RequiresDeposit: true},
	}
	for name, dto := range cases {
		t.Run(name, func(t *testing.T) {
			called := false
			repo := existingArea()
			repo.UpdateCommonAreaFunc = func(ctx context.Context, a *domain.CommonArea) error { called = true; return nil }
			if _, err := newUC(repo, nil, nil, nil).UpdateCommonArea(context.Background(), dto); err == nil {
				t.Fatal("se esperaba error")
			}
			if called {
				t.Fatal("no debe guardar con datos inválidos")
			}
		})
	}
}

func TestUpdateCommonArea_NotFound(t *testing.T) {
	repo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return nil, domain.ErrCommonAreaNotFound
		},
	}
	_, err := newUC(repo, nil, nil, nil).UpdateCommonArea(context.Background(), domain.UpdateCommonAreaDTO{ID: 9, Name: "X", CommonAreaTypeID: 1, MaxCapacity: 1})
	if !errors.Is(err, domain.ErrCommonAreaNotFound) {
		t.Fatalf("got %v", err)
	}
}

// ---------- DeleteCommonArea ----------

func TestDeleteCommonArea(t *testing.T) {
	deleted := uint(0)
	repo := existingArea()
	repo.DeleteCommonAreaFunc = func(ctx context.Context, id uint) error { deleted = id; return nil }
	if err := newUC(repo, nil, nil, nil).DeleteCommonArea(context.Background(), 4); err != nil {
		t.Fatal(err)
	}
	if deleted != 4 {
		t.Fatalf("deleted=%d", deleted)
	}

	missing := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return nil, domain.ErrCommonAreaNotFound
		},
		DeleteCommonAreaFunc: func(ctx context.Context, id uint) error { t.Fatal("no debe borrar"); return nil },
	}
	if err := newUC(missing, nil, nil, nil).DeleteCommonArea(context.Background(), 4); !errors.Is(err, domain.ErrCommonAreaNotFound) {
		t.Fatalf("got %v", err)
	}
}

// ---------- SetSchedules ----------

func TestSetSchedules_UpdatesExistingDayAndCreatesMissing(t *testing.T) {
	var updated []domain.CommonAreaSchedule
	var created []domain.CommonAreaSchedule
	sched := &mocks.MockScheduleRepository{
		GetAllSchedulesFunc: func(ctx context.Context, id uint) ([]*domain.CommonAreaSchedule, error) {
			return []*domain.CommonAreaSchedule{{ID: 11, CommonAreaID: id, DayOfWeek: 1, StartTime: "08:00", EndTime: "20:00", IsActive: true}}, nil
		},
		UpdateScheduleFunc: func(ctx context.Context, s *domain.CommonAreaSchedule) error {
			updated = append(updated, *s)
			return nil
		},
		CreateScheduleFunc: func(ctx context.Context, s *domain.CommonAreaSchedule) (*domain.CommonAreaSchedule, error) {
			created = append(created, *s)
			return s, nil
		},
	}
	_, err := newUC(existingArea(), sched, nil, nil).SetSchedules(context.Background(), 7, []domain.ScheduleInputDTO{
		{DayOfWeek: 1, StartTime: "09:00", EndTime: "22:00", IsActive: true},
		{DayOfWeek: 0, StartTime: "08:00", EndTime: "12:00", IsActive: false},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(updated) != 1 || updated[0].ID != 11 || updated[0].StartTime != "09:00" || updated[0].EndTime != "22:00" {
		t.Fatalf("lunes no actualizado: %+v", updated)
	}
	if len(created) != 1 || created[0].DayOfWeek != 0 || created[0].IsActive || created[0].CommonAreaID != 7 {
		t.Fatalf("domingo no creado cerrado: %+v", created)
	}
}

func TestSetSchedules_RejectsInvalidInput(t *testing.T) {
	cases := map[string][]domain.ScheduleInputDTO{
		"día fuera de rango": {{DayOfWeek: 7, StartTime: "08:00", EndTime: "10:00", IsActive: true}},
		"día repetido":       {{DayOfWeek: 2, StartTime: "08:00", EndTime: "10:00", IsActive: true}, {DayOfWeek: 2, StartTime: "11:00", EndTime: "12:00", IsActive: true}},
		"formato de hora":    {{DayOfWeek: 2, StartTime: "8am", EndTime: "10:00", IsActive: true}},
		"inicio >= fin":      {{DayOfWeek: 2, StartTime: "10:00", EndTime: "10:00", IsActive: true}},
	}
	for name, input := range cases {
		t.Run(name, func(t *testing.T) {
			sched := &mocks.MockScheduleRepository{
				UpdateScheduleFunc: func(ctx context.Context, s *domain.CommonAreaSchedule) error { t.Fatal("no debe guardar"); return nil },
				CreateScheduleFunc: func(ctx context.Context, s *domain.CommonAreaSchedule) (*domain.CommonAreaSchedule, error) {
					t.Fatal("no debe guardar")
					return nil, nil
				},
			}
			_, err := newUC(existingArea(), sched, nil, nil).SetSchedules(context.Background(), 1, input)
			if !errors.Is(err, domain.ErrInvalidSchedule) {
				t.Fatalf("got %v", err)
			}
		})
	}
}

// ---------- Restricciones ----------

func TestCreateRestriction_ValidatesAndCreates(t *testing.T) {
	day := time.Date(2026, 10, 20, 0, 0, 0, 0, time.UTC)
	var saved *domain.CommonAreaRestriction
	restr := &mocks.MockRestrictionRepository{
		CreateRestrictionFunc: func(ctx context.Context, r *domain.CommonAreaRestriction) (*domain.CommonAreaRestriction, error) {
			saved = r
			r.ID = 99
			return r, nil
		},
	}
	uc := newUC(existingArea(), nil, restr, nil)

	if _, err := uc.CreateRestriction(context.Background(), domain.CreateRestrictionDTO{CommonAreaID: 1, RestrictionType: "party", StartDate: day, EndDate: day}); !errors.Is(err, domain.ErrInvalidRestriction) {
		t.Fatalf("tipo inválido: %v", err)
	}
	if _, err := uc.CreateRestriction(context.Background(), domain.CreateRestrictionDTO{CommonAreaID: 1, RestrictionType: "maintenance", StartDate: day, EndDate: day.AddDate(0, 0, -1)}); !errors.Is(err, domain.ErrInvalidRestriction) {
		t.Fatalf("fechas invertidas: %v", err)
	}
	if _, err := uc.CreateRestriction(context.Background(), domain.CreateRestrictionDTO{CommonAreaID: 1, RestrictionType: "maintenance", StartDate: day, EndDate: day, StartTime: ptrS("08:00")}); !errors.Is(err, domain.ErrInvalidRestriction) {
		t.Fatalf("hora sin fin: %v", err)
	}
	if saved != nil {
		t.Fatal("no debe guardar restricciones inválidas")
	}

	got, err := uc.CreateRestriction(context.Background(), domain.CreateRestrictionDTO{
		CommonAreaID: 1, RestrictionType: "maintenance", StartDate: day, EndDate: day,
		StartTime: ptrS("08:00"), EndTime: ptrS("12:00"), Reason: "Pintura", CreatedByUserID: 5,
	})
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != 99 || !saved.IsActive || saved.CreatedByUserID != 5 || saved.Reason != "Pintura" {
		t.Fatalf("restricción mal creada: %+v", saved)
	}
}

func TestDeleteRestriction_OtherAreaIsNotFound(t *testing.T) {
	deleted := false
	restr := &mocks.MockRestrictionRepository{
		GetRestrictionByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaRestriction, error) {
			return &domain.CommonAreaRestriction{ID: id, CommonAreaID: 2}, nil
		},
		DeleteRestrictionFunc: func(ctx context.Context, id uint) error { deleted = true; return nil },
	}
	uc := newUC(nil, nil, restr, nil)
	if err := uc.DeleteRestriction(context.Background(), 1, 50); !errors.Is(err, domain.ErrRestrictionNotFound) {
		t.Fatalf("got %v", err)
	}
	if deleted {
		t.Fatal("no debe borrar la restricción de otra zona")
	}
	if err := uc.DeleteRestriction(context.Background(), 2, 50); err != nil || !deleted {
		t.Fatalf("debe borrar la de su zona: err=%v deleted=%v", err, deleted)
	}
}

// ---------- Reservas: confirmar y pagos ----------

func TestConfirmReservation_TransitionsToConfirmed(t *testing.T) {
	var code string
	res := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, c string) error { code = c; return nil },
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return &domain.CommonAreaReservation{ID: id, StatusCode: "confirmed"}, nil
		},
	}
	got, err := newUC(nil, nil, nil, res).ConfirmReservation(context.Background(), 3)
	if err != nil {
		t.Fatal(err)
	}
	if code != "confirmed" || got.StatusCode != "confirmed" {
		t.Fatalf("code=%s got=%+v", code, got)
	}
}

func TestUpdateReservationPayments_MarksDepositWithTimestamp(t *testing.T) {
	var saved *domain.CommonAreaReservation
	res := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if saved != nil {
				return saved, nil
			}
			return &domain.CommonAreaReservation{ID: id}, nil
		},
		UpdateReservationFunc: func(ctx context.Context, r *domain.CommonAreaReservation) error { saved = r; return nil },
	}
	uc := newUC(nil, nil, nil, res)

	if _, err := uc.UpdateReservationPayments(context.Background(), 1, domain.UpdatePaymentsDTO{}); err == nil {
		t.Fatal("sin cambios debe fallar")
	}

	got, err := uc.UpdateReservationPayments(context.Background(), 1, domain.UpdatePaymentsDTO{DepositPaid: ptrB(true)})
	if err != nil {
		t.Fatal(err)
	}
	if !got.DepositPaid || got.DepositPaidAt == nil {
		t.Fatalf("depósito no marcado: %+v", got)
	}
	if got.FullPaymentPaid {
		t.Fatal("el pago completo no debe cambiar")
	}
}

func TestSearchUnits_ScopedToBusiness(t *testing.T) {
	var gotBusiness uint
	repo := &mocks.MockCommonAreaRepository{
		SearchUnitsFunc: func(ctx context.Context, businessID uint, search string, limit int) ([]domain.UnitLookupDTO, error) {
			gotBusiness = businessID
			return []domain.UnitLookupDTO{{ID: 1, Number: "126", Block: "Casa"}}, nil
		},
	}
	units, err := newUC(repo, nil, nil, nil).SearchUnits(context.Background(), 8, "126", 10)
	if err != nil || len(units) != 1 || gotBusiness != 8 {
		t.Fatalf("units=%v err=%v business=%d", units, err, gotBusiness)
	}
}
