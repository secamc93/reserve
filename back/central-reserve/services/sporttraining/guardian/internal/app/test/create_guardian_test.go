package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/guardian/internal/app"
	"central_reserve/services/sporttraining/guardian/internal/app/test/mocks"
	"central_reserve/services/sporttraining/guardian/internal/domain"
)

func TestCreateGuardian_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		CreateFunc: func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
			guardian.ID = 1
			return guardian, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateGuardianDTO{
		BusinessID:       1,
		FirstName:        "Juan",
		LastName:         "Pérez",
		DocumentType:     "CC",
		DocumentNumber:   "12345678",
		Email:            "juan.perez@example.com",
		Phone:            "3001234567",
		Address:          "Calle 123",
		City:             "Bogotá",
		State:            "Cundinamarca",
		Country:          "Colombia",
		Relationship:     "Padre",
		CanBookSessions:  true,
		CanAccessRecords: true,
	}

	// Act
	result, err := uc.CreateGuardian(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.FirstName != "Juan" {
		t.Errorf("expected FirstName 'Juan', got '%s'", result.FirstName)
	}

	if result.LastName != "Pérez" {
		t.Errorf("expected LastName 'Pérez', got '%s'", result.LastName)
	}

	if result.DocumentNumber != "12345678" {
		t.Errorf("expected DocumentNumber '12345678', got '%s'", result.DocumentNumber)
	}

	if result.Email != "juan.perez@example.com" {
		t.Errorf("expected Email 'juan.perez@example.com', got '%s'", result.Email)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	if !result.CanBookSessions {
		t.Error("expected CanBookSessions to be true")
	}

	if !result.CanAccessRecords {
		t.Error("expected CanAccessRecords to be true")
	}
}

func TestCreateGuardian_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGuardianRepository{
		CreateFunc: func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateGuardianDTO{
		BusinessID:     1,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "12345678",
		Email:          "juan.perez@example.com",
		Phone:          "3001234567",
	}

	// Act
	result, err := uc.CreateGuardian(context.Background(), dto)

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
