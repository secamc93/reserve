package businesshandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetBusinessesConfiguredResourcesHandler obtiene la configuración de recursos para businesses con paginación
//
//	@Summary		Obtener configuración de recursos de businesses
//	@Description	Obtiene una lista paginada de businesses con sus recursos configurados y su estado (activo/inactivo)
//	@Tags			Business Resources
//	@Accept			json
//	@Produce		json
//	@Param			page				query		int		false	"Número de página"							default(1)	minimum(1)
//	@Param			page_size			query		int		false	"Elementos por página (máximo 200)"			default(10)	minimum(1)	maximum(200)
//	@Param			per_page			query		int		false	"Alias de page_size (compatibilidad)"		minimum(1)	maximum(200)
//	@Param			business_id			query		int		false	"Filtrar por ID de business"
//	@Param			business_type_id	query		int		false	"Filtrar por ID de tipo de business"
//	@Success		200					{object}	map[string]interface{}	"Lista de businesses con recursos obtenida exitosamente"
//	@Failure		400					{object}	map[string]interface{}	"Parámetros de consulta inválidos"
//	@Failure		401					{object}	map[string]interface{}	"No autorizado"
//	@Failure		403					{object}	map[string]interface{}	"Sin permisos"
//	@Failure		500					{object}	map[string]interface{}	"Error interno del servidor"
//	@Router			/businesses/configured-resources [get]
//	@Security		BearerAuth
func (h *BusinessHandler) GetBusinessesConfiguredResourcesHandler(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetBusinessesConfiguredResourcesHandler")

	// Parsear parámetros de paginación: page_size (estándar) o per_page (compatibilidad)
	perPageStr := c.Query("page_size")
	if perPageStr == "" {
		perPageStr = c.Query("per_page")
	}
	page, perPage, err := pagination.ParseQuery(c.Query("page"), perPageStr)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("page", c.Query("page")).Str("page_size", perPageStr).Msg("Parámetros de paginación inválidos")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Parámetros de paginación inválidos",
			"error":   err.Error(),
		})
		return
	}

	// Aplicar lógica de super admin
	isSuperAdmin := middleware.IsSuperAdmin(c)
	var businessID *uint
	var businessTypeID *uint

	if !isSuperAdmin {
		// Usuario normal: forzar business_id del token
		tokenBusinessID, ok := middleware.GetBusinessID(c)
		if ok && tokenBusinessID > 0 {
			businessID = &tokenBusinessID
			h.logger.Info(ctx).Uint("business_id", tokenBusinessID).Msg("Usuario normal: filtrando por business_id del token")
		} else {
			h.logger.Error(ctx).Msg("Usuario normal sin business_id en token")
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Sin permisos para acceder a esta configuración",
				"error":   "Usuario sin business asignado",
			})
			return
		}
	} else {
		// Super admin: permitir query params
		if businessIDStr := c.Query("business_id"); businessIDStr != "" {
			if id, err := strconv.ParseUint(businessIDStr, 10, 32); err == nil {
				val := uint(id)
				businessID = &val
				h.logger.Info(ctx).Uint("business_id", val).Msg("Super admin: filtrando por business_id del query")
			}
		}

		if businessTypeIDStr := c.Query("business_type_id"); businessTypeIDStr != "" {
			if id, err := strconv.ParseUint(businessTypeIDStr, 10, 32); err == nil {
				val := uint(id)
				businessTypeID = &val
				h.logger.Info(ctx).Uint("business_type_id", val).Msg("Super admin: filtrando por business_type_id del query")
			}
		}

		h.logger.Info(ctx).Msg("Super admin: mostrando todos los businesses (aplicando filtros opcionales)")
	}

	// Llamar al método del use case
	businesses, total, err := h.usecase.GetBusinessesConfiguredResources(ctx, page, perPage, businessID, businessTypeID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error al obtener businesses con recursos configurados")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Error interno del servidor",
			"error":   err.Error(),
		})
		return
	}

	// Calcular paginación
	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	hasNext := page < totalPages
	hasPrev := page > 1

	// Construir respuesta
	pagination := gin.H{
		"current_page": page,
		"per_page":     perPage,
		"total":        total,
		"last_page":    totalPages,
		"has_next":     hasNext,
		"has_prev":     hasPrev,
	}

	h.logger.Info(ctx).
		Int64("total", total).
		Int("returned", len(businesses)).
		Int("page", page).
		Bool("is_super_admin", isSuperAdmin).
		Msg("Businesses con recursos configurados obtenidos exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Businesses con recursos configurados obtenidos exitosamente",
		"data":       businesses,
		"pagination": pagination,
	})
}
