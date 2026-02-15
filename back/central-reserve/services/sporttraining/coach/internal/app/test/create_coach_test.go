package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/coach/internal/app"
	"central_reserve/services/sporttraining/coach/internal/app/test/mocks"
	"central_reserve/services/sporttraining/coach/internal/domain"
)

func TestCreateCoach_Success(t *testing.T) {
	// Arrange
	mockCoachRepo := &mocks.MockCoachRepository{
		CreateFunc: func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
			coach.ID = 1
			return coach, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	yearsExp := 5
	maxSessionsDay := 8
	maxSessionsWeek := 40
	hourlyRate := 50.0
	licenseNum := "LIC-12345"

	dto := domain.CreateCoachDTO{
		BusinessID:         1,
		UserID:             100,
		FirstName:          "Juan",
		LastName:           "Pérez",
		DocumentType:       "CC",
		DocumentNumber:     "123456789",
		Email:              "juan.perez@example.com",
		Phone:              "+57 300 1234567",
		LicenseNumber:      &licenseNum,
		YearsOfExperience:  &yearsExp,
		Biography:          "Entrenador con 5 años de experiencia",
		Certifications:     "Certificación FIFA",
		MaxSessionsPerDay:  &maxSessionsDay,
		MaxSessionsPerWeek: &maxSessionsWeek,
		HourlyRate:         &hourlyRate,
		PhotoURL:           "https://example.com/photo.jpg",
		Notes:              "Disponible lunes a viernes",
	}

	// Act
	result, err := uc.CreateCoach(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.FirstName != "Juan" {
		t.Errorf("expected first name 'Juan', got '%s'", result.FirstName)
	}

	if result.LastName != "Pérez" {
		t.Errorf("expected last name 'Pérez', got '%s'", result.LastName)
	}

	if result.Email != "juan.perez@example.com" {
		t.Errorf("expected email 'juan.perez@example.com', got '%s'", result.Email)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	if !result.IsAvailable {
		t.Error("expected IsAvailable to be true")
	}

	if result.YearsOfExperience == nil || *result.YearsOfExperience != yearsExp {
		t.Errorf("expected years of experience %d, got %v", yearsExp, result.YearsOfExperience)
	}
}

func TestCreateCoach_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockCoachRepo := &mocks.MockCoachRepository{
		CreateFunc: func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockCoachRepo, mockLogger)

	dto := domain.CreateCoachDTO{
		BusinessID:     1,
		UserID:         100,
		FirstName:      "Juan",
		LastName:       "Pérez",
		DocumentType:   "CC",
		DocumentNumber: "123456789",
		Email:          "juan.perez@example.com",
		Phone:          "+57 300 1234567",
	}

	// Act
	result, err := uc.CreateCoach(context.Background(), dto)

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
