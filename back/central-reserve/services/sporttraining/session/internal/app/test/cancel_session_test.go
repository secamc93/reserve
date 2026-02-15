package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/session/internal/app"
	"central_reserve/services/sporttraining/session/internal/app/test/mocks"
	"central_reserve/services/sporttraining/session/internal/domain"
)

func TestCancelSession_Success(t *testing.T) {
	// Arrange
	expectedSession := &domain.TrainingSession{
		ID:                 1,
		BusinessID:         1,
		SessionMode:        "individual",
		Status:             "cancelled",
		CancellationReason: "Lluvia intensa",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	mockSessionRepo := &mocks.MockSessionRepository{
		CancelFunc: func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
			return expectedSession, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CancelSessionDTO{
		ID:         1,
		BusinessID: 1,
		Reason:     "Lluvia intensa",
	}

	// Act
	result, err := uc.CancelSession(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.Status != "cancelled" {
		t.Errorf("expected status 'cancelled', got '%s'", result.Status)
	}

	if result.CancellationReason != "Lluvia intensa" {
		t.Errorf("expected cancellation reason 'Lluvia intensa', got '%s'", result.CancellationReason)
	}
}

func TestCancelSession_WithDifferentReasons(t *testing.T) {
	// Arrange
	tests := []struct {
		name   string
		reason string
	}{
		{"Weather issue", "Condiciones climáticas adversas"},
		{"Coach unavailable", "Entrenador no disponible"},
		{"Facility issue", "Problema con las instalaciones"},
		{"Emergency", "Emergencia"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			expectedSession := &domain.TrainingSession{
				ID:                 1,
				BusinessID:         1,
				Status:             "cancelled",
				CancellationReason: tt.reason,
			}

			mockSessionRepo := &mocks.MockSessionRepository{
				CancelFunc: func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
					if dto.Reason != tt.reason {
						t.Errorf("expected reason '%s', got '%s'", tt.reason, dto.Reason)
					}
					return expectedSession, nil
				},
			}
			mockLogger := mocks.NewMockLogger()

			uc := app.New(mockSessionRepo, mockLogger)

			dto := domain.CancelSessionDTO{
				ID:         1,
				BusinessID: 1,
				Reason:     tt.reason,
			}

			// Act
			result, err := uc.CancelSession(context.Background(), dto)

			// Assert
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if result.CancellationReason != tt.reason {
				t.Errorf("expected cancellation reason '%s', got '%s'", tt.reason, result.CancellationReason)
			}
		})
	}
}

func TestCancelSession_NotFound(t *testing.T) {
	// Arrange
	expectedErr := domain.ErrSessionNotFound

	mockSessionRepo := &mocks.MockSessionRepository{
		CancelFunc: func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CancelSessionDTO{
		ID:         999,
		BusinessID: 1,
		Reason:     "Test reason",
	}

	// Act
	result, err := uc.CancelSession(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for not found, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestCancelSession_AlreadyCancelled(t *testing.T) {
	// Arrange
	expectedErr := domain.ErrSessionAlreadyCancelled

	mockSessionRepo := &mocks.MockSessionRepository{
		CancelFunc: func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CancelSessionDTO{
		ID:         1,
		BusinessID: 1,
		Reason:     "Second cancellation attempt",
	}

	// Act
	result, err := uc.CancelSession(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for already cancelled, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestCancelSession_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database update error")

	mockSessionRepo := &mocks.MockSessionRepository{
		CancelFunc: func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CancelSessionDTO{
		ID:         1,
		BusinessID: 1,
		Reason:     "Test reason",
	}

	// Act
	result, err := uc.CancelSession(context.Background(), dto)

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

func TestCancelSession_EmptyReason(t *testing.T) {
	// Arrange
	expectedSession := &domain.TrainingSession{
		ID:                 1,
		BusinessID:         1,
		Status:             "cancelled",
		CancellationReason: "",
	}

	mockSessionRepo := &mocks.MockSessionRepository{
		CancelFunc: func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
			return expectedSession, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CancelSessionDTO{
		ID:         1,
		BusinessID: 1,
		Reason:     "", // Empty reason
	}

	// Act
	result, err := uc.CancelSession(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Status != "cancelled" {
		t.Errorf("expected status 'cancelled', got '%s'", result.Status)
	}
}
