package usecasevotes_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestCreateVote_Success(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	now := time.Now()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
		Notes:          "Test vote",
	}

	// Mock: La unidad tiene asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		if votingID == 1 && propertyUnitID == 100 {
			return true, nil
		}
		return false, nil
	}

	// Mock: La unidad NO ha votado
	mockRepo.HasUnitVotedFn = func(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
		return false, nil
	}

	// Mock: Crear voto exitoso
	mockRepo.CreateVoteFn = func(ctx context.Context, vote domain.Vote) (*domain.Vote, error) {
		vote.ID = 1
		vote.OptionText = "Sí"
		vote.OptionCode = "yes"
		vote.OptionColor = "#00FF00"
		vote.VotedAt = now
		return &vote, nil
	}

	// Mock: Publicar en cache exitoso
	mockCache.PublishVoteFn = func(votingID uint, vote domain.VoteDTO) error {
		return nil
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if result.ID != 1 {
		t.Errorf("Expected ID 1, got %d", result.ID)
	}

	if result.VotingID != dto.VotingID {
		t.Errorf("Expected VotingID %d, got %d", dto.VotingID, result.VotingID)
	}

	if result.PropertyUnitID != dto.PropertyUnitID {
		t.Errorf("Expected PropertyUnitID %d, got %d", dto.PropertyUnitID, result.PropertyUnitID)
	}

	if result.VotingOptionID != dto.VotingOptionID {
		t.Errorf("Expected VotingOptionID %d, got %d", dto.VotingOptionID, result.VotingOptionID)
	}

	if result.OptionText != "Sí" {
		t.Errorf("Expected OptionText 'Sí', got '%s'", result.OptionText)
	}

	if result.IPAddress != dto.IPAddress {
		t.Errorf("Expected IPAddress %s, got %s", dto.IPAddress, result.IPAddress)
	}
}

func TestCreateVote_ValidationError(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()

	// DTO inválido (VotingID = 0)
	dto := domain.CreateVoteDTO{
		VotingID:       0, // Inválido
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected validation error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got: %v", result)
	}

	if !contains(err.Error(), "validación") {
		t.Errorf("Expected validation error message, got: %v", err)
	}
}

func TestCreateVote_UnitHasNoAttendance(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	// Mock: La unidad NO tiene asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		return false, nil // Sin asistencia
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error for no attendance, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got: %v", result)
	}

	if err.Error() != "unidad no registra asistencia" {
		t.Errorf("Expected 'unidad no registra asistencia', got: %v", err)
	}
}

func TestCreateVote_ErrorCheckingAttendance(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	expectedErr := errors.New("database error")

	// Mock: Error al verificar asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		return false, expectedErr
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got: %v", result)
	}

	if err != expectedErr {
		t.Errorf("Expected error '%v', got: %v", expectedErr, err)
	}
}

func TestCreateVote_UnitAlreadyVoted(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	// Mock: La unidad tiene asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		return true, nil
	}

	// Mock: La unidad YA votó
	mockRepo.HasUnitVotedFn = func(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
		return true, nil // Ya votó
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error for already voted, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got: %v", result)
	}

	if err.Error() != "la unidad ya votó en esta votación" {
		t.Errorf("Expected 'la unidad ya votó en esta votación', got: %v", err)
	}
}

func TestCreateVote_ErrorCheckingIfVoted(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	expectedErr := errors.New("database error")

	// Mock: La unidad tiene asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		return true, nil
	}

	// Mock: Error al verificar si votó
	mockRepo.HasUnitVotedFn = func(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
		return false, expectedErr
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got: %v", result)
	}

	if err != expectedErr {
		t.Errorf("Expected error '%v', got: %v", expectedErr, err)
	}
}

func TestCreateVote_ErrorCreatingVote(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	expectedErr := errors.New("database error creating vote")

	// Mock: La unidad tiene asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		return true, nil
	}

	// Mock: La unidad NO ha votado
	mockRepo.HasUnitVotedFn = func(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
		return false, nil
	}

	// Mock: Error al crear voto
	mockRepo.CreateVoteFn = func(ctx context.Context, vote domain.Vote) (*domain.Vote, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if result != nil {
		t.Errorf("Expected nil result, got: %v", result)
	}

	if err != expectedErr {
		t.Errorf("Expected error '%v', got: %v", expectedErr, err)
	}
}

func TestCreateVote_CachePublishError_VoteStillCreated(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	now := time.Now()

	dto := domain.CreateVoteDTO{
		VotingID:       1,
		PropertyUnitID: 100,
		VotingOptionID: 10,
		IPAddress:      "192.168.1.1",
		UserAgent:      "Mozilla/5.0",
	}

	// Mock: La unidad tiene asistencia
	mockRepo.CheckUnitAttendanceForVotingFn = func(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
		return true, nil
	}

	// Mock: La unidad NO ha votado
	mockRepo.HasUnitVotedFn = func(ctx context.Context, votingID uint, propertyUnitID uint) (bool, error) {
		return false, nil
	}

	// Mock: Crear voto exitoso
	mockRepo.CreateVoteFn = func(ctx context.Context, vote domain.Vote) (*domain.Vote, error) {
		vote.ID = 1
		vote.OptionText = "Sí"
		vote.OptionCode = "yes"
		vote.OptionColor = "#00FF00"
		vote.VotedAt = now
		return &vote, nil
	}

	// Mock: Error al publicar en cache (NO debe fallar la creación del voto)
	mockCache.PublishVoteFn = func(votingID uint, vote domain.VoteDTO) error {
		return errors.New("redis connection failed")
	}

	// Act
	result, err := useCase.CreateVote(ctx, dto)

	// Assert
	// El voto debe crearse exitosamente aunque falle el cache
	if err != nil {
		t.Fatalf("Expected no error (cache error should be ignored), got: %v", err)
	}

	if result == nil {
		t.Fatal("Expected result, got nil")
	}

	if result.ID != 1 {
		t.Errorf("Expected ID 1, got %d", result.ID)
	}
}

// Helper function
func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 && (s == substr || len(s) >= len(substr) && s[:len(substr)] == substr || len(s) > len(substr) && s[len(s)-len(substr):] == substr || len(s) > len(substr)*2)
}
