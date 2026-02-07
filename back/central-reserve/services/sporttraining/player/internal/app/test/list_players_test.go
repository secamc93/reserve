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

func TestListPlayers_Success(t *testing.T) {
	// Arrange
	expectedPlayers := []domain.PlayerListDTO{
		{
			ID:                1,
			FirstName:         "Juan",
			LastName:          "Pérez",
			DocumentNumber:    "123456789",
			DateOfBirth:       time.Date(2010, 5, 15, 0, 0, 0, 0, time.UTC),
			Gender:            "M",
			PreferredPosition: "Delantero",
			SkillLevelName:    "Principiante",
			IsMinor:           true,
			IsActive:          true,
			CreatedAt:         time.Now(),
		},
		{
			ID:                2,
			FirstName:         "Carlos",
			LastName:          "Gómez",
			DocumentNumber:    "987654321",
			DateOfBirth:       time.Date(1995, 8, 20, 0, 0, 0, 0, time.UTC),
			Gender:            "M",
			PreferredPosition: "Defensa",
			SkillLevelName:    "Avanzado",
			IsMinor:           false,
			IsActive:          true,
			CreatedAt:         time.Now(),
		},
	}

	mockPlayerRepo := &mocks.MockPlayerRepository{
		ListFunc: func(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
			return &domain.PaginatedPlayersDTO{
				Players:    expectedPlayers,
				Total:      2,
				Page:       1,
				PageSize:   10,
				TotalPages: 1,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	filters := domain.PlayerFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListPlayers(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 2 {
		t.Errorf("expected Total 2, got %d", result.Total)
	}

	if len(result.Players) != 2 {
		t.Errorf("expected 2 players, got %d", len(result.Players))
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10, got %d", result.PageSize)
	}
}

func TestListPlayers_PaginationDefaults(t *testing.T) {
	// Arrange
	var capturedFilters domain.PlayerFiltersDTO

	mockPlayerRepo := &mocks.MockPlayerRepository{
		ListFunc: func(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedPlayersDTO{
				Players:    []domain.PlayerListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Filters con valores inválidos
	filters := domain.PlayerFiltersDTO{
		BusinessID: 1,
		Page:       0,  // Inválido
		PageSize:   0,  // Inválido
	}

	// Act
	result, err := uc.ListPlayers(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verificar que se aplicaron defaults
	if capturedFilters.Page != 1 {
		t.Errorf("expected Page to be defaulted to 1, got %d", capturedFilters.Page)
	}

	if capturedFilters.PageSize != 10 {
		t.Errorf("expected PageSize to be defaulted to 10, got %d", capturedFilters.PageSize)
	}

	if result.Page != 1 {
		t.Errorf("expected result Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected result PageSize 10, got %d", result.PageSize)
	}
}

func TestListPlayers_PaginationMaxLimit(t *testing.T) {
	// Arrange
	var capturedFilters domain.PlayerFiltersDTO

	mockPlayerRepo := &mocks.MockPlayerRepository{
		ListFunc: func(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedPlayersDTO{
				Players:    []domain.PlayerListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// PageSize mayor a 100 (límite máximo)
	filters := domain.PlayerFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   150, // Excede el límite
	}

	// Act
	result, err := uc.ListPlayers(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verificar que se aplicó el límite máximo
	if capturedFilters.PageSize != 100 {
		t.Errorf("expected PageSize to be capped at 100, got %d", capturedFilters.PageSize)
	}

	if result.PageSize != 100 {
		t.Errorf("expected result PageSize 100, got %d", result.PageSize)
	}
}

func TestListPlayers_WithFilters(t *testing.T) {
	// Arrange
	isMinor := true
	isActive := true
	skillLevelID := uint(2)

	mockPlayerRepo := &mocks.MockPlayerRepository{
		ListFunc: func(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
			// Simular filtrado
			return &domain.PaginatedPlayersDTO{
				Players: []domain.PlayerListDTO{
					{
						ID:             1,
						FirstName:      "Juan",
						LastName:       "Pérez",
						DocumentNumber: "123456789",
						IsMinor:        true,
						IsActive:       true,
					},
				},
				Total:      1,
				Page:       1,
				PageSize:   10,
				TotalPages: 1,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	filters := domain.PlayerFiltersDTO{
		BusinessID:   1,
		IsMinor:      &isMinor,
		IsActive:     &isActive,
		SkillLevelID: &skillLevelID,
		Name:         "Juan",
		Page:         1,
		PageSize:     10,
	}

	// Act
	result, err := uc.ListPlayers(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 1 {
		t.Errorf("expected Total 1, got %d", result.Total)
	}

	if len(result.Players) != 1 {
		t.Errorf("expected 1 player, got %d", len(result.Players))
	}
}

func TestListPlayers_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database query error")

	mockPlayerRepo := &mocks.MockPlayerRepository{
		ListFunc: func(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	filters := domain.PlayerFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListPlayers(context.Background(), filters)

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
