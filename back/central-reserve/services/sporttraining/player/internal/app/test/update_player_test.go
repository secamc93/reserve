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

func TestUpdatePlayer_Success(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		UpdateFunc: func(ctx context.Context, player *domain.Player) (*domain.Player, error) {
			player.UpdatedAt = time.Now()
			return player, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	dob := time.Date(2010, 5, 15, 0, 0, 0, 0, time.UTC)
	email := "updated@example.com"
	phone := "1111111111"

	dto := domain.UpdatePlayerDTO{
		ID:                1,
		BusinessID:        1,
		FirstName:         "Juan Carlos",
		LastName:          "Pérez García",
		DocumentType:      "TI",
		DocumentNumber:    "123456789",
		DateOfBirth:       dob,
		Gender:            "M",
		Email:             &email,
		Phone:             &phone,
		Address:           "Calle 456 Actualizada",
		City:              "Bogotá",
		State:             "Cundinamarca",
		Country:           "Colombia",
		PreferredPosition: "Mediocampista",
		EmergencyContact:  "María Pérez",
		EmergencyPhone:    "9876543210",
		IsActive:          true,
	}

	// Act
	result, err := uc.UpdatePlayer(context.Background(), dto)

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

	if result.PreferredPosition != "Mediocampista" {
		t.Errorf("expected PreferredPosition 'Mediocampista', got '%s'", result.PreferredPosition)
	}

	if !result.IsMinor {
		t.Error("expected IsMinor to be true for player born in 2010")
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestUpdatePlayer_ChangingToAdult(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		UpdateFunc: func(ctx context.Context, player *domain.Player) (*domain.Player, error) {
			player.UpdatedAt = time.Now()
			return player, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Cambiar fecha de nacimiento a hace 20 años (adulto)
	dob := time.Now().AddDate(-20, 0, 0)

	dto := domain.UpdatePlayerDTO{
		ID:                1,
		BusinessID:        1,
		FirstName:         "Juan",
		LastName:          "Pérez",
		DocumentType:      "CC", // Cambió de TI a CC
		DocumentNumber:    "123456789",
		DateOfBirth:       dob,
		Gender:            "M",
		Address:           "Calle 123",
		City:              "Bogotá",
		State:             "Cundinamarca",
		Country:           "Colombia",
		PreferredPosition: "Delantero",
		EmergencyContact:  "María Pérez",
		EmergencyPhone:    "9876543210",
		IsActive:          true,
	}

	// Act
	result, err := uc.UpdatePlayer(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// IsMinor debe ser false ahora
	if result.IsMinor {
		t.Error("expected IsMinor to be false after changing to adult age")
	}

	if result.DocumentType != "CC" {
		t.Errorf("expected DocumentType 'CC', got '%s'", result.DocumentType)
	}
}

func TestUpdatePlayer_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database update error")

	mockPlayerRepo := &mocks.MockPlayerRepository{
		UpdateFunc: func(ctx context.Context, player *domain.Player) (*domain.Player, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	dob := time.Date(2010, 5, 15, 0, 0, 0, 0, time.UTC)

	dto := domain.UpdatePlayerDTO{
		ID:                1,
		BusinessID:        1,
		FirstName:         "Juan",
		LastName:          "Pérez",
		DocumentType:      "TI",
		DocumentNumber:    "123456789",
		DateOfBirth:       dob,
		Gender:            "M",
		Address:           "Calle 123",
		City:              "Bogotá",
		State:             "Cundinamarca",
		Country:           "Colombia",
		PreferredPosition: "Delantero",
		EmergencyContact:  "María Pérez",
		EmergencyPhone:    "9876543210",
		IsActive:          true,
	}

	// Act
	result, err := uc.UpdatePlayer(context.Background(), dto)

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
