package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeliverPackage registra la entrega de un paquete
// @Summary Entregar paquete
// @Description Registra la entrega de un paquete al residente
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del paquete"
// @Param request body request.DeliverPackageRequest false "Notas adicionales"
// @Success 200 {object} response.PackageResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/{id}/deliver [post]
func (h *PackageHandler) DeliverPackage(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "DeliverPackage")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.DeliverPackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Si no hay body, usar valores por defecto
		req = request.DeliverPackageRequest{}
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "user_id no disponible",
		})
		return
	}

	dto := domain.DeliverPackageDTO{
		PackageID:         uint(id),
		DeliveredByUserID: userID,
		Notes:             req.Notes,
	}

	pkg, err := h.useCase.DeliverPackage(ctx, dto)
	if err != nil {
		if err == domain.ErrPackageNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Paquete no encontrado",
			})
			return
		}
		if err == domain.ErrPackageAlreadyDelivered {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El paquete ya fue entregado",
			})
			return
		}
		if err == domain.ErrPackageNotDeliverable {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El paquete no puede ser entregado en su estado actual",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error entregando paquete")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error entregando paquete",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.PackageResponse{
		Success: true,
		Data:    mappers.PackageToResponse(pkg),
	})
}
