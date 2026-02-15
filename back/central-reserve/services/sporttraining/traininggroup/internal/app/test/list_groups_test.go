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

func TestListGroups_Success(t *testing.T) {
	// Arrange
	expectedGroups := []domain.GroupListDTO{
		{
			ID:              1,
			Name:            "Grupo A",
			Code:            "GA",
			Category:        "Infantil",
			CoachName:       "Juan Pérez",
			MaxCapacity:     20,
			CurrentCapacity: 15,
			IsActive:        true,
			CreatedAt:       time.Now(),
		},
		{
			ID:              2,
			Name:            "Grupo B",
			Code:            "GB",
			Category:        "Juvenil",
			CoachName:       "María González",
			MaxCapacity:     25,
			CurrentCapacity: 20,
			IsActive:        true,
			CreatedAt:       time.Now(),
		},
	}

	mockRepo := &mocks.MockGroupRepository{
		ListFunc: func(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
			totalPages := int(2) / filters.PageSize
			if int(2)%filters.PageSize != 0 {
				totalPages++
			}

			return &domain.PaginatedGroupsDTO{
				Groups:     expectedGroups,
				Total:      2,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: totalPages,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.GroupFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListGroups(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 2 {
		t.Errorf("expected total 2, got %d", result.Total)
	}

	if len(result.Groups) != 2 {
		t.Errorf("expected 2 groups, got %d", len(result.Groups))
	}

	if result.Page != 1 {
		t.Errorf("expected page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected page size 10, got %d", result.PageSize)
	}
}

func TestListGroups_DefaultPagination(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		ListFunc: func(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
			// Verificar que los defaults se aplicaron
			if filters.Page != 1 {
				t.Errorf("expected page to default to 1, got %d", filters.Page)
			}
			if filters.PageSize != 10 {
				t.Errorf("expected page size to default to 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedGroupsDTO{
				Groups:     []domain.GroupListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.GroupFiltersDTO{
		BusinessID: 1,
		Page:       0, // Invalid, should default to 1
		PageSize:   0, // Invalid, should default to 10
	}

	// Act
	result, err := uc.ListGroups(context.Background(), filters)

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

func TestListGroups_MaxPageSize(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		ListFunc: func(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
			// Verificar que el tamaño máximo se respeta
			if filters.PageSize != 100 {
				t.Errorf("expected page size to be capped at 100, got %d", filters.PageSize)
			}

			return &domain.PaginatedGroupsDTO{
				Groups:     []domain.GroupListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.GroupFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   500, // Exceeds max, should be capped to 100
	}

	// Act
	result, err := uc.ListGroups(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.PageSize != 100 {
		t.Errorf("expected page size 100, got %d", result.PageSize)
	}
}

func TestListGroups_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database query error")

	mockRepo := &mocks.MockGroupRepository{
		ListFunc: func(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.GroupFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListGroups(context.Background(), filters)

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
