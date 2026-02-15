package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/guardian/internal/app"
	"central_reserve/services/sporttraining/guardian/internal/app/test/mocks"
	"central_reserve/services/sporttraining/guardian/internal/domain"
)

func TestUpdateGuardian_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		UpdateFunc: func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
			return guardian, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.UpdateGuardianDTO{
		ID:               1,
		BusinessID:       1,
		FirstName:        "Juan Carlos",
		LastName:         "Pérez González",
		DocumentType:     "CC",
		DocumentNumber:   "12345678",
		Email:            "juancarlos.perez@example.com",
		Phone:            "3009876543",
		Address:          "Calle 456",
		City:             "Medellín",
		State:            "Antioquia",
		Country:          "Colombia",
		Relationship:     "Padre",
		CanBookSessions:  true,
		CanAccessRecords: false,
		IsActive:         true,
	}

	// Act
	result, err := uc.UpdateGuardian(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.FirstName != "Juan Carlos" {
		t.Errorf("expected FirstName 'Juan Carlos', got '%s'", result.FirstName)
	}

	if result.LastName != "Pérez González" {
		t.Errorf("expected LastName 'Pérez González', got '%s'", result.LastName)
	}

	if result.Email != "juancarlos.perez@example.com" {
		t.Errorf("expected Email 'juancarlos.perez@example.com', got '%s'", result.Email)
	}

	if result.City != "Medellín" {
		t.Errorf("expected City 'Medellín', got '%s'", result.City)
	}

	if result.CanAccessRecords {
		t.Error("expected CanAccessRecords to be false")
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestUpdateGuardian_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGuardianRepository{
		UpdateFunc: func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.UpdateGuardianDTO{
		ID:             1,
		BusinessID:     1,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "12345678",
		Email:          "juan.perez@example.com",
		Phone:          "3001234567",
		IsActive:       true,
	}

	// Act
	result, err := uc.UpdateGuardian(context.Background(), dto)

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

func TestUpdateGuardian_NotFound(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		UpdateFunc: func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
			return nil, domain.ErrGuardianNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.UpdateGuardianDTO{
		ID:             999,
		BusinessID:     1,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "12345678",
		Email:          "juan.perez@example.com",
		Phone:          "3001234567",
		IsActive:       true,
	}

	// Act
	result, err := uc.UpdateGuardian(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrGuardianNotFound) {
		t.Errorf("expected ErrGuardianNotFound, got %v", err)
	}
}
