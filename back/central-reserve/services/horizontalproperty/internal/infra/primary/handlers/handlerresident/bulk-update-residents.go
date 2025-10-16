package handlerresident

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"

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
//	@Param			hp_id		path		int		true	"ID de la propiedad horizontal"
//	@Param			file		formData	file	true	"Archivo Excel con residentes a actualizar"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/residents/bulk-update [put]
func (h *ResidentHandler) BulkUpdateResidents(c *gin.Context) {
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/bulk-update-residents.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID de propiedad horizontal")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "Debe ser numérico"})
		return
	}

	// Obtener archivo Excel del formulario
	file, err := c.FormFile("file")
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/bulk-update-residents.go - Error obteniendo archivo: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Msg("Error obteniendo archivo Excel")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Archivo requerido", Error: "Debe proporcionar un archivo Excel"})
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

	fmt.Printf("\n📝 [EDICION MASIVA RESIDENTES POR EXCEL]\n")
	fmt.Printf("   Propiedad Horizontal ID: %d\n", uint(hpID))
	fmt.Printf("   Archivo: %s\n\n", file.Filename)

	// Ejecutar edición masiva desde Excel
	result, err := h.useCase.BulkUpdateResidentsFromExcel(c.Request.Context(), uint(hpID), tempFile.Name())
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlerresident/bulk-update-residents.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Str("filename", file.Filename).Msg("Error ejecutando edición masiva desde Excel")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error procesando archivo Excel", Error: err.Error()})
		return
	}

	fmt.Printf("✅ [EDICION MASIVA RESIDENTES COMPLETADA]\n")
	fmt.Printf("   Total procesados: %d\n", result.TotalProcessed)
	fmt.Printf("   Actualizados: %d\n", result.Updated)
	fmt.Printf("   Errores: %d\n\n", result.Errors)

	h.logger.Info().
		Uint("hp_id", uint(hpID)).
		Str("filename", file.Filename).
		Int("total_processed", result.TotalProcessed).
		Int("updated", result.Updated).
		Int("errors", result.Errors).
		Msg("Edición masiva de residentes desde Excel completada")

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
