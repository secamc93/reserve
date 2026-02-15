package domain

import "context"

// AttendanceRepository - Puerto para repositorio de asistencia
type AttendanceRepository interface {
	Create(ctx context.Context, record *AttendanceRecord) (*AttendanceRecord, error)
	ListBySession(ctx context.Context, filters AttendanceFiltersDTO) (*PaginatedAttendanceDTO, error)
	ListByPlayer(ctx context.Context, filters AttendanceFiltersDTO) (*PaginatedAttendanceDTO, error)
}

// AttendanceUseCase - Puerto para casos de uso de asistencia
type AttendanceUseCase interface {
	RecordAttendance(ctx context.Context, dto CreateAttendanceDTO) (*AttendanceRecord, error)
	ListBySession(ctx context.Context, filters AttendanceFiltersDTO) (*PaginatedAttendanceDTO, error)
	ListByPlayer(ctx context.Context, filters AttendanceFiltersDTO) (*PaginatedAttendanceDTO, error)
}
