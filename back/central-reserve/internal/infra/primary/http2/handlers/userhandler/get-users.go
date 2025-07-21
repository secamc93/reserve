package userhandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUsersHandler maneja la solicitud de obtener usuarios filtrados y paginados
// @Summary Obtener usuarios filtrados y paginados
// @Description Obtiene la lista filtrada y paginada de usuarios del sistema con sus roles y businesses
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Número de página" default(1) minimum(1)
// @Param page_size query int false "Tamaño de página" default(10) minimum(1) maximum(100)
// @Param name query string false "Filtrar por nombre (búsqueda parcial)"
// @Param email query string false "Filtrar por email (búsqueda parcial)"
// @Param phone query string false "Filtrar por teléfono (búsqueda parcial)"
// @Param is_active query bool false "Filtrar por estado activo"
// @Param role_id query int false "Filtrar por ID de rol"
// @Param business_id query int false "Filtrar por ID de business"
// @Param created_at query string false "Filtrar por fecha de creación (YYYY-MM-DD o YYYY-MM-DD,YYYY-MM-DD para rango)"
// @Param sort_by query string false "Campo para ordenar" Enums(name, email, phone, is_active, created_at, updated_at) default(created_at)
// @Param sort_order query string false "Orden de clasificación" Enums(asc, desc) default(desc)
// @Success 200 {object} response.UserListResponse "Usuarios obtenidos exitosamente"
// @Failure 400 {object} response.UserErrorResponse "Parámetros de filtro inválidos"
// @Failure 401 {object} response.UserErrorResponse "Token de acceso requerido"
// @Failure 500 {object} response.UserErrorResponse "Error interno del servidor"
// @Router /users [get]
func (h *UserHandler) GetUsersHandler(c *gin.Context) {
	// Crear struct de request y bindear parámetros de query
	var req request.GetUsersRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al parsear parámetros de query")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "Parámetros de filtro inválidos",
		})
		return
	}

	// Convertir request a filtros del dominio
	filters := mapper.ToUserFilters(req)

	// Las validaciones ya están manejadas por el binding automático
	// Los valores por defecto y las validaciones están en las etiquetas del struct

	h.logger.Info().
		Int("page", filters.Page).
		Int("page_size", filters.PageSize).
		Str("name", filters.Name).
		Str("email", filters.Email).
		Str("phone", filters.Phone).
		Str("sort_by", filters.SortBy).
		Str("sort_order", filters.SortOrder).
		Msg("Iniciando solicitud para obtener usuarios filtrados y paginados")

	userListDTO, err := h.usecase.GetUsers(c.Request.Context(), filters)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al obtener usuarios desde el caso de uso")
		c.JSON(http.StatusInternalServerError, response.UserErrorResponse{
			Error: "Error interno del servidor",
		})
		return
	}

	response := mapper.ToUserListResponse(userListDTO)

	h.logger.Info().
		Int("count", len(userListDTO.Users)).
		Int64("total", userListDTO.Total).
		Int("total_pages", userListDTO.TotalPages).
		Msg("Usuarios obtenidos exitosamente")
	c.JSON(http.StatusOK, response)
}
