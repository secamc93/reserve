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

func TestCreateReservation_MissingCommonAreaID(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	dto := domain.CreateReservationDTO{
		BusinessID:     1,
		CommonAreaID:   0, // Missing
		PropertyUnitID: 1,
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for missing common_area_id, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	expectedErrMsg := "common_area_id es requerido"
	if err.Error() != expectedErrMsg {
		t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
	}
}

func TestCreateReservation_MissingPropertyUnitID(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	dto := domain.CreateReservationDTO{
		BusinessID:     1,
		CommonAreaID:   1,
		PropertyUnitID: 0, // Missing
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for missing property_unit_id, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	expectedErrMsg := "property_unit_id es requerido"
	if err.Error() != expectedErrMsg {
		t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
	}
}

func TestCreateReservation_CommonAreaNotFound(t *testing.T) {
	// Arrange
	expectedErr := errors.New("common area not found")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return nil, expectedErr
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

	dto := domain.CreateReservationDTO{
		BusinessID:     1,
		CommonAreaID:   1,
		PropertyUnitID: 1,
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestCreateReservation_ExceedsCapacity(t *testing.T) {
	// Arrange
	maxCapacity := 10

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:          1,
				MaxCapacity: maxCapacity,
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

	dto := domain.CreateReservationDTO{
		BusinessID:     1,
		CommonAreaID:   1,
		PropertyUnitID: 1,
		NumberOfGuests: 15, // Exceeds capacity
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for exceeds capacity, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrExceedsCapacity) {
		t.Errorf("expected error %v, got %v", domain.ErrExceedsCapacity, err)
	}
}

func TestCreateReservation_InvalidStartTime(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:          1,
				MaxCapacity: 10,
			}, nil
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
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	dto := domain.CreateReservationDTO{
		BusinessID:      1,
		CommonAreaID:    1,
		PropertyUnitID:  1,
		NumberOfGuests:  5,
		ReservationDate: time.Now(),
		StartTime:       "invalid", // Invalid format
		EndTime:         "14:00",
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid start time, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateReservation_InvalidEndTime(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:          1,
				MaxCapacity: 10,
			}, nil
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
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	dto := domain.CreateReservationDTO{
		BusinessID:      1,
		CommonAreaID:    1,
		PropertyUnitID:  1,
		NumberOfGuests:  5,
		ReservationDate: time.Now(),
		StartTime:       "12:00",
		EndTime:         "invalid", // Invalid format
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid end time, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateReservation_NotAvailable(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:          1,
				MaxCapacity: 10,
				IsActive:    true,
			}, nil
		},
	}
	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:        1,
				StartTime: "08:00",
				EndTime:   "20:00",
				IsActive:  true,
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
			return false, nil // Not available
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

	dto := domain.CreateReservationDTO{
		BusinessID:      1,
		CommonAreaID:    1,
		PropertyUnitID:  1,
		NumberOfGuests:  5,
		ReservationDate: time.Now(),
		StartTime:       "12:00",
		EndTime:         "14:00",
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for not available, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrReservationNotAvailable) {
		t.Errorf("expected error %v, got %v", domain.ErrReservationNotAvailable, err)
	}
}

func TestCreateReservation_CheckAvailabilityError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database error")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return &domain.CommonArea{
				ID:          1,
				MaxCapacity: 10,
				IsActive:    true,
			}, nil
		},
	}
	mockScheduleRepo := &mocks.MockScheduleRepository{
		GetScheduleForDayFunc: func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
			return &domain.CommonAreaSchedule{
				ID:        1,
				StartTime: "08:00",
				EndTime:   "20:00",
				IsActive:  true,
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

	dto := domain.CreateReservationDTO{
		BusinessID:      1,
		CommonAreaID:    1,
		PropertyUnitID:  1,
		NumberOfGuests:  5,
		ReservationDate: time.Now(),
		StartTime:       "12:00",
		EndTime:         "14:00",
	}

	// Act
	result, err := uc.CreateReservation(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from CheckAvailability, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
