package usecases

import (
	"context"
	"reserve/testing/modules/visit/internal/domain"
)

// CatalogUseCases encapsula los casos de uso relacionados con catálogos
type CatalogUseCases struct {
	visitAPI domain.VisitAPIPort
}

// NewCatalogUseCases crea una nueva instancia de CatalogUseCases
func NewCatalogUseCases(visitAPI domain.VisitAPIPort) *CatalogUseCases {
	return &CatalogUseCases{
		visitAPI: visitAPI,
	}
}

// ListVisitTypes lista todos los tipos de visita
func (uc *CatalogUseCases) ListVisitTypes(ctx context.Context) ([]domain.VisitType, error) {
	return uc.visitAPI.ListVisitTypes(ctx)
}

// ListVisitStatuses lista todos los estados de visita
func (uc *CatalogUseCases) ListVisitStatuses(ctx context.Context) ([]domain.VisitStatus, error) {
	return uc.visitAPI.ListVisitStatuses(ctx)
}
