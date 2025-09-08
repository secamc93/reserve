package rolehandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetRolesHandler maneja la solicitud de obtener todos los roles
// @Summary Obtener todos los roles
// @Description Obtiene la lista completa de roles del sistema
// @Tags Roles
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.RoleListResponse "Roles obtenidos exitosamente"
// @Failure 401 {object} response.RoleErrorResponse "Token de acceso requerido"
// @Failure 500 {object} response.RoleErrorResponse "Error interno del servidor"
// @Router /roles [get]
func (h *RoleHandler) GetRolesHandler(c *gin.Context) {
	h.logger.Info().Msg("Iniciando solicitud para obtener todos los roles")

	roles, err := h.usecase.GetRoles(c.Request.Context())
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
