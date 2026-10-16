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

func reservationUC(statuses map[string]uint, created *domain.ParkingReservation) domain.ParkingUseCase {
	slots := &mocks.ParkingSlotRepositoryMock{GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
		return &domain.ParkingSlot{ID: id, IsActive: true}, nil
	}}
	res := &mocks.ParkingReservationRepositoryMock{
		CheckAvailabilityFn: func(ctx context.Context, dto domain.CheckParkingAvailabilityDTO) (bool, error) { return true, nil },
		GetReservationStatusIDByCodeFn: func(ctx context.Context, code string) (uint, error) { return statuses[code], nil },
		CreateParkingReservationFn: func(ctx context.Context, r *domain.ParkingReservation) (*domain.ParkingReservation, error) {
			*created = *r
			return r, nil
		},
	}
	return app.New(&mocks.ParkingZoneRepositoryMock{}, slots, &mocks.ParkingAssignmentRepositoryMock{}, res, &mocks.ParkingOccupancyRepositoryMock{}, &mocks.ParkingTypeRepositoryMock{}, mocks.NewMockLogger())
}

func baseReservation(requiresApproval bool) domain.CreateParkingReservationDTO {
	return domain.CreateParkingReservationDTO{BusinessID: 1, ParkingSlotID: 3, ReservationDate: time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC), StartTime: "09:00", EndTime: "11:00", VehiclePlate: "KJM-842", RequiresApproval: requiresApproval}
}

func TestCreateParkingReservation_EstadoPorCodigoNoPorIDFijo(t *testing.T) {
	var created domain.ParkingReservation
	uc := reservationUC(map[string]uint{"confirmed": 42, "pending": 41}, &created)
	if _, err := uc.CreateParkingReservation(context.Background(), baseReservation(false)); err != nil || created.ReservationStatusID != 42 {
		t.Fatalf("sin aprobación debe quedar confirmada (42), quedó %d (%v)", created.ReservationStatusID, err)
	}
	if _, err := uc.CreateParkingReservation(context.Background(), baseReservation(true)); err != nil || created.ReservationStatusID != 41 {
		t.Fatalf("con aprobación debe quedar pendiente (41), quedó %d (%v)", created.ReservationStatusID, err)
	}
}

func TestCreateParkingReservation_SinCatalogoDeEstados(t *testing.T) {
	var created domain.ParkingReservation
	uc := reservationUC(map[string]uint{}, &created)
	if _, err := uc.CreateParkingReservation(context.Background(), baseReservation(false)); !errors.Is(err, domain.ErrReservationStatusMissing) {
		t.Fatalf("esperaba ErrReservationStatusMissing, obtuve %v", err)
	}
}
