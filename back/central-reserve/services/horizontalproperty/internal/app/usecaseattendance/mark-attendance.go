package usecaseattendance

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// MarkAttendance - Marcar asistencia de una unidad
func (uc *AttendanceUseCase) MarkAttendance(ctx context.Context, attendanceListID, propertyUnitID uint, residentID *uint, proxyID *uint, attendedAsOwner, attendedAsProxy bool, signature, signatureMethod string) (*domain.AttendanceRecordDTO, error) {
	uc.logger.Info().
		Uint("attendance_list_id", attendanceListID).
		Uint("property_unit_id", propertyUnitID).
		Bool("attended_as_owner", attendedAsOwner).
		Bool("attended_as_proxy", attendedAsProxy).
		Msg("Marcando asistencia")

	// Si vienen residente/apoderado omitimos y solo marcamos por unidad
	residentID = nil
	proxyID = nil

	// Verificar si ya existe un registro para esta unidad en esta lista
	existingRecord, err := uc.attendanceRepo.GetAttendanceRecordByListAndUnit(ctx, attendanceListID, propertyUnitID)
	if err == nil && existingRecord != nil {
		// Actualizar registro existente
		existingRecord.ResidentID = residentID
		existingRecord.ProxyID = proxyID
		existingRecord.AttendedAsOwner = attendedAsOwner
		existingRecord.AttendedAsProxy = attendedAsProxy
		existingRecord.Signature = signature
		existingRecord.SignatureMethod = signatureMethod
		existingRecord.SignatureDate = &[]time.Time{time.Now()}[0]
		existingRecord.UpdatedAt = time.Now()

		updated, err := uc.attendanceRepo.UpdateAttendanceRecord(ctx, existingRecord.ID, *existingRecord)
		if err != nil {
			uc.logger.Error().Err(err).
				Uint("attendance_list_id", attendanceListID).
				Uint("property_unit_id", propertyUnitID).
				Msg("Error actualizando registro de asistencia")
			return nil, err
		}

		// Mapear a DTO de respuesta
		response := &domain.AttendanceRecordDTO{
			ID:                updated.ID,
			AttendanceListID:  updated.AttendanceListID,
			PropertyUnitID:    updated.PropertyUnitID,
			ResidentID:        updated.ResidentID,
			ProxyID:           updated.ProxyID,
			AttendedAsOwner:   updated.AttendedAsOwner,
			AttendedAsProxy:   updated.AttendedAsProxy,
			Signature:         updated.Signature,
			SignatureDate:     updated.SignatureDate,
			SignatureMethod:   updated.SignatureMethod,
			VerifiedBy:        updated.VerifiedBy,
			VerificationDate:  updated.VerificationDate,
			VerificationNotes: updated.VerificationNotes,
			Notes:             updated.Notes,
			IsValid:           updated.IsValid,
			CreatedAt:         updated.CreatedAt,
			UpdatedAt:         updated.UpdatedAt,
		}

		uc.logger.Info().
			Uint("record_id", updated.ID).
			Uint("attendance_list_id", attendanceListID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Asistencia actualizada exitosamente")

		return response, nil
	}

	// Crear nuevo registro
	record := domain.AttendanceRecord{
		AttendanceListID: attendanceListID,
		PropertyUnitID:   propertyUnitID,
		ResidentID:       residentID,
		ProxyID:          proxyID,
		AttendedAsOwner:  attendedAsOwner,
		AttendedAsProxy:  attendedAsProxy,
		Signature:        signature,
		SignatureMethod:  signatureMethod,
		SignatureDate:    &[]time.Time{time.Now()}[0],
		IsValid:          true,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	created, err := uc.attendanceRepo.CreateAttendanceRecord(ctx, record)
	if err != nil {
		uc.logger.Error().Err(err).
			Uint("attendance_list_id", attendanceListID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error creando registro de asistencia")
		return nil, err
	}

	// Mapear a DTO de respuesta
	response := &domain.AttendanceRecordDTO{
		ID:                created.ID,
		AttendanceListID:  created.AttendanceListID,
		PropertyUnitID:    created.PropertyUnitID,
		ResidentID:        created.ResidentID,
		ProxyID:           created.ProxyID,
		AttendedAsOwner:   created.AttendedAsOwner,
		AttendedAsProxy:   created.AttendedAsProxy,
		Signature:         created.Signature,
		SignatureDate:     created.SignatureDate,
		SignatureMethod:   created.SignatureMethod,
		VerifiedBy:        created.VerifiedBy,
		VerificationDate:  created.VerificationDate,
		VerificationNotes: created.VerificationNotes,
		Notes:             created.Notes,
		IsValid:           created.IsValid,
		CreatedAt:         created.CreatedAt,
		UpdatedAt:         created.UpdatedAt,
	}

	uc.logger.Info().
		Uint("record_id", created.ID).
		Uint("attendance_list_id", attendanceListID).
		Uint("property_unit_id", propertyUnitID).
		Msg("Asistencia marcada exitosamente")

	return response, nil
}
