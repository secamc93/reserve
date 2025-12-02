package domain

import (
	sharedjwt "central_reserve/shared/jwt"
	"context"
)

// IRepository define las operaciones del repositorio que usan los casos de uso de login
type IRepository interface {
	// Usuario y autenticación
	GetUserByEmail(ctx context.Context, email string) (*UserAuthInfo, error)
	GetUserByID(ctx context.Context, id uint) (*UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]Role, error)
	GetUserBusinesses(ctx context.Context, userID uint) ([]BusinessInfoEntity, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
	ChangePassword(ctx context.Context, userID uint, newPassword string) error

	// Roles, permisos y configuración de recursos
	GetRoleByID(ctx context.Context, roleID uint) (*Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]Permission, error)
	GetBusinessConfiguredResourcesIDs(ctx context.Context, businessID uint) ([]uint, error)
	GetBusinessStaffRelation(ctx context.Context, userID uint, businessID *uint) (*BusinessStaffRelation, error)

	// Business
	GetBusinessByID(ctx context.Context, businessID uint) (*BusinessInfo, error)
	GetUserRoleByBusiness(ctx context.Context, userID uint, businessID uint) (*Role, error)
}

type IJWTService interface {
	GenerateToken(userID uint) (string, error)
	ValidateToken(tokenString string) (*sharedjwt.JWTClaims, error)
	RefreshToken(tokenString string) (string, error)

	GenerateBusinessToken(userID, businessID, businessTypeID, roleID uint) (string, error)
	ValidateBusinessToken(tokenString string) (*sharedjwt.BusinessTokenClaims, error)

	GeneratePublicVotingToken(votingID, votingGroupID, hpID uint, durationHours int) (string, error)
	GenerateVotingAuthToken(residentID, propertyUnitID, votingID, votingGroupID, hpID uint) (string, error)
	ValidatePublicVotingToken(tokenString string) (*sharedjwt.PublicVotingClaims, error)
	ValidateVotingAuthToken(tokenString string) (*sharedjwt.VotingAuthClaims, error)
}
