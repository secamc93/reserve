package userhandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserByIDHandler maneja la solicitud de obtener un usuario por ID
// @Summary Obtener usuario por ID
// @Description Obtiene un usuario específico por su ID con sus roles y businesses
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del usuario" minimum(1)
// @Success 200 {object} response.UserSuccessResponse "Usuario obtenido exitosamente"
// @Failure 400 {object} response.UserErrorResponse "ID inválido"
// @Failure 401 {object} response.UserErrorResponse "Token de acceso requerido"
// @Failure 404 {object} response.UserErrorResponse "Usuario no encontrado"
// @Failure 500 {object} response.UserErrorResponse "Error interno del servidor"
// @Router /users/{id} [get]
func (h *UserHandler) GetUserByIDHandler(c *gin.Context) {
	var req request.GetUserByIDRequest

	// Binding automático con validaciones para parámetros de URL
	if err := c.ShouldBindUri(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar ID del usuario")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "ID inválido: " + err.Error(),
		})
		return
	}

	h.logger.Info().Uint("id", req.ID).Msg("Iniciando solicitud para obtener usuario por ID")

	user, err := h.usecase.GetUserByID(c.Request.Context(), req.ID)
	if err != nil {
		h.logger.Error().Uint("id", req.ID).Err(err).Msg("Error al obtener usuario por ID desde el caso de uso")

		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "usuario no encontrado" {
			statusCode = http.StatusNotFound
			errorMessage = "Usuario no encontrado"
		}

		c.JSON(statusCode, response.UserErrorResponse{
			Error: errorMessage,
		})
		return
	}

	userResponse := mapper.ToUserResponse(*user)

	h.logger.Info().Uint("id", req.ID).Msg("Usuario obtenido exitosamente")
	c.JSON(http.StatusOK, response.UserSuccessResponse{
		Success: true,
		Data:    userResponse,
	})
}
