package usecasehorizontalproperty_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty/test/mocks"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/domain"
)

func TestListHorizontalProperties_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	filters := domain.HorizontalPropertyFiltersDTO{
		Page:     1,
		PageSize: 10,
		OrderBy:  "created_at",
		OrderDir: "desc",
	}

	expectedData := []domain.HorizontalPropertyListDTO{
		{
			ID:               1,
			Name:             "Torre Central",
			Code:             "torre-central",
			BusinessTypeName: "Propiedad Horizontal",
			Address:          "Calle 123",
			TotalUnits:       50,
			LogoURL:          "logos/logo1.jpg",
			NavbarImageURL:   "navbar/navbar1.jpg",
			IsActive:         true,
			CreatedAt:        time.Now(),
		},
		{
			ID:               2,
			Name:             "Edificio Norte",
			Code:             "edificio-norte",
			BusinessTypeName: "Propiedad Horizontal",
			Address:          "Calle 456",
			TotalUnits:       30,
			LogoURL:          "logos/logo2.jpg",
			IsActive:         true,
			CreatedAt:        time.Now(),
		},
	}

	mockRepo.ListHorizontalPropertiesFunc = func(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
		return &domain.PaginatedHorizontalPropertyDTO{
			Data:       expectedData,
			Total:      2,
			Page:       filters.Page,
			PageSize:   filters.PageSize,
			TotalPages: 1,
		}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.ListHorizontalProperties(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if len(result.Data) != 2 {
		t.Errorf("Expected 2 items, got %d", len(result.Data))
	}

	if result.Total != 2 {
		t.Errorf("Expected total 2, got %d", result.Total)
	}

	// Verificar que las URLs se completaron correctamente
	if result.Data[0].LogoURL != "https://s3.example.com/logos/logo1.jpg" {
		t.Errorf("Expected logo URL https://s3.example.com/logos/logo1.jpg, got %s", result.Data[0].LogoURL)
	}

	if result.Data[0].NavbarImageURL != "https://s3.example.com/navbar/navbar1.jpg" {
		t.Errorf("Expected navbar URL https://s3.example.com/navbar/navbar1.jpg, got %s", result.Data[0].NavbarImageURL)
	}
}

func TestListHorizontalProperties_DefaultPagination(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	// Filters con valores inválidos para validar defaults
	filters := domain.HorizontalPropertyFiltersDTO{
		Page:     0,  // Inválido
		PageSize: 0,  // Inválido
	}

	mockRepo.ListHorizontalPropertiesFunc = func(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
		// Verificar que se aplicaron defaults
		if filters.Page != 1 {
			t.Errorf("Expected default page 1, got %d", filters.Page)
		}
		if filters.PageSize != 10 {
			t.Errorf("Expected default pageSize 10, got %d", filters.PageSize)
		}
		if filters.OrderBy != "created_at" {
			t.Errorf("Expected default orderBy 'created_at', got %s", filters.OrderBy)
		}
		if filters.OrderDir != "desc" {
			t.Errorf("Expected default orderDir 'desc', got %s", filters.OrderDir)
		}

		return &domain.PaginatedHorizontalPropertyDTO{
			Data:       []domain.HorizontalPropertyListDTO{},
			Total:      0,
			Page:       filters.Page,
			PageSize:   filters.PageSize,
			TotalPages: 0,
		}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.ListHorizontalProperties(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}
}

func TestListHorizontalProperties_MaxPageSize(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	// PageSize mayor al máximo permitido
	filters := domain.HorizontalPropertyFiltersDTO{
		Page:     1,
		PageSize: 200, // Mayor a 100
	}

	mockRepo.ListHorizontalPropertiesFunc = func(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
		// Verificar que se aplicó el máximo
		if filters.PageSize != 100 {
			t.Errorf("Expected max pageSize 100, got %d", filters.PageSize)
		}

		return &domain.PaginatedHorizontalPropertyDTO{
			Data:       []domain.HorizontalPropertyListDTO{},
			Total:      0,
			Page:       filters.Page,
			PageSize:   filters.PageSize,
			TotalPages: 0,
		}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.ListHorizontalProperties(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}
}

func TestListHorizontalProperties_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	filters := domain.HorizontalPropertyFiltersDTO{
		Page:     1,
		PageSize: 10,
	}

	mockRepo.ListHorizontalPropertiesFunc = func(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
		return nil, errors.New("database error")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.ListHorizontalProperties(ctx, filters)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}
