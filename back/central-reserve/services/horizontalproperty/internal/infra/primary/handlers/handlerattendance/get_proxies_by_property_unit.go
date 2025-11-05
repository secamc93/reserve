package handlerattendance

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// GetProxiesByPropertyUnit godoc
//
//	@Summary		Obtener apoderados por unidad de propiedad
//	@Description	Lista todos los apoderados asociados a una unidad de propiedad específica
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			unit_id	path		uint	true	"ID de la unidad de propiedad"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/proxies/unit/{unit_id} [get]
func (h *AttendanceHandler) GetProxiesByPropertyUnit(c *gin.Context) {
	unitID := parseUint(c.Param("unit_id"))
	list, err := h.attendanceUseCase.GetProxiesByPropertyUnit(c.Request.Context(), unitID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando apoderados por unidad", Error: err.Error()})
		return
	}
	out := make([]response.ProxyResponse, len(list))
	for i, p := range list {
		out[i] = response.ProxyResponse(p)
	}
	c.JSON(http.StatusOK, response.ProxiesSuccess{Success: true, Message: "Apoderados por unidad", Data: out})
}
