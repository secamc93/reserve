package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/coach/internal/app"
	"central_reserve/services/sporttraining/coach/internal/app/test/mocks"
	"central_reserve/services/sporttraining/coach/internal/domain"
)

func TestAssignSpecialty_Success(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		AssignSpecialtyFunc: func(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
			return nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.AssignSpecialtyDTO{
		CoachID:          1,
		SpecialtyID:      10,
		ProficiencyLevel: 4,
	}

	// Act
	err := uc.AssignSpecialty(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAssignSpecialty_InvalidProficiencyLevel_Zero(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.AssignSpecialtyDTO{
		CoachID:          1,
		SpecialtyID:      10,
		ProficiencyLevel: 0, // Inválido
	}

	// Act
	err := uc.AssignSpecialty(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid proficiency level, got nil")
	}

	if !errors.Is(err, domain.ErrInvalidProficiencyLevel) {
		t.Errorf("expected ErrInvalidProficiencyLevel, got %v", err)
	}
}

func TestAssignSpecialty_InvalidProficiencyLevel_TooHigh(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.AssignSpecialtyDTO{
		CoachID:          1,
		SpecialtyID:      10,
		ProficiencyLevel: 6, // Inválido (máximo es 5)
	}

	// Act
	err := uc.AssignSpecialty(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid proficiency level, got nil")
	}

	if !errors.Is(err, domain.ErrInvalidProficiencyLevel) {
		t.Errorf("expected ErrInvalidProficiencyLevel, got %v", err)
	}
}

func TestAssignSpecialty_InvalidProficiencyLevel_Negative(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.AssignSpecialtyDTO{
		CoachID:          1,
		SpecialtyID:      10,
		ProficiencyLevel: -2, // Inválido
	}

	// Act
	err := uc.AssignSpecialty(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid proficiency level, got nil")
	}

	if !errors.Is(err, domain.ErrInvalidProficiencyLevel) {
		t.Errorf("expected ErrInvalidProficiencyLevel, got %v", err)
	}
}

func TestAssignSpecialty_ValidProficiencyLevels(t *testing.T) {
	// Arrange
	tests := []struct {
		name             string
		proficiencyLevel int
	}{
		{"Level 1", 1},
		{"Level 2", 2},
		{"Level 3", 3},
		{"Level 4", 4},
		{"Level 5", 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCoachRepo := &mocks.MockCoachRepository{
				AssignSpecialtyFunc: func(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
					return nil
				},
			}
			mockLogger := mocks.NewMockLogger()

			uc := app.New(mockCoachRepo, mockLogger)

			dto := domain.AssignSpecialtyDTO{
				CoachID:          1,
				SpecialtyID:      10,
				ProficiencyLevel: tt.proficiencyLevel,
			}

			// Act
			err := uc.AssignSpecialty(context.Background(), dto)

			// Assert
			if err != nil {
				t.Errorf("expected no error for level %d, got %v", tt.proficiencyLevel, err)
			}
		})
	}
}

func TestAssignSpecialty_AlreadyAssigned(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		AssignSpecialtyFunc: func(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
			return domain.ErrSpecialtyAlreadyAssigned
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.AssignSpecialtyDTO{
		CoachID:          1,
		SpecialtyID:      10,
		ProficiencyLevel: 3,
	}

	// Act
	err := uc.AssignSpecialty(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for already assigned specialty, got nil")
	}

	if !errors.Is(err, domain.ErrSpecialtyAlreadyAssigned) {
		t.Errorf("expected ErrSpecialtyAlreadyAssigned, got %v", err)
	}
}

func TestAssignSpecialty_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database insert error")

	mockCoachRepo := &mocks.MockCoachRepository{
		AssignSpecialtyFunc: func(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
			return expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.AssignSpecialtyDTO{
		CoachID:          1,
		SpecialtyID:      10,
		ProficiencyLevel: 4,
	}

	// Act
	err := uc.AssignSpecialty(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
