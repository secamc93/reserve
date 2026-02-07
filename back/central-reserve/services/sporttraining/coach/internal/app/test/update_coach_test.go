package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/coach/internal/app"
	"central_reserve/services/sporttraining/coach/internal/app/test/mocks"
	"central_reserve/services/sporttraining/coach/internal/domain"
)

func TestUpdateCoach_Success(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		UpdateFunc: func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
			return coach, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	yearsExp := 7
	maxSessionsDay := 10
	maxSessionsWeek := 50
	hourlyRate := 60.0
	licenseNum := "LIC-67890"

	dto := domain.UpdateCoachDTO{
		ID:                 1,
		BusinessID:         1,
		FirstName:          "Juan Carlos",
		LastName:           "Pérez García",
		DocumentType:       "CC",
		DocumentNumber:     "123456789",
		Email:              "juancarlos.perez@example.com",
		Phone:              "+57 300 9876543",
		LicenseNumber:      &licenseNum,
		YearsOfExperience:  &yearsExp,
		Biography:          "Entrenador senior con 7 años de experiencia",
		Certifications:     "Certificación FIFA, UEFA Pro",
		IsAvailable:        true,
		MaxSessionsPerDay:  &maxSessionsDay,
		MaxSessionsPerWeek: &maxSessionsWeek,
		HourlyRate:         &hourlyRate,
		PhotoURL:           "https://example.com/photo-updated.jpg",
		Notes:              "Disponible todos los días",
		IsActive:           true,
	}

	// Act
	result, err := uc.UpdateCoach(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected coach, got nil")
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.FirstName != "Juan Carlos" {
		t.Errorf("expected first name 'Juan Carlos', got '%s'", result.FirstName)
	}

	if result.Email != "juancarlos.perez@example.com" {
		t.Errorf("expected email 'juancarlos.perez@example.com', got '%s'", result.Email)
	}

	if result.YearsOfExperience == nil || *result.YearsOfExperience != yearsExp {
		t.Errorf("expected years of experience %d, got %v", yearsExp, result.YearsOfExperience)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestUpdateCoach_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database update error")

	mockCoachRepo := &mocks.MockCoachRepository{
		UpdateFunc: func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.UpdateCoachDTO{
		ID:             1,
		BusinessID:     1,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "123456789",
		Email:          "juan.perez@example.com",
		Phone:          "+57 300 1234567",
		IsAvailable:    true,
		IsActive:       true,
	}

	// Act
	result, err := uc.UpdateCoach(context.Background(), dto)

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

func TestUpdateCoach_NotFound(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		UpdateFunc: func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
			return nil, domain.ErrCoachNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.UpdateCoachDTO{
		ID:             999,
		BusinessID:     1,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "123456789",
		Email:          "juan.perez@example.com",
		Phone:          "+57 300 1234567",
		IsAvailable:    true,
		IsActive:       true,
	}

	// Act
	result, err := uc.UpdateCoach(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrCoachNotFound) {
		t.Errorf("expected ErrCoachNotFound, got %v", err)
	}
}
