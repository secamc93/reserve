package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/auth/users/internal/domain"
	"central_reserve/services/auth/users/internal/infra/primary/handlers/request"
	"central_reserve/services/auth/users/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SetSuperAdminHandler da o quita el rol de super admin a un usuario
//
//	@Summary		Dar o quitar super admin
//	@Description	Asigna (enabled=true) o quita (enabled=false) el rol de alcance platform sin propiedad. Solo un super admin puede hacerlo y nadie puede quitárselo a sí mismo.
//	@Tags			Users
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			id			path		int								true	"ID del usuario"
//	@Param			request		body		request.SetSuperAdminRequest	true	"enabled: true para dar, false para quitar"
//	@Success		200			{object}	response.SetSuperAdminResponse
//	@Failure		400			{object}	response.UserErrorResponse	"Datos inválidos o quitarse el rol a sí mismo"
//	@Failure		403			{object}	response.UserErrorResponse	"Solo un super admin puede hacerlo"
//	@Failure		404			{object}	response.UserErrorResponse	"Usuario no encontrado"
//	@Failure		500			{object}	response.UserErrorResponse	"Error interno del servidor"
//	@Router			/users/{id}/super-admin [put]
func (h *handlers) SetSuperAdminHandler(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "SetSuperAdminHandler")

	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{Error: "ID de usuario inválido"})
		return
	}

	actorID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, response.UserErrorResponse{Error: "Usuario no autenticado"})
		return
	}
	if !middleware.IsSuperAdmin(c) {
		h.logger.Warn(ctx).Uint("actor_id", actorID).Uint64("user_id", userID).Msg("Intento de cambiar super admin sin serlo")
		c.JSON(http.StatusForbidden, response.UserErrorResponse{Error: "Solo un super admin puede dar o quitar este rol"})
		return
	}

	var req request.SetSuperAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.UserErrorResponse{Error: "Datos de entrada inválidos: " + err.Error()})
		return
	}
	enabled := *req.Enabled

	if err := h.usecase.SetSuperAdmin(ctx, actorID, uint(userID), enabled); err != nil {
		switch {
		case errors.Is(err, domain.ErrCannotRevokeOwnSuperAdmin):
			c.JSON(http.StatusBadRequest, response.UserErrorResponse{Error: err.Error()})
		case errors.Is(err, domain.ErrUserNotFound):
			c.JSON(http.StatusNotFound, response.UserErrorResponse{Error: "Usuario no encontrado"})
		default:
			h.logger.Error(ctx).Err(err).Uint64("user_id", userID).Msg("Error al cambiar super admin")
			c.JSON(http.StatusInternalServerError, response.UserErrorResponse{Error: "No se pudo cambiar el rol de super admin"})
		}
		return
	}

	message := "El usuario ya no es super admin"
	if enabled {
		message = "El usuario ahora es super admin"
	}
	c.JSON(http.StatusOK, response.SetSuperAdminResponse{Success: true, Message: message, IsSuperAdmin: enabled})
}
