package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/guardian/internal/app"
	"central_reserve/services/sporttraining/guardian/internal/app/test/mocks"
	"central_reserve/services/sporttraining/guardian/internal/domain"
)

func TestAssignGuardianToPlayer_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		AssignToPlayerFunc: func(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error {
			// Verificar que se reciban los datos correctos
			if assignment.PlayerID != 1 {
				t.Errorf("expected PlayerID 1, got %d", assignment.PlayerID)
			}
			if assignment.GuardianID != 2 {
				t.Errorf("expected GuardianID 2, got %d", assignment.GuardianID)
			}
			if assignment.RelationshipType != "Padre" {
				t.Errorf("expected RelationshipType 'Padre', got '%s'", assignment.RelationshipType)
			}
			if !assignment.IsPrimaryGuardian {
				t.Error("expected IsPrimaryGuardian to be true")
			}
			if !assignment.CanPickup {
				t.Error("expected CanPickup to be true")
			}
			if !assignment.CanBookSessions {
				t.Error("expected CanBookSessions to be true")
			}
			if !assignment.HasMedicalAuthority {
				t.Error("expected HasMedicalAuthority to be true")
			}
			if assignment.StartDate.IsZero() {
				t.Error("expected StartDate to be set")
			}

			return nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AssignGuardianDTO{
		PlayerID:            1,
		GuardianID:          2,
		RelationshipType:    "Padre",
		IsPrimaryGuardian:   true,
		CanPickup:           true,
		CanBookSessions:     true,
		HasMedicalAuthority: true,
	}

	// Act
	err := uc.AssignGuardianToPlayer(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAssignGuardianToPlayer_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGuardianRepository{
		AssignToPlayerFunc: func(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error {
			return expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AssignGuardianDTO{
		PlayerID:            1,
		GuardianID:          2,
		RelationshipType:    "Padre",
		IsPrimaryGuardian:   true,
		CanPickup:           true,
		CanBookSessions:     true,
		HasMedicalAuthority: true,
	}

	// Act
	err := uc.AssignGuardianToPlayer(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestAssignGuardianToPlayer_AlreadyAssigned(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		AssignToPlayerFunc: func(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error {
			return domain.ErrGuardianAlreadyAssigned
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AssignGuardianDTO{
		PlayerID:            1,
		GuardianID:          2,
		RelationshipType:    "Padre",
		IsPrimaryGuardian:   true,
		CanPickup:           true,
		CanBookSessions:     true,
		HasMedicalAuthority: true,
	}

	// Act
	err := uc.AssignGuardianToPlayer(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrGuardianAlreadyAssigned) {
		t.Errorf("expected ErrGuardianAlreadyAssigned, got %v", err)
	}
}

func TestAssignGuardianToPlayer_PlayerNotFound(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGuardianRepository{
		AssignToPlayerFunc: func(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error {
			return domain.ErrPlayerNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AssignGuardianDTO{
		PlayerID:            999,
		GuardianID:          2,
		RelationshipType:    "Padre",
		IsPrimaryGuardian:   true,
		CanPickup:           true,
		CanBookSessions:     true,
		HasMedicalAuthority: true,
	}

	// Act
	err := uc.AssignGuardianToPlayer(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPlayerNotFound) {
		t.Errorf("expected ErrPlayerNotFound, got %v", err)
	}
}
