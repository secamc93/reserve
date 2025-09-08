package permissionhandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreatePermissionHandler maneja la solicitud de crear un nuevo permiso
// @Summary Crear nuevo permiso
// @Description Crea un nuevo permiso en el sistema
// @Tags Permissions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param permission body request.CreatePermissionRequest true "Datos del permiso a crear"
// @Success 201 {object} response.PermissionMessageResponse "Permiso creado exitosamente"
// @Failure 400 {object} response.PermissionErrorResponse "Datos de entrada inválidos"
// @Failure 401 {object} response.PermissionErrorResponse "Token de acceso requerido"
// @Failure 409 {object} response.PermissionErrorResponse "Permiso con código duplicado"
// @Failure 500 {object} response.PermissionErrorResponse "Error interno del servidor"
// @Router /permissions [post]
func (h *PermissionHandler) CreatePermissionHandler(c *gin.Context) {
	var req request.CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar datos de entrada para crear permiso")
		c.JSON(http.StatusBadRequest, response.PermissionErrorResponse{
			Error: "Datos de entrada inválidos: " + err.Error(),
		})
		return
	}

	h.logger.Info().
		Str("name", req.Name).
		Str("code", req.Code).
		Str("resource", req.Resource).
		Str("action", req.Action).
		Msg("Iniciando solicitud para crear nuevo permiso")

	permissionDTO := mapper.ToCreatePermissionDTO(req)

	result, err := h.usecase.CreatePermission(c.Request.Context(), permissionDTO)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al crear permiso desde el caso de uso")

		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "ya existe un permiso con el código: "+req.Code {
			statusCode = http.StatusConflict
			errorMessage = "Ya existe un permiso con este código"
		}

		c.JSON(statusCode, response.PermissionErrorResponse{
			Error: errorMessage,
		})
		return
	}

	h.logger.Info().Str("result", result).Msg("Permiso creado exitosamente")
	c.JSON(http.StatusCreated, response.PermissionMessageResponse{
		Success: true,
		Message: result,
	})
}
