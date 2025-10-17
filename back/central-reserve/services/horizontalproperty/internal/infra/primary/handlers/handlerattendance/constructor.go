package handlerattendance

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

// Aliases removidos: usamos tipos locales en doc_types.go

// AttendanceHandler - Handler para gestión de asistencia
type AttendanceHandler struct {
	attendanceUseCase domain.AttendanceUseCase
	logger            log.ILogger
}

// NewAttendanceHandler - Constructor del handler de asistencia
func NewAttendanceHandler(
	attendanceUseCase domain.AttendanceUseCase,
	logger log.ILogger,
) *AttendanceHandler {
	return &AttendanceHandler{
		attendanceUseCase: attendanceUseCase,
		logger:            logger,
	}
}
