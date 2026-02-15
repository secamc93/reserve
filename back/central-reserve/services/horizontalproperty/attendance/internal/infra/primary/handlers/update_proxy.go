package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// UpdateProxy godoc
//
//	@Summary		Actualizar apoderado
//	@Description	Actualiza los datos de un apoderado existente
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id		path		uint						true	"ID del apoderado"
//	@Param			request	body		request.UpdateProxyRequest	true	"Datos actualizados del apoderado"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		404		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/proxies/{id} [put]
func (h *AttendanceHandler) UpdateProxy(c *gin.Context) {
	id := parseUint(c.Param("id"))
	var req request.UpdateProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := mappers.MapUpdateProxyRequestToDTO(req)
	updated, err := h.attendanceUseCase.UpdateProxy(c.Request.Context(), id, dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error actualizando apoderado", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.ProxySuccess{Success: true, Message: "Apoderado actualizado", Data: mappers.MapProxyDTOToResponse(*updated)})
}
