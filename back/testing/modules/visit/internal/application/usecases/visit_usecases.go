package usecases

import (
	"context"
	"reserve/testing/modules/visit/internal/application"
	"reserve/testing/modules/visit/internal/domain"
)

// VisitUseCases encapsula los casos de uso relacionados con visitas
type VisitUseCases struct {
	visitAPI domain.VisitAPIPort
}

// NewVisitUseCases crea una nueva instancia de VisitUseCases
func NewVisitUseCases(visitAPI domain.VisitAPIPort) *VisitUseCases {
	return &VisitUseCases{
		visitAPI: visitAPI,
	}
}

// CreateVisit crea una nueva visita
func (uc *VisitUseCases) CreateVisit(ctx context.Context, dto application.CreateVisitDTO) (*domain.Visit, error) {
	visit := domain.Visit{
		VisitorID:          dto.VisitorID,
		PropertyUnitID:     dto.PropertyUnitID,
		VisitTypeID:        dto.VisitTypeID,
		ScheduledDate:      dto.ScheduledDate,
		ScheduledStartTime: dto.ScheduledStartTime,
		Purpose:            dto.Purpose,
		NumberOfVisitors:   dto.NumberOfVisitors,
		NotifyResident:     dto.NotifyResident,
		NotifySecurity:     dto.NotifySecurity,
	}

	return uc.visitAPI.CreateVisit(ctx, visit)
}

// UpdateVisit actualiza una visita existente
func (uc *VisitUseCases) UpdateVisit(ctx context.Context, visitID uint, dto application.UpdateVisitDTO) (*domain.Visit, error) {
	if visitID == 0 {
		return nil, domain.ErrInvalidVisitData
	}

	visit := domain.Visit{
		VisitorID:          dto.VisitorID,
		PropertyUnitID:     dto.PropertyUnitID,
		VisitTypeID:        dto.VisitTypeID,
		ScheduledDate:      dto.ScheduledDate,
		ScheduledStartTime: dto.ScheduledStartTime,
		Purpose:            dto.Purpose,
		NumberOfVisitors:   dto.NumberOfVisitors,
		NotifyResident:     dto.NotifyResident,
		NotifySecurity:     dto.NotifySecurity,
	}

	return uc.visitAPI.UpdateVisit(ctx, visitID, visit)
}

// DeleteVisit elimina una visita
func (uc *VisitUseCases) DeleteVisit(ctx context.Context, visitID uint) error {
	if visitID == 0 {
		return domain.ErrInvalidVisitData
	}

	return uc.visitAPI.DeleteVisit(ctx, visitID)
}

// ListVisits lista todas las visitas
func (uc *VisitUseCases) ListVisits(ctx context.Context) ([]domain.Visit, error) {
	return uc.visitAPI.ListVisits(ctx)
}

// GetVisitByID obtiene una visita por su ID
func (uc *VisitUseCases) GetVisitByID(ctx context.Context, visitID uint) (*domain.Visit, error) {
	if visitID == 0 {
		return nil, domain.ErrInvalidVisitData
	}

	return uc.visitAPI.GetVisitByID(ctx, visitID)
}

// GetVisitByQR obtiene una visita por su código QR
func (uc *VisitUseCases) GetVisitByQR(ctx context.Context, qrCode string) (*domain.Visit, error) {
	if qrCode == "" {
		return nil, domain.ErrInvalidVisitData
	}

	return uc.visitAPI.GetVisitByQR(ctx, qrCode)
}

// RegisterEntry registra la entrada de una visita
func (uc *VisitUseCases) RegisterEntry(ctx context.Context, dto application.EntryRequestDTO) error {
	if dto.VisitID == 0 {
		return domain.ErrInvalidVisitData
	}

	request := domain.EntryRequest{
		Gate:   dto.Gate,
		Method: dto.Method,
	}

	return uc.visitAPI.RegisterEntry(ctx, dto.VisitID, request)
}

// RegisterExit registra la salida de una visita
func (uc *VisitUseCases) RegisterExit(ctx context.Context, dto application.ExitRequestDTO) error {
	if dto.VisitID == 0 {
		return domain.ErrInvalidVisitData
	}

	request := domain.ExitRequest{
		Gate: dto.Gate,
	}

	return uc.visitAPI.RegisterExit(ctx, dto.VisitID, request)
}

// ListCompanions lista los acompañantes de una visita
func (uc *VisitUseCases) ListCompanions(ctx context.Context, visitID uint) ([]domain.Companion, error) {
	if visitID == 0 {
		return nil, domain.ErrInvalidVisitData
	}

	return uc.visitAPI.ListCompanions(ctx, visitID)
}

// CreateCompanion crea un acompañante para una visita
func (uc *VisitUseCases) CreateCompanion(ctx context.Context, visitID uint, dto application.CreateCompanionDTO) (*domain.Companion, error) {
	if visitID == 0 {
		return nil, domain.ErrInvalidVisitData
	}

	companion := domain.Companion{
		DNI:      dto.DNI,
		FullName: dto.FullName,
	}

	return uc.visitAPI.CreateCompanion(ctx, visitID, companion)
}

// DeleteCompanion elimina un acompañante de una visita
func (uc *VisitUseCases) DeleteCompanion(ctx context.Context, visitID uint, companionID uint) error {
	if visitID == 0 || companionID == 0 {
		return domain.ErrInvalidVisitData
	}

	return uc.visitAPI.DeleteCompanion(ctx, visitID, companionID)
}

// RegisterAssets registra activos para una visita
func (uc *VisitUseCases) RegisterAssets(ctx context.Context, visitID uint, dto application.RegisterAssetDTO) (*domain.Asset, error) {
	if visitID == 0 {
		return nil, domain.ErrInvalidVisitData
	}

	asset := domain.Asset{
		Description: dto.Description,
		Serial:      dto.Serial,
		Brand:       dto.Brand,
	}

	return uc.visitAPI.RegisterAssets(ctx, visitID, asset)
}
