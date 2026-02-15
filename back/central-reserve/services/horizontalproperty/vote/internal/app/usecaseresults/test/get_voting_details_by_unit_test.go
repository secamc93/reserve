package usecaseresults_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestGetVotingDetailsByUnit_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	hpID := uint(10)

	coefficient1 := 0.05
	coefficient2 := 0.03
	residentID1 := uint(100)
	residentID2 := uint(101)
	residentName1 := "Juan Pérez"
	residentName2 := "María García"
	optionID := uint(1)
	optionText := "Sí"
	optionCode := "yes"
	optionColor := "#00FF00"
	votedAt := "2024-01-15 10:30:00"

	expectedDetails := []domain.VotingDetailByUnitDTO{
		{
			PropertyUnitID:           1,
			PropertyUnitNumber:       "101",
			ParticipationCoefficient: &coefficient1,
			ResidentID:               &residentID1,
			ResidentName:             &residentName1,
			HasVoted:                 true,
			HasAttendance:            true,
			VotingOptionID:           &optionID,
			OptionText:               &optionText,
			OptionCode:               &optionCode,
			OptionColor:              &optionColor,
			VotedAt:                  &votedAt,
		},
		{
			PropertyUnitID:           2,
			PropertyUnitNumber:       "102",
			ParticipationCoefficient: &coefficient2,
			ResidentID:               &residentID2,
			ResidentName:             &residentName2,
			HasVoted:                 false,
			HasAttendance:            true,
			VotingOptionID:           nil,
			OptionText:               nil,
			OptionCode:               nil,
			OptionColor:              nil,
			VotedAt:                  nil,
		},
	}

	mockRepo.GetVotingDetailsByUnitFn = func(ctx context.Context, vID, hID uint) ([]domain.VotingDetailByUnitDTO, error) {
		if vID == votingID && hID == hpID {
			return expectedDetails, nil
		}
		return []domain.VotingDetailByUnitDTO{}, nil
	}

	// Act
	result, err := useCase.GetVotingDetailsByUnit(ctx, votingID, hpID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != len(expectedDetails) {
		t.Errorf("expected %d details, got %d", len(expectedDetails), len(result))
	}

	if len(result) > 0 {
		// Verificar unidad que votó
		if result[0].PropertyUnitNumber != "101" {
			t.Errorf("expected unit number 101, got %s", result[0].PropertyUnitNumber)
		}

		if !result[0].HasVoted {
			t.Error("expected first unit to have voted")
		}

		if !result[0].HasAttendance {
			t.Error("expected first unit to have attendance")
		}

		if result[0].VotingOptionID == nil || *result[0].VotingOptionID != optionID {
			t.Error("expected voting option ID to be set")
		}

		if result[0].OptionText == nil || *result[0].OptionText != "Sí" {
			t.Error("expected option text to be 'Sí'")
		}
	}

	if len(result) > 1 {
		// Verificar unidad que NO votó
		if result[1].HasVoted {
			t.Error("expected second unit to not have voted")
		}

		if result[1].VotingOptionID != nil {
			t.Error("expected voting option ID to be nil for non-voted unit")
		}
	}
}

func TestGetVotingDetailsByUnit_NoUnits(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	hpID := uint(10)

	mockRepo.GetVotingDetailsByUnitFn = func(ctx context.Context, vID, hID uint) ([]domain.VotingDetailByUnitDTO, error) {
		return []domain.VotingDetailByUnitDTO{}, nil
	}

	// Act
	result, err := useCase.GetVotingDetailsByUnit(ctx, votingID, hpID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected 0 details, got %d", len(result))
	}
}

func TestGetVotingDetailsByUnit_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	hpID := uint(10)
	expectedErr := errors.New("database error")

	mockRepo.GetVotingDetailsByUnitFn = func(ctx context.Context, vID, hID uint) ([]domain.VotingDetailByUnitDTO, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.GetVotingDetailsByUnit(ctx, votingID, hpID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestGetVotingDetailsByUnit_MixedAttendance(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	hpID := uint(10)

	coefficient1 := 0.05
	residentID1 := uint(100)
	residentName1 := "Juan Pérez"
	residentID2 := uint(101)
	residentName2 := "María García"

	expectedDetails := []domain.VotingDetailByUnitDTO{
		{
			PropertyUnitID:           1,
			PropertyUnitNumber:       "101",
			ParticipationCoefficient: &coefficient1,
			ResidentID:               &residentID1,
			ResidentName:             &residentName1,
			HasVoted:                 true,
			HasAttendance:            true, // Con asistencia y votó
		},
		{
			PropertyUnitID:           2,
			PropertyUnitNumber:       "102",
			ParticipationCoefficient: &coefficient1,
			ResidentID:               &residentID2,
			ResidentName:             &residentName2,
			HasVoted:                 false,
			HasAttendance:            true, // Con asistencia pero NO votó
		},
		{
			PropertyUnitID:           3,
			PropertyUnitNumber:       "103",
			ParticipationCoefficient: &coefficient1,
			ResidentID:               nil,
			ResidentName:             nil,
			HasVoted:                 false,
			HasAttendance:            false, // SIN asistencia
		},
	}

	mockRepo.GetVotingDetailsByUnitFn = func(ctx context.Context, vID, hID uint) ([]domain.VotingDetailByUnitDTO, error) {
		return expectedDetails, nil
	}

	// Act
	result, err := useCase.GetVotingDetailsByUnit(ctx, votingID, hpID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 details, got %d", len(result))
	}

	// Verificar conteos
	votedCount := 0
	attendanceCount := 0
	for _, detail := range result {
		if detail.HasVoted {
			votedCount++
		}
		if detail.HasAttendance {
			attendanceCount++
		}
	}

	if votedCount != 1 {
		t.Errorf("expected 1 voted unit, got %d", votedCount)
	}

	if attendanceCount != 2 {
		t.Errorf("expected 2 units with attendance, got %d", attendanceCount)
	}
}

func TestGetVotingDetailsByUnit_WithCoefficients(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	hpID := uint(10)

	coefficient1 := 0.10
	coefficient2 := 0.05
	coefficient3 := 0.03

	expectedDetails := []domain.VotingDetailByUnitDTO{
		{
			PropertyUnitID:           1,
			PropertyUnitNumber:       "Apto 101",
			ParticipationCoefficient: &coefficient1,
			HasVoted:                 true,
			HasAttendance:            true,
		},
		{
			PropertyUnitID:           2,
			PropertyUnitNumber:       "Apto 102",
			ParticipationCoefficient: &coefficient2,
			HasVoted:                 true,
			HasAttendance:            true,
		},
		{
			PropertyUnitID:           3,
			PropertyUnitNumber:       "Parqueadero 1",
			ParticipationCoefficient: &coefficient3,
			HasVoted:                 false,
			HasAttendance:            true,
		},
	}

	mockRepo.GetVotingDetailsByUnitFn = func(ctx context.Context, vID, hID uint) ([]domain.VotingDetailByUnitDTO, error) {
		return expectedDetails, nil
	}

	// Act
	result, err := useCase.GetVotingDetailsByUnit(ctx, votingID, hpID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verificar coeficientes
	totalCoefficient := 0.0
	for _, detail := range result {
		if detail.ParticipationCoefficient != nil {
			totalCoefficient += *detail.ParticipationCoefficient
		}
	}

	expectedTotal := 0.18
	tolerance := 0.0001
	if totalCoefficient < expectedTotal-tolerance || totalCoefficient > expectedTotal+tolerance {
		t.Errorf("expected total coefficient %f, got %f", expectedTotal, totalCoefficient)
	}
}
