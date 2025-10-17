package usecaseattendance

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

// AttendanceUseCase - Caso de uso para gestión de asistencia
type AttendanceUseCase struct {
	attendanceRepo domain.AttendanceRepository
	logger         log.ILogger
}

// NewAttendanceUseCase - Constructor del caso de uso de asistencia
func NewAttendanceUseCase(
	attendanceRepo domain.AttendanceRepository,
	logger log.ILogger,
) *AttendanceUseCase {
	return &AttendanceUseCase{
		attendanceRepo: attendanceRepo,
		logger:         logger,
	}
}
