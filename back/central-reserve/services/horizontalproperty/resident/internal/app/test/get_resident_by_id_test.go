package app_test

import (
	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"context"
	"errors"
	"testing"
	"time"
)

func TestGetResidentByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedResident := &domain.ResidentDetailDTO{
		ID:                 1,
		BusinessID:         100,
		PropertyUnitID:     200,
		PropertyUnitNumber: "101",
		ResidentTypeID:     1,
		ResidentTypeName:   "Propietario",
		ResidentTypeCode:   "owner",
		Name:               "Juan Pérez",
		Email:              "juan@test.com",
		Phone:              "1234567890",
		Dni:                "12345678",
		EmergencyContact:   "Ana Pérez",
		IsMainResident:     true,
		IsActive:           true,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return expectedResident, nil
			}
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetResidentByID(ctx, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedResident.ID {
		t.Errorf("expected ID %d, got %d", expectedResident.ID, result.ID)
	}

	if result.Name != expectedResident.Name {
		t.Errorf("expected name %s, got %s", expectedResident.Name, result.Name)
	}

	if result.Email != expectedResident.Email {
		t.Errorf("expected email %s, got %s", expectedResident.Email, result.Email)
	}
}

func TestGetResidentByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			return nil, nil // Residente no encontrado
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetResidentByID(ctx, 999)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentNotFound) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentNotFound, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestGetResidentByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetResidentByID(ctx, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}
