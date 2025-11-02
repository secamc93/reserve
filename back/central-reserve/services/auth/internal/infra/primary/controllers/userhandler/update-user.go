package userhandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/mapper"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/userhandler/response"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UpdateUserHandler maneja la solicitud de actualizar un usuario
//
//	@Summary		Actualizar usuario
//	@Description	Actualiza un usuario existente en el sistema. Soporta carga de imagen (avatarFile).
//	@Tags			Users
//	@Accept			multipart/form-data
//	@Produce		json
//	@Security		BearerAuth
//	@Param			id				path		int								true	"ID del usuario"	minimum(1)
//	@Param			name			formData	string							false	"Nombre"
//	@Param			email			formData	string							false	"Email"
//	@Param			password		formData	string							false	"Nueva contraseña"
//	@Param			phone			formData	string							false	"Teléfono (10 dígitos)"
//	@Param			is_active		formData	boolean							false	"¿Activo?"
//	@Param			role_ids		formData	string							false	"IDs de roles separados por comas (ej: 1,2,3)"
//	@Param			business_ids	formData	string							false	"IDs de negocios separados por comas (ej: 1,2,3)"
//	@Param			avatar_url		formData	string							false	"URL de avatar (opcional si se usa avatarFile)"
//	@Param			avatarFile		formData	file							false	"Imagen de avatar"
//	@Success		200				{object}	response.UserSuccessResponse	"Usuario actualizado exitosamente"
//	@Failure		400				{object}	response.UserErrorResponse		"Datos inválidos"
//	@Failure		401				{object}	response.UserErrorResponse		"Token de acceso requerido"
//	@Failure		404				{object}	response.UserErrorResponse		"Usuario no encontrado"
//	@Failure		409				{object}	response.UserErrorResponse		"Email ya existe"
//	@Failure		500				{object}	response.UserErrorResponse		"Error interno del servidor"
//	@Router			/users/{id} [put]
func (h *UserHandler) UpdateUserHandler(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateUserHandler")
	var uriReq request.GetUserByIDRequest
	var bodyReq request.UpdateUserRequest

	// Binding automático para parámetros de URL
	if err := c.ShouldBindUri(&uriReq); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error al validar ID del usuario")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "ID inválido: " + err.Error(),
		})
		return
	}

	// Binding automático para el body (multipart/form-data o JSON)
	if err := c.ShouldBind(&bodyReq); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error al validar datos de la solicitud")
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{
			Error: "Datos inválidos: " + err.Error(),
		})
		return
	}

	// Si no es super admin, forzar business_ids del token si se está actualizando
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin && bodyReq.BusinessIDs != "" {
		tokenBusinessID, ok := middleware.GetBusinessID(c)
		if !ok {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.UserErrorResponse{
				Error: "Token inválido: business_id no disponible",
			})
			return
		}
		// Forzar que el único business sea el del token
		bodyReq.BusinessIDs = strconv.FormatUint(uint64(tokenBusinessID), 10)
		h.logger.Info(ctx).Uint("business_id", tokenBusinessID).Msg("Forzando business_id del token para usuario normal en actualización")
	}

	h.logger.Info(ctx).Uint("id", uriReq.ID).Str("email", bodyReq.Email).Bool("is_super_admin", isSuperAdmin).Msg("Iniciando solicitud para actualizar usuario")

	// Log para verificar si el archivo está llegando
	if bodyReq.AvatarFile != nil {
		h.logger.Info(ctx).Uint("id", uriReq.ID).Str("filename", bodyReq.AvatarFile.Filename).Int64("size", bodyReq.AvatarFile.Size).Msg("Archivo de avatar recibido")
	} else {
		h.logger.Info(ctx).Uint("id", uriReq.ID).Msg("No se recibió archivo de avatar")
	}

	userDTO := mapper.ToUpdateUserDTO(bodyReq)
	message, err := h.usecase.UpdateUser(ctx, uriReq.ID, userDTO)
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("id", uriReq.ID).Msg("Error al actualizar usuario desde el caso de uso")

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

	h.logger.Info(ctx).Uint("id", uriReq.ID).Msg("Usuario actualizado exitosamente")
	c.JSON(http.StatusOK, response.UserMessageResponse{
		Success: true,
		Message: message,
	})
}
