package repository

import (
	"central_reserve/services/auth/dashboard/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(database db.IDatabase, logger log.ILogger) domain.IDashboardRepository {
	return &Repository{
		database: database,
		logger:   logger,
	}
}

