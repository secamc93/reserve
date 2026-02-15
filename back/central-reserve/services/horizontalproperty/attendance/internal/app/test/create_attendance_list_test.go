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

func TestCreateAttendanceList_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	userID := uint(1)
	dto := domain.CreateAttendanceListDTO{
		VotingGroupID:   100,
		Title:           "Lista de Asistencia - Asamblea General",
		Description:     "Lista de asistencia para la asamblea general de copropietarios",
		CreatedByUserID: &userID,
		Notes:           "Generada para reunión del 15 de febrero",
	}

	expectedList := &domain.AttendanceList{
		ID:              1,
		VotingGroupID:   dto.VotingGroupID,
		Title:           dto.Title,
		Description:     dto.Description,
		IsActive:        true,
		CreatedByUserID: dto.CreatedByUserID,
		Notes:           dto.Notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		return expectedList, nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.CreateAttendanceList(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedList.ID {
		t.Errorf("expected ID %d, got %d", expectedList.ID, result.ID)
	}

	if result.VotingGroupID != dto.VotingGroupID {
		t.Errorf("expected VotingGroupID %d, got %d", dto.VotingGroupID, result.VotingGroupID)
	}

	if result.Title != dto.Title {
		t.Errorf("expected Title %s, got %s", dto.Title, result.Title)
	}

	if result.Description != dto.Description {
		t.Errorf("expected Description %s, got %s", dto.Description, result.Description)
	}

	if result.IsActive != true {
		t.Errorf("expected IsActive to be true, got %v", result.IsActive)
	}

	if result.CreatedByUserID == nil || *result.CreatedByUserID != userID {
		t.Errorf("expected CreatedByUserID %d, got %v", userID, result.CreatedByUserID)
	}

	if result.Notes != dto.Notes {
		t.Errorf("expected Notes %s, got %s", dto.Notes, result.Notes)
	}
}

func TestCreateAttendanceList_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreateAttendanceListDTO{
		VotingGroupID: 100,
		Title:         "Lista de Asistencia - Asamblea General",
		Description:   "Lista de asistencia para la asamblea general",
	}

	expectedError := errors.New("database connection failed")

	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.CreateAttendanceList(ctx, dto)

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
