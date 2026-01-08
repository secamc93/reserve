package handlers

import (
	"errors"
	"fmt"
	"strings"
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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
		// Formatear errores de validación en español
		validationErrors := formatValidationErrors(err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   validationErrors,
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

// formatValidationErrors formatea los errores de validación de Gin en un mensaje más amigable
func formatValidationErrors(err error) string {
	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		var errorMessages []string

		fieldNames := map[string]string{
			"PropertyUnitID":   "Unidad de propiedad",
			"ResidentID":       "Residente",
			"Carrier":          "Transportadora",
			"TrackingNumber":   "Número de rastreo",
			"Description":      "Descripción",
			"Notes":            "Notas",
			"NotifyResident":   "Notificar residente",
			// También soportar nombres en snake_case
			"property_unit_id":  "Unidad de propiedad",
			"resident_id":       "Residente",
			"carrier":           "Transportadora",
			"tracking_number":   "Número de rastreo",
			"description":       "Descripción",
			"notes":             "Notas",
			"notify_resident":   "Notificar residente",
		}

		for _, fieldErr := range validationErrs {
			fieldName := fieldNames[fieldErr.Field()]
			if fieldName == "" {
				fieldName = strings.ReplaceAll(fieldErr.Field(), "_", " ")
				fieldName = strings.Title(strings.ToLower(fieldName))
			}

			var msg string
			switch fieldErr.Tag() {
			case "required":
				msg = fmt.Sprintf("%s es requerido", fieldName)
			case "min":
				msg = fmt.Sprintf("%s no cumple con el valor mínimo", fieldName)
			case "max":
				msg = fmt.Sprintf("%s excede el valor máximo", fieldName)
			case "email":
				msg = fmt.Sprintf("%s debe ser un email válido", fieldName)
			default:
				msg = fmt.Sprintf("%s: valor inválido (%s)", fieldName, fieldErr.Tag())
			}
			errorMessages = append(errorMessages, msg)
		}

		if len(errorMessages) > 0 {
			return strings.Join(errorMessages, "; ")
		}
	}

	// Si es un error de tipo gin.ErrorTypeBind, extraer mensaje más limpio
	var ginErr *gin.Error
	if errors.As(err, &ginErr) {
		if ginErr.Type == gin.ErrorTypeBind {
			return fmt.Sprintf("Error al procesar los datos de entrada: %s", err.Error())
		}
	}

	return err.Error()
}
