package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

func TestGetCommonAreaByID_Success(t *testing.T) {
	// Arrange
	expectedArea := &domain.CommonArea{
		ID:               1,
		BusinessID:       1,
		CommonAreaTypeID: 1,
		Name:             "Salón Social",
		MaxCapacity:      50,
		IsActive:         true,
	}

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			if id == 1 {
				return expectedArea, nil
			}
			return nil, domain.ErrCommonAreaNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	// Act
	result, err := uc.GetCommonAreaByID(context.Background(), 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != expectedArea.ID {
		t.Errorf("expected ID %d, got %d", expectedArea.ID, result.ID)
	}

	if result.Name != expectedArea.Name {
		t.Errorf("expected name '%s', got '%s'", expectedArea.Name, result.Name)
	}
}

func TestGetCommonAreaByID_NotFound(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return nil, domain.ErrCommonAreaNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	// Act
	result, err := uc.GetCommonAreaByID(context.Background(), 999)

	// Assert
	if err == nil {
		t.Fatal("expected error for not found, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrCommonAreaNotFound) {
		t.Errorf("expected ErrCommonAreaNotFound, got %v", err)
	}
}

func TestGetCommonAreaByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database error")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaByIDFunc: func(ctx context.Context, id uint) (*domain.CommonArea, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	// Act
	result, err := uc.GetCommonAreaByID(context.Background(), 1)

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

func TestListCommonAreas_Success(t *testing.T) {
	// Arrange
	expectedResult := &domain.PaginatedCommonAreasDTO{
		CommonAreas: []domain.CommonAreaListDTO{
			{ID: 1, Name: "Salón Social", MaxCapacity: 50, IsActive: true},
			{ID: 2, Name: "Cancha", MaxCapacity: 20, IsActive: true},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		ListCommonAreasFunc: func(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
			return expectedResult, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	filters := domain.CommonAreaFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListCommonAreas(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 2 {
		t.Errorf("expected total 2, got %d", result.Total)
	}

	if len(result.CommonAreas) != 2 {
		t.Errorf("expected 2 common areas, got %d", len(result.CommonAreas))
	}
}

func TestListCommonAreas_EmptyResult(t *testing.T) {
	// Arrange
	expectedResult := &domain.PaginatedCommonAreasDTO{
		CommonAreas: []domain.CommonAreaListDTO{},
		Total:       0,
		Page:        1,
		PageSize:    10,
		TotalPages:  0,
	}

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		ListCommonAreasFunc: func(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
			return expectedResult, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	filters := domain.CommonAreaFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListCommonAreas(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected total 0, got %d", result.Total)
	}

	if len(result.CommonAreas) != 0 {
		t.Errorf("expected 0 common areas, got %d", len(result.CommonAreas))
	}
}

func TestListCommonAreas_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database error")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		ListCommonAreasFunc: func(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	filters := domain.CommonAreaFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListCommonAreas(context.Background(), filters)

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

func TestGetCommonAreaTypes_Success(t *testing.T) {
	// Arrange
	expectedTypes := []*domain.CommonAreaType{
		{ID: 1, Name: "Salón Social", Code: "salon_social", IsActive: true},
		{ID: 2, Name: "Cancha", Code: "cancha", IsActive: true},
		{ID: 3, Name: "Piscina", Code: "piscina", IsActive: true},
	}

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaTypesFunc: func(ctx context.Context) ([]*domain.CommonAreaType, error) {
			return expectedTypes, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	// Act
	result, err := uc.GetCommonAreaTypes(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 types, got %d", len(result))
	}

	if result[0].Name != "Salón Social" {
		t.Errorf("expected first type 'Salón Social', got '%s'", result[0].Name)
	}
}

func TestGetCommonAreaTypes_EmptyResult(t *testing.T) {
	// Arrange
	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaTypesFunc: func(ctx context.Context) ([]*domain.CommonAreaType, error) {
			return []*domain.CommonAreaType{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	// Act
	result, err := uc.GetCommonAreaTypes(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected 0 types, got %d", len(result))
	}
}

func TestGetCommonAreaTypes_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database error")

	mockCommonAreaRepo := &mocks.MockCommonAreaRepository{
		GetCommonAreaTypesFunc: func(ctx context.Context) ([]*domain.CommonAreaType, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		mockCommonAreaRepo,
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		&mocks.MockReservationRepository{},
		mockLogger,
	)

	// Act
	result, err := uc.GetCommonAreaTypes(context.Background())

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
