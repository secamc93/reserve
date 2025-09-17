package domain

import (
	"context"
	"mime/multipart"
)

type IBusinessRepository interface {
	GetBusinesses(ctx context.Context) ([]Business, error)
	GetBusinessByID(ctx context.Context, id uint) (*Business, error)
	GetBusinessByCode(ctx context.Context, code string) (*Business, error)
	GetBusinessByCustomDomain(ctx context.Context, domain string) (*Business, error)
	CreateBusiness(ctx context.Context, business Business) (string, error)
	UpdateBusiness(ctx context.Context, id uint, business Business) (string, error)
	DeleteBusiness(ctx context.Context, id uint) (string, error)
	GetBusinesResourcesConfigured(ctx context.Context, businessID uint) ([]BusinessResourceConfigured, error)
	GetBusinessTypes(ctx context.Context) ([]BusinessType, error)
	GetBusinessTypeByID(ctx context.Context, id uint) (*BusinessType, error)
	GetBusinessTypeByCode(ctx context.Context, code string) (*BusinessType, error)
	CreateBusinessType(ctx context.Context, businessType BusinessType) (string, error)
	UpdateBusinessType(ctx context.Context, id uint, businessType BusinessType) (string, error)
	DeleteBusinessType(ctx context.Context, id uint) (string, error)

	// Métodos para BusinessTypeResourcePermitted
	GetBusinessTypeResourcesPermitted(ctx context.Context, businessTypeID uint) ([]BusinessTypeResourcePermitted, error)
	UpdateBusinessTypeResourcesPermitted(ctx context.Context, businessTypeID uint, resourcesIDs []uint) error
	GetResourceByID(ctx context.Context, resourceID uint) (*Resource, error)
	GetBusinessTypesWithResourcesPaginated(ctx context.Context, page, perPage int, businessTypeID *uint) ([]BusinessTypeWithResourcesResponse, int64, error)

	// Métodos para BusinessResourceConfigured (recursos asignados a un business)
	GetBusinessesWithConfiguredResourcesPaginated(ctx context.Context, page, perPage int, businessID *uint) ([]BusinessWithConfiguredResourcesResponse, int64, error)
	UpdateBusinessConfiguredResources(ctx context.Context, businessID uint, resourcesIDs []uint) error
}

// IS3Service define las operaciones de almacenamiento en S3
type IS3Service interface {
	UploadImage(ctx context.Context, file *multipart.FileHeader, folder string) (string, error) // Retorna path relativo
	GetImageURL(filename string) string                                                         // Genera URL completa
	DeleteImage(ctx context.Context, filename string) error
	ImageExists(ctx context.Context, filename string) (bool, error)
}
