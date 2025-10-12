package handlerresident

import (
	"net/http"
	"strconv"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"github.com/gin-gonic/gin"
)

// UpdateResident godoc
// @Summary Actualizar residente
// @Description Actualiza los datos de un residente existente
// @Tags Residents
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param resident_id path int true "ID del residente"
// @Param resident body request.UpdateResidentRequest true "Datos actualizados"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 409 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/residents/{resident_id} [put]
func (h *ResidentHandler) UpdateResident(c *gin.Context) {
	resIDParam := c.Param("resident_id")
	resID, err := strconv.ParseUint(resIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.UpdateResidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := mapper.MapUpdateRequestToDTO(req)
	updated, err := h.useCase.UpdateResident(c.Request.Context(), uint(resID), dto)
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrResidentNotFound {
			status = http.StatusNotFound
		} else if err == domain.ErrResidentEmailExists || err == domain.ErrResidentDniExists {
			status = http.StatusConflict
		}
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo actualizar el residente", Error: err.Error()})
		return
	}
	responseData := mapper.MapDetailDTOToResponse(updated)
	c.JSON(http.StatusOK, response.ResidentSuccess{Success: true, Message: "Residente actualizado exitosamente", Data: responseData})
}
