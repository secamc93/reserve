package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// DeleteCommonArea elimina una zona común de la propiedad del usuario
func (h *CommonAreaHandler) DeleteCommonArea(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "DeleteCommonArea")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	if _, ok := h.loadAreaInScope(c, id); !ok {
		return
	}
	if err := h.useCase.DeleteCommonArea(ctx, id); err != nil {
		h.writeUseCaseError(c, err, "Error eliminando zona común")
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Message: "Zona común eliminada"})
}
