package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListProxies godoc
//
//	@Summary		Listar apoderados
//	@Description	Lista todos los apoderados de un business con filtros opcionales y paginación
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id		query	uint	false	"ID del business (opcional para super admin)"
//	@Param			property_unit_id	query	uint	false	"Filtro por unidad de propiedad"
//	@Param			proxy_type		query	string	false	"Filtro por tipo de apoderado"
//	@Param			is_active		query	bool	false	"Filtro por activo"
//	@Param			page			query	int		false	"Página (default 1)"
//	@Param			page_size		query	int		false	"Tamaño de página (default 10, max 100)"
//	@Success		200				{object}	object
//	@Failure		400				{object}	object
//	@Failure		500				{object}	object
//	@Router			/attendance/proxies [get]
func (h *AttendanceHandler) ListProxies(c *gin.Context) {
	// Configurar contexto de logging una sola vez para toda la función
	ctx := c.Request.Context()

	// Agregar función específica al contexto (una sola vez)
	ctx = log.WithFunctionCtx(ctx, "ListProxies")

	// Verificar si es super admin
	isSuperAdmin := middleware.IsSuperAdmin(c)

	var businessID uint
	var useBusinessFilter bool = true

	if isSuperAdmin {
		// Super admin: query params opcionales
		businessIDStr := c.Query("business_id")
		if businessIDStr != "" {
			businessID = parseUint(businessIDStr)
		} else {
			// Si no hay business_id, no filtrar por business (ver todo)
			useBusinessFilter = false
		}
	} else {
		// Usuario normal: usar business_id del token
		var exists bool
		businessID, exists = middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Error:   "business_id no disponible en el token",
			})
			return
		}
	}

	// Agregar business_id al contexto
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	// Parse pagination
	page := 1
	pageSize := 10
	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := c.Query("page_size"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			pageSize = n
		}
	}

	// Log de inicio de operación
	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Msg("Iniciando listado de apoderados")

	filters := map[string]interface{}{}
	if useBusinessFilter {
		filters["business_id"] = businessID
	}
	if v := c.Query("property_unit_id"); v != "" {
		filters["property_unit_id"] = parseUint(v)
	}
	if v := c.Query("proxy_type"); v != "" {
		filters["proxy_type"] = v
	}
	if v := c.Query("is_active"); v != "" {
		filters["is_active"] = (v == "true")
	}

	result, err := h.attendanceUseCase.ListProxiesPaged(ctx, businessID, filters, page, pageSize)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando apoderados")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando apoderados", Error: err.Error()})
		return
	}

	// Log de éxito
	h.logger.Info(ctx).Int64("total_proxies", result.Total).Msg("Apoderados listados exitosamente")

	out := mappers.MapProxyDTOsToResponse(result.Data)

	// Headers de paginación
	c.Header("X-Total-Count", strconv.FormatInt(result.Total, 10))
	c.Header("X-Page", strconv.Itoa(result.Page))
	c.Header("X-Page-Size", strconv.Itoa(result.PageSize))
	c.Header("X-Total-Pages", strconv.Itoa(result.TotalPages))

	// Respuesta con metadatos de paginación
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Apoderados listados",
		"data":        out,
		"total":       result.Total,
		"page":        result.Page,
		"page_size":   result.PageSize,
		"total_pages": result.TotalPages,
	})
}
