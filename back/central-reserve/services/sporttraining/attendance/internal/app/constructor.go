package app

import (
	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/shared/log"
)

type attendanceUseCase struct {
	repo   domain.AttendanceRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de asistencia
func New(repo domain.AttendanceRepository, logger log.ILogger) domain.AttendanceUseCase {
	return &attendanceUseCase{
		repo:   repo,
		logger: logger.WithModule("asistencia"),
	}
}
