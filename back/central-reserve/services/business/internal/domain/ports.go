package domain

import (
	"context"
	"mime/multipart"
)

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

// IS3Service define las operaciones de almacenamiento en S3
type IS3Service interface {
	UploadImage(ctx context.Context, file *multipart.FileHeader, folder string) (string, error) // Retorna path relativo
	GetImageURL(filename string) string                                                         // Genera URL completa
	DeleteImage(ctx context.Context, filename string) error
	ImageExists(ctx context.Context, filename string) (bool, error)
}
