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

func TestDeleteResident_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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
				return existingResident, nil
			}
			return nil, nil
		},
		DeleteResidentFunc: func(ctx context.Context, id uint) error {
			return nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeleteResident(ctx, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestDeleteResident_NotFound(t *testing.T) {
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
	err := useCase.DeleteResident(ctx, 999)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentNotFound) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentNotFound, err)
	}
}

func TestDeleteResident_RepositoryErrorOnGet(t *testing.T) {
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
	err := useCase.DeleteResident(ctx, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestDeleteResident_RepositoryErrorOnDelete(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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

	expectedErr := errors.New("delete operation failed")

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return existingResident, nil
			}
			return nil, nil
		},
		DeleteResidentFunc: func(ctx context.Context, id uint) error {
			return expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeleteResident(ctx, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
