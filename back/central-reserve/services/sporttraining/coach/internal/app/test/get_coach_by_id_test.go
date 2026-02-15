package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/coach/internal/app"
	"central_reserve/services/sporttraining/coach/internal/app/test/mocks"
	"central_reserve/services/sporttraining/coach/internal/domain"
)

func TestGetCoachByID_Success(t *testing.T) {
	// Arrange
	yearsExp := 5
	expectedCoach := &domain.Coach{
		ID:                1,
		BusinessID:        1,
		UserID:            100,
		FirstName:         "Juan",
		LastName:          "Pérez",
		DocumentType:      "CC",
		DocumentNumber:    "123456789",
		Email:             "juan.perez@example.com",
		Phone:             "+57 300 1234567",
		YearsOfExperience: &yearsExp,
		Biography:         "Entrenador experimentado",
		IsAvailable:       true,
		IsActive:          true,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	mockCoachRepo := &mocks.MockCoachRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Coach, error) {
			if id == 1 && businessID == 1 {
				return expectedCoach, nil
			}
			return nil, domain.ErrCoachNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	// Act
	result, err := uc.GetCoachByID(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected coach, got nil")
	}

	if result.ID != expectedCoach.ID {
		t.Errorf("expected ID %d, got %d", expectedCoach.ID, result.ID)
	}

	if result.FirstName != expectedCoach.FirstName {
		t.Errorf("expected first name '%s', got '%s'", expectedCoach.FirstName, result.FirstName)
	}

	if result.Email != expectedCoach.Email {
		t.Errorf("expected email '%s', got '%s'", expectedCoach.Email, result.Email)
	}
}

func TestGetCoachByID_NotFound(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Coach, error) {
			return nil, domain.ErrCoachNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	// Act
	result, err := uc.GetCoachByID(context.Background(), 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrCoachNotFound) {
		t.Errorf("expected ErrCoachNotFound, got %v", err)
	}
}

func TestGetCoachByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockCoachRepo := &mocks.MockCoachRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Coach, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	// Act
	result, err := uc.GetCoachByID(context.Background(), 1, 1)

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
