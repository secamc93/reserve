package handlerattendance

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// GetProxyByID godoc
//
//	@Summary		Obtener apoderado por ID
//	@Description	Obtiene un apoderado específico por su ID
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path		uint	true	"ID del apoderado"
//	@Success		200	{object}	object
//	@Failure		400	{object}	object
//	@Failure		404	{object}	object
//	@Failure		500	{object}	object
//	@Router			/attendance/proxies/{id} [get]
func (h *AttendanceHandler) GetProxyByID(c *gin.Context) {
	id := parseUint(c.Param("id"))
	p, err := h.attendanceUseCase.GetProxyByID(c.Request.Context(), id)
	if err != nil || p == nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "No encontrado", Error: "proxy no encontrado"})
		return
	}
	c.JSON(http.StatusOK, response.ProxySuccess{Success: true, Message: "Apoderado obtenido", Data: response.ProxyResponse(*p)})
}
