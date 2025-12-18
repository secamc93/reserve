package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ReceivePackage registra la recepción de un paquete
// @Summary Recibir paquete
// @Description Registra la recepción de un nuevo paquete
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.ReceivePackageRequest true "Datos del paquete"
// @Success 201 {object} response.PackageResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages [post]
func (h *PackageHandler) ReceivePackage(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ReceivePackage")

	var req request.ReceivePackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
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

	dto := domain.CreatePackageDTO{
		BusinessID:       businessID,
		PropertyUnitID:   req.PropertyUnitID,
		ResidentID:       req.ResidentID,
		Carrier:          req.Carrier,
		TrackingNumber:   req.TrackingNumber,
		Description:      req.Description,
		Notes:            req.Notes,
		NotifyResident:   req.NotifyResident,
		ReceivedByUserID: userID,
	}

	pkg, err := h.useCase.ReceivePackage(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error recibiendo paquete")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error recibiendo paquete",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.PackageResponse{
		Success: true,
		Data:    mapPackageToResponse(pkg),
	})
}

// mapPackageToResponse mapea entidad de dominio a respuesta
func mapPackageToResponse(pkg *domain.Package) response.PackageData {
	data := response.PackageData{
		ID:                 pkg.ID,
		BusinessID:         pkg.BusinessID,
		PropertyUnitID:     pkg.PropertyUnitID,
		ResidentID:         pkg.ResidentID,
		PackageStatusID:    pkg.PackageStatusID,
		Carrier:            pkg.Carrier,
		TrackingNumber:     pkg.TrackingNumber,
		QRCode:             pkg.QRCode,
		ReceivedByUserID:   pkg.ReceivedByUserID,
		ReceivedAt:         pkg.ReceivedAt,
		DeliveredByUserID:  pkg.DeliveredByUserID,
		DeliveredAt:        pkg.DeliveredAt,
		Description:        pkg.Description,
		Notes:              pkg.Notes,
		NotifyResident:     pkg.NotifyResident,
		NotificationSentAt: pkg.NotificationSentAt,
		CreatedAt:          pkg.CreatedAt,
		UpdatedAt:          pkg.UpdatedAt,
	}

	if pkg.PropertyUnit.ID != 0 {
		data.PropertyUnitNumber = pkg.PropertyUnit.Number
	}
	if pkg.Resident != nil {
		data.ResidentName = pkg.Resident.FullName
	}
	if pkg.PackageStatus.ID != 0 {
		data.StatusName = pkg.PackageStatus.Name
		data.StatusCode = pkg.PackageStatus.Code
	}

	return data
}
