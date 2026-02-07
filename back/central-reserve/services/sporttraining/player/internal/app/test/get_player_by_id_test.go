package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/player/internal/app"
	"central_reserve/services/sporttraining/player/internal/app/test/mocks"
	"central_reserve/services/sporttraining/player/internal/domain"
)

func TestGetPlayerByID_Success(t *testing.T) {
	// Arrange
	expectedPlayer := &domain.Player{
		ID:               1,
		BusinessID:       1,
		FirstName:        "Juan",
		LastName:         "Pérez",
		DocumentType:     "TI",
		DocumentNumber:   "123456789",
		DateOfBirth:      time.Date(2010, 5, 15, 0, 0, 0, 0, time.UTC),
		Gender:           "M",
		Address:          "Calle 123",
		City:             "Bogotá",
		State:            "Cundinamarca",
		Country:          "Colombia",
		PreferredPosition: "Delantero",
		EmergencyContact: "María Pérez",
		EmergencyPhone:   "9876543210",
		IsActive:         true,
		IsMinor:          true,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	mockPlayerRepo := &mocks.MockPlayerRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Player, error) {
			if id == 1 && businessID == 1 {
				return expectedPlayer, nil
			}
			return nil, domain.ErrPlayerNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerByID(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != expectedPlayer.ID {
		t.Errorf("expected ID %d, got %d", expectedPlayer.ID, result.ID)
	}

	if result.FirstName != expectedPlayer.FirstName {
		t.Errorf("expected FirstName '%s', got '%s'", expectedPlayer.FirstName, result.FirstName)
	}

	if result.BusinessID != expectedPlayer.BusinessID {
		t.Errorf("expected BusinessID %d, got %d", expectedPlayer.BusinessID, result.BusinessID)
	}
}

func TestGetPlayerByID_NotFound(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Player, error) {
			return nil, domain.ErrPlayerNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerByID(context.Background(), 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrPlayerNotFound) {
		t.Errorf("expected ErrPlayerNotFound, got %v", err)
	}
}

func TestGetPlayerByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockPlayerRepo := &mocks.MockPlayerRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Player, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerByID(context.Background(), 1, 1)

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
