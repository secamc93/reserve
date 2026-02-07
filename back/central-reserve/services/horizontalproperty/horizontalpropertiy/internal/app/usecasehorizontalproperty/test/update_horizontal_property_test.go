package usecasehorizontalproperty_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty/test/mocks"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/domain"
	"central_reserve/shared/types"
)

func TestUpdateHorizontalProperty_Success_PartialUpdate(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		Code:           "torre-central",
		BusinessTypeID: 1,
		Address:        "Calle 123",
		TotalUnits:     50,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	newName := "Torre Central Renovada"
	newAddress := "Calle 456"
	dto := domain.UpdateHorizontalPropertyDTO{
		Name:    &newName,
		Address: &newAddress,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		if id != propertyID {
			t.Errorf("Expected ID %d, got %d", propertyID, id)
		}
		return existingProperty, nil
	}

	mockRepo.UpdateHorizontalPropertyFunc = func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		// Verificar que solo se actualizaron los campos enviados
		if property.Name != newName {
			t.Errorf("Expected name '%s', got '%s'", newName, property.Name)
		}
		if property.Address != newAddress {
			t.Errorf("Expected address '%s', got '%s'", newAddress, property.Address)
		}
		return property, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		return &domain.BusinessType{
			ID:   1,
			Name: "Propiedad Horizontal",
			Code: "horizontal_property",
		}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if result.Name != newName {
		t.Errorf("Expected name '%s', got '%s'", newName, result.Name)
	}

	if result.Address != newAddress {
		t.Errorf("Expected address '%s', got '%s'", newAddress, result.Address)
	}
}

func TestUpdateHorizontalProperty_Success_UpdateCode(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		Code:           "torre-central",
		BusinessTypeID: 1,
	}

	newCode := "TORRE-CENTRAL-NEW"
	dto := domain.UpdateHorizontalPropertyDTO{
		Code: &newCode,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		// Verificar que se normalizó el código
		if code != "torre-central-new" {
			t.Errorf("Expected normalized code 'torre-central-new', got '%s'", code)
		}
		// Verificar que se excluye el ID actual
		if excludeID == nil || *excludeID != propertyID {
			t.Error("Expected excludeID to be current property ID")
		}
		return false, nil
	}

	mockRepo.UpdateHorizontalPropertyFunc = func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		if property.Code != "torre-central-new" {
			t.Errorf("Expected code 'torre-central-new', got '%s'", property.Code)
		}
		return property, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result.Code != "torre-central-new" {
		t.Errorf("Expected code 'torre-central-new', got '%s'", result.Code)
	}
}

func TestUpdateHorizontalProperty_CodeExists(t *testing.T) {
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
		Code: "torre-central",
	}

	newCode := "torre-norte" // Este código ya existe en otra propiedad
	dto := domain.UpdateHorizontalPropertyDTO{
		Code: &newCode,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return true, nil // Ya existe
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if !errors.Is(err, domain.ErrHorizontalPropertyCodeExists) {
		t.Errorf("Expected ErrHorizontalPropertyCodeExists, got %v", err)
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}

func TestUpdateHorizontalProperty_CustomDomainExists(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	existingProperty := &domain.HorizontalProperty{
		ID:           propertyID,
		CustomDomain: "old-domain.com",
	}

	newDomain := "existing-domain.com"
	dto := domain.UpdateHorizontalPropertyDTO{
		CustomDomain: &newDomain,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.ExistsCustomDomainFunc = func(ctx context.Context, customDomain string, excludeID *uint) (bool, error) {
		return true, nil // Ya existe
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if !errors.Is(err, domain.ErrCustomDomainExists) {
		t.Errorf("Expected ErrCustomDomainExists, got %v", err)
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}

func TestUpdateHorizontalProperty_Success_UpdateImages(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		BusinessTypeID: 1,
		LogoURL:        "old-logos/old-logo.jpg",
		NavbarImageURL: "old-navbar/old-navbar.jpg",
	}

	newLogoFile := &types.FileUpload{
		Filename:    "new-logo.jpg",
		Size:        1024,
		ContentType: "image/jpeg",
		Content:     io.NopCloser(bytes.NewReader([]byte("new logo"))),
	}

	dto := domain.UpdateHorizontalPropertyDTO{
		LogoFile: newLogoFile,
	}

	uploadedFiles := make(map[string]string)
	deletedFiles := []string{}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockS3.UploadImageFunc = func(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
		path := folder + "/" + file.Filename
		uploadedFiles[folder] = path
		return path, nil
	}

	mockS3.DeleteImageFunc = func(ctx context.Context, filename string) error {
		deletedFiles = append(deletedFiles, filename)
		return nil
	}

	mockRepo.UpdateHorizontalPropertyFunc = func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		return property, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verificar que se subió el nuevo archivo
	if _, ok := uploadedFiles["horizontal-property/logos"]; !ok {
		t.Error("Expected new logo to be uploaded")
	}

	// Verificar que se eliminó el archivo antiguo
	if len(deletedFiles) != 1 {
		t.Errorf("Expected 1 file deleted, got %d", len(deletedFiles))
	}

	if deletedFiles[0] != "old-logos/old-logo.jpg" {
		t.Errorf("Expected old logo to be deleted, got %s", deletedFiles[0])
	}

	if result.LogoURL == "" {
		t.Error("Expected new logo URL to be set")
	}
}

func TestUpdateHorizontalProperty_PropertyNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(999)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	newName := "New Name"
	dto := domain.UpdateHorizontalPropertyDTO{
		Name: &newName,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return nil, errors.New("not found")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

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

func TestUpdateHorizontalProperty_ParentBusinessNotFound(t *testing.T) {
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

	newParentID := uint(999)
	dto := domain.UpdateHorizontalPropertyDTO{
		ParentBusinessID: &newParentID,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.ParentBusinessExistsFunc = func(ctx context.Context, parentBusinessID uint) (bool, error) {
		return false, nil // No existe
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if !errors.Is(err, domain.ErrParentBusinessNotFound) {
		t.Errorf("Expected ErrParentBusinessNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}

func TestUpdateHorizontalProperty_S3DeleteError_NotCritical(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Torre Central",
		BusinessTypeID: 1,
		LogoURL:        "old-logo.jpg",
	}

	newLogoFile := &types.FileUpload{
		Filename:    "new-logo.jpg",
		Size:        1024,
		ContentType: "image/jpeg",
		Content:     io.NopCloser(bytes.NewReader([]byte("new logo"))),
	}

	dto := domain.UpdateHorizontalPropertyDTO{
		LogoFile: newLogoFile,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockS3.UploadImageFunc = func(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
		return "new-path/new-logo.jpg", nil
	}

	// Delete falla (pero no debe bloquear la actualización)
	mockS3.DeleteImageFunc = func(ctx context.Context, filename string) error {
		return errors.New("S3 delete failed")
	}

	mockRepo.UpdateHorizontalPropertyFunc = func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		return property, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	// No debe fallar aunque S3 delete falle
	if err != nil {
		t.Fatalf("Expected no error despite S3 delete failure, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}
}

func TestUpdateHorizontalProperty_UpdateAllFields(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyID := uint(1)

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	existingProperty := &domain.HorizontalProperty{
		ID:             propertyID,
		Name:           "Old Name",
		Code:           "old-code",
		BusinessTypeID: 1,
		Address:        "Old Address",
		TotalUnits:     50,
		HasElevator:    false,
		IsActive:       true,
	}

	newName := "New Name"
	newCode := "new-code"
	newAddress := "New Address"
	newTotalUnits := 100
	newHasElevator := true
	newIsActive := false

	dto := domain.UpdateHorizontalPropertyDTO{
		Name:        &newName,
		Code:        &newCode,
		Address:     &newAddress,
		TotalUnits:  &newTotalUnits,
		HasElevator: &newHasElevator,
		IsActive:    &newIsActive,
	}

	mockRepo.GetHorizontalPropertyByIDFunc = func(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
		return existingProperty, nil
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.UpdateHorizontalPropertyFunc = func(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		// Verificar que todos los campos se actualizaron
		if property.Name != newName {
			t.Errorf("Expected name '%s', got '%s'", newName, property.Name)
		}
		if property.Code != newCode {
			t.Errorf("Expected code '%s', got '%s'", newCode, property.Code)
		}
		if property.Address != newAddress {
			t.Errorf("Expected address '%s', got '%s'", newAddress, property.Address)
		}
		if property.TotalUnits != newTotalUnits {
			t.Errorf("Expected total units %d, got %d", newTotalUnits, property.TotalUnits)
		}
		if property.HasElevator != newHasElevator {
			t.Errorf("Expected has elevator %v, got %v", newHasElevator, property.HasElevator)
		}
		if property.IsActive != newIsActive {
			t.Errorf("Expected is active %v, got %v", newIsActive, property.IsActive)
		}
		return property, nil
	}

	mockRepo.GetBusinessTypeByIDFunc = func(ctx context.Context, id uint) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.UpdateHorizontalProperty(ctx, propertyID, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}
}
