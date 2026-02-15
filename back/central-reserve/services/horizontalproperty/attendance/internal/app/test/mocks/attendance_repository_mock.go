package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/attendance/internal/domain"
)

// AttendanceRepositoryMock - Mock del repositorio de asistencia
type AttendanceRepositoryMock struct {
	// Attendance Lists
	CreateAttendanceListFn         func(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error)
	GetAttendanceListByIDFn        func(ctx context.Context, id uint) (*domain.AttendanceList, error)
	GetAttendanceListByVotingGroupFn func(ctx context.Context, votingGroupID uint) (*domain.AttendanceList, error)
	ListAttendanceListsPagedFn     func(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (lists []domain.AttendanceList, total int64, err error)
	UpdateAttendanceListFn         func(ctx context.Context, id uint, attendanceList domain.AttendanceList) (*domain.AttendanceList, error)
	DeleteAttendanceListFn         func(ctx context.Context, id uint) error

	// Proxies
	CreateProxyFn                   func(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error)
	GetProxyByIDFn                  func(ctx context.Context, id uint) (*domain.Proxy, error)
	GetProxiesByPropertyUnitFn      func(ctx context.Context, propertyUnitID uint) ([]domain.Proxy, error)
	GetActiveProxiesByPropertyUnitFn func(ctx context.Context, propertyUnitID uint) ([]domain.Proxy, error)
	ListProxiesPagedFn              func(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (proxies []domain.Proxy, total int64, err error)
	UpdateProxyFn                   func(ctx context.Context, id uint, proxy domain.Proxy) (*domain.Proxy, error)
	DeleteProxyFn                   func(ctx context.Context, id uint) error

	// Attendance Records
	CreateAttendanceRecordFn              func(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error)
	GetAttendanceRecordByIDFn             func(ctx context.Context, id uint) (*domain.AttendanceRecord, error)
	GetAttendanceRecordsByListPagedFn     func(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (records []domain.AttendanceRecord, total int64, err error)
	GetAttendanceRecordByListAndUnitFn    func(ctx context.Context, attendanceListID, propertyUnitID uint) (*domain.AttendanceRecord, error)
	UpdateAttendanceRecordFn              func(ctx context.Context, id uint, record domain.AttendanceRecord) (*domain.AttendanceRecord, error)
	UpdateAttendanceRecordSimpleFn        func(ctx context.Context, id uint, attendedAsOwner, attendedAsProxy bool) (*domain.AttendanceRecord, error)
	UpdateAttendanceRecordsByPropertyUnitFn func(ctx context.Context, propertyUnitID uint, proxyID *uint) error
	DeleteAttendanceRecordFn              func(ctx context.Context, id uint) error

	// Bulk operations
	CreateAttendanceRecordsInBatchFn      func(ctx context.Context, records []domain.AttendanceRecord) error
	GenerateAttendanceListForVotingGroupFn func(ctx context.Context, votingGroupID uint) ([]domain.AttendanceRecord, error)
	DeleteAttendanceRecordsByListFn       func(ctx context.Context, attendanceListID uint) error
	GetAttendanceSummaryFn                func(ctx context.Context, attendanceListID uint) (*domain.AttendanceSummaryDTO, error)
	GetVotingGroupTitleByListIDFn         func(ctx context.Context, attendanceListID uint) (string, error)
}

// Attendance Lists
func (m *AttendanceRepositoryMock) CreateAttendanceList(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
	if m.CreateAttendanceListFn != nil {
		return m.CreateAttendanceListFn(ctx, attendanceList)
	}
	return &attendanceList, nil
}

func (m *AttendanceRepositoryMock) GetAttendanceListByID(ctx context.Context, id uint) (*domain.AttendanceList, error) {
	if m.GetAttendanceListByIDFn != nil {
		return m.GetAttendanceListByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*domain.AttendanceList, error) {
	if m.GetAttendanceListByVotingGroupFn != nil {
		return m.GetAttendanceListByVotingGroupFn(ctx, votingGroupID)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) ListAttendanceListsPaged(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (lists []domain.AttendanceList, total int64, err error) {
	if m.ListAttendanceListsPagedFn != nil {
		return m.ListAttendanceListsPagedFn(ctx, businessID, filters, page, pageSize)
	}
	return nil, 0, nil
}

func (m *AttendanceRepositoryMock) UpdateAttendanceList(ctx context.Context, id uint, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
	if m.UpdateAttendanceListFn != nil {
		return m.UpdateAttendanceListFn(ctx, id, attendanceList)
	}
	return &attendanceList, nil
}

func (m *AttendanceRepositoryMock) DeleteAttendanceList(ctx context.Context, id uint) error {
	if m.DeleteAttendanceListFn != nil {
		return m.DeleteAttendanceListFn(ctx, id)
	}
	return nil
}

// Proxies
func (m *AttendanceRepositoryMock) CreateProxy(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error) {
	if m.CreateProxyFn != nil {
		return m.CreateProxyFn(ctx, proxy)
	}
	return &proxy, nil
}

func (m *AttendanceRepositoryMock) GetProxyByID(ctx context.Context, id uint) (*domain.Proxy, error) {
	if m.GetProxyByIDFn != nil {
		return m.GetProxyByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]domain.Proxy, error) {
	if m.GetProxiesByPropertyUnitFn != nil {
		return m.GetProxiesByPropertyUnitFn(ctx, propertyUnitID)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]domain.Proxy, error) {
	if m.GetActiveProxiesByPropertyUnitFn != nil {
		return m.GetActiveProxiesByPropertyUnitFn(ctx, propertyUnitID)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) ListProxiesPaged(ctx context.Context, businessID uint, filters map[string]interface{}, page, pageSize int) (proxies []domain.Proxy, total int64, err error) {
	if m.ListProxiesPagedFn != nil {
		return m.ListProxiesPagedFn(ctx, businessID, filters, page, pageSize)
	}
	return nil, 0, nil
}

func (m *AttendanceRepositoryMock) UpdateProxy(ctx context.Context, id uint, proxy domain.Proxy) (*domain.Proxy, error) {
	if m.UpdateProxyFn != nil {
		return m.UpdateProxyFn(ctx, id, proxy)
	}
	return &proxy, nil
}

func (m *AttendanceRepositoryMock) DeleteProxy(ctx context.Context, id uint) error {
	if m.DeleteProxyFn != nil {
		return m.DeleteProxyFn(ctx, id)
	}
	return nil
}

// Attendance Records
func (m *AttendanceRepositoryMock) CreateAttendanceRecord(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	if m.CreateAttendanceRecordFn != nil {
		return m.CreateAttendanceRecordFn(ctx, record)
	}
	return &record, nil
}

func (m *AttendanceRepositoryMock) GetAttendanceRecordByID(ctx context.Context, id uint) (*domain.AttendanceRecord, error) {
	if m.GetAttendanceRecordByIDFn != nil {
		return m.GetAttendanceRecordByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) (records []domain.AttendanceRecord, total int64, err error) {
	if m.GetAttendanceRecordsByListPagedFn != nil {
		return m.GetAttendanceRecordsByListPagedFn(ctx, attendanceListID, unitNumber, attended, page, pageSize)
	}
	return nil, 0, nil
}

func (m *AttendanceRepositoryMock) GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*domain.AttendanceRecord, error) {
	if m.GetAttendanceRecordByListAndUnitFn != nil {
		return m.GetAttendanceRecordByListAndUnitFn(ctx, attendanceListID, propertyUnitID)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) UpdateAttendanceRecord(ctx context.Context, id uint, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	if m.UpdateAttendanceRecordFn != nil {
		return m.UpdateAttendanceRecordFn(ctx, id, record)
	}
	return &record, nil
}

func (m *AttendanceRepositoryMock) UpdateAttendanceRecordSimple(ctx context.Context, id uint, attendedAsOwner, attendedAsProxy bool) (*domain.AttendanceRecord, error) {
	if m.UpdateAttendanceRecordSimpleFn != nil {
		return m.UpdateAttendanceRecordSimpleFn(ctx, id, attendedAsOwner, attendedAsProxy)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) UpdateAttendanceRecordsByPropertyUnit(ctx context.Context, propertyUnitID uint, proxyID *uint) error {
	if m.UpdateAttendanceRecordsByPropertyUnitFn != nil {
		return m.UpdateAttendanceRecordsByPropertyUnitFn(ctx, propertyUnitID, proxyID)
	}
	return nil
}

func (m *AttendanceRepositoryMock) DeleteAttendanceRecord(ctx context.Context, id uint) error {
	if m.DeleteAttendanceRecordFn != nil {
		return m.DeleteAttendanceRecordFn(ctx, id)
	}
	return nil
}

// Bulk operations
func (m *AttendanceRepositoryMock) CreateAttendanceRecordsInBatch(ctx context.Context, records []domain.AttendanceRecord) error {
	if m.CreateAttendanceRecordsInBatchFn != nil {
		return m.CreateAttendanceRecordsInBatchFn(ctx, records)
	}
	return nil
}

func (m *AttendanceRepositoryMock) GenerateAttendanceListForVotingGroup(ctx context.Context, votingGroupID uint) ([]domain.AttendanceRecord, error) {
	if m.GenerateAttendanceListForVotingGroupFn != nil {
		return m.GenerateAttendanceListForVotingGroupFn(ctx, votingGroupID)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) DeleteAttendanceRecordsByList(ctx context.Context, attendanceListID uint) error {
	if m.DeleteAttendanceRecordsByListFn != nil {
		return m.DeleteAttendanceRecordsByListFn(ctx, attendanceListID)
	}
	return nil
}

func (m *AttendanceRepositoryMock) GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*domain.AttendanceSummaryDTO, error) {
	if m.GetAttendanceSummaryFn != nil {
		return m.GetAttendanceSummaryFn(ctx, attendanceListID)
	}
	return nil, nil
}

func (m *AttendanceRepositoryMock) GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error) {
	if m.GetVotingGroupTitleByListIDFn != nil {
		return m.GetVotingGroupTitleByListIDFn(ctx, attendanceListID)
	}
	return "", nil
}
