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

func TestListSessions_Success(t *testing.T) {
	// Arrange
	expectedSessions := []domain.SessionListDTO{
		{
			ID:                  1,
			SessionTypeName:     "Entrenamiento Técnico",
			SessionTypeCode:     "TECH",
			CoachName:           "Juan Pérez",
			GroupName:           "Sub-15",
			SessionMode:         "group",
			ScheduledDate:       time.Now().AddDate(0, 0, 1),
			StartTime:           time.Now().Add(1 * time.Hour),
			EndTime:             time.Now().Add(3 * time.Hour),
			Duration:            120,
			Location:            "Cancha Principal",
			Field:               "Campo 1",
			CurrentParticipants: 15,
			Status:              "scheduled",
			IsRecurring:         true,
			CreatedAt:           time.Now(),
		},
		{
			ID:                  2,
			SessionTypeName:     "Entrenamiento Físico",
			SessionTypeCode:     "PHYS",
			CoachName:           "María González",
			SessionMode:         "individual",
			ScheduledDate:       time.Now().AddDate(0, 0, 2),
			StartTime:           time.Now().Add(2 * time.Hour),
			EndTime:             time.Now().Add(4 * time.Hour),
			Duration:            120,
			Location:            "Gimnasio",
			CurrentParticipants: 1,
			Status:              "scheduled",
			IsRecurring:         false,
			CreatedAt:           time.Now(),
		},
	}

	mockSessionRepo := &mocks.MockSessionRepository{
		ListFunc: func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
			return &domain.PaginatedSessionsDTO{
				Sessions:   expectedSessions,
				Total:      2,
				Page:       1,
				PageSize:   10,
				TotalPages: 1,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	filters := domain.SessionFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListSessions(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if len(result.Sessions) != 2 {
		t.Errorf("expected 2 sessions, got %d", len(result.Sessions))
	}

	if result.Total != 2 {
		t.Errorf("expected total 2, got %d", result.Total)
	}

	if result.Page != 1 {
		t.Errorf("expected page 1, got %d", result.Page)
	}

	if result.Sessions[0].SessionTypeName != "Entrenamiento Técnico" {
		t.Errorf("expected first session type 'Entrenamiento Técnico', got '%s'", result.Sessions[0].SessionTypeName)
	}
}

func TestListSessions_WithFilters(t *testing.T) {
	// Arrange
	coachID := uint(5)
	sessionTypeID := uint(2)
	startDate := time.Now()
	endDate := time.Now().AddDate(0, 0, 7)

	expectedSessions := []domain.SessionListDTO{
		{
			ID:              1,
			SessionTypeName: "Entrenamiento Técnico",
			CoachName:       "Juan Pérez",
			SessionMode:     "group",
			Status:          "scheduled",
		},
	}

	mockSessionRepo := &mocks.MockSessionRepository{
		ListFunc: func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
			// Verify filters
			if filters.CoachID == nil || *filters.CoachID != coachID {
				t.Error("CoachID filter not applied correctly")
			}
			if filters.SessionTypeID == nil || *filters.SessionTypeID != sessionTypeID {
				t.Error("SessionTypeID filter not applied correctly")
			}

			return &domain.PaginatedSessionsDTO{
				Sessions:   expectedSessions,
				Total:      1,
				Page:       1,
				PageSize:   10,
				TotalPages: 1,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	filters := domain.SessionFiltersDTO{
		BusinessID:    1,
		CoachID:       &coachID,
		SessionTypeID: &sessionTypeID,
		Status:        "scheduled",
		StartDate:     &startDate,
		EndDate:       &endDate,
		Page:          1,
		PageSize:      10,
	}

	// Act
	result, err := uc.ListSessions(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result.Sessions) != 1 {
		t.Errorf("expected 1 session, got %d", len(result.Sessions))
	}
}

func TestListSessions_DefaultPagination(t *testing.T) {
	// Arrange
	mockSessionRepo := &mocks.MockSessionRepository{
		ListFunc: func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
			// Verify pagination defaults
			if filters.Page != 1 {
				t.Errorf("expected default page 1, got %d", filters.Page)
			}
			if filters.PageSize != 10 {
				t.Errorf("expected default page size 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedSessionsDTO{
				Sessions:   []domain.SessionListDTO{},
				Total:      0,
				Page:       1,
				PageSize:   10,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	filters := domain.SessionFiltersDTO{
		BusinessID: 1,
		Page:       0, // Invalid, should default to 1
		PageSize:   0, // Invalid, should default to 10
	}

	// Act
	_, err := uc.ListSessions(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestListSessions_MaxPageSize(t *testing.T) {
	// Arrange
	mockSessionRepo := &mocks.MockSessionRepository{
		ListFunc: func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
			// Verify max page size is enforced
			if filters.PageSize != 10 {
				t.Errorf("expected page size capped at 10, got %d", filters.PageSize)
			}

			return &domain.PaginatedSessionsDTO{
				Sessions:   []domain.SessionListDTO{},
				Total:      0,
				Page:       1,
				PageSize:   10,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	filters := domain.SessionFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   150, // Over max, should be capped
	}

	// Act
	_, err := uc.ListSessions(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestListSessions_EmptyResult(t *testing.T) {
	// Arrange
	mockSessionRepo := &mocks.MockSessionRepository{
		ListFunc: func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
			return &domain.PaginatedSessionsDTO{
				Sessions:   []domain.SessionListDTO{},
				Total:      0,
				Page:       1,
				PageSize:   10,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	filters := domain.SessionFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListSessions(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result.Sessions) != 0 {
		t.Errorf("expected 0 sessions, got %d", len(result.Sessions))
	}

	if result.Total != 0 {
		t.Errorf("expected total 0, got %d", result.Total)
	}
}

func TestListSessions_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database query error")

	mockSessionRepo := &mocks.MockSessionRepository{
		ListFunc: func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	filters := domain.SessionFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListSessions(context.Background(), filters)

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
