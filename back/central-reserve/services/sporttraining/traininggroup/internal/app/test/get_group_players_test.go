package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/traininggroup/internal/app"
	"central_reserve/services/sporttraining/traininggroup/internal/app/test/mocks"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

func TestGetGroupPlayers_Success(t *testing.T) {
	// Arrange
	expectedPlayers := []domain.GroupPlayerDTO{
		{
			PlayerID:       100,
			FirstName:      "Juan",
			LastName:       "Pérez",
			EnrollmentDate: time.Now().AddDate(0, -2, 0),
			IsActive:       true,
		},
		{
			PlayerID:       101,
			FirstName:      "María",
			LastName:       "González",
			EnrollmentDate: time.Now().AddDate(0, -1, 0),
			IsActive:       true,
		},
		{
			PlayerID:       102,
			FirstName:      "Carlos",
			LastName:       "Rodríguez",
			EnrollmentDate: time.Now().AddDate(0, -3, 0),
			IsActive:       false,
		},
	}

	mockRepo := &mocks.MockGroupRepository{
		GetGroupPlayersFunc: func(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error) {
			if groupID == 1 && businessID == 1 {
				return expectedPlayers, nil
			}
			return []domain.GroupPlayerDTO{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGroupPlayers(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 players, got %d", len(result))
	}

	// Verificar primer jugador
	if result[0].PlayerID != 100 {
		t.Errorf("expected first player ID 100, got %d", result[0].PlayerID)
	}

	if result[0].FirstName != "Juan" {
		t.Errorf("expected first name 'Juan', got '%s'", result[0].FirstName)
	}

	if !result[0].IsActive {
		t.Error("expected first player to be active")
	}

	// Verificar jugador inactivo
	if result[2].IsActive {
		t.Error("expected third player to be inactive")
	}
}

func TestGetGroupPlayers_EmptyList(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		GetGroupPlayersFunc: func(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error) {
			return []domain.GroupPlayerDTO{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGroupPlayers(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected 0 players, got %d", len(result))
	}
}

func TestGetGroupPlayers_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database query error")

	mockRepo := &mocks.MockGroupRepository{
		GetGroupPlayersFunc: func(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGroupPlayers(context.Background(), 1, 1)

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
