package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/dashboard/internal/app"
	"central_reserve/services/horizontalproperty/dashboard/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
)

// TestGetDashboard_RegularUser valida que un usuario regular recibe resumen, estadísticas de votación y asistencia
func TestGetDashboard_RegularUser(t *testing.T) {
	// Arrange
	ctx := context.Background()
	businessID := uint(5)
	isSuperAdmin := false

	mockRepo := &mocks.DashboardRepositoryMock{
		GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
			if bizID != businessID {
				t.Errorf("expected businessID %d, got %d", businessID, bizID)
			}
			return &domain.DashboardSummary{
				BusinessID:                businessID,
				BusinessName:              "Test Business",
				TotalHorizontalProperties: 10,
				TotalUnits:                100,
				TotalResidents:            250,
				TotalVotingGroups:         5,
				ActiveVotings:             3,
				CompletedVotings:          12,
				TotalAttendanceLists:      8,
				ActiveAttendanceLists:     2,
				TotalVotes:                150,
				TotalProxies:              20,
			}, nil
		},
		GetVotingStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.VotingStatistics, error) {
			if bizID != businessID {
				t.Errorf("expected businessID %d, got %d", businessID, bizID)
			}
			return &domain.VotingStatistics{
				TotalVotings:       15,
				ActiveVotings:      3,
				CompletedVotings:   12,
				PendingVotings:     0,
				TotalVotes:         150,
				TotalVotingGroups:  5,
				ActiveVotingGroups: 3,
			}, nil
		},
		GetAttendanceStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.AttendanceStatistics, error) {
			if bizID != businessID {
				t.Errorf("expected businessID %d, got %d", businessID, bizID)
			}
			return &domain.AttendanceStatistics{
				TotalLists:      8,
				ActiveLists:     2,
				TotalRecords:    300,
				AttendedRecords: 280,
				PendingRecords:  20,
				TotalProxies:    20,
			}, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetDashboard(ctx, businessID, isSuperAdmin, 1, 10)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	// Verificar resumen
	if result.Summary.BusinessID != businessID {
		t.Errorf("expected BusinessID %d, got %d", businessID, result.Summary.BusinessID)
	}

	if result.Summary.BusinessName != "Test Business" {
		t.Errorf("expected BusinessName 'Test Business', got '%s'", result.Summary.BusinessName)
	}

	if result.Summary.TotalHorizontalProperties != 10 {
		t.Errorf("expected TotalHorizontalProperties 10, got %d", result.Summary.TotalHorizontalProperties)
	}

	// Verificar estadísticas de votación
	if result.VotingStats.TotalVotings != 15 {
		t.Errorf("expected TotalVotings 15, got %d", result.VotingStats.TotalVotings)
	}

	if result.VotingStats.ActiveVotings != 3 {
		t.Errorf("expected ActiveVotings 3, got %d", result.VotingStats.ActiveVotings)
	}

	// Verificar estadísticas de asistencia
	if result.AttendanceStats.TotalLists != 8 {
		t.Errorf("expected TotalLists 8, got %d", result.AttendanceStats.TotalLists)
	}

	if result.AttendanceStats.ActiveLists != 2 {
		t.Errorf("expected ActiveLists 2, got %d", result.AttendanceStats.ActiveLists)
	}

	// Verificar que NO se incluyan resúmenes de businesses
	if result.BusinessSummaries != nil && len(result.BusinessSummaries) > 0 {
		t.Errorf("expected no BusinessSummaries for regular user, got %d", len(result.BusinessSummaries))
	}

	if result.Pagination != nil {
		t.Error("expected no Pagination for regular user")
	}
}

// TestGetDashboard_SuperAdmin valida que un super admin recibe resúmenes de todos los businesses con paginación
func TestGetDashboard_SuperAdmin(t *testing.T) {
	// Arrange
	ctx := context.Background()
	businessID := uint(0) // Super admin usa businessID 0
	isSuperAdmin := true
	page := 1
	pageSize := 10

	lastActivity := time.Now().Add(-24 * time.Hour)

	mockRepo := &mocks.DashboardRepositoryMock{
		GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
			return &domain.DashboardSummary{
				BusinessID:                0,
				BusinessName:              "Super Admin View",
				TotalHorizontalProperties: 0,
				TotalUnits:                0,
				TotalResidents:            0,
			}, nil
		},
		GetVotingStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.VotingStatistics, error) {
			return &domain.VotingStatistics{
				TotalVotings:  0,
				ActiveVotings: 0,
			}, nil
		},
		GetAttendanceStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.AttendanceStatistics, error) {
			return &domain.AttendanceStatistics{
				TotalLists:  0,
				ActiveLists: 0,
			}, nil
		},
		GetBusinessSummariesFunc: func(ctx context.Context, p, ps int) ([]domain.BusinessSummary, int64, error) {
			if p != page {
				t.Errorf("expected page %d, got %d", page, p)
			}
			if ps != pageSize {
				t.Errorf("expected pageSize %d, got %d", pageSize, ps)
			}

			return []domain.BusinessSummary{
				{
					BusinessID:                1,
					BusinessName:              "Business 1",
					BusinessTypeID:            1,
					LogoURL:                   "https://example.com/logo1.png",
					TotalHorizontalProperties: 5,
					TotalUnits:                50,
					TotalResidents:            120,
					ActiveVotings:             2,
					ActiveAttendanceLists:     1,
					LastActivity:              &lastActivity,
				},
				{
					BusinessID:                2,
					BusinessName:              "Business 2",
					BusinessTypeID:            1,
					LogoURL:                   "https://example.com/logo2.png",
					TotalHorizontalProperties: 8,
					TotalUnits:                80,
					TotalResidents:            200,
					ActiveVotings:             3,
					ActiveAttendanceLists:     2,
					LastActivity:              &lastActivity,
				},
			}, 25, nil // Total de 25 businesses
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetDashboard(ctx, businessID, isSuperAdmin, page, pageSize)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	// Verificar que se incluyan resúmenes de businesses
	if result.BusinessSummaries == nil {
		t.Fatal("expected BusinessSummaries, got nil")
	}

	if len(result.BusinessSummaries) != 2 {
		t.Errorf("expected 2 BusinessSummaries, got %d", len(result.BusinessSummaries))
	}

	// Verificar primer business summary
	if result.BusinessSummaries[0].BusinessID != 1 {
		t.Errorf("expected BusinessID 1, got %d", result.BusinessSummaries[0].BusinessID)
	}

	if result.BusinessSummaries[0].BusinessName != "Business 1" {
		t.Errorf("expected BusinessName 'Business 1', got '%s'", result.BusinessSummaries[0].BusinessName)
	}

	// Verificar paginación
	if result.Pagination == nil {
		t.Fatal("expected Pagination, got nil")
	}

	if result.Pagination.Page != page {
		t.Errorf("expected Page %d, got %d", page, result.Pagination.Page)
	}

	if result.Pagination.PageSize != pageSize {
		t.Errorf("expected PageSize %d, got %d", pageSize, result.Pagination.PageSize)
	}

	if result.Pagination.Total != 25 {
		t.Errorf("expected Total 25, got %d", result.Pagination.Total)
	}

	expectedTotalPages := 3 // 25 items / 10 per page = 3 pages
	if result.Pagination.TotalPages != expectedTotalPages {
		t.Errorf("expected TotalPages %d, got %d", expectedTotalPages, result.Pagination.TotalPages)
	}
}

// TestGetDashboard_SuperAdmin_Pagination valida que la paginación se valida correctamente
func TestGetDashboard_SuperAdmin_Pagination(t *testing.T) {
	tests := []struct {
		name             string
		inputPage        int
		inputPageSize    int
		expectedPage     int
		expectedPageSize int
	}{
		{
			name:             "page menor que 1 se normaliza a 1",
			inputPage:        0,
			inputPageSize:    10,
			expectedPage:     1,
			expectedPageSize: 10,
		},
		{
			name:             "page menor que 1 negativo se normaliza a 1",
			inputPage:        -5,
			inputPageSize:    10,
			expectedPage:     1,
			expectedPageSize: 10,
		},
		{
			name:             "pageSize menor que 1 se normaliza a 10",
			inputPage:        1,
			inputPageSize:    0,
			expectedPage:     1,
			expectedPageSize: 10,
		},
		{
			name:             "pageSize mayor que 100 se limita a 100",
			inputPage:        1,
			inputPageSize:    150,
			expectedPage:     1,
			expectedPageSize: 100,
		},
		{
			name:             "valores válidos se mantienen",
			inputPage:        2,
			inputPageSize:    20,
			expectedPage:     2,
			expectedPageSize: 20,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Arrange
			ctx := context.Background()

			mockRepo := &mocks.DashboardRepositoryMock{
				GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
					return &domain.DashboardSummary{}, nil
				},
				GetVotingStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.VotingStatistics, error) {
					return &domain.VotingStatistics{}, nil
				},
				GetAttendanceStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.AttendanceStatistics, error) {
					return &domain.AttendanceStatistics{}, nil
				},
				GetBusinessSummariesFunc: func(ctx context.Context, p, ps int) ([]domain.BusinessSummary, int64, error) {
					// Verificar que los parámetros sean los esperados
					if p != tt.expectedPage {
						t.Errorf("expected page %d, got %d", tt.expectedPage, p)
					}
					if ps != tt.expectedPageSize {
						t.Errorf("expected pageSize %d, got %d", tt.expectedPageSize, ps)
					}
					return []domain.BusinessSummary{}, 0, nil
				},
			}

			mockLogger := mocks.NewLoggerMock()
			useCase := app.New(mockRepo, mockLogger)

			// Act
			_, err := useCase.GetDashboard(ctx, 0, true, tt.inputPage, tt.inputPageSize)

			// Assert
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

// TestGetDashboard_SummaryError valida el manejo de errores cuando GetDashboardSummary falla
func TestGetDashboard_SummaryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.DashboardRepositoryMock{
		GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetDashboard(ctx, 5, false, 1, 10)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

// TestGetDashboard_VotingStatsError valida el manejo de errores cuando GetVotingStatistics falla
func TestGetDashboard_VotingStatsError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedErr := errors.New("voting statistics query failed")

	mockRepo := &mocks.DashboardRepositoryMock{
		GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
			return &domain.DashboardSummary{
				BusinessID:   5,
				BusinessName: "Test Business",
			}, nil
		},
		GetVotingStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.VotingStatistics, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetDashboard(ctx, 5, false, 1, 10)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

// TestGetDashboard_AttendanceStatsError valida el manejo de errores cuando GetAttendanceStatistics falla
func TestGetDashboard_AttendanceStatsError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedErr := errors.New("attendance statistics query failed")

	mockRepo := &mocks.DashboardRepositoryMock{
		GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
			return &domain.DashboardSummary{
				BusinessID:   5,
				BusinessName: "Test Business",
			}, nil
		},
		GetVotingStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.VotingStatistics, error) {
			return &domain.VotingStatistics{
				TotalVotings:  10,
				ActiveVotings: 2,
			}, nil
		},
		GetAttendanceStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.AttendanceStatistics, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetDashboard(ctx, 5, false, 1, 10)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

// TestGetDashboardByBusiness_Success valida que GetDashboardByBusiness delega correctamente a GetDashboard
func TestGetDashboardByBusiness_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	businessID := uint(7)

	mockRepo := &mocks.DashboardRepositoryMock{
		GetDashboardSummaryFunc: func(ctx context.Context, bizID uint) (*domain.DashboardSummary, error) {
			if bizID != businessID {
				t.Errorf("expected businessID %d, got %d", businessID, bizID)
			}
			return &domain.DashboardSummary{
				BusinessID:                businessID,
				BusinessName:              "Business 7",
				TotalHorizontalProperties: 3,
				TotalUnits:                30,
				TotalResidents:            75,
			}, nil
		},
		GetVotingStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.VotingStatistics, error) {
			if bizID != businessID {
				t.Errorf("expected businessID %d, got %d", businessID, bizID)
			}
			return &domain.VotingStatistics{
				TotalVotings:  5,
				ActiveVotings: 1,
			}, nil
		},
		GetAttendanceStatisticsFunc: func(ctx context.Context, bizID uint) (*domain.AttendanceStatistics, error) {
			if bizID != businessID {
				t.Errorf("expected businessID %d, got %d", businessID, bizID)
			}
			return &domain.AttendanceStatistics{
				TotalLists:  3,
				ActiveLists: 1,
			}, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetDashboardByBusiness(ctx, businessID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	// Verificar que retorna el dashboard del business específico
	if result.Summary.BusinessID != businessID {
		t.Errorf("expected BusinessID %d, got %d", businessID, result.Summary.BusinessID)
	}

	if result.Summary.BusinessName != "Business 7" {
		t.Errorf("expected BusinessName 'Business 7', got '%s'", result.Summary.BusinessName)
	}

	// Verificar que NO incluye business summaries (porque isSuperAdmin=false en la delegación)
	if result.BusinessSummaries != nil && len(result.BusinessSummaries) > 0 {
		t.Errorf("expected no BusinessSummaries, got %d", len(result.BusinessSummaries))
	}

	if result.Pagination != nil {
		t.Error("expected no Pagination")
	}
}
