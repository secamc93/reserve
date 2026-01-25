package app

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/mocks"
)

// TestCreateVisit_Success prueba el caso feliz donde se crea una visita exitosamente
func TestCreateVisit_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	now := time.Now()

	dto := domain.CreateVisitDTO{
		BusinessID:         1,
		VisitorID:          100,
		PropertyUnitID:     200,
		ResidentID:         nil,
		VisitTypeID:        1,
		ScheduledDate:      now,
		ScheduledStartTime: now,
		NumberOfVisitors:   1,
		Purpose:            "Visita social",
	}

	expectedStatus := &domain.VisitStatus{
		ID:          1,
		Code:        "pending",
		Name:        "Pendiente",
		Description: "Visita pendiente de autorización",
		IsFinal:     false,
		IsActive:    true,
	}

	expectedVisit := &domain.Visit{
		ID:                 1,
		BusinessID:         1,
		VisitorID:          100,
		PropertyUnitID:     200,
		VisitTypeID:        1,
		VisitStatusID:      1,
		ScheduledDate:      now,
		ScheduledStartTime: now,
		Purpose:            "Visita social",
		NumberOfVisitors:   1,
	}

	// Configurar mocks
	visitRepo := &mocks.MockVisitRepository{
		GetVisitStatusByCodeFunc: func(ctx context.Context, code string) (*domain.VisitStatus, error) {
			if code != "pending" {
				t.Errorf("Expected code 'pending', got '%s'", code)
			}
			return expectedStatus, nil
		},
		CreateVisitFunc: func(ctx context.Context, visit *domain.Visit) (*domain.Visit, error) {
			// Validar que se pasaron los datos correctos
			if visit.BusinessID != 1 {
				t.Errorf("Expected BusinessID 1, got %d", visit.BusinessID)
			}
			if visit.VisitorID != 100 {
				t.Errorf("Expected VisitorID 100, got %d", visit.VisitorID)
			}
			if visit.PropertyUnitID != 200 {
				t.Errorf("Expected PropertyUnitID 200, got %d", visit.PropertyUnitID)
			}
			if visit.VisitStatusID != 1 {
				t.Errorf("Expected VisitStatusID 1, got %d", visit.VisitStatusID)
			}
			if visit.AuthorizationCode == "" {
				t.Error("Expected AuthorizationCode to be generated")
			}
			if visit.QRCode == "" {
				t.Error("Expected QRCode to be generated")
			}
			if visit.QRCodeExpiresAt == nil {
				t.Error("Expected QRCodeExpiresAt to be set")
			}
			return expectedVisit, nil
		},
	}

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			return false, nil
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		visitRepo:     visitRepo,
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
	if result == nil {
		t.Fatal("Expected result to be non-nil")
	}
	if result.ID != expectedVisit.ID {
		t.Errorf("Expected ID %d, got %d", expectedVisit.ID, result.ID)
	}
}

// TestCreateVisit_MissingVisitorID prueba que falle cuando falta visitor_id
func TestCreateVisit_MissingVisitorID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     1,
		VisitorID:      0, // Falta visitor_id
		PropertyUnitID: 200,
		VisitTypeID:    1,
	}

	logger := mocks.NewMockLogger()
	uc := &visitUseCase{logger: logger}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error for missing visitor_id, got nil")
	}
	if err.Error() != "visitor_id es requerido" {
		t.Errorf("Expected error 'visitor_id es requerido', got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_MissingPropertyUnitID prueba que falle cuando falta property_unit_id
func TestCreateVisit_MissingPropertyUnitID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     1,
		VisitorID:      100,
		PropertyUnitID: 0, // Falta property_unit_id
		VisitTypeID:    1,
	}

	logger := mocks.NewMockLogger()
	uc := &visitUseCase{logger: logger}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error for missing property_unit_id, got nil")
	}
	if err.Error() != "property_unit_id es requerido" {
		t.Errorf("Expected error 'property_unit_id es requerido', got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_MissingVisitTypeID prueba que falle cuando falta visit_type_id
func TestCreateVisit_MissingVisitTypeID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     1,
		VisitorID:      100,
		PropertyUnitID: 200,
		VisitTypeID:    0, // Falta visit_type_id
	}

	logger := mocks.NewMockLogger()
	uc := &visitUseCase{logger: logger}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error for missing visit_type_id, got nil")
	}
	if err.Error() != "visit_type_id es requerido" {
		t.Errorf("Expected error 'visit_type_id es requerido', got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_BusinessIDZero_GetFromPropertyUnit prueba que obtenga business_id desde property_unit cuando es 0
func TestCreateVisit_BusinessIDZero_GetFromPropertyUnit(t *testing.T) {
	// Arrange
	ctx := context.Background()
	now := time.Now()

	dto := domain.CreateVisitDTO{
		BusinessID:         0, // Super admin, business_id = 0
		VisitorID:          100,
		PropertyUnitID:     200,
		VisitTypeID:        1,
		ScheduledDate:      now,
		ScheduledStartTime: now,
	}

	expectedBusinessID := uint(5)
	expectedStatus := &domain.VisitStatus{
		ID:   1,
		Code: "pending",
	}

	// Configurar mocks
	visitRepo := &mocks.MockVisitRepository{
		GetPropertyUnitBusinessIDFunc: func(ctx context.Context, propertyUnitID uint) (uint, error) {
			if propertyUnitID != 200 {
				t.Errorf("Expected propertyUnitID 200, got %d", propertyUnitID)
			}
			return expectedBusinessID, nil
		},
		GetVisitStatusByCodeFunc: func(ctx context.Context, code string) (*domain.VisitStatus, error) {
			return expectedStatus, nil
		},
		CreateVisitFunc: func(ctx context.Context, visit *domain.Visit) (*domain.Visit, error) {
			if visit.BusinessID != expectedBusinessID {
				t.Errorf("Expected BusinessID %d, got %d", expectedBusinessID, visit.BusinessID)
			}
			return &domain.Visit{ID: 1, BusinessID: expectedBusinessID}, nil
		},
	}

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			if businessID != expectedBusinessID {
				t.Errorf("Expected blacklist check with businessID %d, got %d", expectedBusinessID, businessID)
			}
			return false, nil
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		visitRepo:     visitRepo,
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
	if result.BusinessID != expectedBusinessID {
		t.Errorf("Expected BusinessID %d, got %d", expectedBusinessID, result.BusinessID)
	}
}

// TestCreateVisit_ErrorGettingBusinessID prueba el manejo de error al obtener business_id
func TestCreateVisit_ErrorGettingBusinessID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     0, // Super admin
		VisitorID:      100,
		PropertyUnitID: 200,
		VisitTypeID:    1,
	}

	expectedError := errors.New("database connection error")

	visitRepo := &mocks.MockVisitRepository{
		GetPropertyUnitBusinessIDFunc: func(ctx context.Context, propertyUnitID uint) (uint, error) {
			return 0, expectedError
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		visitRepo: visitRepo,
		logger:    logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
	if !errors.Is(err, expectedError) {
		t.Errorf("Expected error to wrap database error, got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_VisitorBlacklisted prueba que rechace visitantes en blacklist
func TestCreateVisit_VisitorBlacklisted(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     1,
		VisitorID:      100,
		PropertyUnitID: 200,
		VisitTypeID:    1,
	}

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			// IsVisitorBlacklisted retorna true cuando el visitante está en blacklist
			// Esto hará que ValidateBlacklist retorne (true, ErrVisitorBlacklisted)
			return true, nil
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error for blacklisted visitor, got nil")
	}
	if !errors.Is(err, domain.ErrVisitorBlacklisted) {
		t.Errorf("Expected ErrVisitorBlacklisted, got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_BlacklistCheckError prueba el manejo de error en validación de blacklist
func TestCreateVisit_BlacklistCheckError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     1,
		VisitorID:      100,
		PropertyUnitID: 200,
		VisitTypeID:    1,
	}

	expectedError := errors.New("database error checking blacklist")

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			return false, expectedError
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
	if !errors.Is(err, expectedError) {
		t.Errorf("Expected error to be propagated, got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_ErrorGettingPendingStatus prueba el manejo de error al obtener estado pending
func TestCreateVisit_ErrorGettingPendingStatus(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateVisitDTO{
		BusinessID:     1,
		VisitorID:      100,
		PropertyUnitID: 200,
		VisitTypeID:    1,
	}

	expectedError := errors.New("status not found")

	visitRepo := &mocks.MockVisitRepository{
		GetVisitStatusByCodeFunc: func(ctx context.Context, code string) (*domain.VisitStatus, error) {
			return nil, expectedError
		},
	}

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			return false, nil
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		visitRepo:     visitRepo,
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
	if !errors.Is(err, expectedError) {
		t.Errorf("Expected error to wrap status error, got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_ErrorCreatingVisit prueba el manejo de error al crear visita en repositorio
func TestCreateVisit_ErrorCreatingVisit(t *testing.T) {
	// Arrange
	ctx := context.Background()
	now := time.Now()

	dto := domain.CreateVisitDTO{
		BusinessID:         1,
		VisitorID:          100,
		PropertyUnitID:     200,
		VisitTypeID:        1,
		ScheduledDate:      now,
		ScheduledStartTime: now,
	}

	expectedError := errors.New("database insert error")
	expectedStatus := &domain.VisitStatus{
		ID:   1,
		Code: "pending",
	}

	visitRepo := &mocks.MockVisitRepository{
		GetVisitStatusByCodeFunc: func(ctx context.Context, code string) (*domain.VisitStatus, error) {
			return expectedStatus, nil
		},
		CreateVisitFunc: func(ctx context.Context, visit *domain.Visit) (*domain.Visit, error) {
			return nil, expectedError
		},
	}

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			return false, nil
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		visitRepo:     visitRepo,
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	result, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
	if !errors.Is(err, expectedError) {
		t.Errorf("Expected error to wrap database error, got: %v", err)
	}
	if result != nil {
		t.Error("Expected result to be nil")
	}
}

// TestCreateVisit_QRCodeGeneration prueba que se genere QR code con expiración de 24 horas
func TestCreateVisit_QRCodeGeneration(t *testing.T) {
	// Arrange
	ctx := context.Background()
	now := time.Now()

	dto := domain.CreateVisitDTO{
		BusinessID:         1,
		VisitorID:          100,
		PropertyUnitID:     200,
		VisitTypeID:        1,
		ScheduledDate:      now,
		ScheduledStartTime: now,
	}

	expectedStatus := &domain.VisitStatus{
		ID:   1,
		Code: "pending",
	}

	var capturedVisit *domain.Visit

	visitRepo := &mocks.MockVisitRepository{
		GetVisitStatusByCodeFunc: func(ctx context.Context, code string) (*domain.VisitStatus, error) {
			return expectedStatus, nil
		},
		CreateVisitFunc: func(ctx context.Context, visit *domain.Visit) (*domain.Visit, error) {
			capturedVisit = visit
			return &domain.Visit{ID: 1}, nil
		},
	}

	blacklistRepo := &mocks.MockVisitBlacklistRepository{
		IsVisitorBlacklistedFunc: func(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
			return false, nil
		},
	}

	logger := mocks.NewMockLogger()

	uc := &visitUseCase{
		visitRepo:     visitRepo,
		blacklistRepo: blacklistRepo,
		logger:        logger,
	}

	// Act
	_, err := uc.CreateVisit(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if capturedVisit == nil {
		t.Fatal("Expected visit to be captured")
	}

	// Verificar que se generó código de autorización
	if capturedVisit.AuthorizationCode == "" {
		t.Error("Expected AuthorizationCode to be generated")
	}

	// Verificar que se generó QR code
	if capturedVisit.QRCode == "" {
		t.Error("Expected QRCode to be generated")
	}

	// Verificar que QRCodeExpiresAt está configurado
	if capturedVisit.QRCodeExpiresAt == nil {
		t.Fatal("Expected QRCodeExpiresAt to be set")
	}

	// Verificar que la expiración es aproximadamente en 24 horas
	expectedExpiry := time.Now().Add(24 * time.Hour)
	timeDiff := capturedVisit.QRCodeExpiresAt.Sub(expectedExpiry).Abs()
	if timeDiff > time.Minute {
		t.Errorf("Expected QRCodeExpiresAt to be ~24 hours from now, diff: %v", timeDiff)
	}
}
