package userhandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/userhandler/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateUserHandler maneja la solicitud de actualizar un usuario
// @Summary Actualizar usuario
// @Description Actualiza un usuario existente en el sistema. Soporta carga de imagen (avatarFile).
// @Tags Users
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del usuario" minimum(1)
// @Param name formData string false "Nombre"
// @Param email formData string false "Email"
// @Param password formData string false "Nueva contraseña"
// @Param phone formData string false "Teléfono (10 dígitos)"
// @Param is_active formData boolean false "¿Activo?"
// @Param role_ids formData []int false "IDs de roles" collectionFormat(multi)
// @Param business_ids formData []int false "IDs de negocios" collectionFormat(multi)
// @Param avatar_url formData string false "URL de avatar (opcional si se usa avatarFile)"
// @Param avatarFile formData file false "Imagen de avatar"
// @Success 200 {object} response.UserSuccessResponse "Usuario actualizado exitosamente"
// @Failure 400 {object} response.UserErrorResponse "Datos inválidos"
// @Failure 401 {object} response.UserErrorResponse "Token de acceso requerido"
// @Failure 404 {object} response.UserErrorResponse "Usuario no encontrado"
// @Failure 409 {object} response.UserErrorResponse "Email ya existe"
// @Failure 500 {object} response.UserErrorResponse "Error interno del servidor"
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUserHandler(c *gin.Context) {
	var uriReq request.GetUserByIDRequest
	var bodyReq request.UpdateUserRequest

	// Binding automático para parámetros de URL
	if err := c.ShouldBindUri(&uriReq); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar ID del usuario")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "ID inválido: " + err.Error(),
		})
		return
	}

	// Binding automático para el body (multipart/form-data o JSON)
	if err := c.ShouldBind(&bodyReq); err != nil {
		h.logger.Error().Err(err).Msg("Error al validar datos de la solicitud")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "Datos inválidos: " + err.Error(),
		})
		return
	}

	h.logger.Info().Uint("id", uriReq.ID).Str("email", bodyReq.Email).Msg("Iniciando solicitud para actualizar usuario")

	// Log para verificar si el archivo está llegando
	if bodyReq.AvatarFile != nil {
		h.logger.Info().Uint("id", uriReq.ID).Str("filename", bodyReq.AvatarFile.Filename).Int64("size", bodyReq.AvatarFile.Size).Msg("Archivo de avatar recibido")
	} else {
		h.logger.Info().Uint("id", uriReq.ID).Msg("No se recibió archivo de avatar")
	}

	userDTO := mapper.ToUpdateUserDTO(bodyReq)
	message, err := h.usecase.UpdateUser(c.Request.Context(), uriReq.ID, userDTO)
	if err != nil {
		h.logger.Error().Err(err).Uint("id", uriReq.ID).Msg("Error al actualizar usuario desde el caso de uso")

		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "usuario no encontrado" {
			statusCode = http.StatusNotFound
			errorMessage = "Usuario no encontrado"
		} else if err.Error() == "el email ya está registrado" {
			statusCode = http.StatusConflict
			errorMessage = "El email ya está registrado"
		}

		c.JSON(statusCode, response.UserErrorResponse{
			Error: errorMessage,
		})
		return
	}

	h.logger.Info().Uint("id", uriReq.ID).Msg("Usuario actualizado exitosamente")
	c.JSON(http.StatusOK, response.UserMessageResponse{
		Success: true,
		Message: message,
	})
}
