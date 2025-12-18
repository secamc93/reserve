package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetPackageByID obtiene un paquete por ID
// @Summary Obtener paquete por ID
// @Description Obtiene los detalles de un paquete por su ID
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del paquete"
// @Success 200 {object} response.PackageResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/{id} [get]
func (h *PackageHandler) GetPackageByID(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetPackageByID")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	pkg, err := h.useCase.GetPackageByID(ctx, uint(id))
	if err != nil {
		if err == domain.ErrPackageNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Paquete no encontrado",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo paquete")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo paquete",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.PackageResponse{
		Success: true,
		Data:    mapPackageToResponse(pkg),
	})
}

// GetPackageByQRCode obtiene un paquete por código QR
// @Summary Obtener paquete por QR
// @Description Obtiene los detalles de un paquete por su código QR
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param qr_code path string true "Código QR del paquete"
// @Success 200 {object} response.PackageResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/qr/{qr_code} [get]
func (h *PackageHandler) GetPackageByQRCode(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetPackageByQRCode")

	qrCode := c.Param("qr_code")
	if qrCode == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Código QR requerido",
		})
		return
	}

	pkg, err := h.useCase.GetPackageByQRCode(ctx, qrCode)
	if err != nil {
		if err == domain.ErrPackageNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Paquete no encontrado",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo paquete por QR")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo paquete",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.PackageResponse{
		Success: true,
		Data:    mapPackageToResponse(pkg),
	})
}

// UpdatePackageStatus actualiza el estado de un paquete
// @Summary Actualizar estado de paquete
// @Description Actualiza el estado de un paquete manualmente
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del paquete"
// @Param request body request.UpdatePackageStatusRequest true "Datos de actualización"
// @Success 200 {object} response.PackageResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/{id}/status [put]
func (h *PackageHandler) UpdatePackageStatus(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "UpdatePackageStatus")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.UpdatePackageStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "user_id no disponible",
		})
		return
	}

	dto := domain.UpdatePackageStatusDTO{
		PackageID:       uint(id),
		PackageStatusID: req.PackageStatusID,
		UpdatedByUserID: userID,
		Notes:           req.Notes,
	}

	pkg, err := h.useCase.UpdatePackageStatus(ctx, dto)
	if err != nil {
		if err == domain.ErrPackageNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Paquete no encontrado",
			})
			return
		}
		if err == domain.ErrInvalidStatusTransition {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "Transición de estado inválida",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error actualizando estado de paquete")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error actualizando estado de paquete",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.PackageResponse{
		Success: true,
		Data:    mapPackageToResponse(pkg),
	})
}
