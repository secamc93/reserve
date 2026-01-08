package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

// CreateVisit crea una nueva visita
func (uc *visitUseCase) CreateVisit(ctx context.Context, dto domain.CreateVisitDTO) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateVisit")

	// Validaciones básicas
	if dto.VisitorID == 0 {
		return nil, fmt.Errorf("visitor_id es requerido")
	}
	if dto.PropertyUnitID == 0 {
		return nil, fmt.Errorf("property_unit_id es requerido")
	}
	if dto.VisitTypeID == 0 {
		return nil, fmt.Errorf("visit_type_id es requerido")
	}

	// Si business_id es 0 (super admin), obtener el business_id desde la property_unit
	businessID := dto.BusinessID
	if businessID == 0 {
		visitRepo, ok := uc.visitRepo.(*repository.VisitRepository)
		if !ok {
			return nil, fmt.Errorf("repositorio de visitas no es del tipo esperado")
		}
		var err error
		businessID, err = visitRepo.GetPropertyUnitBusinessID(ctx, dto.PropertyUnitID)
		if err != nil {
			return nil, fmt.Errorf("error obteniendo business_id desde unidad de propiedad: %w", err)
		}
	}

	// Validar blacklist usando el business_id correcto
	isBlacklisted, err := uc.ValidateBlacklist(ctx, businessID, dto.VisitorID)
	if err != nil && err != domain.ErrVisitorBlacklisted {
		return nil, err
	}
	if isBlacklisted {
		return nil, domain.ErrVisitorBlacklisted
	}

	// Obtener estado inicial (pending)
	status, err := uc.getVisitStatusByCode(ctx, "pending")
	if err != nil {
		return nil, fmt.Errorf("error obteniendo estado pending: %w", err)
	}

	// Generar código de autorización único
	authCode := generateAuthorizationCode()

	// Generar QR code (simplificado, en producción usar librería de QR)
	qrCode := fmt.Sprintf("VISIT-%s-%d", authCode, time.Now().Unix())

	// Calcular expiración del QR (24 horas por defecto)
	qrExpiresAt := time.Now().Add(24 * time.Hour)

	// Crear entidad de visita usando el business_id correcto
	visit := &domain.Visit{
		BusinessID:         businessID,
		VisitorID:          dto.VisitorID,
		PropertyUnitID:     dto.PropertyUnitID,
		ResidentID:         dto.ResidentID,
		VisitTypeID:        dto.VisitTypeID,
		VisitStatusID:      status.ID,
		VisitorVehicleID:   dto.VisitorVehicleID,
		ScheduledDate:      dto.ScheduledDate,
		ScheduledStartTime: dto.ScheduledStartTime,
		ScheduledEndTime:   dto.ScheduledEndTime,
		AuthorizationCode:  authCode,
		QRCode:             qrCode,
		QRCodeExpiresAt:    &qrExpiresAt,
		Purpose:            dto.Purpose,
		NumberOfVisitors:   dto.NumberOfVisitors,
		HasCompanions:      dto.HasCompanions,
		HasAssets:          dto.HasAssets,
		Notes:              dto.Notes,
		NotifyResident:     dto.NotifyResident,
		NotifySecurity:     dto.NotifySecurity,
	}

	// Crear visita
	created, err := uc.visitRepo.CreateVisit(ctx, visit)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando visita")
		return nil, fmt.Errorf("error creando visita: %w", err)
	}

	uc.logger.Info(ctx).Uint("visit_id", created.ID).Uint("visitor_id", dto.VisitorID).Msg("Visita creada exitosamente")

	return created, nil
}

// generateAuthorizationCode genera un código único de autorización
func generateAuthorizationCode() string {
	return fmt.Sprintf("AUTH-%d", time.Now().UnixNano())
}

// getVisitStatusByCode obtiene un estado de visita por código usando el repositorio
func (uc *visitUseCase) getVisitStatusByCode(ctx context.Context, code string) (*models.VisitStatus, error) {
	visitRepo, ok := uc.visitRepo.(*repository.VisitRepository)
	if !ok {
		return nil, fmt.Errorf("repositorio de visitas no es del tipo esperado")
	}
	return visitRepo.GetVisitStatusByCode(ctx, code)
}
