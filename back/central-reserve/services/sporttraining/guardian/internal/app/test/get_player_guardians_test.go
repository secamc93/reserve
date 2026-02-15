package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/guardian/internal/app"
	"central_reserve/services/sporttraining/guardian/internal/app/test/mocks"
	"central_reserve/services/sporttraining/guardian/internal/domain"
)

func TestGetPlayerGuardians_Success(t *testing.T) {
	// Arrange
	now := time.Now()

	expectedGuardians := []domain.PlayerGuardianDTO{
		{
			ID:                  1,
			FirstName:           "Juan",
			LastName:            "Pérez",
			DocumentNumber:      "12345678",
			Email:               "juan.perez@example.com",
			Phone:               "3001234567",
			RelationshipType:    "Padre",
			IsPrimaryGuardian:   true,
			CanPickup:           true,
			CanBookSessions:     true,
			HasMedicalAuthority: true,
			StartDate:           now,
		},
		{
			ID:                  2,
			FirstName:           "María",
			LastName:            "González",
			DocumentNumber:      "87654321",
			Email:               "maria.gonzalez@example.com",
			Phone:               "3009876543",
			RelationshipType:    "Madre",
			IsPrimaryGuardian:   false,
			CanPickup:           true,
			CanBookSessions:     false,
			HasMedicalAuthority: true,
			StartDate:           now,
		},
	}

	mockRepo := &mocks.MockGuardianRepository{
		GetPlayerGuardiansFunc: func(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
			if playerID == 1 && businessID == 1 {
				return expectedGuardians, nil
			}
			return []domain.PlayerGuardianDTO{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerGuardians(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 2 {
		t.Errorf("expected 2 guardians, got %d", len(result))
	}

	// Verificar primer tutor
	if result[0].FirstName != "Juan" {
		t.Errorf("expected FirstName 'Juan', got '%s'", result[0].FirstName)
	}

	if !result[0].IsPrimaryGuardian {
		t.Error("expected first guardian to be primary")
	}

	if result[0].RelationshipType != "Padre" {
		t.Errorf("expected RelationshipType 'Padre', got '%s'", result[0].RelationshipType)
	}

	// Verificar segundo tutor
	if result[1].FirstName != "María" {
		t.Errorf("expected FirstName 'María', got '%s'", result[1].FirstName)
	}

	if result[1].IsPrimaryGuardian {
		t.Error("expected second guardian not to be primary")
	}

	if result[1].CanBookSessions {
		t.Error("expected second guardian CanBookSessions to be false")
	}
}

func TestGetPlayerGuardians_EmptyResult(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		GetPlayerGuardiansFunc: func(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
			return []domain.PlayerGuardianDTO{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerGuardians(context.Background(), 999, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty result, got %d guardians", len(result))
	}
}

func TestGetPlayerGuardians_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGuardianRepository{
		GetPlayerGuardiansFunc: func(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerGuardians(context.Background(), 1, 1)

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

func TestGetPlayerGuardians_PlayerNotFound(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		GetPlayerGuardiansFunc: func(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
			return nil, domain.ErrPlayerNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPlayerGuardians(context.Background(), 999, 1)

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
