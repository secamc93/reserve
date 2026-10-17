package app

import (
	"context"
	"fmt"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/attendance/internal/domain"
)

// AssignRecordProxy ver domain.AttendanceUseCase. El apoderado queda solo en este registro (esta
// asamblea): no se copia a las listas de otros grupos de votación.
func (uc *AttendanceUseCase) AssignRecordProxy(ctx context.Context, scopeBusinessID, recordID uint, proxyName, proxyDni string) (*domain.AttendanceRecordDTO, error) {
	proxyName = strings.Join(strings.Fields(proxyName), " ")
	proxyDni = strings.TrimSpace(proxyDni)
	if proxyName == "" {
		return nil, domain.ErrProxyNameRequired
	}
	record, businessID, err := uc.recordInScope(ctx, scopeBusinessID, recordID)
	if err != nil {
		return nil, err
	}

	var proxyID uint
	if record.ProxyID != nil {
		current, err := uc.attendanceRepo.GetProxyByID(ctx, *record.ProxyID)
		if err != nil {
			return nil, err
		}
		current.ProxyName = proxyName
		if proxyDni != "" {
			current.ProxyDni = proxyDni
		}
		updated, err := uc.attendanceRepo.UpdateProxy(ctx, current.ID, *current)
		if err != nil {
			return nil, err
		}
		proxyID = updated.ID
	} else {
		if proxyDni == "" {
			// La columna es obligatoria; si en la asamblea no se anota el documento se deja un
			// identificador interno (mismo criterio que CreateProxy).
			proxyDni = fmt.Sprintf("PX%v", time.Now().UnixNano())
		}
		created, err := uc.attendanceRepo.CreateProxy(ctx, domain.Proxy{
			BusinessID:     businessID,
			PropertyUnitID: record.PropertyUnitID,
			ProxyName:      proxyName,
			ProxyDni:       proxyDni,
			ProxyType:      "external",
			IsActive:       true,
			StartDate:      time.Now(),
		})
		if err != nil {
			return nil, err
		}
		proxyID = created.ID
	}

	updated, err := uc.attendanceRepo.SetAttendanceRecordProxy(ctx, record.ID, &proxyID)
	if err != nil {
		return nil, err
	}
	uc.logger.Info().Uint("record_id", record.ID).Uint("proxy_id", proxyID).Msg("Apoderado asignado al registro de asistencia")
	dto := toRecordDTO(updated)
	dto.ProxyName = proxyName
	return dto, nil
}

// RemoveRecordProxy ver domain.AttendanceUseCase.
func (uc *AttendanceUseCase) RemoveRecordProxy(ctx context.Context, scopeBusinessID, recordID uint) (*domain.AttendanceRecordDTO, error) {
	record, _, err := uc.recordInScope(ctx, scopeBusinessID, recordID)
	if err != nil {
		return nil, err
	}
	updated, err := uc.attendanceRepo.SetAttendanceRecordProxy(ctx, record.ID, nil)
	if err != nil {
		return nil, err
	}
	if record.ProxyID != nil {
		if err := uc.attendanceRepo.DeleteProxy(ctx, *record.ProxyID); err != nil {
			uc.logger.Warn().Err(err).Uint("proxy_id", *record.ProxyID).Msg("No se pudo borrar el apoderado desvinculado")
		}
	}
	return toRecordDTO(updated), nil
}

// recordInScope obtiene el registro y verifica que su lista sea de la propiedad del token.
func (uc *AttendanceUseCase) recordInScope(ctx context.Context, scopeBusinessID, recordID uint) (*domain.AttendanceRecord, uint, error) {
	record, err := uc.attendanceRepo.GetAttendanceRecordByID(ctx, recordID)
	if err != nil || record == nil {
		return nil, 0, domain.ErrAttendanceRecordNotFound
	}
	businessID, err := uc.attendanceRepo.GetAttendanceListBusinessID(ctx, record.AttendanceListID)
	if err != nil {
		return nil, 0, err
	}
	if businessID == 0 || (scopeBusinessID != 0 && scopeBusinessID != businessID) {
		return nil, 0, domain.ErrAttendanceRecordNotFound
	}
	return record, businessID, nil
}

func toRecordDTO(r *domain.AttendanceRecord) *domain.AttendanceRecordDTO {
	return &domain.AttendanceRecordDTO{
		ID:                r.ID,
		AttendanceListID:  r.AttendanceListID,
		PropertyUnitID:    r.PropertyUnitID,
		ResidentID:        r.ResidentID,
		ProxyID:           r.ProxyID,
		AttendedAsOwner:   r.AttendedAsOwner,
		AttendedAsProxy:   r.AttendedAsProxy,
		Signature:         r.Signature,
		SignatureDate:     r.SignatureDate,
		SignatureMethod:   r.SignatureMethod,
		VerifiedBy:        r.VerifiedBy,
		VerificationDate:  r.VerificationDate,
		VerificationNotes: r.VerificationNotes,
		Notes:             r.Notes,
		IsValid:           r.IsValid,
		CreatedAt:         r.CreatedAt,
		UpdatedAt:         r.UpdatedAt,
		ResidentName:      r.ResidentName,
		ProxyName:         r.ProxyName,
		UnitNumber:        r.UnitNumber,
		UnitBlock:         r.UnitBlock,
	}
}
