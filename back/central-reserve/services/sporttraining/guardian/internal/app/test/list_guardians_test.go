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

func TestListGuardians_Success(t *testing.T) {
	// Arrange
	now := time.Now()
	isActive := true

	expectedResult := &domain.PaginatedGuardiansDTO{
		Guardians: []domain.GuardianListDTO{
			{
				ID:             1,
				FirstName:      "Juan",
				LastName:       "Pérez",
				DocumentNumber: "12345678",
				Email:          "juan.perez@example.com",
				Phone:          "3001234567",
				Relationship:   "Padre",
				IsActive:       true,
				CreatedAt:      now,
			},
			{
				ID:             2,
				FirstName:      "María",
				LastName:       "González",
				DocumentNumber: "87654321",
				Email:          "maria.gonzalez@example.com",
				Phone:          "3009876543",
				Relationship:   "Madre",
				IsActive:       true,
				CreatedAt:      now,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockRepo := &mocks.MockGuardianRepository{
		ListFunc: func(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
			return expectedResult, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.GuardianFiltersDTO{
		BusinessID: 1,
		Name:       "",
		IsActive:   &isActive,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListGuardians(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 2 {
		t.Errorf("expected Total 2, got %d", result.Total)
	}

	if len(result.Guardians) != 2 {
		t.Errorf("expected 2 guardians, got %d", len(result.Guardians))
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10, got %d", result.PageSize)
	}
}

func TestListGuardians_DefaultPagination(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		ListFunc: func(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
			// Verificar que se aplicaron los defaults
			if filters.Page != 1 {
				t.Errorf("expected default Page 1, got %d", filters.Page)
			}
			if filters.PageSize != 10 {
				t.Errorf("expected default PageSize 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedGuardiansDTO{
				Guardians:  []domain.GuardianListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Filtros con paginación inválida
	filters := domain.GuardianFiltersDTO{
		BusinessID: 1,
		Page:       0,      // Inválido, debe ser >= 1
		PageSize:   -5,     // Inválido, debe ser > 0
	}

	// Act
	result, err := uc.ListGuardians(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10, got %d", result.PageSize)
	}
}

func TestListGuardians_MaxPageSize(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		ListFunc: func(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
			// Verificar que se aplicó el límite máximo
			if filters.PageSize != 10 {
				t.Errorf("expected max PageSize 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedGuardiansDTO{
				Guardians:  []domain.GuardianListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Intentar usar un PageSize mayor al límite (100)
	filters := domain.GuardianFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   150, // Mayor al límite
	}

	// Act
	result, err := uc.ListGuardians(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize limited to 10, got %d", result.PageSize)
	}
}

func TestListGuardians_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGuardianRepository{
		ListFunc: func(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.GuardianFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListGuardians(context.Background(), filters)

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
