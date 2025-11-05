package usecaseattendance

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"context"
	"fmt"
	"time"
)

// Placeholder methods - Implementar según necesidades

func (uc *AttendanceUseCase) GetAttendanceListByID(ctx context.Context, id uint) (*domain.AttendanceListDTO, error) {
	// TODO: Implementar
	return nil, nil
}

func (uc *AttendanceUseCase) GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*domain.AttendanceListDTO, error) {
	// TODO: Implementar
	return nil, nil
}

func (uc *AttendanceUseCase) ListAttendanceLists(ctx context.Context, businessID uint, filters map[string]interface{}) ([]domain.AttendanceListDTO, error) {
	lists, err := uc.attendanceRepo.ListAttendanceLists(ctx, businessID, filters)
	if err != nil {
		return nil, err
	}
	res := make([]domain.AttendanceListDTO, len(lists))
	for i, l := range lists {
		res[i] = domain.AttendanceListDTO{
			ID:              l.ID,
			VotingGroupID:   l.VotingGroupID,
			Title:           l.Title,
			Description:     l.Description,
			IsActive:        l.IsActive,
			CreatedByUserID: l.CreatedByUserID,
			Notes:           l.Notes,
			CreatedAt:       l.CreatedAt,
			UpdatedAt:       l.UpdatedAt,
		}
	}
	return res, nil
}

func (uc *AttendanceUseCase) UpdateAttendanceList(ctx context.Context, id uint, dto domain.UpdateAttendanceListDTO) (*domain.AttendanceListDTO, error) {
	// TODO: Implementar
	return nil, nil
}

func (uc *AttendanceUseCase) DeleteAttendanceList(ctx context.Context, id uint) error {
	return uc.attendanceRepo.DeleteAttendanceList(ctx, id)
}

func (uc *AttendanceUseCase) GetProxyByID(ctx context.Context, id uint) (*domain.ProxyDTO, error) {
	p, err := uc.attendanceRepo.GetProxyByID(ctx, id)
	if err != nil || p == nil {
		return nil, err
	}
	dto := &domain.ProxyDTO{
		ID:              p.ID,
		BusinessID:      p.BusinessID,
		PropertyUnitID:  p.PropertyUnitID,
		ProxyName:       p.ProxyName,
		ProxyDni:        p.ProxyDni,
		ProxyEmail:      p.ProxyEmail,
		ProxyPhone:      p.ProxyPhone,
		ProxyAddress:    p.ProxyAddress,
		ProxyType:       p.ProxyType,
		IsActive:        p.IsActive,
		StartDate:       p.StartDate,
		EndDate:         p.EndDate,
		PowerOfAttorney: p.PowerOfAttorney,
		Notes:           p.Notes,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}
	return dto, nil
}

func (uc *AttendanceUseCase) GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]domain.ProxyDTO, error) {
	proxies, err := uc.attendanceRepo.GetProxiesByPropertyUnit(ctx, propertyUnitID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.ProxyDTO, len(proxies))
	for i, p := range proxies {
		res[i] = domain.ProxyDTO{
			ID:              p.ID,
			BusinessID:      p.BusinessID,
			PropertyUnitID:  p.PropertyUnitID,
			ProxyName:       p.ProxyName,
			ProxyDni:        p.ProxyDni,
			ProxyEmail:      p.ProxyEmail,
			ProxyPhone:      p.ProxyPhone,
			ProxyAddress:    p.ProxyAddress,
			ProxyType:       p.ProxyType,
			IsActive:        p.IsActive,
			StartDate:       p.StartDate,
			EndDate:         p.EndDate,
			PowerOfAttorney: p.PowerOfAttorney,
			Notes:           p.Notes,
			CreatedAt:       p.CreatedAt,
			UpdatedAt:       p.UpdatedAt,
		}
	}
	return res, nil
}

func (uc *AttendanceUseCase) GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]domain.ProxyDTO, error) {
	proxies, err := uc.attendanceRepo.GetActiveProxiesByPropertyUnit(ctx, propertyUnitID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.ProxyDTO, len(proxies))
	for i, p := range proxies {
		res[i] = domain.ProxyDTO{
			ID:              p.ID,
			BusinessID:      p.BusinessID,
			PropertyUnitID:  p.PropertyUnitID,
			ProxyName:       p.ProxyName,
			ProxyDni:        p.ProxyDni,
			ProxyEmail:      p.ProxyEmail,
			ProxyPhone:      p.ProxyPhone,
			ProxyAddress:    p.ProxyAddress,
			ProxyType:       p.ProxyType,
			IsActive:        p.IsActive,
			StartDate:       p.StartDate,
			EndDate:         p.EndDate,
			PowerOfAttorney: p.PowerOfAttorney,
			Notes:           p.Notes,
			CreatedAt:       p.CreatedAt,
			UpdatedAt:       p.UpdatedAt,
		}
	}
	return res, nil
}

func (uc *AttendanceUseCase) ListProxies(ctx context.Context, businessID uint, filters map[string]interface{}) ([]domain.ProxyDTO, error) {
	proxies, err := uc.attendanceRepo.ListProxies(ctx, businessID, filters)
	if err != nil {
		return nil, err
	}
	res := make([]domain.ProxyDTO, len(proxies))
	for i, p := range proxies {
		res[i] = domain.ProxyDTO{
			ID:              p.ID,
			BusinessID:      p.BusinessID,
			PropertyUnitID:  p.PropertyUnitID,
			ProxyName:       p.ProxyName,
			ProxyDni:        p.ProxyDni,
			ProxyEmail:      p.ProxyEmail,
			ProxyPhone:      p.ProxyPhone,
			ProxyAddress:    p.ProxyAddress,
			ProxyType:       p.ProxyType,
			IsActive:        p.IsActive,
			StartDate:       p.StartDate,
			EndDate:         p.EndDate,
			PowerOfAttorney: p.PowerOfAttorney,
			Notes:           p.Notes,
			CreatedAt:       p.CreatedAt,
			UpdatedAt:       p.UpdatedAt,
		}
	}
	return res, nil
}

func (uc *AttendanceUseCase) UpdateProxy(ctx context.Context, id uint, dto domain.UpdateProxyDTO) (*domain.ProxyDTO, error) {
	p := domain.Proxy{
		ProxyName:       dto.ProxyName,
		ProxyDni:        dto.ProxyDni,
		ProxyEmail:      dto.ProxyEmail,
		ProxyPhone:      dto.ProxyPhone,
		ProxyAddress:    dto.ProxyAddress,
		ProxyType:       dto.ProxyType,
		IsActive:        getBoolOrDefault(dto.IsActive, true),
		StartDate:       getTimeOrDefault(dto.StartDate),
		EndDate:         dto.EndDate,
		PowerOfAttorney: dto.PowerOfAttorney,
		Notes:           dto.Notes,
	}
	updated, err := uc.attendanceRepo.UpdateProxy(ctx, id, p)
	if err != nil {
		return nil, err
	}
	res := &domain.ProxyDTO{
		ID:              updated.ID,
		BusinessID:      updated.BusinessID,
		PropertyUnitID:  updated.PropertyUnitID,
		ProxyName:       updated.ProxyName,
		ProxyDni:        updated.ProxyDni,
		ProxyEmail:      updated.ProxyEmail,
		ProxyPhone:      updated.ProxyPhone,
		ProxyAddress:    updated.ProxyAddress,
		ProxyType:       updated.ProxyType,
		IsActive:        updated.IsActive,
		StartDate:       updated.StartDate,
		EndDate:         updated.EndDate,
		PowerOfAttorney: updated.PowerOfAttorney,
		Notes:           updated.Notes,
		CreatedAt:       updated.CreatedAt,
		UpdatedAt:       updated.UpdatedAt,
	}
	return res, nil
}

func (uc *AttendanceUseCase) DeleteProxy(ctx context.Context, id uint) error {
	// Primero obtener el apoderado para saber qué unidad de propiedad actualizar
	proxy, err := uc.attendanceRepo.GetProxyByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("proxy_id", id).Msg("Error obteniendo apoderado para eliminar")
		return err
	}
	if proxy == nil {
		uc.logger.Warn().Uint("proxy_id", id).Msg("Apoderado no encontrado para eliminar")
		return fmt.Errorf("apoderado no encontrado")
	}

	// Eliminar la relación en los registros de asistencia (establecer proxy_id a NULL)
	if err := uc.attendanceRepo.UpdateAttendanceRecordsByPropertyUnit(ctx, proxy.PropertyUnitID, nil); err != nil {
		uc.logger.Error().Err(err).
			Uint("proxy_id", id).
			Uint("property_unit_id", proxy.PropertyUnitID).
			Msg("Error eliminando relación de apoderado en registros de asistencia")
		// Continuamos con la eliminación del apoderado aunque falle la actualización
	}

	// Eliminar el apoderado
	if err := uc.attendanceRepo.DeleteProxy(ctx, id); err != nil {
		uc.logger.Error().Err(err).Uint("proxy_id", id).Msg("Error eliminando apoderado")
		return err
	}

	uc.logger.Info().
		Uint("proxy_id", id).
		Uint("property_unit_id", proxy.PropertyUnitID).
		Str("proxy_name", proxy.ProxyName).
		Msg("Apoderado eliminado exitosamente")

	return nil
}

func (uc *AttendanceUseCase) CreateAttendanceRecord(ctx context.Context, dto domain.CreateAttendanceRecordDTO) (*domain.AttendanceRecordDTO, error) {
	// TODO: Implementar
	return nil, nil
}

func (uc *AttendanceUseCase) GetAttendanceRecordByID(ctx context.Context, id uint) (*domain.AttendanceRecordDTO, error) {
	record, err := uc.attendanceRepo.GetAttendanceRecordByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if record == nil {
		return nil, nil
	}

	// Convertir a DTO
	dto := &domain.AttendanceRecordDTO{
		ID:                record.ID,
		AttendanceListID:  record.AttendanceListID,
		PropertyUnitID:    record.PropertyUnitID,
		ResidentID:        record.ResidentID,
		ProxyID:           record.ProxyID,
		AttendedAsOwner:   record.AttendedAsOwner,
		AttendedAsProxy:   record.AttendedAsProxy,
		Signature:         record.Signature,
		SignatureDate:     record.SignatureDate,
		SignatureMethod:   record.SignatureMethod,
		VerifiedBy:        record.VerifiedBy,
		VerificationDate:  record.VerificationDate,
		VerificationNotes: record.VerificationNotes,
		Notes:             record.Notes,
		IsValid:           record.IsValid,
		CreatedAt:         record.CreatedAt,
		UpdatedAt:         record.UpdatedAt,
		ResidentName:      record.ResidentName,
		ProxyName:         record.ProxyName,
		UnitNumber:        record.UnitNumber,
	}
	return dto, nil
}

func (uc *AttendanceUseCase) GetAttendanceRecordsByList(ctx context.Context, attendanceListID uint) ([]domain.AttendanceRecordDTO, error) {
	records, err := uc.attendanceRepo.GetAttendanceRecordsByList(ctx, attendanceListID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.AttendanceRecordDTO, len(records))
	for i, r := range records {
		res[i] = domain.AttendanceRecordDTO{
			ID:                       r.ID,
			AttendanceListID:         r.AttendanceListID,
			PropertyUnitID:           r.PropertyUnitID,
			ResidentID:               r.ResidentID,
			ProxyID:                  r.ProxyID,
			AttendedAsOwner:          r.AttendedAsOwner,
			AttendedAsProxy:          r.AttendedAsProxy,
			Signature:                r.Signature,
			SignatureDate:            r.SignatureDate,
			SignatureMethod:          r.SignatureMethod,
			VerifiedBy:               r.VerifiedBy,
			VerificationDate:         r.VerificationDate,
			VerificationNotes:        r.VerificationNotes,
			Notes:                    r.Notes,
			IsValid:                  r.IsValid,
			CreatedAt:                r.CreatedAt,
			UpdatedAt:                r.UpdatedAt,
			ResidentName:             r.ResidentName,
			ProxyName:                r.ProxyName,
			UnitNumber:               r.UnitNumber,
			ParticipationCoefficient: r.ParticipationCoefficient,
		}
	}
	return res, nil
}

func (uc *AttendanceUseCase) GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (*domain.PaginatedAttendanceRecordsDTO, error) {
	records, total, err := uc.attendanceRepo.GetAttendanceRecordsByListPaged(ctx, attendanceListID, unitNumber, attended, page, pageSize)
	if err != nil {
		return nil, err
	}
	out := make([]domain.AttendanceRecordDTO, len(records))
	for i, r := range records {
		out[i] = domain.AttendanceRecordDTO{
			ID:                       r.ID,
			AttendanceListID:         r.AttendanceListID,
			PropertyUnitID:           r.PropertyUnitID,
			ResidentID:               r.ResidentID,
			ProxyID:                  r.ProxyID,
			AttendedAsOwner:          r.AttendedAsOwner,
			AttendedAsProxy:          r.AttendedAsProxy,
			Signature:                r.Signature,
			SignatureDate:            r.SignatureDate,
			SignatureMethod:          r.SignatureMethod,
			VerifiedBy:               r.VerifiedBy,
			VerificationDate:         r.VerificationDate,
			VerificationNotes:        r.VerificationNotes,
			Notes:                    r.Notes,
			IsValid:                  r.IsValid,
			CreatedAt:                r.CreatedAt,
			UpdatedAt:                r.UpdatedAt,
			ResidentName:             r.ResidentName,
			ProxyName:                r.ProxyName,
			UnitNumber:               r.UnitNumber,
			ParticipationCoefficient: r.ParticipationCoefficient,
		}
	}
	totalPages := 0
	if pageSize > 0 {
		totalPages = int((total + int64(pageSize) - 1) / int64(pageSize))
	}
	return &domain.PaginatedAttendanceRecordsDTO{
		Data:       out,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (uc *AttendanceUseCase) GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*domain.AttendanceRecordDTO, error) {
	r, err := uc.attendanceRepo.GetAttendanceRecordByListAndUnit(ctx, attendanceListID, propertyUnitID)
	if err != nil || r == nil {
		return nil, err
	}
	dto := &domain.AttendanceRecordDTO{
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
	}
	return dto, nil
}

func (uc *AttendanceUseCase) UpdateAttendanceRecord(ctx context.Context, id uint, dto domain.UpdateAttendanceRecordDTO) (*domain.AttendanceRecordDTO, error) {
	// TODO: Implementar
	return nil, nil
}

func (uc *AttendanceUseCase) DeleteAttendanceRecord(ctx context.Context, id uint) error {
	// TODO: Implementar
	return nil
}

func (uc *AttendanceUseCase) VerifyAttendance(ctx context.Context, recordID uint, verifiedBy uint, verificationNotes string) (*domain.AttendanceRecordDTO, error) {
	// TODO: Implementar
	return nil, nil
}

func (uc *AttendanceUseCase) GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*domain.AttendanceSummaryDTO, error) {
	return uc.attendanceRepo.GetAttendanceSummary(ctx, attendanceListID)
}

// helpers
func getBoolOrDefault(v *bool, def bool) bool {
	if v == nil {
		return def
	}
	return *v
}
func getTimeOrDefault(v *time.Time) time.Time {
	if v == nil {
		return time.Time{}
	}
	return *v
}

// MarkAttendanceSimple - marca/desmarca asistencia de forma simple
func (uc *AttendanceUseCase) MarkAttendanceSimple(ctx context.Context, recordID uint, attended bool) (*domain.AttendanceRecordDTO, error) {
	uc.logger.Info().
		Uint("record_id", recordID).
		Bool("attended", attended).
		Msg("Iniciando MarkAttendanceSimple")

	// Actualizar directamente en BD usando el método simple
	uc.logger.Info().
		Uint("record_id", recordID).
		Msg("Llamando a UpdateAttendanceRecordSimple")

	updated, err := uc.attendanceRepo.UpdateAttendanceRecordSimple(ctx, recordID, attended, false)
	if err != nil {
		uc.logger.Error().
			Err(err).
			Uint("record_id", recordID).
			Msg("Error en UpdateAttendanceRecordSimple")
		return nil, err
	}

	uc.logger.Info().
		Uint("record_id", recordID).
		Uint("updated_id", updated.ID).
		Bool("attended_as_owner", updated.AttendedAsOwner).
		Msg("UpdateAttendanceRecordSimple exitoso")

	// Convertir a DTO
	dto := &domain.AttendanceRecordDTO{
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
		ResidentName:      updated.ResidentName,
		ProxyName:         updated.ProxyName,
		UnitNumber:        updated.UnitNumber,
	}
	return dto, nil
}

// DebugGetAttendanceRecordByID - método de debug para obtener registro directamente
func (uc *AttendanceUseCase) DebugGetAttendanceRecordByID(ctx context.Context, id uint) (*domain.AttendanceRecord, error) {
	return uc.attendanceRepo.GetAttendanceRecordByID(ctx, id)
}

// passthrough
func (uc *AttendanceUseCase) GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error) {
	return uc.attendanceRepo.GetVotingGroupTitleByListID(ctx, attendanceListID)
}
