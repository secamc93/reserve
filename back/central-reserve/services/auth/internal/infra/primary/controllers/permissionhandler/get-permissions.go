package permissionhandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetPermissionsHandler maneja la solicitud de obtener todos los permisos
// @Summary Obtener todos los permisos
// @Description Obtiene la lista completa de permisos del sistema
// @Tags Permissions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.PermissionListResponse "Lista de permisos obtenida exitosamente"
// @Failure 401 {object} response.PermissionErrorResponse "Token de acceso requerido"
// @Failure 500 {object} response.PermissionErrorResponse "Error interno del servidor"
// @Router /permissions [get]
func (h *PermissionHandler) GetPermissionsHandler(c *gin.Context) {
	h.logger.Info().Msg("Iniciando solicitud para obtener todos los permisos")

	permissions, err := h.usecase.GetPermissions(c.Request.Context())
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al obtener permisos desde el caso de uso")
		c.JSON(http.StatusInternalServerError, response.PermissionErrorResponse{
			Error: "Error interno del servidor",
		})
		return
	}

	response := mapper.ToPermissionListResponse(permissions)

	h.logger.Info().Int("count", len(permissions)).Msg("Permisos obtenidos exitosamente")
	c.JSON(http.StatusOK, response)
}
