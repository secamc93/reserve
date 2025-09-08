package domain

import "context"

// IBusinessTypeRepository define las operaciones para tipos de negocio
type IBusinessTypeRepository interface {
	GetBusinessTypes(ctx context.Context) ([]BusinessType, error)
	GetBusinessTypeByID(ctx context.Context, id uint) (*BusinessType, error)
	GetBusinessTypeByCode(ctx context.Context, code string) (*BusinessType, error)
	CreateBusinessType(ctx context.Context, businessType BusinessType) (string, error)
	UpdateBusinessType(ctx context.Context, id uint, businessType BusinessType) (string, error)
	DeleteBusinessType(ctx context.Context, id uint) (string, error)
}

// IBusinessRepository define las operaciones para negocios
type IBusinessRepository interface {
	GetBusinesses(ctx context.Context) ([]Business, error)
	GetBusinessByID(ctx context.Context, id uint) (*Business, error)
	GetBusinessByCode(ctx context.Context, code string) (*Business, error)
	GetBusinessByCustomDomain(ctx context.Context, domain string) (*Business, error)
	CreateBusiness(ctx context.Context, business Business) (string, error)
	UpdateBusiness(ctx context.Context, id uint, business Business) (string, error)
	DeleteBusiness(ctx context.Context, id uint) (string, error)
	GetBusinesResourcesConfigured(ctx context.Context, businessID uint) ([]BusinessResourceConfigured, error)
}
