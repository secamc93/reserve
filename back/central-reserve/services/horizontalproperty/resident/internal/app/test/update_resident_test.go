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

func TestUpdateResident_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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
	}

	newName := "Juan Carlos Pérez"
	newPhone := "0987654321"

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return existingResident, nil
			}
			return nil, nil
		},
		UpdateResidentFunc: func(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
			resident.ID = id
			resident.UpdatedAt = time.Now()
			return resident, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdateResidentDTO{
		Name:  &newName,
		Phone: &newPhone,
	}

	// Modificar el mock para retornar los datos actualizados en la segunda llamada
	callCount := 0
	mockRepo.GetResidentByIDFunc = func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
		callCount++
		if id == 1 {
			if callCount > 1 {
				// Segunda llamada: retornar datos actualizados
				updatedResident := *existingResident
				updatedResident.Name = newName
				updatedResident.Phone = newPhone
				return &updatedResident, nil
			}
			return existingResident, nil
		}
		return nil, nil
	}

	// Act
	result, err := useCase.UpdateResident(ctx, 1, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Name != newName {
		t.Errorf("expected name %s, got %s", newName, result.Name)
	}

	if result.Phone != newPhone {
		t.Errorf("expected phone %s, got %s", newPhone, result.Phone)
	}
}

func TestUpdateResident_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			return nil, nil // Residente no encontrado
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	newName := "Juan Carlos Pérez"
	dto := domain.UpdateResidentDTO{
		Name: &newName,
	}

	// Act
	result, err := useCase.UpdateResident(ctx, 999, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrResidentNotFound) {
		t.Errorf("expected error %v, got %v", domain.ErrResidentNotFound, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestUpdateResident_EmailConflict(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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
	}

	newEmail := "existing@test.com"

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return existingResident, nil
			}
			return nil, nil
		},
		ExistsResidentByEmailFunc: func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
			if email == newEmail {
				return true, nil // Email ya existe
			}
			return false, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdateResidentDTO{
		Email: &newEmail,
	}

	// Act
	result, err := useCase.UpdateResident(ctx, 1, dto)

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

func TestUpdateResident_DniConflict(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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
	}

	newDni := "87654321"

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return existingResident, nil
			}
			return nil, nil
		},
		ExistsResidentByEmailFunc: func(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
			return false, nil
		},
		ExistsResidentByDniFunc: func(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
			if dni == newDni {
				return true, nil // DNI ya existe
			}
			return false, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdateResidentDTO{
		Dni: &newDni,
	}

	// Act
	result, err := useCase.UpdateResident(ctx, 1, dto)

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

func TestUpdateResident_SameEmail(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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
	}

	sameEmail := "juan@test.com"
	newName := "Juan Carlos Pérez"

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return existingResident, nil
			}
			return nil, nil
		},
		UpdateResidentFunc: func(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
			resident.ID = id
			resident.UpdatedAt = time.Now()
			return resident, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdateResidentDTO{
		Name:  &newName,
		Email: &sameEmail, // Mismo email, no debe verificar conflicto
	}

	// Modificar el mock para retornar los datos actualizados en la segunda llamada
	callCount := 0
	mockRepo.GetResidentByIDFunc = func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
		callCount++
		if id == 1 {
			if callCount > 1 {
				// Segunda llamada: retornar datos actualizados
				updatedResident := *existingResident
				updatedResident.Name = newName
				return &updatedResident, nil
			}
			return existingResident, nil
		}
		return nil, nil
	}

	// Act
	result, err := useCase.UpdateResident(ctx, 1, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Name != newName {
		t.Errorf("expected name %s, got %s", newName, result.Name)
	}
}

func TestUpdateResident_PartialUpdate(t *testing.T) {
	// Arrange
	ctx := context.Background()
	existingResident := &domain.ResidentDetailDTO{
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
	}

	isActive := false

	mockRepo := &mocks.MockResidentRepository{
		GetResidentByIDFunc: func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
			if id == 1 {
				return existingResident, nil
			}
			return nil, nil
		},
		UpdateResidentFunc: func(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
			resident.ID = id
			resident.UpdatedAt = time.Now()
			return resident, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdateResidentDTO{
		IsActive: &isActive, // Solo actualizar estado activo
	}

	// Modificar el mock para retornar los datos actualizados en la segunda llamada
	callCount := 0
	mockRepo.GetResidentByIDFunc = func(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
		callCount++
		if id == 1 {
			if callCount > 1 {
				// Segunda llamada: retornar datos actualizados
				updatedResident := *existingResident
				updatedResident.IsActive = isActive
				return &updatedResident, nil
			}
			return existingResident, nil
		}
		return nil, nil
	}

	// Act
	result, err := useCase.UpdateResident(ctx, 1, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.IsActive != isActive {
		t.Errorf("expected IsActive %v, got %v", isActive, result.IsActive)
	}

	// Verificar que otros campos no cambiaron
	if result.Name != existingResident.Name {
		t.Errorf("expected name unchanged %s, got %s", existingResident.Name, result.Name)
	}

	if result.Email != existingResident.Email {
		t.Errorf("expected email unchanged %s, got %s", existingResident.Email, result.Email)
	}
}
