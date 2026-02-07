package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

func TestCreateCommonArea_Success(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		CreateCommonAreaFunc: func(ctx context.Context, area *domain.CommonArea) (*domain.CommonArea, error) {
			area.ID = 1
			return area, nil
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

	maxCap := 50
	dto := domain.CreateCommonAreaDTO{
		BusinessID:       1,
		CommonAreaTypeID: 1,
		Name:             "Salón Social",
		Description:      "Salón para eventos",
		Location:         "Piso 1",
		MaxCapacity:      maxCap,
		RequiresApproval: true,
		IsActive:         true,
	}

	// Act
	result, err := uc.CreateCommonArea(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.Name != "Salón Social" {
		t.Errorf("expected name 'Salón Social', got '%s'", result.Name)
	}

	if result.MaxCapacity != maxCap {
		t.Errorf("expected max capacity %d, got %d", maxCap, result.MaxCapacity)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestCreateCommonArea_EmptyName(t *testing.T) {
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

	dto := domain.CreateCommonAreaDTO{
		BusinessID:       1,
		CommonAreaTypeID: 1,
		Name:             "", // Nombre vacío
		MaxCapacity:      50,
	}

	// Act
	result, err := uc.CreateCommonArea(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for empty name, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	expectedErrMsg := "el nombre es requerido"
	if err.Error() != expectedErrMsg {
		t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
	}
}

func TestCreateCommonArea_MissingTypeID(t *testing.T) {
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

	dto := domain.CreateCommonAreaDTO{
		BusinessID:       1,
		CommonAreaTypeID: 0, // TypeID = 0
		Name:             "Salón Social",
		MaxCapacity:      50,
	}

	// Act
	result, err := uc.CreateCommonArea(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for missing type ID, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	expectedErrMsg := "el tipo de zona común es requerido"
	if err.Error() != expectedErrMsg {
		t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
	}
}

func TestCreateCommonArea_InvalidMaxCapacity(t *testing.T) {
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

	tests := []struct {
		name        string
		maxCapacity int
	}{
		{"MaxCapacity zero", 0},
		{"MaxCapacity negative", -10},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dto := domain.CreateCommonAreaDTO{
				BusinessID:       1,
				CommonAreaTypeID: 1,
				Name:             "Salón Social",
				MaxCapacity:      tt.maxCapacity,
			}

			// Act
			result, err := uc.CreateCommonArea(context.Background(), dto)

			// Assert
			if err == nil {
				t.Fatal("expected error for invalid max capacity, got nil")
			}

			if result != nil {
				t.Errorf("expected nil result, got %v", result)
			}

			expectedErrMsg := "la capacidad máxima debe ser mayor a 0"
			if err.Error() != expectedErrMsg {
				t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
			}
		})
	}
}

func TestCreateCommonArea_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		CreateCommonAreaFunc: func(ctx context.Context, area *domain.CommonArea) (*domain.CommonArea, error) {
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

	dto := domain.CreateCommonAreaDTO{
		BusinessID:       1,
		CommonAreaTypeID: 1,
		Name:             "Salón Social",
		MaxCapacity:      50,
	}

	// Act
	result, err := uc.CreateCommonArea(context.Background(), dto)

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
