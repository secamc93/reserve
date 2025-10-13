package handlerpropertyunit

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"

	"github.com/gin-gonic/gin"
)

// GetPropertyUnitByID godoc
//
//	@Summary		Obtener unidad por ID
//	@Description	Obtiene los detalles de una unidad de propiedad específica
//	@Tags			Property Units
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id	path		int	true	"ID de la propiedad horizontal"
//	@Param			unit_id	path		int	true	"ID de la unidad"
//	@Success		200		{object}	object
//	@Failure		404		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/{hp_id}/property-units/{unit_id} [get]
func (h *PropertyUnitHandler) GetPropertyUnitByID(c *gin.Context) {
	unitIDParam := c.Param("unit_id")
	unitID, err := strconv.ParseUint(unitIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/get-property-unit-by-id.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("unit_id", unitIDParam).Msg("Error parseando ID de unidad")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de unidad inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	unit, err := h.useCase.GetPropertyUnitByID(c.Request.Context(), uint(unitID))
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrPropertyUnitNotFound {
			status = http.StatusNotFound
		}

		fmt.Fprintf(os.Stderr, "[ERROR] handlerpropertyunit/get-property-unit-by-id.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("unit_id", uint(unitID)).Msg("Error obteniendo unidad de propiedad")
		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: "No se pudo obtener la unidad",
			Error:   err.Error(),
		})
		return
	}

	responseData := mapper.MapDetailDTOToResponse(unit)
	c.JSON(http.StatusOK, response.PropertyUnitSuccess{
		Success: true,
		Message: "Unidad obtenida exitosamente",
		Data:    responseData,
	})
}
