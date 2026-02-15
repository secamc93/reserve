package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/guardian/internal/app"
	"central_reserve/services/sporttraining/guardian/internal/app/test/mocks"
	"central_reserve/services/sporttraining/guardian/internal/domain"
)

func TestGetGuardianByID_Success(t *testing.T) {
	// Arrange
	expectedGuardian := &domain.Guardian{
		ID:             1,
		BusinessID:     1,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "12345678",
		Email:          "juan.perez@example.com",
		Phone:          "3001234567",
		Relationship:   "Padre",
		IsActive:       true,
	}

	mockRepo := &mocks.MockGuardianRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error) {
			if id == 1 && businessID == 1 {
				return expectedGuardian, nil
			}
			return nil, domain.ErrGuardianNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGuardianByID(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != expectedGuardian.ID {
		t.Errorf("expected ID %d, got %d", expectedGuardian.ID, result.ID)
	}

	if result.FirstName != expectedGuardian.FirstName {
		t.Errorf("expected FirstName '%s', got '%s'", expectedGuardian.FirstName, result.FirstName)
	}

	if result.DocumentNumber != expectedGuardian.DocumentNumber {
		t.Errorf("expected DocumentNumber '%s', got '%s'", expectedGuardian.DocumentNumber, result.DocumentNumber)
	}
}

func TestGetGuardianByID_NotFound(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error) {
			return nil, domain.ErrGuardianNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGuardianByID(context.Background(), 999, 1)

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

func TestGetGuardianByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGuardianRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGuardianByID(context.Background(), 1, 1)

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
