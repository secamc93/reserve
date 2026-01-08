package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListPackageStatuses obtiene todos los estados de paquete
// @Summary Listar estados de paquete
// @Description Obtiene todos los estados de paquete activos
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.PackageStatusesResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/statuses [get]
func (h *PackageHandler) ListPackageStatuses(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListPackageStatuses")

	statuses, err := h.useCase.GetPackageStatuses(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo estados de paquete")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo estados de paquete",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.PackageStatusData, len(statuses))
	for i, s := range statuses {
		data[i] = response.PackageStatusData{
			ID:          s.ID,
			Code:        s.Code,
			Name:        s.Name,
			Description: s.Description,
			IsFinal:     s.IsFinal,
			IsActive:    s.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.PackageStatusesResponse{
		Success: true,
		Data:    data,
	})
}
