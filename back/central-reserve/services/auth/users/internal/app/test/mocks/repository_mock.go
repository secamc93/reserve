package mocks

import (
	"central_reserve/services/auth/users/internal/domain"
	"context"
)

// MockRepository implementa domain.IUserRepository: cada método llama a su Func si existe y,
// si no, devuelve valores cero.
type MockRepository struct {
	GetUserByEmailFunc                func(ctx context.Context, email string) (*domain.UserAuthInfo, error)
	GetUserByIDFunc                   func(ctx context.Context, userID uint) (*domain.UserAuthInfo, error)
	GetUsersFunc                      func(ctx context.Context, filters domain.UserFilters) ([]domain.UserQueryDTO, int64, error)
	CreateUserFunc                    func(ctx context.Context, user domain.UsersEntity) (uint, error)
	UpdateUserFunc                    func(ctx context.Context, id uint, user domain.UsersEntity) (string, error)
	DeleteUserFunc                    func(ctx context.Context, id uint) (string, error)
	GetUserBusinessesFunc             func(ctx context.Context, userID uint) ([]domain.BusinessInfoEntity, error)
	AssignBusinessesToUserFunc        func(ctx context.Context, userID uint, businessIDs []uint) error
	GetUserRolesFunc                  func(ctx context.Context, userID uint) ([]domain.Role, error)
	GetUserRoleByBusinessFunc         func(ctx context.Context, userID uint, businessID uint) (*domain.Role, error)
	GetRoleByIDFunc                   func(ctx context.Context, roleID uint) (*domain.Role, error)
	GetBusinessStaffRelationshipsFunc func(ctx context.Context, userID uint) ([]domain.BusinessRoleAssignmentDetailed, error)
	AssignRoleToUserBusinessFunc      func(ctx context.Context, userID uint, assignments []domain.BusinessRoleAssignment) error
	GetPlatformRoleIDFunc             func(ctx context.Context) (uint, error)
	SetPlatformRoleFunc               func(ctx context.Context, userID uint, roleID uint, enabled bool) error
}

func (m *MockRepository) GetUserByEmail(ctx context.Context, email string) (*domain.UserAuthInfo, error) {
	if m.GetUserByEmailFunc != nil {
		return m.GetUserByEmailFunc(ctx, email)
	}
	return nil, nil
}

func (m *MockRepository) GetUserByID(ctx context.Context, userID uint) (*domain.UserAuthInfo, error) {
	if m.GetUserByIDFunc != nil {
		return m.GetUserByIDFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRepository) GetUsers(ctx context.Context, filters domain.UserFilters) ([]domain.UserQueryDTO, int64, error) {
	if m.GetUsersFunc != nil {
		return m.GetUsersFunc(ctx, filters)
	}
	return nil, 0, nil
}

func (m *MockRepository) CreateUser(ctx context.Context, user domain.UsersEntity) (uint, error) {
	if m.CreateUserFunc != nil {
		return m.CreateUserFunc(ctx, user)
	}
	return 0, nil
}

func (m *MockRepository) UpdateUser(ctx context.Context, id uint, user domain.UsersEntity) (string, error) {
	if m.UpdateUserFunc != nil {
		return m.UpdateUserFunc(ctx, id, user)
	}
	return "", nil
}

func (m *MockRepository) DeleteUser(ctx context.Context, id uint) (string, error) {
	if m.DeleteUserFunc != nil {
		return m.DeleteUserFunc(ctx, id)
	}
	return "", nil
}

func (m *MockRepository) GetUserBusinesses(ctx context.Context, userID uint) ([]domain.BusinessInfoEntity, error) {
	if m.GetUserBusinessesFunc != nil {
		return m.GetUserBusinessesFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRepository) AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error {
	if m.AssignBusinessesToUserFunc != nil {
		return m.AssignBusinessesToUserFunc(ctx, userID, businessIDs)
	}
	return nil
}

func (m *MockRepository) GetUserRoles(ctx context.Context, userID uint) ([]domain.Role, error) {
	if m.GetUserRolesFunc != nil {
		return m.GetUserRolesFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRepository) GetUserRoleByBusiness(ctx context.Context, userID uint, businessID uint) (*domain.Role, error) {
	if m.GetUserRoleByBusinessFunc != nil {
		return m.GetUserRoleByBusinessFunc(ctx, userID, businessID)
	}
	return nil, nil
}

func (m *MockRepository) GetRoleByID(ctx context.Context, roleID uint) (*domain.Role, error) {
	if m.GetRoleByIDFunc != nil {
		return m.GetRoleByIDFunc(ctx, roleID)
	}
	return nil, nil
}

func (m *MockRepository) GetBusinessStaffRelationships(ctx context.Context, userID uint) ([]domain.BusinessRoleAssignmentDetailed, error) {
	if m.GetBusinessStaffRelationshipsFunc != nil {
		return m.GetBusinessStaffRelationshipsFunc(ctx, userID)
	}
	return nil, nil
}

func (m *MockRepository) AssignRoleToUserBusiness(ctx context.Context, userID uint, assignments []domain.BusinessRoleAssignment) error {
	if m.AssignRoleToUserBusinessFunc != nil {
		return m.AssignRoleToUserBusinessFunc(ctx, userID, assignments)
	}
	return nil
}

func (m *MockRepository) GetPlatformRoleID(ctx context.Context) (uint, error) {
	if m.GetPlatformRoleIDFunc != nil {
		return m.GetPlatformRoleIDFunc(ctx)
	}
	return 0, nil
}

func (m *MockRepository) SetPlatformRole(ctx context.Context, userID uint, roleID uint, enabled bool) error {
	if m.SetPlatformRoleFunc != nil {
		return m.SetPlatformRoleFunc(ctx, userID, roleID, enabled)
	}
	return nil
}
