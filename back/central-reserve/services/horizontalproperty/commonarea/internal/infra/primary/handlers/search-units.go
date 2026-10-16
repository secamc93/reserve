package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// SearchUnits busca unidades de la propiedad para elegir la unidad de una reserva
func (h *CommonAreaHandler) SearchUnits(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "SearchUnits")

	var req request.SearchUnitsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Parámetros inválidos", Error: err.Error()})
		return
	}
	businessID, ok := h.resolveBusinessID(c)
	if !ok {
		return
	}
	units, err := h.useCase.SearchUnits(ctx, businessID, req.Search, req.Limit)
	if err != nil {
		h.writeUseCaseError(c, err, "Error buscando unidades")
		return
	}
	data := make([]response.UnitLookupResponse, len(units))
	for i, u := range units {
		data[i] = response.UnitLookupResponse{ID: u.ID, Number: u.Number, Block: u.Block}
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Data: data})
}
