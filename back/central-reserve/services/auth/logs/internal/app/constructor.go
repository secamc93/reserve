package app

import (
	"central_reserve/services/auth/logs/internal/domain"
	"central_reserve/shared/log"
)

type LogsUseCase struct {
	repository domain.ILogsRepository
	log        log.ILogger
}

func New(repository domain.ILogsRepository, log log.ILogger) domain.ILogsUseCase {
	return &LogsUseCase{
		repository: repository,
		log:        log,
	}
}
