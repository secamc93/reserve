package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GetCommonAreaByID obtiene una zona común por ID (solo de la propiedad del usuario)
func (h *CommonAreaHandler) GetCommonAreaByID(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	area, ok := h.loadAreaInScope(c, id)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Data:    mappers.CommonAreaToResponse(area),
	})
}
