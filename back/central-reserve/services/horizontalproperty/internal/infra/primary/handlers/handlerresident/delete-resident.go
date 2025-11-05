package handlerresident

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeleteResident godoc
//
//	@Summary		Eliminar residente
//	@Description	Elimina (soft delete) un residente
//	@Tags			Residents
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			resident_id	path		int	true	"ID del residente"
//	@Success		200			{object}	object
//	@Failure		404			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/residents/{resident_id} [delete]
func (h *ResidentHandler) DeleteResident(c *gin.Context) {
	// Configurar contexto de logging
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "DeleteResident")

	resIDParam := c.Param("resident_id")
	resID, err := strconv.ParseUint(resIDParam, 10, 32)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("resident_id", resIDParam).Msg("Error parseando ID de residente")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	// Verificar acceso según business_id del token
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin {
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Message: "Token inválido",
				Error:   "business_id no disponible en el token",
			})
			return
		}
		// Agregar business_id al contexto para filtrado
		ctx = log.WithBusinessIDCtx(ctx, tokenBusinessID)
	}

	h.logger.Info(ctx).Uint("resident_id", uint(resID)).Bool("is_super_admin", isSuperAdmin).Msg("Eliminando residente")

	err = h.useCase.DeleteResident(ctx, uint(resID))
	if err != nil {
		status := http.StatusInternalServerError
		message := "No se pudo eliminar el residente"

		// Mapear errores específicos del caso de uso
		switch err {
		case domain.ErrResidentNotFound:
			status = http.StatusNotFound
			message = "Residente no encontrado"
		}

		h.logger.Error(ctx).Err(err).Uint("resident_id", uint(resID)).Msg("Error eliminando residente")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: message,
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info(ctx).Uint("resident_id", uint(resID)).Msg("Residente eliminado exitosamente")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Residente eliminado exitosamente",
	})
}
