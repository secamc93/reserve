package horizontalpropertyhandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// DeleteHorizontalProperty godoc
//
//	@Summary		Eliminar propiedad horizontal
//	@Description	Elimina una propiedad horizontal (soft delete) y sus imágenes de S3
//	@Tags			Propiedades Horizontales
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200		{object}	response.HorizontalPropertyDeleteSuccessResponse
//	@Failure		400		{object}	object
//	@Failure		404		{object}	object
//	@Failure		409		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/{business_id} [delete]
func (h *HorizontalPropertyHandler) DeleteHorizontalProperty(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "DeleteHorizontalProperty")

	// Get ID from path parameter
	idParam := c.Param("business_id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("id_param", idParam).Msg("Error parsing ID parameter")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "El ID debe ser un número válido",
		})
		return
	}

	// Verificar acceso: super admin puede eliminar cualquier propiedad, usuario normal solo la suya
	isSuperAdmin := middleware.IsSuperAdmin(c)
	if !isSuperAdmin {
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Message: "Token inválido",
				Error:   "business_id no disponible",
			})
			return
		}
		if uint(id) != tokenBusinessID {
			h.logger.Error(ctx).Uint("requested_id", uint(id)).Uint("token_business_id", tokenBusinessID).Msg("Acceso denegado: business_id no coincide")
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false,
				Message: "No tiene acceso a esta propiedad",
				Error:   "El business_id del token no coincide con el solicitado",
			})
			return
		}
	}

	// Call use case
	err = h.horizontalPropertyUseCase.DeleteHorizontalProperty(ctx, uint(id))
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("id", uint(id)).Msg("Error deleting horizontal property")

		// Handle specific domain errors
		switch err.Error() {
		case "propiedad horizontal no encontrada":
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Propiedad horizontal no encontrada",
				Error:   err.Error(),
			})
		case "no se puede eliminar una propiedad horizontal que tiene unidades registradas":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "No se puede eliminar la propiedad horizontal",
				Error:   "La propiedad tiene unidades registradas",
			})
		case "no se puede eliminar una propiedad horizontal que tiene residentes registrados":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "No se puede eliminar la propiedad horizontal",
				Error:   "La propiedad tiene residentes registrados",
			})
		default:
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{
				Success: false,
				Message: "Error interno del servidor",
				Error:   err.Error(),
			})
		}
		return
	}

	h.logger.Info(ctx).
		Uint("id", uint(id)).
		Bool("is_super_admin", isSuperAdmin).
		Msg("Propiedad horizontal eliminada exitosamente")

	// Return success response
	c.JSON(http.StatusOK, response.HorizontalPropertyDeleteSuccessResponse{
		Success: true,
		Message: "Propiedad horizontal eliminada exitosamente",
	})
}
