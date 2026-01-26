package domain

import "context"

// VisitAPIPort define el contrato para interactuar con la API de visitas
type VisitAPIPort interface {
	// Visitantes
	CreateVisitor(ctx context.Context, visitor Visitor) (*Visitor, error)
	SearchVisitorByDNI(ctx context.Context, dni string) (*Visitor, error)

	// Visitas
	CreateVisit(ctx context.Context, visit Visit) (*Visit, error)
	UpdateVisit(ctx context.Context, visitID uint, visit Visit) (*Visit, error)
	DeleteVisit(ctx context.Context, visitID uint) error
	ListVisits(ctx context.Context) ([]Visit, error)
	GetVisitByID(ctx context.Context, visitID uint) (*Visit, error)
	GetVisitByQR(ctx context.Context, qrCode string) (*Visit, error)

	// Entrada/Salida
	RegisterEntry(ctx context.Context, visitID uint, request EntryRequest) error
	RegisterExit(ctx context.Context, visitID uint, request ExitRequest) error

	// Acompañantes
	ListCompanions(ctx context.Context, visitID uint) ([]Companion, error)
	CreateCompanion(ctx context.Context, visitID uint, companion Companion) (*Companion, error)
	DeleteCompanion(ctx context.Context, visitID uint, companionID uint) error

	// Activos
	RegisterAssets(ctx context.Context, visitID uint, asset Asset) (*Asset, error)

	// Catálogos
	ListVisitTypes(ctx context.Context) ([]VisitType, error)
	ListVisitStatuses(ctx context.Context) ([]VisitStatus, error)
}

// AuthPort define el contrato para autenticación
type AuthPort interface {
	GetMainToken(ctx context.Context, email, password string) (string, error)
	GetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error)
	ListBusinesses(ctx context.Context, token string) ([]Business, error)
}

// DatabasePort define el contrato para consultas directas a BD
type DatabasePort interface {
	// Visitantes
	ListVisitorsFromDB(ctx context.Context) ([]Visitor, error)

	// Visitas
	ListVisitsFromDB(ctx context.Context, businessID uint) ([]Visit, error)

	// Property Units
	ListPropertyUnitsFromDB(ctx context.Context, businessID uint) ([]PropertyUnit, error)

	// Catálogos
	ListVisitTypesFromDB(ctx context.Context) ([]VisitType, error)

	// Utilidades
	GetVisitStatistics(ctx context.Context, businessID uint) (*VisitStatistics, error)
	CheckConnection(ctx context.Context) (*DBConnectionStats, error)
}

// VisitStatistics representa estadísticas de visitas
type VisitStatistics struct {
	TotalVisits     int64
	PendingVisits   int64
	ActiveVisits    int64
	CompletedVisits int64
	TodayVisits     int64
}

// DBConnectionStats representa estadísticas de conexión a BD
type DBConnectionStats struct {
	OpenConnections int
	InUse           int
	Idle            int
	WaitCount       int64
}
