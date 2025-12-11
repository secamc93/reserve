package mapper

import (
	"central_reserve/services/auth/dashboard/internal/domain"
	"central_reserve/services/auth/dashboard/internal/infra/primary/handlers/response"
)

// ToDashboardStatsResponse convierte DashboardStats del dominio a DashboardStatsResponse
func ToDashboardStatsResponse(stats *domain.DashboardStats) response.DashboardStatsResponse {
	return response.DashboardStatsResponse{
		Success: true,
		Data: response.DashboardStatsData{
			Users: response.UserStatsResponse{
				Total:      stats.Users.Total,
				Active:     stats.Users.Active,
				Inactive:   stats.Users.Inactive,
				SuperUsers: stats.Users.SuperUsers,
			},
			Roles: response.RoleStatsResponse{
				Total:  stats.Roles.Total,
				System: stats.Roles.System,
				Custom: stats.Roles.Custom,
			},
			Permissions: response.PermissionStatsResponse{
				Total:      stats.Permissions.Total,
				Assigned:   stats.Permissions.Assigned,
				Unassigned: stats.Permissions.Unassigned,
			},
			Resources: response.ResourceStatsResponse{
				Total:    stats.Resources.Total,
				Active:   stats.Resources.Active,
				Inactive: stats.Resources.Inactive,
			},
			Businesses: response.BusinessStatsResponse{
				Total:    stats.Businesses.Total,
				Active:   stats.Businesses.Active,
				Inactive: stats.Businesses.Inactive,
			},
			BusinessTypes: response.BusinessTypeStatsResponse{
				Total: stats.BusinessTypes.Total,
			},
		},
	}
}
