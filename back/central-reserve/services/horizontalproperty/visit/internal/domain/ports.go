package domain

import "context"

// VisitorRepository - Puerto para repositorio de visitantes
type VisitorRepository interface {
	FindByDNI(ctx context.Context, businessID *uint, dni string) (*Visitor, error)
	CreateOrGetVisitor(ctx context.Context, businessID *uint, dni string, name string, phone string) (*Visitor, error)
	CreateVisitor(ctx context.Context, visitor *Visitor) (*Visitor, error)
	GetVisitorByID(ctx context.Context, id uint) (*Visitor, error)
	UpdateVisitor(ctx context.Context, visitor *Visitor) (*Visitor, error)
}

// VisitRepository - Puerto para repositorio de visitas
type VisitRepository interface {
	CreateVisit(ctx context.Context, visit *Visit) (*Visit, error)
	GetVisitByID(ctx context.Context, id uint) (*Visit, error)
	GetVisitByQRCode(ctx context.Context, qrCode string) (*Visit, error)
	GetVisitByAuthorizationCode(ctx context.Context, authCode string) (*Visit, error)
	UpdateVisit(ctx context.Context, visit *Visit) error
	ListVisits(ctx context.Context, filters VisitFiltersDTO) (*PaginatedVisitsDTO, error)
	GetActiveVisits(ctx context.Context, businessID uint) ([]*Visit, error)
}

// VisitCompanionRepository - Puerto para repositorio de acompañantes
type VisitCompanionRepository interface {
	CreateCompanion(ctx context.Context, companion *VisitCompanion) (*VisitCompanion, error)
	GetCompanionsByVisitID(ctx context.Context, visitID uint) ([]*VisitCompanion, error)
	UpdateCompanion(ctx context.Context, companion *VisitCompanion) error
	DeleteCompanion(ctx context.Context, id uint) error
}

// VisitAssetRepository - Puerto para repositorio de activos
type VisitAssetRepository interface {
	CreateAsset(ctx context.Context, asset *VisitAsset) (*VisitAsset, error)
	GetAssetsByVisitID(ctx context.Context, visitID uint) ([]*VisitAsset, error)
	UpdateAsset(ctx context.Context, asset *VisitAsset) error
	DeleteAsset(ctx context.Context, id uint) error
	GetPendingExitAssets(ctx context.Context, visitID uint) ([]*VisitAsset, error)
}

// VisitBlacklistRepository - Puerto para repositorio de lista negra
type VisitBlacklistRepository interface {
	CreateBlacklistEntry(ctx context.Context, entry *VisitBlacklist) (*VisitBlacklist, error)
	GetBlacklistEntry(ctx context.Context, businessID uint, visitorID uint) (*VisitBlacklist, error)
	IsVisitorBlacklisted(ctx context.Context, businessID uint, visitorID uint) (bool, error)
	UnblockVisitor(ctx context.Context, businessID uint, visitorID uint, unblockedByUserID uint, reason string) error
	ListBlacklist(ctx context.Context, businessID uint) ([]*VisitBlacklist, error)
}

// VisitUseCase - Puerto para casos de uso de visitas
type VisitUseCase interface {
	SearchVisitor(ctx context.Context, businessID uint, dni string) (*Visitor, error)
	CreateOrGetVisitor(ctx context.Context, businessID *uint, dni string, name string, phone string) (*Visitor, error)
	CreateVisit(ctx context.Context, dto CreateVisitDTO) (*Visit, error)
	ListVisits(ctx context.Context, filters VisitFiltersDTO) (*PaginatedVisitsDTO, error)
	RegisterEntry(ctx context.Context, visitID uint, userID uint, gate string, method string) (*Visit, error)
	RegisterExit(ctx context.Context, visitID uint, userID uint, gate string) (*Visit, error)
	GetVisitByQRCode(ctx context.Context, qrCode string) (*Visit, error)
	ValidateBlacklist(ctx context.Context, businessID uint, visitorID uint) (bool, error)
	RegisterAssets(ctx context.Context, visitID uint, assets []CreateVisitAssetDTO) error
}
