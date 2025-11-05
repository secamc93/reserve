package handlerattendance

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// DeleteProxy godoc
//
//	@Summary		Eliminar apoderado
//	@Description	Elimina un apoderado por su ID
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path		uint	true	"ID del apoderado"
//	@Success		200	{object}	object
//	@Failure		400	{object}	object
//	@Failure		404	{object}	object
//	@Failure		500	{object}	object
//	@Router			/attendance/proxies/{id} [delete]
func (h *AttendanceHandler) DeleteProxy(c *gin.Context) {
	id := parseUint(c.Param("id"))
	if err := h.attendanceUseCase.DeleteProxy(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error eliminando apoderado", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse[gin.H]{Success: true, Message: "Apoderado eliminado", Data: gin.H{"id": id}})
}
