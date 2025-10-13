package userhandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateUserHandler maneja la solicitud de crear un usuario
//
//	@Summary		Crear usuario
//	@Description	Crea un nuevo usuario con roles y businesses opcionales. Soporta carga de imagen (avatarFile).
//	@Tags			Users
//	@Accept			multipart/form-data
//	@Produce		json
//	@Security		BearerAuth
//	@Param			name			formData	string							true	"Nombre"
//	@Param			email			formData	string							true	"Email"
//	@Param			phone			formData	string							false	"Teléfono (10 dígitos)"
//	@Param			is_active		formData	boolean							false	"¿Activo?"
//	@Param			role_ids		formData	string							false	"IDs de roles separados por comas (ej: 1,2,3)"
//	@Param			business_ids	formData	string							false	"IDs de negocios separados por comas (ej: 1,2,3)"
//	@Param			avatar_url		formData	string							false	"URL de avatar (opcional si se usa avatarFile)"
//	@Param			avatarFile		formData	file							false	"Imagen de avatar"
//	@Success		201				{object}	response.UserMessageResponse	"Usuario creado exitosamente"
//	@Failure		400				{object}	response.UserErrorResponse		"Datos inválidos"
//	@Failure		401				{object}	response.UserErrorResponse		"Token de acceso requerido"
//	@Failure		409				{object}	response.UserErrorResponse		"Email ya existe"
//	@Failure		500				{object}	response.UserErrorResponse		"Error interno del servidor"
//	@Router			/users [post]
func (h *UserHandler) CreateUserHandler(c *gin.Context) {
	var req request.CreateUserRequest
	if err := c.ShouldBind(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar datos de entrada")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "Datos de entrada inválidos: " + err.Error(),
		})
		return
	}

	h.logger.Info().Str("email", req.Email).Msg("Iniciando solicitud para crear usuario")

	// Log simple para confirmar recepción de archivo
	if req.AvatarFile != nil {
		h.logger.Info().Str("email", req.Email).Str("filename", req.AvatarFile.Filename).Int64("size", req.AvatarFile.Size).Msg("Archivo de avatar recibido en creación")
	}

	userDTO := mapper.ToCreateUserDTO(req)
	email, password, message, err := h.usecase.CreateUser(c.Request.Context(), userDTO)
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
	c.JSON(http.StatusCreated, response.UserCreatedResponse{
		Success:  true,
		Email:    email,
		Password: password,
		Message:  message,
	})
}
