package usecases

import (
	"context"
	"reserve/testing/modules/visit/internal/application"
	"reserve/testing/modules/visit/internal/domain"
)

// VisitorUseCases encapsula los casos de uso relacionados con visitantes
type VisitorUseCases struct {
	visitAPI domain.VisitAPIPort
}

// NewVisitorUseCases crea una nueva instancia de VisitorUseCases
func NewVisitorUseCases(visitAPI domain.VisitAPIPort) *VisitorUseCases {
	return &VisitorUseCases{
		visitAPI: visitAPI,
	}
}

// CreateVisitor crea un nuevo visitante
func (uc *VisitorUseCases) CreateVisitor(ctx context.Context, dto application.CreateVisitorDTO) (*domain.Visitor, error) {
	visitor := domain.Visitor{
		DNI:      dto.DNI,
		FullName: dto.FullName,
		Phone:    dto.Phone,
		Email:    dto.Email,
	}

	return uc.visitAPI.CreateVisitor(ctx, visitor)
}

// SearchVisitorByDNI busca un visitante por su DNI
func (uc *VisitorUseCases) SearchVisitorByDNI(ctx context.Context, dni string) (*domain.Visitor, error) {
	if dni == "" {
		return nil, domain.ErrInvalidDNI
	}

	return uc.visitAPI.SearchVisitorByDNI(ctx, dni)
}
