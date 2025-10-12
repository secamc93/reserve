package handlerresident

import (
	"net/http"
	"strconv"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"github.com/gin-gonic/gin"
)

// GetResidentByID godoc
// @Summary Obtener residente por ID
// @Description Obtiene los detalles de un residente específico
// @Tags Residents
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param resident_id path int true "ID del residente"
// @Success 200 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/residents/{resident_id} [get]
func (h *ResidentHandler) GetResidentByID(c *gin.Context) {
	resIDParam := c.Param("resident_id")
	resID, err := strconv.ParseUint(resIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "Debe ser numérico"})
		return
	}
	resident, err := h.useCase.GetResidentByID(c.Request.Context(), uint(resID))
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrResidentNotFound {
			status = http.StatusNotFound
		}
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo obtener el residente", Error: err.Error()})
		return
	}
	responseData := mapper.MapDetailDTOToResponse(resident)
	c.JSON(http.StatusOK, response.ResidentSuccess{Success: true, Message: "Residente obtenido exitosamente", Data: responseData})
}
