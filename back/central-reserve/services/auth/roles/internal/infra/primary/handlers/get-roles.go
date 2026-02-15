package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/auth/roles/internal/domain"
	"central_reserve/services/auth/roles/internal/infra/primary/handlers/mappers"
	"central_reserve/services/auth/roles/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetRolesHandler maneja la solicitud de obtener todos los roles
//
//	@Summary		Obtener todos los roles
//	@Description	Obtiene la lista completa de roles del sistema con opciones de filtrado y paginación
//	@Tags			Roles
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			page				query		int		false	"Número de página"	default(1)	minimum(1)
//	@Param			page_size			query		int		false	"Tamaño de página"	default(10)	minimum(1)	maximum(100)
//	@Param			business_type_id	query		int		false	"Filtrar por tipo de business"
//	@Param			scope_id			query		int		false	"Filtrar por ID de scope"
//	@Param			is_system			query		bool	false	"Filtrar por rol de sistema (true/false)"
//	@Param			name				query		string	false	"Buscar en el nombre del rol (búsqueda parcial)"
//	@Param			level				query		int		false	"Filtrar por nivel del rol"
//	@Param			sort_by				query		string	false	"Campo para ordenar"	Enums(id, name, level, created_at, updated_at)	default(created_at)
//	@Param			sort_order			query		string	false	"Orden de clasificación"	Enums(asc, desc)	default(desc)
//	@Success		200					{object}	response.RoleListResponse	"Roles obtenidos exitosamente"
//	@Failure		401					{object}	response.RoleErrorResponse		"Token de acceso requerido"
//	@Failure		500					{object}	response.RoleErrorResponse		"Error interno del servidor"
//	@Router			/roles [get]
func (h *handlers) GetRolesHandler(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetRolesHandler")

	// Leer todos los query parameters
	filters := domain.RoleFilters{}

	// Paginación
	page := 1
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	filters.Page = page

	pageSize := 10
	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}
	filters.PageSize = pageSize

	// Ordenamiento
	filters.SortBy = c.DefaultQuery("sort_by", "created_at")
	filters.SortOrder = c.DefaultQuery("sort_order", "desc")

	// Si no es super admin, obtener business_type_id del token
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin {
		// Obtener business_type_id del token
		tokenBusinessTypeID, ok := middleware.GetBusinessTypeID(c)
		if ok && tokenBusinessTypeID > 0 {
			filters.BusinessTypeID = &tokenBusinessTypeID
			h.logger.Info(ctx).Uint("business_type_id", tokenBusinessTypeID).Msg("Usuario normal: filtrando roles por business_type_id del token")
		}
	} else {
		// Super admin puede filtrar por business_type_id desde query param
		if businessTypeIDStr := c.Query("business_type_id"); businessTypeIDStr != "" {
			if id, err := strconv.ParseUint(businessTypeIDStr, 10, 32); err == nil {
				val := uint(id)
				filters.BusinessTypeID = &val
				h.logger.Info(ctx).Uint("business_type_id", val).Msg("Super admin: filtrando roles por business_type_id del query")
			}
		}
	}

	// Filtrar por scope_id
	if scopeIDStr := c.Query("scope_id"); scopeIDStr != "" {
		if id, err := strconv.ParseUint(scopeIDStr, 10, 32); err == nil {
			val := uint(id)
			filters.ScopeID = &val
		}
	}

	// Filtrar por is_system
	if isSystemStr := c.Query("is_system"); isSystemStr != "" {
		if val, err := strconv.ParseBool(isSystemStr); err == nil {
			filters.IsSystem = &val
		}
	}

	// Filtrar por name (búsqueda parcial)
	if nameStr := c.Query("name"); nameStr != "" {
		filters.Name = &nameStr
	}

	// Filtrar por level
	if levelStr := c.Query("level"); levelStr != "" {
		if level, err := strconv.Atoi(levelStr); err == nil {
			filters.Level = &level
		}
	}

	roleListDTO, err := h.usecase.GetRoles(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error al obtener roles desde el caso de uso")
		c.JSON(http.StatusInternalServerError, response.RoleErrorResponse{
			Error: "Error interno del servidor",
		})
		return
	}

	response := mappers.ToRoleListResponse(roleListDTO)

	h.logger.Info(ctx).
		Int("count", len(roleListDTO.Roles)).
		Int64("total", roleListDTO.Total).
		Int("current_page", roleListDTO.Page).
		Int("per_page", roleListDTO.PageSize).
		Int("last_page", roleListDTO.TotalPages).
		Bool("is_super_admin", isSuperAdmin).
		Msg("Roles obtenidos exitosamente con paginación")
	c.JSON(http.StatusOK, response)
}
