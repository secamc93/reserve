package authhandler

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/authhandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/authhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/authhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// LoginHandler maneja la solicitud de login
//
//	@Summary		Autenticar usuario
//	@Description	Autentica un usuario con email y contraseña, retornando información del usuario y token de acceso
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		request.LoginRequest				true	"Credenciales de login"
//	@Success		200		{object}	response.LoginSuccessResponse		"Login exitoso"
//	@Failure		400		{object}	response.LoginBadRequestResponse	"Datos de entrada inválidos"
//	@Failure		401		{object}	response.LoginErrorResponse			"Credenciales inválidas"
//	@Failure		403		{object}	response.LoginErrorResponse			"Usuario inactivo"
//	@Failure		500		{object}	response.LoginErrorResponse			"Error interno del servidor"
//	@Router			/auth/login [post]
func (h *AuthHandler) LoginHandler(c *gin.Context) {
	var loginRequest request.LoginRequest

	// Validar y bindear el request
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar request de login")
		c.JSON(http.StatusBadRequest, response.LoginBadRequestResponse{
			Error:   "Datos de entrada inválidos",
			Details: err.Error(),
		})
		return
	}

	// Convertir request a dominio
	domainRequest := domain.LoginRequest{
		Email:    loginRequest.Email,
		Password: loginRequest.Password,
	}

	// Ejecutar caso de uso
	domainResponse, err := h.usecase.Login(c.Request.Context(), domainRequest)
	if err != nil {
		h.logger.Error().Err(err).Str("email", loginRequest.Email).Msg("Error en proceso de login")

		// Determinar el código de estado HTTP apropiado
		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "credenciales inválidas" {
			statusCode = http.StatusUnauthorized
			errorMessage = "Credenciales inválidas"
		} else if err.Error() == "usuario inactivo" {
			statusCode = http.StatusForbidden
			errorMessage = "Usuario inactivo"
		} else if err.Error() == "email y contraseña son requeridos" {
			statusCode = http.StatusBadRequest
			errorMessage = "Email y contraseña son requeridos"
		}

		c.JSON(statusCode, response.LoginErrorResponse{
			Error: errorMessage,
		})
		return
	}

	// Convertir respuesta de dominio a response
	loginResponse := *mapper.ToLoginResponse(domainResponse)

	h.logger.Info().
		Str("email", loginRequest.Email).
		Uint("user_id", domainResponse.User.ID).
		Msg("Login exitoso")

	// Retornar respuesta exitosa
	c.JSON(http.StatusOK, response.LoginSuccessResponse{
		Success: true,
		Data:    loginResponse,
	})
}
