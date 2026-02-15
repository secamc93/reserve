package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/traininggroup/internal/app"
	"central_reserve/services/sporttraining/traininggroup/internal/app/test/mocks"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

func TestUpdateGroup_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		UpdateFunc: func(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
			return group, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	ageMin := 12
	ageMax := 20
	dto := domain.UpdateGroupDTO{
		ID:                1,
		BusinessID:        1,
		CoachID:           100,
		Name:              "Grupo Juvenil B - Actualizado",
		Code:              "GJ-B",
		Category:          "Juvenil",
		Description:       "Grupo actualizado",
		MaxCapacity:       25,
		AgeMin:            &ageMin,
		AgeMax:            &ageMax,
		RecurringSchedule: "Martes y Jueves 18:00-20:00",
		IsActive:          true,
	}

	// Act
	result, err := uc.UpdateGroup(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.Name != "Grupo Juvenil B - Actualizado" {
		t.Errorf("expected updated name, got '%s'", result.Name)
	}

	if result.MaxCapacity != 25 {
		t.Errorf("expected max capacity 25, got %d", result.MaxCapacity)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestUpdateGroup_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database update error")

	mockRepo := &mocks.MockGroupRepository{
		UpdateFunc: func(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.UpdateGroupDTO{
		ID:          1,
		BusinessID:  1,
		CoachID:     100,
		Name:        "Test",
		Code:        "T",
		MaxCapacity: 10,
		IsActive:    true,
	}

	// Act
	result, err := uc.UpdateGroup(context.Background(), dto)

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
