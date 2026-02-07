package usecasehorizontalproperty_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"testing"

	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/app/usecasehorizontalproperty/test/mocks"
	"central_reserve/services/horizontalproperty/horizontalpropertiy/internal/domain"
	"central_reserve/shared/types"
)

func TestCreateHorizontalProperty_Success_MinimalData(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	dto := domain.CreateHorizontalPropertyDTO{
		Name:        "Torre Central",
		Code:        "TORRE-CENTRAL",
		Address:     "Calle 123",
		TotalUnits:  50,
		Timezone:    "America/Bogota",
		Description: "Propiedad de prueba",
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		// Verificar que el código se normalizó
		if code != "torre-central" {
			t.Errorf("Expected normalized code 'torre-central', got '%s'", code)
		}
		return false, nil
	}

	mockRepo.GetHorizontalPropertyTypeFunc = func(ctx context.Context) (*domain.BusinessType, error) {
		return &domain.BusinessType{
			ID:   1,
			Name: "Propiedad Horizontal",
			Code: "horizontal_property",
		}, nil
	}

	mockRepo.CreateHorizontalPropertyFunc = func(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		// Verificar que se aplicaron defaults
		if property.PrimaryColor != "#1f2937" {
			t.Errorf("Expected default primary color '#1f2937', got '%s'", property.PrimaryColor)
		}
		if !property.EnableReservations {
			t.Error("Expected EnableReservations to be true by default")
		}
		if property.EnableDelivery {
			t.Error("Expected EnableDelivery to be false by default")
		}

		property.ID = 1
		return property, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if result.ID != 1 {
		t.Errorf("Expected ID 1, got %d", result.ID)
	}

	if result.Name != "Torre Central" {
		t.Errorf("Expected name 'Torre Central', got '%s'", result.Name)
	}

	if result.Code != "torre-central" {
		t.Errorf("Expected code 'torre-central', got '%s'", result.Code)
	}
}

func TestCreateHorizontalProperty_Success_WithImages(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	logoFile := &types.FileUpload{
		Filename:    "logo.jpg",
		Size:        1024,
		ContentType: "image/jpeg",
		Content:     io.NopCloser(bytes.NewReader([]byte("logo content"))),
	}

	navbarFile := &types.FileUpload{
		Filename:    "navbar.jpg",
		Size:        2048,
		ContentType: "image/jpeg",
		Content:     io.NopCloser(bytes.NewReader([]byte("navbar content"))),
	}

	dto := domain.CreateHorizontalPropertyDTO{
		Name:            "Torre Central",
		Code:            "torre-central",
		Address:         "Calle 123",
		TotalUnits:      50,
		LogoFile:        logoFile,
		NavbarImageFile: navbarFile,
	}

	s3UploadedFiles := make(map[string]string)

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.GetHorizontalPropertyTypeFunc = func(ctx context.Context) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	mockS3.UploadImageFunc = func(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
		path := folder + "/" + file.Filename
		s3UploadedFiles[folder] = path
		return path, nil
	}

	mockRepo.CreateHorizontalPropertyFunc = func(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		property.ID = 1
		return property, nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verificar que se subieron ambas imágenes
	if len(s3UploadedFiles) != 2 {
		t.Errorf("Expected 2 files uploaded to S3, got %d", len(s3UploadedFiles))
	}

	if _, ok := s3UploadedFiles["horizontal-property/logos"]; !ok {
		t.Error("Expected logo to be uploaded to horizontal-property/logos")
	}

	if _, ok := s3UploadedFiles["horizontal-property/navbar"]; !ok {
		t.Error("Expected navbar to be uploaded to horizontal-property/navbar")
	}

	// Verificar que las URLs están en el resultado
	if result.LogoURL == "" {
		t.Error("Expected LogoURL to be set")
	}

	if result.NavbarImageURL == "" {
		t.Error("Expected NavbarImageURL to be set")
	}
}

func TestCreateHorizontalProperty_CodeExists(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	dto := domain.CreateHorizontalPropertyDTO{
		Name:       "Torre Central",
		Code:       "torre-central",
		Address:    "Calle 123",
		TotalUnits: 50,
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return true, nil // Ya existe
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

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

func TestCreateHorizontalProperty_CustomDomainExists(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	dto := domain.CreateHorizontalPropertyDTO{
		Name:         "Torre Central",
		Code:         "torre-central",
		Address:      "Calle 123",
		TotalUnits:   50,
		CustomDomain: "torre-central.com",
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.ExistsCustomDomainFunc = func(ctx context.Context, customDomain string, excludeID *uint) (bool, error) {
		return true, nil // Ya existe
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

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

func TestCreateHorizontalProperty_ParentBusinessNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	parentID := uint(999)
	dto := domain.CreateHorizontalPropertyDTO{
		Name:             "Torre Central",
		Code:             "torre-central",
		Address:          "Calle 123",
		TotalUnits:       50,
		ParentBusinessID: &parentID,
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.ParentBusinessExistsFunc = func(ctx context.Context, parentBusinessID uint) (bool, error) {
		return false, nil // No existe
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

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

func TestCreateHorizontalProperty_BusinessTypeNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	dto := domain.CreateHorizontalPropertyDTO{
		Name:       "Torre Central",
		Code:       "torre-central",
		Address:    "Calle 123",
		TotalUnits: 50,
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.GetHorizontalPropertyTypeFunc = func(ctx context.Context) (*domain.BusinessType, error) {
		return nil, errors.New("business type not found")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if !errors.Is(err, domain.ErrBusinessTypeNotFound) {
		t.Errorf("Expected ErrBusinessTypeNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}

func TestCreateHorizontalProperty_S3UploadError(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()

	logoFile := &types.FileUpload{
		Filename:    "logo.jpg",
		Size:        1024,
		ContentType: "image/jpeg",
		Content:     io.NopCloser(bytes.NewReader([]byte("logo content"))),
	}

	dto := domain.CreateHorizontalPropertyDTO{
		Name:       "Torre Central",
		Code:       "torre-central",
		Address:    "Calle 123",
		TotalUnits: 50,
		LogoFile:   logoFile,
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.GetHorizontalPropertyTypeFunc = func(ctx context.Context) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	mockS3.UploadImageFunc = func(ctx context.Context, file *types.FileUpload, folder string) (string, error) {
		return "", errors.New("S3 upload failed")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got %v", result)
	}
}

func TestCreateHorizontalProperty_WithSetupOptions(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	unitsCreated := false
	committeesCreated := false

	dto := domain.CreateHorizontalPropertyDTO{
		Name:       "Torre Central",
		Code:       "torre-central",
		Address:    "Calle 123",
		TotalUnits: 10,
		SetupOptions: &domain.HorizontalPropertySetupOptions{
			CreateUnits:              true,
			UnitType:                 "apartment",
			StartUnitNumber:          101,
			CreateRequiredCommittees: true,
		},
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.GetHorizontalPropertyTypeFunc = func(ctx context.Context) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	mockRepo.CreateHorizontalPropertyFunc = func(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		property.ID = 1
		return property, nil
	}

	mockRepo.CreatePropertyUnitsFunc = func(ctx context.Context, businessID uint, units []domain.PropertyUnitCreate) error {
		unitsCreated = true
		// Verificar que se crearon las unidades correctas
		if len(units) != 10 {
			t.Errorf("Expected 10 units, got %d", len(units))
		}
		if units[0].Number != "101" {
			t.Errorf("Expected first unit number '101', got '%s'", units[0].Number)
		}
		if units[0].UnitType != "apartment" {
			t.Errorf("Expected unit type 'apartment', got '%s'", units[0].UnitType)
		}
		return nil
	}

	mockRepo.CreateRequiredCommitteesFunc = func(ctx context.Context, businessID uint) error {
		committeesCreated = true
		return nil
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if !unitsCreated {
		t.Error("Expected units to be created")
	}

	if !committeesCreated {
		t.Error("Expected committees to be created")
	}
}

func TestCreateHorizontalProperty_SetupError_DoesNotBlockCreation(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := mocks.NewMockHPRepository()
	mockLogger := mocks.NewMockLogger()
	mockS3 := mocks.NewMockFileStorage()
	mockEnv := mocks.NewMockEnvConfig()
	mockEnv.Values["URL_BASE_DOMAIN_S3"] = "https://s3.example.com"

	dto := domain.CreateHorizontalPropertyDTO{
		Name:       "Torre Central",
		Code:       "torre-central",
		Address:    "Calle 123",
		TotalUnits: 10,
		SetupOptions: &domain.HorizontalPropertySetupOptions{
			CreateUnits:              true,
			CreateRequiredCommittees: true,
		},
	}

	mockRepo.ExistsHorizontalPropertyByCodeFunc = func(ctx context.Context, code string, excludeID *uint) (bool, error) {
		return false, nil
	}

	mockRepo.GetHorizontalPropertyTypeFunc = func(ctx context.Context) (*domain.BusinessType, error) {
		return &domain.BusinessType{ID: 1, Name: "Propiedad Horizontal"}, nil
	}

	mockRepo.CreateHorizontalPropertyFunc = func(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
		property.ID = 1
		return property, nil
	}

	// Setup falla, pero no debe bloquear la creación
	mockRepo.CreatePropertyUnitsFunc = func(ctx context.Context, businessID uint, units []domain.PropertyUnitCreate) error {
		return errors.New("units creation failed")
	}

	mockRepo.CreateRequiredCommitteesFunc = func(ctx context.Context, businessID uint) error {
		return errors.New("committees creation failed")
	}

	useCase := usecasehorizontalproperty.NewHorizontalPropertyUseCase(mockRepo, mockLogger, mockS3, mockEnv)

	// Act
	result, err := useCase.CreateHorizontalProperty(ctx, dto)

	// Assert
	// La creación debe ser exitosa a pesar de errores en setup
	if err != nil {
		t.Fatalf("Expected no error despite setup failures, got %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if result.ID != 1 {
		t.Errorf("Expected ID 1, got %d", result.ID)
	}
}
