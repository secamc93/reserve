package handlers

import (
	"central_reserve/services/auth/dashboard/internal/infra/primary/handlers/mappers"
	"central_reserve/services/auth/dashboard/internal/infra/primary/handlers/response"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetDashboardStatsHandler maneja la solicitud de obtener estadísticas del dashboard
//
//	@Summary		Obtener estadísticas del dashboard IAM
//	@Description	Obtiene estadísticas resumidas de todos los módulos IAM (usuarios, roles, permisos, recursos, negocios, tipos de negocio)
//	@Tags			Dashboard
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_type_id	query		int		false	"Filtrar por tipo de business"
//	@Param			business_id			query		int		false	"Filtrar por ID de business"
//	@Success		200					{object}	response.DashboardStatsResponse	"Estadísticas obtenidas exitosamente"
//	@Failure		401					{object}	response.DashboardErrorResponse	"Token de acceso requerido"
//	@Failure		500					{object}	response.DashboardErrorResponse	"Error interno del servidor"
//	@Router			/dashboard/stats [get]
func (h *handlers) GetDashboardStatsHandler(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetDashboardStatsHandler")

	// Leer parámetros opcionales de filtrado
	var businessTypeID *uint
	var businessID *uint

	// Si no es super admin, obtener business_type_id del token
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin {
		// Obtener business_type_id del token
		tokenBusinessTypeID, ok := middleware.GetBusinessTypeID(c)
		if ok && tokenBusinessTypeID > 0 {
			businessTypeID = &tokenBusinessTypeID
			h.logger.Info(ctx).Uint("business_type_id", tokenBusinessTypeID).Msg("Usuario normal: filtrando por business_type_id del token")
		}

		// Obtener business_id del token si está disponible
		tokenBusinessID, ok := middleware.GetBusinessID(c)
		if ok && tokenBusinessID > 0 {
			businessID = &tokenBusinessID
			h.logger.Info(ctx).Uint("business_id", tokenBusinessID).Msg("Usuario normal: filtrando por business_id del token")
		}
	} else {
		// Super admin puede filtrar por business_type_id o business_id desde query params
		if businessTypeIDStr := c.Query("business_type_id"); businessTypeIDStr != "" {
			if id, err := strconv.ParseUint(businessTypeIDStr, 10, 32); err == nil {
				val := uint(id)
				businessTypeID = &val
				h.logger.Info(ctx).Uint("business_type_id", val).Msg("Super admin: filtrando por business_type_id del query")
			}
		}

		if businessIDStr := c.Query("business_id"); businessIDStr != "" {
			if id, err := strconv.ParseUint(businessIDStr, 10, 32); err == nil {
				val := uint(id)
				businessID = &val
				h.logger.Info(ctx).Uint("business_id", val).Msg("Super admin: filtrando por business_id del query")
			}
		}
	}

	stats, err := h.usecase.GetDashboardStats(ctx, businessTypeID, businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error al obtener estadísticas del dashboard desde el caso de uso")
		c.JSON(http.StatusInternalServerError, response.DashboardErrorResponse{
			Error: "Error interno del servidor",
		})
		return
	}

	response := mappers.ToDashboardStatsResponse(stats)

	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Msg("Estadísticas del dashboard obtenidas exitosamente")
	c.JSON(http.StatusOK, response)
}


