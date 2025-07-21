package userhandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateUserHandler maneja la solicitud de crear un usuario
// @Summary Crear usuario
// @Description Crea un nuevo usuario con roles y businesses opcionales
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user body request.CreateUserRequest true "Datos del usuario"
// @Success 201 {object} response.UserMessageResponse "Usuario creado exitosamente"
// @Failure 400 {object} response.UserErrorResponse "Datos inválidos"
// @Failure 401 {object} response.UserErrorResponse "Token de acceso requerido"
// @Failure 409 {object} response.UserErrorResponse "Email ya existe"
// @Failure 500 {object} response.UserErrorResponse "Error interno del servidor"
// @Router /users [post]
func (h *UserHandler) CreateUserHandler(c *gin.Context) {
	var req request.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar datos de entrada")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "Datos de entrada inválidos: " + err.Error(),
		})
		return
	}

	h.logger.Info().Str("email", req.Email).Msg("Iniciando solicitud para crear usuario")

	userDTO := mapper.ToCreateUserDTO(req)
	message, err := h.usecase.CreateUser(c.Request.Context(), userDTO)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al crear usuario desde el caso de uso")

		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "el email ya está registrado" {
			statusCode = http.StatusConflict
			errorMessage = "El email ya está registrado"
		}

		c.JSON(statusCode, response.UserErrorResponse{
			Error: errorMessage,
		})
		return
	}

	h.logger.Info().Str("email", req.Email).Msg("Usuario creado exitosamente")
	c.JSON(http.StatusCreated, response.UserMessageResponse{
		Success: true,
		Message: message,
	})
}
