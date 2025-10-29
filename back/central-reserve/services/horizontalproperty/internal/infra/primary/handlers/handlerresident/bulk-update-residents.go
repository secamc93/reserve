package handlerresident

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// BulkUpdateResidents godoc
//
//	@Summary		Edición masiva de residentes por Excel
//	@Description	Actualiza múltiples residentes usando un archivo Excel. La columna principal es 'unidad' para identificar el residente. Solo se pueden actualizar nombre y DNI.
//	@Tags			Residentes
//	@Security		BearerAuth
//	@Accept			multipart/form-data
//	@Produce		json
//	@Param			business_id	formData	int		false	"ID del business (opcional para super admin)"
//	@Param			file		formData	file	true	"Archivo Excel con residentes a actualizar"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/residents/bulk-update [put]
func (h *ResidentHandler) BulkUpdateResidents(c *gin.Context) {
	// Configurar contexto de logging
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "BulkUpdateResidents")

	// Determinar business_id según token y rol (super admin)
	isSuperAdmin := middleware.IsSuperAdmin(c)
	tokenBusinessID, exists := middleware.GetBusinessID(c)

	var businessID uint
	if isSuperAdmin {
		// Super admin: puede usar el business_id del form o del token
		businessIDParam := c.PostForm("business_id")
		if businessIDParam != "" {
			businessIDFromForm, err := strconv.ParseUint(businessIDParam, 10, 32)
			if err != nil {
				h.logger.Error(ctx).Err(err).Str("business_id", businessIDParam).Msg("Error parseando business_id del form")
				c.JSON(http.StatusBadRequest, response.ErrorResponse{
					Success: false,
					Message: "business_id inválido",
					Error:   "Debe ser numérico",
				})
				return
			}
			businessID = uint(businessIDFromForm)
		} else if exists && tokenBusinessID != 0 {
			businessID = tokenBusinessID
		} else {
			h.logger.Error(ctx).Msg("business_id requerido para super admin")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "business_id requerido",
				Error:   "Debe especificar business_id en el form o tenerlo en el token",
			})
			return
		}
	} else {
		// Usuario normal: business_id siempre del token
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Message: "Token inválido",
				Error:   "business_id no disponible en el token",
			})
			return
		}
		businessID = tokenBusinessID
	}

	// Agregar business_id al contexto para logging
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Msg("Iniciando edición masiva de residentes")

	// Obtener archivo Excel del formulario
	file, err := c.FormFile("file")
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo archivo Excel")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Archivo requerido",
			Error:   "Debe proporcionar un archivo Excel",
		})
		return
	}

	// Validar extensión del archivo
	if !strings.HasSuffix(strings.ToLower(file.Filename), ".xlsx") && !strings.HasSuffix(strings.ToLower(file.Filename), ".xls") {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Formato de archivo inválido",
			Error:   "El archivo debe ser un Excel (.xlsx o .xls)",
		})
		return
	}

	// Crear archivo temporal
	tempFile, err := os.CreateTemp("", "bulk_update_residents_*.xlsx")
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/bulk-update-residents.go - Error creando archivo temporal: %v\n", err)
		h.logger.Error().Err(err).Msg("Error creando archivo temporal")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error interno", Error: "No se pudo procesar el archivo"})
		return
	}
	defer os.Remove(tempFile.Name()) // Limpiar archivo temporal

	// Guardar archivo subido
	if err := c.SaveUploadedFile(file, tempFile.Name()); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/bulk-update-residents.go - Error guardando archivo: %v\n", err)
		h.logger.Error().Err(err).Msg("Error guardando archivo subido")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error interno", Error: "No se pudo guardar el archivo"})
		return
	}

	// Ejecutar edición masiva desde Excel
	result, err := h.useCase.BulkUpdateResidentsFromExcel(ctx, businessID, tempFile.Name())
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("filename", file.Filename).Msg("Error ejecutando edición masiva desde Excel")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error procesando archivo Excel",
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info(ctx).Int("total_processed", result.TotalProcessed).Int("updated", result.Updated).Int("errors", result.Errors).Msg("Edición masiva de residentes completada exitosamente")

	// Mapear resultado a response
	errorDetails := make([]response.BulkUpdateErrorDetailResult, len(result.ErrorDetails))
	for i, e := range result.ErrorDetails {
		errorDetails[i] = response.BulkUpdateErrorDetailResult{Row: e.Row, PropertyUnitNumber: e.PropertyUnitNumber, Error: e.Error}
	}
	responseData := response.BulkUpdateResidentsResponse{
		TotalProcessed: result.TotalProcessed,
		Updated:        result.Updated,
		Errors:         result.Errors,
		ErrorDetails:   errorDetails,
	}

	c.JSON(http.StatusOK, response.BulkUpdateResidentsSuccess{
		Success: true,
		Message: fmt.Sprintf("Edición masiva completada: %d actualizados, %d errores", result.Updated, result.Errors),
		Data:    responseData,
	})
}
