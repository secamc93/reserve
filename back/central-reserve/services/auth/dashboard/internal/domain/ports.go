package domain

import "context"

// IDashboardRepository define las operaciones del repositorio de dashboard
type IDashboardRepository interface {
	GetDashboardStats(ctx context.Context, businessTypeID *uint, businessID *uint) (*DashboardStats, error)
}


