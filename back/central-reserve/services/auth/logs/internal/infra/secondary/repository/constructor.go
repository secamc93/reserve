package repository

import (
	"central_reserve/services/auth/logs/internal/domain"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
)

type Repository struct {
	env    env.IConfig
	logger log.ILogger
}

func New(env env.IConfig, logger log.ILogger) domain.ILogsRepository {
	return &Repository{
		env:    env,
		logger: logger,
	}
}
