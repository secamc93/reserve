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

func TestListByPlayer_Success(t *testing.T) {
	// Arrange
	playerID := uint(100)
	mockRepo := &mocks.MockAttendanceRepository{
		ListByPlayerFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			now := time.Now()
			yesterday := now.AddDate(0, 0, -1)

			records := []domain.AttendanceListDTO{
				{
					ID:                  1,
					TrainingSessionID:   1,
					SessionDate:         now,
					SessionLocation:     "Cancha 1",
					PlayerID:            playerID,
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
					TrainingSessionID:   2,
					SessionDate:         yesterday,
					SessionLocation:     "Cancha 2",
					PlayerID:            playerID,
					PlayerName:          "Juan Pérez",
					AttendanceStatusID:  2,
					StatusName:          "Ausente",
					StatusCode:          "absent",
					StatusColor:         "#FF0000",
					RecordedByCoachID:   50,
					RecordedByCoachName: "Carlos López",
					RecordedAt:          yesterday,
					CreatedAt:           yesterday,
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
		BusinessID: 10,
		PlayerID:   &playerID,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListByPlayer(context.Background(), filters)

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

	// Validar que todos los registros pertenecen al jugador
	for i, record := range result.Records {
		if record.PlayerID != playerID {
			t.Errorf("record %d: expected PlayerID %d, got %d", i, playerID, record.PlayerID)
		}

		if record.PlayerName != "Juan Pérez" {
			t.Errorf("record %d: expected PlayerName 'Juan Pérez', got '%s'", i, record.PlayerName)
		}
	}

	// Validar estados diferentes
	if result.Records[0].StatusCode != "present" {
		t.Errorf("expected first record StatusCode 'present', got '%s'", result.Records[0].StatusCode)
	}

	if result.Records[1].StatusCode != "absent" {
		t.Errorf("expected second record StatusCode 'absent', got '%s'", result.Records[1].StatusCode)
	}
}

func TestListByPlayer_EmptyResult(t *testing.T) {
	// Arrange
	playerID := uint(999)
	mockRepo := &mocks.MockAttendanceRepository{
		ListByPlayerFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
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
		BusinessID: 10,
		PlayerID:   &playerID,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListByPlayer(context.Background(), filters)

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

func TestListByPlayer_Pagination(t *testing.T) {
	// Arrange
	playerID := uint(100)
	mockRepo := &mocks.MockAttendanceRepository{
		ListByPlayerFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			now := time.Now()

			// Simular página 2 con 5 registros
			records := make([]domain.AttendanceListDTO, 5)
			for i := range records {
				records[i] = domain.AttendanceListDTO{
					ID:                  uint(i + 6), // IDs del 6 al 10
					TrainingSessionID:   uint(i + 1),
					SessionDate:         now,
					SessionLocation:     "Cancha 1",
					PlayerID:            playerID,
					PlayerName:          "Juan Pérez",
					AttendanceStatusID:  1,
					StatusName:          "Presente",
					StatusCode:          "present",
					StatusColor:         "#00FF00",
					RecordedByCoachID:   50,
					RecordedByCoachName: "Carlos López",
					RecordedAt:          now,
					CreatedAt:           now,
				}
			}

			return &domain.PaginatedAttendanceDTO{
				Records:    records,
				Total:      12,
				Page:       2,
				PageSize:   5,
				TotalPages: 3,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.AttendanceFiltersDTO{
		BusinessID: 10,
		PlayerID:   &playerID,
		Page:       2,
		PageSize:   5,
	}

	// Act
	result, err := uc.ListByPlayer(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 12 {
		t.Errorf("expected Total 12, got %d", result.Total)
	}

	if len(result.Records) != 5 {
		t.Errorf("expected 5 records, got %d", len(result.Records))
	}

	if result.Page != 2 {
		t.Errorf("expected Page 2, got %d", result.Page)
	}

	if result.PageSize != 5 {
		t.Errorf("expected PageSize 5, got %d", result.PageSize)
	}

	if result.TotalPages != 3 {
		t.Errorf("expected TotalPages 3, got %d", result.TotalPages)
	}
}

func TestListByPlayer_PaginationDefaults(t *testing.T) {
	// Arrange
	playerID := uint(100)
	mockRepo := &mocks.MockAttendanceRepository{
		ListByPlayerFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
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
		BusinessID: 10,
		PlayerID:   &playerID,
		Page:       -5, // Valor inválido
		PageSize:   250, // Valor inválido (mayor a 100)
	}

	// Act
	result, err := uc.ListByPlayer(context.Background(), filters)

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

func TestListByPlayer_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection lost")
	playerID := uint(100)

	mockRepo := &mocks.MockAttendanceRepository{
		ListByPlayerFunc: func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.AttendanceFiltersDTO{
		BusinessID: 10,
		PlayerID:   &playerID,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListByPlayer(context.Background(), filters)

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
