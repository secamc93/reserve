package usecasetables

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/domain/ports"
	"context"
)

type IUseCaseTable interface {
	CreateTable(ctx context.Context, table entities.Table) (string, error)
	GetTables(ctx context.Context) ([]entities.Table, error)
	GetTableByID(ctx context.Context, id uint) (*entities.Table, error)
	UpdateTable(ctx context.Context, id uint, table entities.Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}

type TableUseCase struct {
	repository ports.ITableRepository
}

func NewTableUseCase(repository ports.ITableRepository) IUseCaseTable {
	return &TableUseCase{
		repository: repository,
	}
}
