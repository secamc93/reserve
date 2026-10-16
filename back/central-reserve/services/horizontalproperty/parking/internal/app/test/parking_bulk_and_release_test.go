package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func newUC(zones *mocks.ParkingZoneRepositoryMock, slots *mocks.ParkingSlotRepositoryMock, assigns *mocks.ParkingAssignmentRepositoryMock) domain.ParkingUseCase {
	if zones == nil {
		zones = &mocks.ParkingZoneRepositoryMock{}
	}
	if slots == nil {
		slots = &mocks.ParkingSlotRepositoryMock{}
	}
	if assigns == nil {
		assigns = &mocks.ParkingAssignmentRepositoryMock{}
	}
	return app.New(zones, slots, assigns, &mocks.ParkingReservationRepositoryMock{}, &mocks.ParkingOccupancyRepositoryMock{}, &mocks.ParkingTypeRepositoryMock{}, mocks.NewMockLogger())
}

func zoneRepo(businessID uint) *mocks.ParkingZoneRepositoryMock {
	return &mocks.ParkingZoneRepositoryMock{
		GetParkingZoneByIDFn: func(ctx context.Context, id uint) (*domain.ParkingZone, error) {
			return &domain.ParkingZone{ID: id, BusinessID: businessID, IsActive: true}, nil
		},
	}
}

func TestBulkSlotNumbers(t *testing.T) {
	got, err := app.BulkSlotNumbers("P2-", 121, 123, 3)
	if err != nil || len(got) != 3 || got[0] != "P2-121" || got[2] != "P2-123" {
		t.Fatalf("got %v, %v", got, err)
	}
	if got, _ := app.BulkSlotNumbers("V-", 1, 2, 2); got[0] != "V-01" {
		t.Fatalf("relleno con ceros: %v", got)
	}
	if _, err := app.BulkSlotNumbers("", 5, 4, 0); !errors.Is(err, domain.ErrInvalidSlotRange) {
		t.Fatalf("hasta < desde: %v", err)
	}
	if _, err := app.BulkSlotNumbers("", 1, 201, 0); !errors.Is(err, domain.ErrTooManySlots) {
		t.Fatalf("más de 200: %v", err)
	}
}

func TestCreateParkingSlotsBulk_CreaTodosConSusAtributos(t *testing.T) {
	var created []*domain.ParkingSlot
	slots := &mocks.ParkingSlotRepositoryMock{
		CreateParkingSlotsBulkFn: func(ctx context.Context, s []*domain.ParkingSlot) error { created = s; return nil },
	}
	w := 2.5
	res, err := newUC(zoneRepo(1), slots, nil).CreateParkingSlotsBulk(context.Background(), domain.CreateParkingSlotsBulkDTO{
		BusinessID: 1, ParkingZoneID: 3, ParkingTypeID: 1, Prefix: "P2-", From: 121, To: 132, Pad: 3, IsCovered: true, Width: &w,
	})
	if err != nil || len(res) != 12 || len(created) != 12 {
		t.Fatalf("esperaba 12 cupos, obtuve %d (%v)", len(created), err)
	}
	if created[0].SlotNumber != "P2-121" || !created[0].IsCovered || *created[0].Width != 2.5 || created[0].ParkingZoneID != 3 {
		t.Fatalf("cupo inesperado: %+v", created[0])
	}
}

func TestCreateParkingSlotsBulk_NumeroExistenteNoCreaNinguno(t *testing.T) {
	called := false
	slots := &mocks.ParkingSlotRepositoryMock{
		ExistingSlotNumbersFn:    func(ctx context.Context, z uint, n []string) ([]string, error) { return []string{"P2-122"}, nil },
		CreateParkingSlotsBulkFn: func(ctx context.Context, s []*domain.ParkingSlot) error { called = true; return nil },
	}
	_, err := newUC(zoneRepo(1), slots, nil).CreateParkingSlotsBulk(context.Background(), domain.CreateParkingSlotsBulkDTO{
		BusinessID: 1, ParkingZoneID: 3, ParkingTypeID: 1, Prefix: "P2-", From: 121, To: 123, Pad: 3,
	})
	if !errors.Is(err, domain.ErrSlotNumberExists) || called {
		t.Fatalf("esperaba ErrSlotNumberExists sin crear, obtuve %v (creó=%v)", err, called)
	}
}

func TestCreateParkingSlotsBulk_ZonaDeOtraPropiedad(t *testing.T) {
	called := false
	slots := &mocks.ParkingSlotRepositoryMock{CreateParkingSlotsBulkFn: func(ctx context.Context, s []*domain.ParkingSlot) error { called = true; return nil }}
	_, err := newUC(zoneRepo(2), slots, nil).CreateParkingSlotsBulk(context.Background(), domain.CreateParkingSlotsBulkDTO{
		BusinessID: 1, ParkingZoneID: 3, ParkingTypeID: 1, From: 1, To: 2,
	})
	if !errors.Is(err, domain.ErrParkingZoneNotFound) || called {
		t.Fatalf("esperaba ErrParkingZoneNotFound, obtuve %v", err)
	}
}

func assignRepo(a domain.ParkingAssignment, saved *domain.ParkingAssignment) *mocks.ParkingAssignmentRepositoryMock {
	return &mocks.ParkingAssignmentRepositoryMock{
		GetParkingAssignmentByIDFn: func(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
			if id != a.ID {
				return nil, nil
			}
			cp := a
			return &cp, nil
		},
		UpdateParkingAssignmentFn: func(ctx context.Context, x *domain.ParkingAssignment) error { *saved = *x; return nil },
	}
}

func TestReleaseParkingAssignment_DesactivaConFinHoy(t *testing.T) {
	var saved domain.ParkingAssignment
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	today := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	uc := newUC(nil, nil, assignRepo(domain.ParkingAssignment{ID: 9, BusinessID: 1, IsActive: true, StartDate: start}, &saved))
	a, err := uc.ReleaseParkingAssignment(context.Background(), 1, 9, today)
	if err != nil || a.IsActive || saved.IsActive || saved.EndDate == nil || !saved.EndDate.Equal(today) {
		t.Fatalf("esperaba liberada con fin hoy: %+v (%v)", saved, err)
	}
	// Liberar dos veces
	uc2 := newUC(nil, nil, assignRepo(domain.ParkingAssignment{ID: 9, BusinessID: 1, IsActive: false}, &saved))
	if _, err := uc2.ReleaseParkingAssignment(context.Background(), 1, 9, today); !errors.Is(err, domain.ErrParkingAssignmentInactive) {
		t.Fatalf("esperaba ErrParkingAssignmentInactive, obtuve %v", err)
	}
}

func TestParkingAssignment_OtraPropiedadNoLaEncuentra(t *testing.T) {
	var saved domain.ParkingAssignment
	uc := newUC(nil, nil, assignRepo(domain.ParkingAssignment{ID: 9, BusinessID: 1, IsActive: true}, &saved))
	if _, err := uc.ReleaseParkingAssignment(context.Background(), 2, 9, time.Now()); !errors.Is(err, domain.ErrParkingAssignmentNotFound) {
		t.Fatalf("liberar: %v", err)
	}
	if _, err := uc.UpdateParkingAssignment(context.Background(), domain.UpdateParkingAssignmentDTO{BusinessID: 2, ID: 9, VehiclePlate: "ABC123"}); !errors.Is(err, domain.ErrParkingAssignmentNotFound) {
		t.Fatalf("editar: %v", err)
	}
	if saved.ID != 0 {
		t.Fatal("no debe guardar nada de otra propiedad")
	}
}

func TestUpdateParkingAssignment_NormalizaPlacaYValidaFechas(t *testing.T) {
	var saved domain.ParkingAssignment
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	uc := newUC(nil, nil, assignRepo(domain.ParkingAssignment{ID: 9, BusinessID: 1, IsActive: true, StartDate: start}, &saved))
	end := time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC)
	a, err := uc.UpdateParkingAssignment(context.Background(), domain.UpdateParkingAssignmentDTO{BusinessID: 1, ID: 9, VehiclePlate: " jdt-918 ", VehicleBrand: "Renault", EndDate: &end})
	if err != nil || a.VehiclePlate != "JDT-918" || saved.VehicleBrand != "Renault" || !saved.EndDate.Equal(end) {
		t.Fatalf("edición inesperada: %+v (%v)", saved, err)
	}
	before := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	if _, err := uc.UpdateParkingAssignment(context.Background(), domain.UpdateParkingAssignmentDTO{BusinessID: 1, ID: 9, VehiclePlate: "X", EndDate: &before}); !errors.Is(err, domain.ErrInvalidTimeRange) {
		t.Fatalf("fin antes del inicio: %v", err)
	}
	if _, err := uc.UpdateParkingAssignment(context.Background(), domain.UpdateParkingAssignmentDTO{BusinessID: 1, ID: 9, VehiclePlate: "  "}); !errors.Is(err, domain.ErrInvalidVehiclePlate) {
		t.Fatalf("placa vacía: %v", err)
	}
}
