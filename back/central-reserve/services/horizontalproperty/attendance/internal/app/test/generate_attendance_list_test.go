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

func TestGenerateAttendanceList_NewList(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	votingGroupID := uint(100)

	// No existe lista previa para este grupo de votación
	mockRepo.GetAttendanceListByVotingGroupFn = func(ctx context.Context, vgID uint) (*domain.AttendanceList, error) {
		return nil, nil
	}

	// Crear nueva lista
	createdList := &domain.AttendanceList{
		ID:            1,
		VotingGroupID: votingGroupID,
		Title:         "Lista de Asistencia - Generada Automáticamente",
		Description:   "Lista de asistencia generada automáticamente para el grupo de votación",
		IsActive:      true,
		Notes:         "Generada automáticamente por el sistema",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		if attendanceList.VotingGroupID != votingGroupID {
			t.Errorf("expected VotingGroupID %d, got %d", votingGroupID, attendanceList.VotingGroupID)
		}
		return createdList, nil
	}

	// Generar registros de asistencia (3 unidades de ejemplo)
	generatedRecords := []domain.AttendanceRecord{
		{PropertyUnitID: 101},
		{PropertyUnitID: 102},
		{PropertyUnitID: 103},
	}

	mockRepo.GenerateAttendanceListForVotingGroupFn = func(ctx context.Context, vgID uint) ([]domain.AttendanceRecord, error) {
		if vgID != votingGroupID {
			t.Errorf("expected votingGroupID %d, got %d", votingGroupID, vgID)
		}
		return generatedRecords, nil
	}

	// Crear registros en batch
	mockRepo.CreateAttendanceRecordsInBatchFn = func(ctx context.Context, records []domain.AttendanceRecord) error {
		if len(records) != len(generatedRecords) {
			t.Errorf("expected %d records, got %d", len(generatedRecords), len(records))
		}

		// Verificar que todos tienen el attendance_list_id correcto
		for i, record := range records {
			if record.AttendanceListID != createdList.ID {
				t.Errorf("record[%d]: expected AttendanceListID %d, got %d", i, createdList.ID, record.AttendanceListID)
			}
			if record.AttendedAsOwner != false {
				t.Errorf("record[%d]: expected AttendedAsOwner to be false, got %v", i, record.AttendedAsOwner)
			}
			if record.AttendedAsProxy != false {
				t.Errorf("record[%d]: expected AttendedAsProxy to be false, got %v", i, record.AttendedAsProxy)
			}
			if record.IsValid != false {
				t.Errorf("record[%d]: expected IsValid to be false, got %v", i, record.IsValid)
			}
		}
		return nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.GenerateAttendanceList(ctx, votingGroupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != createdList.ID {
		t.Errorf("expected ID %d, got %d", createdList.ID, result.ID)
	}

	if result.VotingGroupID != votingGroupID {
		t.Errorf("expected VotingGroupID %d, got %d", votingGroupID, result.VotingGroupID)
	}

	if result.Title != "Lista de Asistencia - Generada Automáticamente" {
		t.Errorf("expected default title, got %s", result.Title)
	}

	if result.IsActive != true {
		t.Errorf("expected IsActive to be true, got %v", result.IsActive)
	}
}

func TestGenerateAttendanceList_ExistingList(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	votingGroupID := uint(100)

	// Ya existe una lista para este grupo
	existingList := &domain.AttendanceList{
		ID:              5,
		VotingGroupID:   votingGroupID,
		Title:           "Lista Existente",
		Description:     "Lista creada manualmente",
		IsActive:        true,
		CreatedByUserID: nil,
		Notes:           "Lista manual",
		CreatedAt:       time.Now().Add(-48 * time.Hour),
		UpdatedAt:       time.Now().Add(-48 * time.Hour),
	}

	mockRepo.GetAttendanceListByVotingGroupFn = func(ctx context.Context, vgID uint) (*domain.AttendanceList, error) {
		if vgID != votingGroupID {
			t.Errorf("expected votingGroupID %d, got %d", votingGroupID, vgID)
		}
		return existingList, nil
	}

	// NO debe llamar a CreateAttendanceList ni a GenerateAttendanceListForVotingGroup
	// ni a CreateAttendanceRecordsInBatch
	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		t.Error("CreateAttendanceList should not be called when list already exists")
		return nil, nil
	}

	mockRepo.GenerateAttendanceListForVotingGroupFn = func(ctx context.Context, vgID uint) ([]domain.AttendanceRecord, error) {
		t.Error("GenerateAttendanceListForVotingGroup should not be called when list already exists")
		return nil, nil
	}

	mockRepo.CreateAttendanceRecordsInBatchFn = func(ctx context.Context, records []domain.AttendanceRecord) error {
		t.Error("CreateAttendanceRecordsInBatch should not be called when list already exists")
		return nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.GenerateAttendanceList(ctx, votingGroupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != existingList.ID {
		t.Errorf("expected ID %d, got %d", existingList.ID, result.ID)
	}

	if result.VotingGroupID != votingGroupID {
		t.Errorf("expected VotingGroupID %d, got %d", votingGroupID, result.VotingGroupID)
	}

	if result.Title != existingList.Title {
		t.Errorf("expected Title %s, got %s", existingList.Title, result.Title)
	}

	if result.Description != existingList.Description {
		t.Errorf("expected Description %s, got %s", existingList.Description, result.Description)
	}

	if result.Notes != existingList.Notes {
		t.Errorf("expected Notes %s, got %s", existingList.Notes, result.Notes)
	}
}

func TestGenerateAttendanceList_GetListError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	votingGroupID := uint(100)
	expectedError := errors.New("database connection failed")

	mockRepo.GetAttendanceListByVotingGroupFn = func(ctx context.Context, vgID uint) (*domain.AttendanceList, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.GenerateAttendanceList(ctx, votingGroupID)

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

func TestGenerateAttendanceList_CreateListError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	votingGroupID := uint(100)

	// No existe lista previa
	mockRepo.GetAttendanceListByVotingGroupFn = func(ctx context.Context, vgID uint) (*domain.AttendanceList, error) {
		return nil, nil
	}

	expectedError := errors.New("failed to create attendance list")

	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.GenerateAttendanceList(ctx, votingGroupID)

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

func TestGenerateAttendanceList_GenerateRecordsError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	votingGroupID := uint(100)

	mockRepo.GetAttendanceListByVotingGroupFn = func(ctx context.Context, vgID uint) (*domain.AttendanceList, error) {
		return nil, nil
	}

	createdList := &domain.AttendanceList{
		ID:            1,
		VotingGroupID: votingGroupID,
		Title:         "Lista de Asistencia - Generada Automáticamente",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		return createdList, nil
	}

	expectedError := errors.New("failed to generate attendance records")

	mockRepo.GenerateAttendanceListForVotingGroupFn = func(ctx context.Context, vgID uint) ([]domain.AttendanceRecord, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.GenerateAttendanceList(ctx, votingGroupID)

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

func TestGenerateAttendanceList_CreateBatchError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	votingGroupID := uint(100)

	mockRepo.GetAttendanceListByVotingGroupFn = func(ctx context.Context, vgID uint) (*domain.AttendanceList, error) {
		return nil, nil
	}

	createdList := &domain.AttendanceList{
		ID:            1,
		VotingGroupID: votingGroupID,
		Title:         "Lista de Asistencia - Generada Automáticamente",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	mockRepo.CreateAttendanceListFn = func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
		return createdList, nil
	}

	generatedRecords := []domain.AttendanceRecord{
		{PropertyUnitID: 101},
		{PropertyUnitID: 102},
	}

	mockRepo.GenerateAttendanceListForVotingGroupFn = func(ctx context.Context, vgID uint) ([]domain.AttendanceRecord, error) {
		return generatedRecords, nil
	}

	expectedError := errors.New("failed to create records in batch")

	mockRepo.CreateAttendanceRecordsInBatchFn = func(ctx context.Context, records []domain.AttendanceRecord) error {
		return expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.GenerateAttendanceList(ctx, votingGroupID)

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
