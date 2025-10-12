package handlerpropertyunit

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"

	"github.com/gin-gonic/gin"
)

// UpdatePropertyUnit godoc
// @Summary Actualizar unidad de propiedad
// @Description Actualiza los datos de una unidad de propiedad existente
// @Tags Property Units
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param unit_id path int true "ID de la unidad"
// @Param unit body request.UpdatePropertyUnitRequest true "Datos actualizados"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 409 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/property-units/{unit_id} [put]
func (h *PropertyUnitHandler) UpdatePropertyUnit(c *gin.Context) {
	unitIDParam := c.Param("unit_id")
	unitID, err := strconv.ParseUint(unitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de unidad inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	var req request.UpdatePropertyUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := mapper.MapUpdateRequestToDTO(req)
	updated, err := h.useCase.UpdatePropertyUnit(c.Request.Context(), uint(unitID), dto)
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrPropertyUnitNotFound {
			status = http.StatusNotFound
		} else if err == domain.ErrPropertyUnitNumberExists {
			status = http.StatusConflict
		}

		c.JSON(status, response.ErrorResponse{
			Success: false,
			Message: "No se pudo actualizar la unidad",
			Error:   err.Error(),
		})
		return
	}

	responseData := mapper.MapDetailDTOToResponse(updated)
	c.JSON(http.StatusOK, response.PropertyUnitSuccess{
		Success: true,
		Message: "Unidad actualizada exitosamente",
		Data:    responseData,
	})
}
