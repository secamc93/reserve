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

func TestCreatePlayer_Success(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		CreateFunc: func(ctx context.Context, player *domain.Player) (*domain.Player, error) {
			player.ID = 1
			player.CreatedAt = time.Now()
			player.UpdatedAt = time.Now()
			return player, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	dob := time.Date(2010, 5, 15, 0, 0, 0, 0, time.UTC)
	email := "test@example.com"
	phone := "1234567890"

	dto := domain.CreatePlayerDTO{
		BusinessID:       1,
		FirstName:        "Juan",
		LastName:         "Pérez",
		DocumentType:     "TI",
		DocumentNumber:   "123456789",
		DateOfBirth:      dob,
		Gender:           "M",
		Email:            &email,
		Phone:            &phone,
		Address:          "Calle 123",
		City:             "Bogotá",
		State:            "Cundinamarca",
		Country:          "Colombia",
		PreferredPosition: "Delantero",
		EmergencyContact: "María Pérez",
		EmergencyPhone:   "9876543210",
	}

	// Act
	result, err := uc.CreatePlayer(context.Background(), dto)

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

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	// IsMinor debe ser true para fecha de nacimiento 2010 (menor de 18)
	if !result.IsMinor {
		t.Error("expected IsMinor to be true for player born in 2010")
	}
}

func TestCreatePlayer_AdultPlayer(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		CreateFunc: func(ctx context.Context, player *domain.Player) (*domain.Player, error) {
			player.ID = 2
			player.CreatedAt = time.Now()
			player.UpdatedAt = time.Now()
			return player, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Fecha de nacimiento de hace 25 años (adulto)
	dob := time.Now().AddDate(-25, 0, 0)

	dto := domain.CreatePlayerDTO{
		BusinessID:       1,
		FirstName:        "Carlos",
		LastName:         "Gómez",
		DocumentType:     "CC",
		DocumentNumber:   "987654321",
		DateOfBirth:      dob,
		Gender:           "M",
		Address:          "Calle 456",
		City:             "Medellín",
		State:            "Antioquia",
		Country:          "Colombia",
		PreferredPosition: "Defensa",
		EmergencyContact: "Ana Gómez",
		EmergencyPhone:   "5555555555",
	}

	// Act
	result, err := uc.CreatePlayer(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// IsMinor debe ser false para jugador de 25 años
	if result.IsMinor {
		t.Error("expected IsMinor to be false for adult player")
	}
}

func TestCreatePlayer_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockPlayerRepo := &mocks.MockPlayerRepository{
		CreateFunc: func(ctx context.Context, player *domain.Player) (*domain.Player, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	dob := time.Date(2010, 5, 15, 0, 0, 0, 0, time.UTC)

	dto := domain.CreatePlayerDTO{
		BusinessID:       1,
		FirstName:        "Juan",
		LastName:         "Pérez",
		DocumentType:     "TI",
		DocumentNumber:   "123456789",
		DateOfBirth:      dob,
		Gender:           "M",
		Address:          "Calle 123",
		City:             "Bogotá",
		State:            "Cundinamarca",
		Country:          "Colombia",
		PreferredPosition: "Delantero",
		EmergencyContact: "María Pérez",
		EmergencyPhone:   "9876543210",
	}

	// Act
	result, err := uc.CreatePlayer(context.Background(), dto)

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
