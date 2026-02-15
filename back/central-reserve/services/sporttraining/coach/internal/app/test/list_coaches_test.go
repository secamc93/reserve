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

func TestListCoaches_Success(t *testing.T) {
	// Arrange
	yearsExp1 := 5
	yearsExp2 := 3

	expectedResult := &domain.PaginatedCoachesDTO{
		Coaches: []domain.CoachListDTO{
			{
				ID:                1,
				FirstName:         "Juan",
				LastName:          "Pérez",
				DocumentNumber:    "123456789",
				Email:             "juan.perez@example.com",
				Phone:             "+57 300 1234567",
				YearsOfExperience: &yearsExp1,
				IsAvailable:       true,
				IsActive:          true,
				CreatedAt:         time.Now(),
			},
			{
				ID:                2,
				FirstName:         "María",
				LastName:          "González",
				DocumentNumber:    "987654321",
				Email:             "maria.gonzalez@example.com",
				Phone:             "+57 300 7654321",
				YearsOfExperience: &yearsExp2,
				IsAvailable:       true,
				IsActive:          true,
				CreatedAt:         time.Now(),
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockCoachRepo := &mocks.MockCoachRepository{
		ListFunc: func(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
			return expectedResult, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	filters := domain.CoachFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListCoaches(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if len(result.Coaches) != 2 {
		t.Errorf("expected 2 coaches, got %d", len(result.Coaches))
	}

	if result.Total != 2 {
		t.Errorf("expected total 2, got %d", result.Total)
	}

	if result.Page != 1 {
		t.Errorf("expected page 1, got %d", result.Page)
	}

	if result.Coaches[0].FirstName != "Juan" {
		t.Errorf("expected first coach name 'Juan', got '%s'", result.Coaches[0].FirstName)
	}

	if result.Coaches[1].FirstName != "María" {
		t.Errorf("expected second coach name 'María', got '%s'", result.Coaches[1].FirstName)
	}
}

func TestListCoaches_WithFilters(t *testing.T) {
	// Arrange
	isAvailable := true
	isActive := true

	expectedResult := &domain.PaginatedCoachesDTO{
		Coaches: []domain.CoachListDTO{
			{
				ID:          1,
				FirstName:   "Juan",
				LastName:    "Pérez",
				IsAvailable: true,
				IsActive:    true,
			},
		},
		Total:      1,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockCoachRepo := &mocks.MockCoachRepository{
		ListFunc: func(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
			if filters.IsAvailable != nil && *filters.IsAvailable == true {
				return expectedResult, nil
			}
			return &domain.PaginatedCoachesDTO{Coaches: []domain.CoachListDTO{}, Total: 0, Page: 1, PageSize: 10, TotalPages: 0}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	filters := domain.CoachFiltersDTO{
		BusinessID:  1,
		Name:        "Juan",
		IsAvailable: &isAvailable,
		IsActive:    &isActive,
		Page:        1,
		PageSize:    10,
	}

	// Act
	result, err := uc.ListCoaches(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result.Coaches) != 1 {
		t.Errorf("expected 1 coach, got %d", len(result.Coaches))
	}
}

func TestListCoaches_DefaultPagination(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		ListFunc: func(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
			// Verificar que se aplicaron los defaults
			if filters.Page != 1 {
				t.Errorf("expected default page 1, got %d", filters.Page)
			}
			if filters.PageSize != 10 {
				t.Errorf("expected default page size 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedCoachesDTO{
				Coaches:    []domain.CoachListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	// Parámetros inválidos que deben ser corregidos
	filters := domain.CoachFiltersDTO{
		BusinessID: 1,
		Page:       0,  // Inválido, debe corregirse a 1
		PageSize:   -5, // Inválido, debe corregirse a 10
	}

	// Act
	result, err := uc.ListCoaches(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Page != 1 {
		t.Errorf("expected page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected page size 10, got %d", result.PageSize)
	}
}

func TestListCoaches_MaxPageSize(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		ListFunc: func(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
			// Verificar que se aplicó el límite máximo
			if filters.PageSize != 10 {
				t.Errorf("expected max page size 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedCoachesDTO{
				Coaches:    []domain.CoachListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	// PageSize > 100 debe corregirse a 10 (default)
	filters := domain.CoachFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   200,
	}

	// Act
	result, err := uc.ListCoaches(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.PageSize != 10 {
		t.Errorf("expected corrected page size 10, got %d", result.PageSize)
	}
}

func TestListCoaches_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database query error")

	mockCoachRepo := &mocks.MockCoachRepository{
		ListFunc: func(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	filters := domain.CoachFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListCoaches(context.Background(), filters)

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
