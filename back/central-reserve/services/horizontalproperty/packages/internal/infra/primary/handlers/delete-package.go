package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// DeletePackage elimina un paquete (soft delete - cambia estado a returned)
// @Summary Eliminar paquete
// @Description Marca un paquete como retornado (soft delete)
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del paquete"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/{id} [delete]
func (h *PackageHandler) DeletePackage(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "DeletePackage")

	packageIDParam := c.Param("id")
	packageID, err := strconv.ParseUint(packageIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de paquete invalido",
		})
		return
	}

	err = h.useCase.DeletePackage(ctx, uint(packageID))
	if err != nil {
		if err == domain.ErrPackageNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Paquete no encontrado",
			})
			return
		}
		if err == domain.ErrPackageAlreadyFinal {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "No se puede eliminar un paquete en estado final",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error eliminando paquete")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error eliminando paquete",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Paquete marcado como retornado correctamente",
	})
}
