package usecaseshared_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseshared"
)

func TestCheckUnitAttendanceForVoting_Success_HasAttendance(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	propertyUnitID := uint(100)

	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, vID, puID uint) (bool, error) {
		if vID == votingID && puID == propertyUnitID {
			return true, nil
		}
		return false, nil
	}

	// Act
	hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if !hasAttendance {
		t.Error("expected unit to have attendance")
	}
}

func TestCheckUnitAttendanceForVoting_Success_NoAttendance(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	propertyUnitID := uint(100)

	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, vID, puID uint) (bool, error) {
		return false, nil
	}

	// Act
	hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if hasAttendance {
		t.Error("expected unit to not have attendance")
	}
}

func TestCheckUnitAttendanceForVoting_InvalidVotingID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	votingID := uint(0) // Inválido
	propertyUnitID := uint(100)

	// Act
	hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)

	// Assert
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}

	if hasAttendance {
		t.Error("expected hasAttendance to be false on error")
	}

	if err.Error() != "voting_id es requerido" {
		t.Errorf("expected error 'voting_id es requerido', got: %v", err)
	}
}

func TestCheckUnitAttendanceForVoting_InvalidPropertyUnitID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	propertyUnitID := uint(0) // Inválido

	// Act
	hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)

	// Assert
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}

	if hasAttendance {
		t.Error("expected hasAttendance to be false on error")
	}

	if err.Error() != "property_unit_id es requerido" {
		t.Errorf("expected error 'property_unit_id es requerido', got: %v", err)
	}
}

func TestCheckUnitAttendanceForVoting_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	propertyUnitID := uint(100)
	expectedErr := errors.New("database connection error")

	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, vID, puID uint) (bool, error) {
		return false, expectedErr
	}

	// Act
	hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, propertyUnitID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if hasAttendance {
		t.Error("expected hasAttendance to be false on error")
	}

	// El error debe estar envuelto
	if !errors.Is(err, expectedErr) {
		t.Errorf("expected wrapped error containing %v, got: %v", expectedErr, err)
	}
}

func TestCheckUnitAttendanceForVoting_MultipleUnits(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	// Simular que algunas unidades tienen asistencia y otras no
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, vID, puID uint) (bool, error) {
		if vID != votingID {
			return false, errors.New("voting not found")
		}
		// Unidades 1-5 tienen asistencia, 6-10 no
		return puID >= 1 && puID <= 5, nil
	}

	// Act & Assert para unidades con asistencia
	for unitID := uint(1); unitID <= 5; unitID++ {
		hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, unitID)
		if err != nil {
			t.Fatalf("expected no error for unit %d, got %v", unitID, err)
		}
		if !hasAttendance {
			t.Errorf("expected unit %d to have attendance", unitID)
		}
	}

	// Act & Assert para unidades sin asistencia
	for unitID := uint(6); unitID <= 10; unitID++ {
		hasAttendance, err := useCase.CheckUnitAttendanceForVoting(ctx, votingID, unitID)
		if err != nil {
			t.Fatalf("expected no error for unit %d, got %v", unitID, err)
		}
		if hasAttendance {
			t.Errorf("expected unit %d to not have attendance", unitID)
		}
	}
}

func TestCheckUnitAttendanceForVoting_DifferentVotings(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseshared.New(mockRepo, mockCache, mockLogger)

	propertyUnitID := uint(100)

	// Simular que la unidad tiene asistencia solo en votingID=1
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, vID, puID uint) (bool, error) {
		return vID == 1 && puID == propertyUnitID, nil
	}

	// Act & Assert - Tiene asistencia en votingID=1
	hasAttendance1, err := useCase.CheckUnitAttendanceForVoting(ctx, 1, propertyUnitID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !hasAttendance1 {
		t.Error("expected unit to have attendance in voting 1")
	}

	// Act & Assert - NO tiene asistencia en votingID=2
	hasAttendance2, err := useCase.CheckUnitAttendanceForVoting(ctx, 2, propertyUnitID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if hasAttendance2 {
		t.Error("expected unit to not have attendance in voting 2")
	}
}
