package handlers

import (
	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/shared/log"
)

type AttendanceHandler struct {
	useCase domain.AttendanceUseCase
	logger  log.ILogger
}

func New(useCase domain.AttendanceUseCase, logger log.ILogger) *AttendanceHandler {
	return &AttendanceHandler{
		useCase: useCase,
		logger:  logger.WithModule("asistencia-handler"),
	}
}
