package horizontalpropertyhandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetHorizontalPropertyByID godoc
//
//	@Summary		Obtener propiedad horizontal por ID
//	@Description	Obtiene una propiedad horizontal con información detallada (incluye unidades y comités)
//	@Tags			Propiedades Horizontales
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_id	path		int	true	"ID de la propiedad horizontal"
//	@Success		200		{object}	response.HorizontalPropertySuccessResponse
//	@Failure		400		{object}	object
//	@Failure		404		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/{business_id} [get]
func (h *HorizontalPropertyHandler) GetHorizontalPropertyByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetHorizontalPropertyByID")

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

	// Verificar acceso: super admin puede ver cualquier propiedad, usuario normal solo la suya
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
	result, err := h.horizontalPropertyUseCase.GetHorizontalPropertyByID(ctx, uint(id))
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("id", uint(id)).Msg("Error getting horizontal property by ID")

		// Handle specific domain errors
		switch err.Error() {
		case "propiedad horizontal no encontrada":
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Propiedad horizontal no encontrada",
				Error:   err.Error(),
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

	// Map domain DTO to response
	responseData := mapper.MapDTOToResponse(result)

	// Return success response
	c.JSON(http.StatusOK, response.HorizontalPropertySuccessResponse{
		Success: true,
		Message: "Propiedad horizontal obtenida exitosamente",
		Data:    *responseData,
	})
}
