package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/traininggroup/internal/app"
	"central_reserve/services/sporttraining/traininggroup/internal/app/test/mocks"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

func TestCreateGroup_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		CreateFunc: func(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
			group.ID = 1
			return group, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	ageMin := 10
	ageMax := 18
	dto := domain.CreateGroupDTO{
		BusinessID:        1,
		CoachID:           100,
		Name:              "Grupo Infantil A",
		Code:              "GI-A",
		Category:          "Infantil",
		Description:       "Grupo para niños de 10 a 18 años",
		MaxCapacity:       20,
		AgeMin:            &ageMin,
		AgeMax:            &ageMax,
		RecurringSchedule: "Lunes y Miércoles 16:00-18:00",
	}

	// Act
	result, err := uc.CreateGroup(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.Name != "Grupo Infantil A" {
		t.Errorf("expected name 'Grupo Infantil A', got '%s'", result.Name)
	}

	if result.Code != "GI-A" {
		t.Errorf("expected code 'GI-A', got '%s'", result.Code)
	}

	if result.MaxCapacity != 20 {
		t.Errorf("expected max capacity 20, got %d", result.MaxCapacity)
	}

	if result.CurrentCapacity != 0 {
		t.Errorf("expected current capacity 0, got %d", result.CurrentCapacity)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	if result.AgeMin == nil || *result.AgeMin != ageMin {
		t.Errorf("expected age min %d, got %v", ageMin, result.AgeMin)
	}

	if result.AgeMax == nil || *result.AgeMax != ageMax {
		t.Errorf("expected age max %d, got %v", ageMax, result.AgeMax)
	}
}

func TestCreateGroup_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGroupRepository{
		CreateFunc: func(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateGroupDTO{
		BusinessID:  1,
		CoachID:     100,
		Name:        "Grupo Test",
		Code:        "GT",
		MaxCapacity: 20,
	}

	// Act
	result, err := uc.CreateGroup(context.Background(), dto)

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
