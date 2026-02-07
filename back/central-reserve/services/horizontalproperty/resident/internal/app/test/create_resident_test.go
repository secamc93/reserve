package app_test

import (
	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"context"
	"errors"
	"testing"
	"time"
)

func TestCreateResident_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{
		ExistsResidentByEmailFunc: func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
			return false, nil
		},
		ExistsResidentByDniFunc: func(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
			return false, nil
		},
		CreateResidentFunc: func(ctx context.Context, resident *domain.Resident) (*domain.Resident, error) {
			resident.ID = 1
			resident.CreatedAt = time.Now()
			resident.UpdatedAt = time.Now()
			return resident, nil
		},
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			return &domain.ResidentDetailDTO{
				ID:                 1,
				BusinessID:         100,
				PropertyUnitID:     200,
				PropertyUnitNumber: "101",
				ResidentTypeID:     1,
				ResidentTypeName:   "Propietario",
				ResidentTypeCode:   "owner",
				Name:               "Juan Pérez",
				Email:              "juan@test.com",
				Phone:              "1234567890",
				Dni:                "12345678",
				EmergencyContact:   "Ana Pérez",
				IsMainResident:     true,
				IsActive:           true,
				CreatedAt:          time.Now(),
				UpdatedAt:          time.Now(),
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:       100,
		PropertyUnitID:   200,
		ResidentTypeID:   1,
		Name:             "Juan Pérez",
		Email:            "juan@test.com",
		Phone:            "1234567890",
		Dni:              "12345678",
		EmergencyContact: "Ana Pérez",
		IsMainResident:   true,
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Name != dto.Name {
		t.Errorf("expected name %s, got %s", dto.Name, result.Name)
	}

	if result.Email != dto.Email {
		t.Errorf("expected email %s, got %s", dto.Email, result.Email)
	}

	if result.Dni != dto.Dni {
		t.Errorf("expected dni %s, got %s", dto.Dni, result.Dni)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestCreateResident_EmptyName(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{}
	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:     100,
		PropertyUnitID: 200,
		ResidentTypeID: 1,
		Name:           "", // Empty name
		Email:          "juan@test.com",
		Dni:            "12345678",
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentNameRequired) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentNameRequired, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateResident_EmptyEmail(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{}
	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:     100,
		PropertyUnitID: 200,
		ResidentTypeID: 1,
		Name:           "Juan Pérez",
		Email:          "", // Empty email
		Dni:            "12345678",
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentEmailRequired) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentEmailRequired, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateResident_EmptyDni(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{}
	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:     100,
		PropertyUnitID: 200,
		ResidentTypeID: 1,
		Name:           "Juan Pérez",
		Email:          "juan@test.com",
		Dni:            "",    // Empty DNI
		AllowEmptyDni:  false, // Not allowed
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentDniRequired) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentDniRequired, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateResident_EmptyDni_AllowEmpty(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{
		ExistsResidentByEmailFunc: func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
			return false, nil
		},
		CreateResidentFunc: func(ctx context.Context, resident *domain.Resident) (*domain.Resident, error) {
			resident.ID = 1
			resident.CreatedAt = time.Now()
			resident.UpdatedAt = time.Now()
			return resident, nil
		},
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			return &domain.ResidentDetailDTO{
				ID:                 1,
				BusinessID:         100,
				PropertyUnitID:     200,
				PropertyUnitNumber: "101",
				ResidentTypeID:     1,
				ResidentTypeName:   "Propietario",
				ResidentTypeCode:   "owner",
				Name:               "Juan Pérez",
				Email:              "juan@test.com",
				Phone:              "1234567890",
				Dni:                "", // Empty DNI allowed
				EmergencyContact:   "Ana Pérez",
				IsMainResident:     true,
				IsActive:           true,
				CreatedAt:          time.Now(),
				UpdatedAt:          time.Now(),
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:     100,
		PropertyUnitID: 200,
		ResidentTypeID: 1,
		Name:           "Juan Pérez",
		Email:          "juan@test.com",
		Dni:            "",   // Empty DNI
		AllowEmptyDni:  true, // Allowed
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Dni != "" {
		t.Errorf("expected empty dni, got %s", result.Dni)
	}
}

func TestCreateResident_EmailExists(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{
		ExistsResidentByEmailFunc: func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
			return true, nil // Email already exists
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:     100,
		PropertyUnitID: 200,
		ResidentTypeID: 1,
		Name:           "Juan Pérez",
		Email:          "existing@test.com",
		Dni:            "12345678",
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentEmailExists) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentEmailExists, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateResident_DniExists(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{
		ExistsResidentByEmailFunc: func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
			return false, nil
		},
		ExistsResidentByDniFunc: func(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
			return true, nil // DNI already exists
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.CreateResidentDTO{
		BusinessID:     100,
		PropertyUnitID: 200,
		ResidentTypeID: 1,
		Name:           "Juan Pérez",
		Email:          "juan@test.com",
		Dni:            "12345678",
	}

	// Act
	result, err := useCase.CreateResident(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentDniExists) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentDniExists, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}
