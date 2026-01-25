package usecases

import (
	"context"
	"reserve/testing/modules/visit/internal/domain"
)

// DatabaseUseCases encapsula los casos de uso de consultas directas a BD
type DatabaseUseCases struct {
	dbPort domain.DatabasePort
}

// NewDatabaseUseCases crea una nueva instancia de DatabaseUseCases
func NewDatabaseUseCases(dbPort domain.DatabasePort) *DatabaseUseCases {
	return &DatabaseUseCases{
		dbPort: dbPort,
	}
}

// ListVisitorsFromDB lista visitantes desde la BD
func (uc *DatabaseUseCases) ListVisitorsFromDB(ctx context.Context) ([]domain.Visitor, error) {
	return uc.dbPort.ListVisitorsFromDB(ctx)
}

// ListVisitsFromDB lista visitas desde la BD
func (uc *DatabaseUseCases) ListVisitsFromDB(ctx context.Context, businessID uint) ([]domain.Visit, error) {
	if businessID == 0 {
		return nil, domain.ErrBusinessNotFound
	}

	return uc.dbPort.ListVisitsFromDB(ctx, businessID)
}

// GetVisitStatistics obtiene estadísticas de visitas
func (uc *DatabaseUseCases) GetVisitStatistics(ctx context.Context, businessID uint) (*domain.VisitStatistics, error) {
	if businessID == 0 {
		return nil, domain.ErrBusinessNotFound
	}

	return uc.dbPort.GetVisitStatistics(ctx, businessID)
}

// ExecuteCustomQuery ejecuta una consulta SQL personalizada
func (uc *DatabaseUseCases) ExecuteCustomQuery(ctx context.Context, query string) ([]map[string]any, error) {
	return uc.dbPort.ExecuteCustomQuery(ctx, query)
}

// CheckConnection verifica la conexión a la BD
func (uc *DatabaseUseCases) CheckConnection(ctx context.Context) (*domain.DBConnectionStats, error) {
	return uc.dbPort.CheckConnection(ctx)
}
