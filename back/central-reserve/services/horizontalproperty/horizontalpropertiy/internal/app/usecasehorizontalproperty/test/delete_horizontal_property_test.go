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

func TestDeleteHorizontalProperty_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		Code:           "torre-central",
		LogoURL:        "logos/logo.jpg",
		NavbarImageURL: "navbar/navbar.jpg",
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	var s3DeletedFiles []string

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		if id != propertyID {
			t.Errorf("Expected ID %d, got %d", propertyID, id)
		}
		return existingProperty, nil
	}

	mockRepo.DeleteHorizontalPropertyFunc = func(ctx context.Context, id uint) error {
		if id != propertyID {
			t.Errorf("Expected ID %d, got %d", propertyID, id)
		}
		return nil
	}

	mockS3.DeleteImageFunc = func(ctx context.Context, filename string) error {
		s3DeletedFiles = append(s3DeletedFiles, filename)
		return nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	err := useCase.DeleteHorizontalProperty(ctx, propertyID)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verificar que se eliminaron las imágenes de S3
	if len(s3DeletedFiles) != 2 {
		t.Errorf("Expected 2 files deleted from S3, got %d", len(s3DeletedFiles))
	}

	expectedFiles := []string{"logos/logo.jpg", "navbar/navbar.jpg"}
	for _, expected := range expectedFiles {
		found := false
		for _, deleted := range s3DeletedFiles {
			if deleted == expected {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("Expected file %s to be deleted from S3, but it wasn't", expected)
		}
	}
}

func TestDeleteHorizontalProperty_PropertyNotFound(t *testing.T) {
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
	err := useCase.DeleteHorizontalProperty(ctx, propertyID)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if !errors.Is(err, domain.ErrHorizontalPropertyNotFound) {
		t.Errorf("Expected ErrHorizontalPropertyNotFound, got %v", err)
	}
}

func TestDeleteHorizontalProperty_S3DeleteError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		LogoURL:        "logos/logo.jpg",
		NavbarImageURL: "navbar/navbar.jpg",
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.DeleteHorizontalPropertyFunc = func(ctx context.Context, id uint) error {
		return nil
	}

	// S3 falla al eliminar (pero no debe bloquear el delete)
	mockS3.DeleteImageFunc = func(ctx context.Context, filename string) error {
		return errors.New("S3 error")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	err := useCase.DeleteHorizontalProperty(ctx, propertyID)

	// Assert
	// No debe fallar aunque S3 falle (error no crítico)
	if err != nil {
		t.Fatalf("Expected no error despite S3 failure, got %v", err)
	}
}

func TestDeleteHorizontalProperty_NoImages(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		LogoURL:        "", // Sin logo
		NavbarImageURL: "", // Sin navbar
	}

	s3DeleteCalled := false

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.DeleteHorizontalPropertyFunc = func(ctx context.Context, id uint) error {
		return nil
	}

	mockS3.DeleteImageFunc = func(ctx context.Context, filename string) error {
		s3DeleteCalled = true
		return nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	err := useCase.DeleteHorizontalProperty(ctx, propertyID)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// No debe intentar eliminar de S3 si no hay imágenes
	if s3DeleteCalled {
		t.Error("S3 delete should not be called when there are no images")
	}
}

func TestDeleteHorizontalProperty_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	existingProperty := &domain.HorizontalProperty{
		ID:   propertyID,
		Name: "Torre Central",
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.DeleteHorizontalPropertyFunc = func(ctx context.Context, id uint) error {
		return errors.New("database error")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	err := useCase.DeleteHorizontalProperty(ctx, propertyID)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
}
