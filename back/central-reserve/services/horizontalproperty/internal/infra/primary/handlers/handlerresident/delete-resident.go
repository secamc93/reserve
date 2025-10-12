package handlerresident

import (
	"net/http"
	"strconv"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"github.com/gin-gonic/gin"
)

// DeleteResident godoc
// @Summary Eliminar residente
// @Description Elimina (soft delete) un residente
// @Tags Residents
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param resident_id path int true "ID del residente"
// @Success 200 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/residents/{resident_id} [delete]
func (h *ResidentHandler) DeleteResident(c *gin.Context) {
	resIDParam := c.Param("resident_id")
	resID, err := strconv.ParseUint(resIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "Debe ser numérico"})
		return
	}
	err = h.useCase.DeleteResident(c.Request.Context(), uint(resID))
	if err != nil {
		status := http.StatusInternalServerError
		if err == domain.ErrResidentNotFound {
			status = http.StatusNotFound
		}
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo eliminar el residente", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Residente eliminado exitosamente"})
}
