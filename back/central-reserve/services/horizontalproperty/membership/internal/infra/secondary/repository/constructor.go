package repository

import (
	"central_reserve/services/horizontalproperty/membership/internal/domain/ports"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

type repository struct {
	db     db.IDatabase
	logger log.ILogger
}

// New crea el repositorio de membresías.
func New(database db.IDatabase, logger log.ILogger) ports.IRepository {
	return &repository{db: database, logger: logger}
}
