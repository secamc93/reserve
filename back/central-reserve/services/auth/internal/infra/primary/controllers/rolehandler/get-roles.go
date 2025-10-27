package rolehandler

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetRolesHandler maneja la solicitud de obtener todos los roles
//
//	@Summary		Obtener todos los roles
//	@Description	Obtiene la lista completa de roles del sistema con opciones de filtrado
//	@Tags			Roles
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_type_id	query		int		false	"Filtrar por tipo de business"
//	@Param			scope_id			query		int		false	"Filtrar por ID de scope"
//	@Param			is_system			query		bool	false	"Filtrar por rol de sistema (true/false)"
//	@Param			name				query		string	false	"Buscar en el nombre del rol (búsqueda parcial)"
//	@Param			level				query		int		false	"Filtrar por nivel del rol"
//	@Success		200					{object}	response.RoleListResponse	"Roles obtenidos exitosamente"
//	@Failure		401					{object}	response.RoleErrorResponse		"Token de acceso requerido"
//	@Failure		500					{object}	response.RoleErrorResponse		"Error interno del servidor"
//	@Router			/roles [get]
func (h *RoleHandler) GetRolesHandler(c *gin.Context) {
	h.logger.Info().Msg("Iniciando solicitud para obtener todos los roles")

	// Leer todos los query parameters
	filters := domain.RoleFilters{}

	// Filtrar por business_type_id
	if businessTypeIDStr := c.Query("business_type_id"); businessTypeIDStr != "" {
		if id, err := strconv.ParseUint(businessTypeIDStr, 10, 32); err == nil {
			val := uint(id)
			filters.BusinessTypeID = &val
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

	roles, err := h.usecase.GetRoles(c.Request.Context(), filters)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al obtener roles desde el caso de uso")
		c.JSON(http.StatusInternalServerError, response.RoleErrorResponse{
			Error: "Error interno del servidor",
		})
		return
	}

	response := mapper.ToRoleListResponse(roles)

	h.logger.Info().Int("count", len(roles)).Msg("Roles obtenidos exitosamente")
	c.JSON(http.StatusOK, response)
}
