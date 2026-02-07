package domain

import "context"

// ============================================================================
// ATTENDANCE INTERFACES - Interfaces para gestión de asistencia
// ============================================================================

// AttendanceRepository - Repositorio para gestión de asistencia
type AttendanceRepository interface {
	// Attendance Lists
	CreateAttendanceList(ctx context.Context, attendanceList AttendanceList) (*AttendanceList, error)
	GetAttendanceListByID(ctx context.Context, id uint) (*AttendanceList, error)
	GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*AttendanceList, error)
	ListAttendanceListsPaged(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (lists []AttendanceList, total int64, err error)
	UpdateAttendanceList(ctx context.Context, id uint, attendanceList AttendanceList) (*AttendanceList, error)
	DeleteAttendanceList(ctx context.Context, id uint) error

	// Proxies
	CreateProxy(ctx context.Context, proxy Proxy) (*Proxy, error)
	GetProxyByID(ctx context.Context, id uint) (*Proxy, error)
	GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]Proxy, error)
	GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]Proxy, error)
	ListProxiesPaged(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (proxies []Proxy, total int64, err error)
	UpdateProxy(ctx context.Context, id uint, proxy Proxy) (*Proxy, error)
	DeleteProxy(ctx context.Context, id uint) error

	// Attendance Records
	CreateAttendanceRecord(ctx context.Context, record AttendanceRecord) (*AttendanceRecord, error)
	GetAttendanceRecordByID(ctx context.Context, id uint) (*AttendanceRecord, error)
	GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (records []AttendanceRecord, total int64, err error)
	GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*AttendanceRecord, error)
	UpdateAttendanceRecord(ctx context.Context, id uint, record AttendanceRecord) (*AttendanceRecord, error)
	UpdateAttendanceRecordSimple(ctx context.Context, id uint, attendedAsOwner, attendedAsProxy bool) (*AttendanceRecord, error)
	UpdateAttendanceRecordsByPropertyUnit(ctx context.Context, propertyUnitID uint, proxyID *uint) error
	DeleteAttendanceRecord(ctx context.Context, id uint) error

	// Bulk operations
	CreateAttendanceRecordsInBatch(ctx context.Context, records []AttendanceRecord) error
	GenerateAttendanceListForVotingGroup(ctx context.Context, votingGroupID uint) ([]AttendanceRecord, error)
	DeleteAttendanceRecordsByList(ctx context.Context, attendanceListID uint) error
	GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*AttendanceSummaryDTO, error)
	GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error)
}

// AttendanceUseCase - Caso de uso para gestión de asistencia
type AttendanceUseCase interface {
	// Attendance Lists
	CreateAttendanceList(ctx context.Context, dto CreateAttendanceListDTO) (*AttendanceListDTO, error)
	GetAttendanceListByID(ctx context.Context, id uint) (*AttendanceListDTO, error)
	GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*AttendanceListDTO, error)
	ListAttendanceListsPaged(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (*PaginatedAttendanceListsDTO, error)
	UpdateAttendanceList(ctx context.Context, id uint, dto UpdateAttendanceListDTO) (*AttendanceListDTO, error)
	DeleteAttendanceList(ctx context.Context, id uint) error
	GenerateAttendanceList(ctx context.Context, votingGroupID uint) (*AttendanceListDTO, error)

	// Proxies
	CreateProxy(ctx context.Context, dto CreateProxyDTO) (*ProxyDTO, error)
	GetProxyByID(ctx context.Context, id uint) (*ProxyDTO, error)
	GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]ProxyDTO, error)
	GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]ProxyDTO, error)
	ListProxiesPaged(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (*PaginatedProxiesDTO, error)
	UpdateProxy(ctx context.Context, id uint, dto UpdateProxyDTO) (*ProxyDTO, error)
	DeleteProxy(ctx context.Context, id uint) error

	// Attendance Records
	CreateAttendanceRecord(ctx context.Context, dto CreateAttendanceRecordDTO) (*AttendanceRecordDTO, error)
	GetAttendanceRecordByID(ctx context.Context, id uint) (*AttendanceRecordDTO, error)
	GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (*PaginatedAttendanceRecordsDTO, error)
	GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*AttendanceRecordDTO, error)
	UpdateAttendanceRecord(ctx context.Context, id uint, dto UpdateAttendanceRecordDTO) (*AttendanceRecordDTO, error)
	DeleteAttendanceRecord(ctx context.Context, id uint) error

	// Special operations
	MarkAttendance(ctx context.Context, attendanceListID, propertyUnitID uint, residentID *uint, proxyID *uint, attendedAsOwner, attendedAsProxy bool, signature, signatureMethod string) (*AttendanceRecordDTO, error)
	MarkAttendanceSimple(ctx context.Context, recordID uint, attended bool) (*AttendanceRecordDTO, error)
	VerifyAttendance(ctx context.Context, recordID uint, verifiedBy uint, verificationNotes string) (*AttendanceRecordDTO, error)
	GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*AttendanceSummaryDTO, error)
	GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error)
}
