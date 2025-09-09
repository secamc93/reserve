package usecasetables

import (
	"central_reserve/services/tables/internal/domain"
	"context"
)

type IUseCaseTable interface {
	CreateTable(ctx context.Context, table domain.Table) (string, error)
	GetTables(ctx context.Context) ([]domain.Table, error)
	GetTableByID(ctx context.Context, id uint) (*domain.Table, error)
	UpdateTable(ctx context.Context, id uint, table domain.Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}

type TableUseCase struct {
	repository domain.ITableRepository
}

func NewTableUseCase(repository domain.ITableRepository) IUseCaseTable {
	return &TableUseCase{
		repository: repository,
	}
}
