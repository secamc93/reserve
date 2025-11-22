package repository

import (
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

// Repository implementa el repositorio consolidado
type Repository struct {
	db     db.IDatabase
	logger log.ILogger
}

// New crea una nueva instancia del repositorio
func New(db db.IDatabase, logger log.ILogger) *Repository {
	return &Repository{
		db:     db,
		logger: logger,
	}
}
