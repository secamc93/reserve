package handlers

import (
	"errors"
	"fmt"
	"strings"
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// CreateVisit crea una nueva visita
// @Summary Crear visita
// @Description Crea una nueva visita para un visitante
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.CreateVisitRequest true "Datos de la visita"
// @Success 201 {object} response.VisitResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits [post]
func (h *VisitHandler) CreateVisit(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateVisit")

	var req request.CreateVisitRequest
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

	dto := domain.CreateVisitDTO{
		BusinessID:         businessID,
		VisitorID:          req.VisitorID,
		PropertyUnitID:     req.PropertyUnitID,
		ResidentID:         req.ResidentID,
		VisitTypeID:        req.VisitTypeID,
		VisitorVehicleID:   req.VisitorVehicleID,
		ScheduledDate:      req.ScheduledDate,
		ScheduledStartTime: req.ScheduledStartTime,
		ScheduledEndTime:   req.ScheduledEndTime,
		Purpose:            req.Purpose,
		NumberOfVisitors:   req.NumberOfVisitors,
		HasCompanions:      req.HasCompanions,
		HasAssets:          req.HasAssets,
		Notes:              req.Notes,
		NotifyResident:     req.NotifyResident,
		NotifySecurity:     req.NotifySecurity,
	}

	visit, err := h.useCase.CreateVisit(ctx, dto)
	if err != nil {
		if err == domain.ErrVisitorBlacklisted {
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false,
				Message: "El visitante está en lista negra",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error creando visita")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando visita",
		})
		return
	}

	c.JSON(http.StatusCreated, response.VisitResponse{
		Success: true,
		Data: response.VisitData{
			ID:                 visit.ID,
			BusinessID:         visit.BusinessID,
			VisitorID:          visit.VisitorID,
			PropertyUnitID:     visit.PropertyUnitID,
			ResidentID:         visit.ResidentID,
			VisitTypeID:        visit.VisitTypeID,
			VisitStatusID:      visit.VisitStatusID,
			ScheduledDate:      visit.ScheduledDate,
			ScheduledStartTime: visit.ScheduledStartTime,
			ScheduledEndTime:   visit.ScheduledEndTime,
			ActualEntryTime:    visit.ActualEntryTime,
			ActualExitTime:     visit.ActualExitTime,
			AuthorizationCode:  visit.AuthorizationCode,
			QRCode:             visit.QRCode,
			Purpose:            visit.Purpose,
			Notes:              visit.Notes,
		},
	})
}

// formatValidationErrors formatea los errores de validación de Gin en un mensaje más amigable
func formatValidationErrors(err error) string {
	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		var errorMessages []string
		
		fieldNames := map[string]string{
			"VisitorID":          "ID del visitante",
			"PropertyUnitID":     "Unidad de propiedad",
			"VisitTypeID":        "Tipo de visita",
			"ScheduledDate":      "Fecha programada",
			"ScheduledStartTime": "Hora de inicio",
			"ScheduledEndTime":   "Hora de fin",
			"Purpose":            "Propósito",
			"NumberOfVisitors":   "Número de visitantes",
			// También soportar nombres en snake_case
			"visitor_id":          "ID del visitante",
			"property_unit_id":    "Unidad de propiedad",
			"visit_type_id":       "Tipo de visita",
			"scheduled_date":      "Fecha programada",
			"scheduled_start_time": "Hora de inicio",
			"scheduled_end_time":   "Hora de fin",
			"purpose":             "Propósito",
			"number_of_visitors":  "Número de visitantes",
		}
		
		for _, fieldErr := range validationErrs {
			// Intentar obtener nombre amigable del campo
			fieldName := fieldNames[fieldErr.Field()]
			if fieldName == "" {
				// Si no está en el mapa, convertir el nombre del campo a formato amigable
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
	
	// Detectar errores de parsing de fecha/hora y traducirlos al español
	errStr := err.Error()
	if strings.Contains(errStr, "parsing time") || strings.Contains(errStr, "cannot parse") {
		// Mapear mensajes de error de parsing al español
		if strings.Contains(errStr, "scheduled_date") || strings.Contains(errStr, "ScheduledDate") {
			return "La fecha programada tiene un formato inválido. Por favor use el formato: YYYY-MM-DD (ejemplo: 2026-01-08)"
		}
		if strings.Contains(errStr, "scheduled_start_time") || strings.Contains(errStr, "ScheduledStartTime") {
			return "La hora de inicio tiene un formato inválido. Por favor use el formato completo: YYYY-MM-DDTHH:mm:ssZ (ejemplo: 2026-01-08T15:00:00Z)"
		}
		if strings.Contains(errStr, "scheduled_end_time") || strings.Contains(errStr, "ScheduledEndTime") {
			return "La hora de fin tiene un formato inválido. Por favor use el formato completo: YYYY-MM-DDTHH:mm:ssZ (ejemplo: 2026-01-08T18:00:00Z)"
		}
		// Mensaje genérico para errores de parsing de fecha/hora
		return "El formato de fecha u hora es inválido. Por favor verifique que las fechas estén en el formato correcto (YYYY-MM-DD para fechas, YYYY-MM-DDTHH:mm:ssZ para timestamps)"
	}
	
	// Si es un error de tipo gin.ErrorTypeBind, extraer mensaje más limpio
	var ginErr *gin.Error
	if errors.As(err, &ginErr) {
		if ginErr.Type == gin.ErrorTypeBind {
			// Traducir mensajes comunes al español
			if strings.Contains(errStr, "json:") {
				return "Error al procesar los datos de entrada. Por favor verifique que todos los campos estén en el formato correcto"
			}
			return fmt.Sprintf("Error al procesar los datos de entrada: %s", errStr)
		}
	}
	
	// Si no es un error de validación estructurado, devolver el error original
	// Intentar traducir mensajes comunes al español
	return translateErrorMessage(errStr)
}

// translateErrorMessage traduce mensajes de error comunes del inglés al español
func translateErrorMessage(msg string) string {
	translations := map[string]string{
		"parsing time":                "Error al procesar la fecha u hora",
		"cannot parse":                "No se pudo procesar el formato",
		"invalid":                     "inválido",
		"required":                    "es requerido",
		"not found":                   "no encontrado",
		"already exists":              "ya existe",
		"unauthorized":                "no autorizado",
		"forbidden":                   "prohibido",
		"internal server error":       "error interno del servidor",
		"bad request":                 "solicitud inválida",
		"invalid json":                "JSON inválido",
		"unmarshal":                   "no se pudo procesar",
	}
	
	lowerMsg := strings.ToLower(msg)
	for english, spanish := range translations {
		if strings.Contains(lowerMsg, english) {
			return strings.ReplaceAll(msg, english, spanish)
		}
	}
	
	return msg
}
