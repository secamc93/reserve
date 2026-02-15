package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/attendance/internal/app"
	"central_reserve/services/sporttraining/attendance/internal/app/test/mocks"
	"central_reserve/services/sporttraining/attendance/internal/domain"
)

func TestListBySession_Success(t *testing.T) {
	// Arrange
	sessionID := uint(1)
	mockRepo := &mocks.MockAttendanceRepository{
		ListBySessionFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			now := time.Now()
			records := []domain.AttendanceListDTO{
				{
					ID:                  1,
					TrainingSessionID:   sessionID,
					SessionDate:         now,
					SessionLocation:     "Cancha 1",
					PlayerID:            100,
					PlayerName:          "Juan Pérez",
					AttendanceStatusID:  1,
					StatusName:          "Presente",
					StatusCode:          "present",
					StatusColor:         "#00FF00",
					RecordedByCoachID:   50,
					RecordedByCoachName: "Carlos López",
					RecordedAt:          now,
					CreatedAt:           now,
				},
				{
					ID:                  2,
					TrainingSessionID:   sessionID,
					SessionDate:         now,
					SessionLocation:     "Cancha 1",
					PlayerID:            101,
					PlayerName:          "María García",
					AttendanceStatusID:  1,
					StatusName:          "Presente",
					StatusCode:          "present",
					StatusColor:         "#00FF00",
					RecordedByCoachID:   50,
					RecordedByCoachName: "Carlos López",
					RecordedAt:          now,
					CreatedAt:           now,
				},
			}

			return &domain.PaginatedAttendanceDTO{
				Records:    records,
				Total:      2,
				Page:       1,
				PageSize:   10,
				TotalPages: 1,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.AttendanceFiltersDTO{
		BusinessID:        10,
		TrainingSessionID: &sessionID,
		Page:              1,
		PageSize:          10,
	}

	// Act
	result, err := uc.ListBySession(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 2 {
		t.Errorf("expected Total 2, got %d", result.Total)
	}

	if len(result.Records) != 2 {
		t.Fatalf("expected 2 records, got %d", len(result.Records))
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10, got %d", result.PageSize)
	}

	if result.TotalPages != 1 {
		t.Errorf("expected TotalPages 1, got %d", result.TotalPages)
	}

	// Validar primer registro
	firstRecord := result.Records[0]
	if firstRecord.TrainingSessionID != sessionID {
		t.Errorf("expected TrainingSessionID %d, got %d", sessionID, firstRecord.TrainingSessionID)
	}

	if firstRecord.PlayerName != "Juan Pérez" {
		t.Errorf("expected PlayerName 'Juan Pérez', got '%s'", firstRecord.PlayerName)
	}

	if firstRecord.StatusCode != "present" {
		t.Errorf("expected StatusCode 'present', got '%s'", firstRecord.StatusCode)
	}
}

func TestListBySession_EmptyResult(t *testing.T) {
	// Arrange
	sessionID := uint(999)
	mockRepo := &mocks.MockAttendanceRepository{
		ListBySessionFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			return &domain.PaginatedAttendanceDTO{
				Records:    []domain.AttendanceListDTO{},
				Total:      0,
				Page:       1,
				PageSize:   10,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.AttendanceFiltersDTO{
		BusinessID:        10,
		TrainingSessionID: &sessionID,
		Page:              1,
		PageSize:          10,
	}

	// Act
	result, err := uc.ListBySession(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected Total 0, got %d", result.Total)
	}

	if len(result.Records) != 0 {
		t.Errorf("expected 0 records, got %d", len(result.Records))
	}
}

func TestListBySession_PaginationDefaults(t *testing.T) {
	// Arrange
	sessionID := uint(1)
	mockRepo := &mocks.MockAttendanceRepository{
		ListBySessionFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			// Verificar que se aplicaron los defaults
			if filters.Page != 1 {
				t.Errorf("expected default Page 1, got %d", filters.Page)
			}
			if filters.PageSize != 10 {
				t.Errorf("expected default PageSize 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedAttendanceDTO{
				Records:    []domain.AttendanceListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.AttendanceFiltersDTO{
		BusinessID:        10,
		TrainingSessionID: &sessionID,
		Page:              0, // Valor inválido
		PageSize:          150, // Valor inválido (mayor a 100)
	}

	// Act
	result, err := uc.ListBySession(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1 after default, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10 after default, got %d", result.PageSize)
	}
}

func TestListBySession_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database query error")
	sessionID := uint(1)

	mockRepo := &mocks.MockAttendanceRepository{
		ListBySessionFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.AttendanceFiltersDTO{
		BusinessID:        10,
		TrainingSessionID: &sessionID,
		Page:              1,
		PageSize:          10,
	}

	// Act
	result, err := uc.ListBySession(context.Background(), filters)

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
