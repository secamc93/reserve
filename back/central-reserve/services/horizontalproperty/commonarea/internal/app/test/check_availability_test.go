package app_test

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

func TestCheckAvailability_Success(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC) // Viernes

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:           1,
				CommonAreaID: 1,
				DayOfWeek:    5, // Viernes
				StartTime:    "08:00",
				EndTime:      "22:00",
				IsActive:     true,
			}, nil
		},
	}

	mockRestrictionRepo := &mocks.MockRestrictionRepository{
		GetActiveRestrictionsFunc: func(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error) {
			return []*domain.CommonAreaRestriction{}, nil
		},
	}

	mockReservationRepo := &mocks.MockReservationRepository{
		CheckAvailabilityFunc: func(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error) {
			return true, nil
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		mockScheduleRepo,
		mockRestrictionRepo,
		mockReservationRepo,
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    1,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if !available {
		t.Error("expected availability to be true")
	}
}

func TestCheckAvailability_CommonAreaNotActive(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: false, // Zona inactiva
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    1,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for inactive common area, got nil")
	}

	if available {
		t.Error("expected availability to be false")
	}

	expectedErrMsg := "la zona común no está activa"
	if err.Error() != expectedErrMsg {
		t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
	}
}

func TestCheckAvailability_CommonAreaNotFound(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return nil, domain.ErrCommonAreaNotFound
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    999,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for common area not found, got nil")
	}

	if available {
		t.Error("expected availability to be false")
	}

	if !errors.Is(err, domain.ErrCommonAreaNotFound) {
		t.Errorf("expected ErrCommonAreaNotFound, got %v", err)
	}
}

func TestCheckAvailability_NoScheduleConfigured(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return nil, nil // No hay horario configurado
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		mockScheduleRepo,
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    1,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for no schedule configured, got nil")
	}

	if available {
		t.Error("expected availability to be false")
	}

	if !errors.Is(err, domain.ErrScheduleNotConfigured) {
		t.Errorf("expected ErrScheduleNotConfigured, got %v", err)
	}
}

func TestCheckAvailability_TimeOutsideSchedule(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:           1,
				CommonAreaID: 1,
				DayOfWeek:    5,
				StartTime:    "08:00",
				EndTime:      "22:00",
				IsActive:     true,
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		mockScheduleRepo,
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	tests := []struct {
		name      string
		startTime string
		endTime   string
	}{
		{"Start before schedule", "07:00", "09:00"},
		{"End after schedule", "20:00", "23:00"},
		{"Both outside schedule", "06:00", "23:00"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dto := domain.CheckAvailabilityDTO{
				CommonAreaID:    1,
				ReservationDate: testDate,
				StartTime:       tt.startTime,
				EndTime:         tt.endTime,
			}

			// Act
			available, err := uc.CheckAvailability(context.Background(), dto)

			// Assert
			if err == nil {
				t.Fatal("expected error for time outside schedule, got nil")
			}

			if available {
				t.Error("expected availability to be false")
			}

			expectedErrMsg := fmt.Sprintf("el horario solicitado está fuera del horario disponible (%s - %s)", "08:00", "22:00")
			if err.Error() != expectedErrMsg {
				t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
			}
		})
	}
}

func TestCheckAvailability_RestrictionActive(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:           1,
				CommonAreaID: 1,
				DayOfWeek:    5,
				StartTime:    "08:00",
				EndTime:      "22:00",
				IsActive:     true,
			}, nil
		},
	}

	mockRestrictionRepo := &mocks.MockRestrictionRepository{
		GetActiveRestrictionsFunc: func(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error) {
			// Retornar restricción activa
			return []*domain.CommonAreaRestriction{
				{
					ID:              1,
					CommonAreaID:    1,
					RestrictionType: "maintenance",
					Reason:          "Mantenimiento programado",
				},
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		mockScheduleRepo,
		mockRestrictionRepo,
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    1,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for active restriction, got nil")
	}

	if available {
		t.Error("expected availability to be false")
	}

	if !errors.Is(err, domain.ErrRestrictionActive) {
		t.Errorf("expected ErrRestrictionActive, got %v", err)
	}
}

func TestCheckAvailability_NotAvailableInRepository(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:           1,
				CommonAreaID: 1,
				DayOfWeek:    5,
				StartTime:    "08:00",
				EndTime:      "22:00",
				IsActive:     true,
			}, nil
		},
	}

	mockRestrictionRepo := &mocks.MockRestrictionRepository{
		GetActiveRestrictionsFunc: func(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error) {
			return []*domain.CommonAreaRestriction{}, nil
		},
	}

	mockReservationRepo := &mocks.MockReservationRepository{
		CheckAvailabilityFunc: func(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error) {
			return false, nil // No disponible (ya hay otra reserva)
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		mockScheduleRepo,
		mockRestrictionRepo,
		mockReservationRepo,
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    1,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if available {
		t.Error("expected availability to be false")
	}
}

func TestCheckAvailability_RepositoryError(t *testing.T) {
	// Arrange
	testDate := time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC)
	expectedErr := errors.New("database error")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:           1,
				CommonAreaID: 1,
				DayOfWeek:    5,
				StartTime:    "08:00",
				EndTime:      "22:00",
				IsActive:     true,
			}, nil
		},
	}

	mockRestrictionRepo := &mocks.MockRestrictionRepository{
		GetActiveRestrictionsFunc: func(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error) {
			return []*domain.CommonAreaRestriction{}, nil
		},
	}

	mockReservationRepo := &mocks.MockReservationRepository{
		CheckAvailabilityFunc: func(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error) {
			return false, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		mockScheduleRepo,
		mockRestrictionRepo,
		mockReservationRepo,
		mockLogger,
	)

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    1,
		ReservationDate: testDate,
		StartTime:       "10:00",
		EndTime:         "12:00",
	}

	// Act
	available, err := uc.CheckAvailability(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if available {
		t.Error("expected availability to be false")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
