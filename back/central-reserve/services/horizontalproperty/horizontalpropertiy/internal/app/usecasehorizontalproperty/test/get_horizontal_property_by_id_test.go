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

func TestGetHorizontalPropertyByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	expectedProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		Code:           "torre-central",
		BusinessTypeID: 1,
		Address:        "Calle 123",
		TotalUnits:     50,
		LogoURL:        "logos/logo.jpg",
		NavbarImageURL: "navbar/navbar.jpg",
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	expectedBusinessType := &domain.BusinessType{
		ID:   1,
		Name: "Propiedad Horizontal",
		Code: "horizontal_property",
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		if id != propertyID {
			t.Errorf("Expected ID %d, got %d", propertyID, id)
		}
		return expectedProperty, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		if id != expectedProperty.BusinessTypeID {
			t.Errorf("Expected BusinessTypeID %d, got %d", expectedProperty.BusinessTypeID, id)
		}
		return expectedBusinessType, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.GetHorizontalPropertyByID(ctx, propertyID)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if result.ID != propertyID {
		t.Errorf("Expected ID %d, got %d", propertyID, result.ID)
	}

	if result.Name != expectedProperty.Name {
		t.Errorf("Expected name %s, got %s", expectedProperty.Name, result.Name)
	}

	if result.BusinessTypeName != expectedBusinessType.Name {
		t.Errorf("Expected business type name %s, got %s", expectedBusinessType.Name, result.BusinessTypeName)
	}

	// Verificar que las URLs se completaron correctamente
	if result.LogoURL != "https://s3.example.com/logos/logo.jpg" {
		t.Errorf("Expected logo URL https://s3.example.com/logos/logo.jpg, got %s", result.LogoURL)
	}

	if result.NavbarImageURL != "https://s3.example.com/navbar/navbar.jpg" {
		t.Errorf("Expected navbar URL https://s3.example.com/navbar/navbar.jpg, got %s", result.NavbarImageURL)
	}
}

func TestGetHorizontalPropertyByID_PropertyNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(999)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return nil, errors.New("not found")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.GetHorizontalPropertyByID(ctx, propertyID)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if !errors.Is(err, domain.ErrHorizontalPropertyNotFound) {
		t.Errorf("Expected ErrHorizontalPropertyNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}

func TestGetHorizontalPropertyByID_BusinessTypeError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	expectedProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		BusinessTypeID: 1,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return expectedProperty, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		return nil, errors.New("business type not found")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.GetHorizontalPropertyByID(ctx, propertyID)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}
