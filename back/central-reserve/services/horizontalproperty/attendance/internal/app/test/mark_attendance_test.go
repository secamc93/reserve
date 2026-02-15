package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/attendance/internal/app"
	"central_reserve/services/horizontalproperty/attendance/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
)

func TestMarkAttendance_ExistingRecord(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	attendanceListID := uint(1)
	propertyUnitID := uint(200)
	signature := "base64encodedSignature"
	signatureMethod := "digital"

	existingRecord := &domain.AttendanceRecord{
		ID:               10,
		AttendanceListID: attendanceListID,
		PropertyUnitID:   propertyUnitID,
		ResidentID:       nil,
		ProxyID:          nil,
		AttendedAsOwner:  false,
		AttendedAsProxy:  false,
		IsValid:          true,
		CreatedAt:        time.Now().Add(-24 * time.Hour),
		UpdatedAt:        time.Now().Add(-24 * time.Hour),
	}

	updatedRecord := &domain.AttendanceRecord{
		ID:               existingRecord.ID,
		AttendanceListID: attendanceListID,
		PropertyUnitID:   propertyUnitID,
		ResidentID:       nil,
		ProxyID:          nil,
		AttendedAsOwner:  true,
		AttendedAsProxy:  false,
		Signature:        signature,
		SignatureMethod:  signatureMethod,
		SignatureDate:    &[]time.Time{time.Now()}[0],
		IsValid:          true,
		CreatedAt:        existingRecord.CreatedAt,
		UpdatedAt:        time.Now(),
	}

	mockRepo.GetAttendanceRecordByListAndUnitFn = func(ctx context.Context, listID, unitID uint) (*domain.AttendanceRecord, error) {
		return existingRecord, nil
	}

	mockRepo.UpdateAttendanceRecordFn = func(ctx context.Context, id uint, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
		if id != existingRecord.ID {
			t.Errorf("expected ID %d, got %d", existingRecord.ID, id)
		}
		return updatedRecord, nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.MarkAttendance(ctx, attendanceListID, propertyUnitID, nil, nil, true, false, signature, signatureMethod)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != existingRecord.ID {
		t.Errorf("expected ID %d, got %d", existingRecord.ID, result.ID)
	}

	if result.AttendedAsOwner != true {
		t.Errorf("expected AttendedAsOwner to be true, got %v", result.AttendedAsOwner)
	}

	if result.AttendedAsProxy != false {
		t.Errorf("expected AttendedAsProxy to be false, got %v", result.AttendedAsProxy)
	}

	if result.Signature != signature {
		t.Errorf("expected Signature %s, got %s", signature, result.Signature)
	}

	if result.SignatureMethod != signatureMethod {
		t.Errorf("expected SignatureMethod %s, got %s", signatureMethod, result.SignatureMethod)
	}
}

func TestMarkAttendance_NewRecord(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	attendanceListID := uint(1)
	propertyUnitID := uint(200)
	signature := "base64encodedSignature"
	signatureMethod := "digital"

	// No existe registro previo
	mockRepo.GetAttendanceRecordByListAndUnitFn = func(ctx context.Context, listID, unitID uint) (*domain.AttendanceRecord, error) {
		return nil, errors.New("record not found")
	}

	newRecord := &domain.AttendanceRecord{
		ID:               15,
		AttendanceListID: attendanceListID,
		PropertyUnitID:   propertyUnitID,
		ResidentID:       nil,
		ProxyID:          nil,
		AttendedAsOwner:  true,
		AttendedAsProxy:  false,
		Signature:        signature,
		SignatureMethod:  signatureMethod,
		SignatureDate:    &[]time.Time{time.Now()}[0],
		IsValid:          true,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	mockRepo.CreateAttendanceRecordFn = func(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
		if record.AttendanceListID != attendanceListID {
			t.Errorf("expected AttendanceListID %d, got %d", attendanceListID, record.AttendanceListID)
		}
		if record.PropertyUnitID != propertyUnitID {
			t.Errorf("expected PropertyUnitID %d, got %d", propertyUnitID, record.PropertyUnitID)
		}
		return newRecord, nil
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.MarkAttendance(ctx, attendanceListID, propertyUnitID, nil, nil, true, false, signature, signatureMethod)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != newRecord.ID {
		t.Errorf("expected ID %d, got %d", newRecord.ID, result.ID)
	}

	if result.AttendedAsOwner != true {
		t.Errorf("expected AttendedAsOwner to be true, got %v", result.AttendedAsOwner)
	}

	if result.Signature != signature {
		t.Errorf("expected Signature %s, got %s", signature, result.Signature)
	}

	if result.IsValid != true {
		t.Errorf("expected IsValid to be true, got %v", result.IsValid)
	}
}

func TestMarkAttendance_UpdateError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	attendanceListID := uint(1)
	propertyUnitID := uint(200)

	existingRecord := &domain.AttendanceRecord{
		ID:               10,
		AttendanceListID: attendanceListID,
		PropertyUnitID:   propertyUnitID,
		AttendedAsOwner:  false,
		AttendedAsProxy:  false,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	expectedError := errors.New("database update failed")

	mockRepo.GetAttendanceRecordByListAndUnitFn = func(ctx context.Context, listID, unitID uint) (*domain.AttendanceRecord, error) {
		return existingRecord, nil
	}

	mockRepo.UpdateAttendanceRecordFn = func(ctx context.Context, id uint, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.MarkAttendance(ctx, attendanceListID, propertyUnitID, nil, nil, true, false, "signature", "digital")

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error %v, got %v", expectedError, err)
	}
}

func TestMarkAttendance_CreateError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.AttendanceRepositoryMock{}
	mockLogger := mocks.NewMockLogger()

	attendanceListID := uint(1)
	propertyUnitID := uint(200)

	// No existe registro previo
	mockRepo.GetAttendanceRecordByListAndUnitFn = func(ctx context.Context, listID, unitID uint) (*domain.AttendanceRecord, error) {
		return nil, errors.New("record not found")
	}

	expectedError := errors.New("database create failed")

	mockRepo.CreateAttendanceRecordFn = func(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
		return nil, expectedError
	}

	useCase := app.NewAttendanceUseCase(mockRepo, mockLogger)

	// Act
	result, err := useCase.MarkAttendance(ctx, attendanceListID, propertyUnitID, nil, nil, true, false, "signature", "digital")

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error %v, got %v", expectedError, err)
	}
}
