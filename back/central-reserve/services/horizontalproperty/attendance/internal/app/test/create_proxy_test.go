package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/attendance/internal/app"
	"central_reserve/services/horizontalproperty/attendance/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
)

func TestCreateProxy_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	startDate := time.Now()
	endDate := time.Now().AddDate(1, 0, 0) // 1 año después

	dto := domain.CreateProxyDTO{
		BusinessID:      1,
		PropertyUnitID:  200,
		ProxyName:       "Juan Pérez",
		ProxyDni:        "12345678",
		ProxyEmail:      "juan.perez@email.com",
		ProxyPhone:      "+57 300 1234567",
		ProxyAddress:    "Calle 123 # 45-67",
		ProxyType:       "external",
		StartDate:       &startDate,
		EndDate:         &endDate,
		PowerOfAttorney: "POA-2026-001",
		Notes:           "Apoderado autorizado por el propietario",
	}

	expectedProxy := &domain.Proxy{
		ID:              1,
		BusinessID:      dto.BusinessID,
		PropertyUnitID:  dto.PropertyUnitID,
		ProxyName:       dto.ProxyName,
		ProxyDni:        dto.ProxyDni,
		ProxyEmail:      dto.ProxyEmail,
		ProxyPhone:      dto.ProxyPhone,
		ProxyAddress:    dto.ProxyAddress,
		ProxyType:       dto.ProxyType,
		IsActive:        true,
		StartDate:       *dto.StartDate,
		EndDate:         dto.EndDate,
		PowerOfAttorney: dto.PowerOfAttorney,
		Notes:           dto.Notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	mockRepo.CreateProxyFn = func(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error) {
		return expectedProxy, nil
	}

	mockRepo.UpdateAttendanceRecordsByPropertyUnitFn = func(ctx context.Context, propertyUnitID uint, proxyID *uint) error {
		return nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.CreateProxy(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedProxy.ID {
		t.Errorf("expected ID %d, got %d", expectedProxy.ID, result.ID)
	}

	if result.PropertyUnitID != dto.PropertyUnitID {
		t.Errorf("expected PropertyUnitID %d, got %d", dto.PropertyUnitID, result.PropertyUnitID)
	}

	if result.ProxyName != dto.ProxyName {
		t.Errorf("expected ProxyName %s, got %s", dto.ProxyName, result.ProxyName)
	}

	if result.ProxyDni != dto.ProxyDni {
		t.Errorf("expected ProxyDni %s, got %s", dto.ProxyDni, result.ProxyDni)
	}

	if result.ProxyType != dto.ProxyType {
		t.Errorf("expected ProxyType %s, got %s", dto.ProxyType, result.ProxyType)
	}

	if result.IsActive != true {
		t.Errorf("expected IsActive to be true, got %v", result.IsActive)
	}
}

func TestCreateProxy_DefaultValues(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	// DTO sin ProxyType ni StartDate
	dto := domain.CreateProxyDTO{
		BusinessID:     1,
		PropertyUnitID: 200,
		ProxyName:      "Juan Pérez",
		ProxyDni:       "",        // Vacío, debe generar uno automático
		ProxyType:      "",        // Vacío, debe usar "external" por defecto
		StartDate:      nil,       // Nil, debe usar tiempo actual
		EndDate:        nil,
	}

	mockRepo.CreateProxyFn = func(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error) {
		// Verificar que se aplicaron valores por defecto
		if proxy.ProxyType != "external" {
			t.Errorf("expected default ProxyType 'external', got %s", proxy.ProxyType)
		}

		if proxy.ProxyDni == "" {
			t.Error("expected generated ProxyDni, got empty string")
		}

		expectedProxy := &domain.Proxy{
			ID:              1,
			BusinessID:      proxy.BusinessID,
			PropertyUnitID:  proxy.PropertyUnitID,
			ProxyName:       proxy.ProxyName,
			ProxyDni:        proxy.ProxyDni,
			ProxyType:       proxy.ProxyType,
			IsActive:        true,
			StartDate:       proxy.StartDate,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}
		return expectedProxy, nil
	}

	mockRepo.UpdateAttendanceRecordsByPropertyUnitFn = func(ctx context.Context, propertyUnitID uint, proxyID *uint) error {
		return nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.CreateProxy(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ProxyType != "external" {
		t.Errorf("expected default ProxyType 'external', got %s", result.ProxyType)
	}

	if result.ProxyDni == "" {
		t.Error("expected generated ProxyDni, got empty string")
	}

	// Verificar que StartDate no es cero
	if result.StartDate.IsZero() {
		t.Error("expected StartDate to be set, got zero value")
	}
}

func TestCreateProxy_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreateProxyDTO{
		BusinessID:     1,
		PropertyUnitID: 200,
		ProxyName:      "Juan Pérez",
		ProxyDni:       "12345678",
	}

	expectedError := errors.New("database connection failed")

	mockRepo.CreateProxyFn = func(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.CreateProxy(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error %v, got %v", expectedError, err)
	}
}

func TestCreateProxy_UpdateRecordsError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreateProxyDTO{
		BusinessID:     1,
		PropertyUnitID: 200,
		ProxyName:      "Juan Pérez",
		ProxyDni:       "12345678",
		ProxyType:      "external",
	}

	expectedProxy := &domain.Proxy{
		ID:             1,
		BusinessID:     dto.BusinessID,
		PropertyUnitID: dto.PropertyUnitID,
		ProxyName:      dto.ProxyName,
		ProxyDni:       dto.ProxyDni,
		ProxyType:      dto.ProxyType,
		IsActive:       true,
		StartDate:      time.Now(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	mockRepo.CreateProxyFn = func(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error) {
		return expectedProxy, nil
	}

	// UpdateAttendanceRecordsByPropertyUnit falla, pero NO debe afectar la creación del proxy
	mockRepo.UpdateAttendanceRecordsByPropertyUnitFn = func(ctx context.Context, propertyUnitID uint, proxyID *uint) error {
		return errors.New("failed to update attendance records")
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.CreateProxy(ctx, dto)

	// Assert
	// Según el código, NO debe retornar error aunque falle la actualización de registros
	if err != nil {
		t.Fatalf("expected no error (update records error should not propagate), got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedProxy.ID {
		t.Errorf("expected ID %d, got %d", expectedProxy.ID, result.ID)
	}
}
