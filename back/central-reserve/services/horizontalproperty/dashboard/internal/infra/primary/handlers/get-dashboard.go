package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/dashboard/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetDashboard godoc
//
//	@Summary		Obtener dashboard
//	@Description	Obtiene el resumen completo del dashboard según el tipo de usuario (business o super admin)
//	@Tags			Dashboard
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query	uint	false	"ID del business (opcional para super admin, si no se envía ve todo)"
//	@Param			page		query	int		false	"Página para business summaries (solo super admin, default: 1)"
//	@Param			page_size	query	int		false	"Tamaño de página para business summaries (solo super admin, default: 10, max: 100)"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/dashboard [get]
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	// Verificar si es super admin
	isSuperAdmin := middleware.IsSuperAdmin(c)

	var businessID uint
	if isSuperAdmin {
		// Super admin: puede usar business_id del query param o ver todo (0)
		businessIDStr := c.Query("business_id")
		if businessIDStr != "" {
			businessID = parseUint(businessIDStr)
		}
		// Si businessIDStr está vacío, businessID = 0 significa "ver todo"
	} else {
		// Usuario normal: usar business_id del token
		var exists bool
		businessID, exists = middleware.GetBusinessID(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Error:   "business_id no disponible en el token",
			})
			return
		}
	}

	// Crear contexto con business_id para logging estructurado
	ctx := c.Request.Context()
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	// Log de información con contexto estructurado
	h.logger.Info(ctx).Uint("business_id", businessID).Bool("is_super_admin", isSuperAdmin).Msg("Obteniendo dashboard")

	// Obtener parámetros de paginación (solo para super admin)
	page := 1
	pageSize := 10
	if isSuperAdmin {
		if pageStr := c.Query("page"); pageStr != "" {
			if parsedPage := parseUint(pageStr); parsedPage > 0 {
				page = int(parsedPage)
			}
		}
		if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
			if parsedPageSize := parseUint(pageSizeStr); parsedPageSize > 0 {
				pageSize = int(parsedPageSize)
			}
		}
	}

	// Obtener dashboard
	dashboard, err := h.dashboardUseCase.GetDashboard(ctx, businessID, isSuperAdmin, page, pageSize)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo dashboard")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo dashboard",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse[*response.DashboardResponse]{
		Success: true,
		Message: "Dashboard obtenido exitosamente",
		Data:    response.MapDashboardToResponse(dashboard),
	})
}

// parseUint helper
func parseUint(s string) uint {
	var out uint
	if v, err := strconv.ParseUint(s, 10, 32); err == nil {
		out = uint(v)
	}
	return out
}


