package handlerresident

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ImportResidentsExcel godoc
//
//	@Summary		Importar residentes desde Excel
//	@Description	Importa múltiples residentes desde un archivo Excel. VALIDACION TODO O NADA: Si UNA unidad no existe, NO se crea NADA. El Excel debe tener 3 columnas: 'Número de Unidad', 'Nombre Propietario', 'DNI'
//	@Tags			Residentes
//	@Accept			multipart/form-data
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id	path		int		true	"ID de la propiedad horizontal"
//	@Param			file	formData	file	true	"Archivo Excel (.xlsx)"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/{hp_id}/residents/import-excel [post]
func (h *ResidentHandler) ImportResidentsExcel(c *gin.Context) {
	fmt.Printf("\n\n")
	fmt.Printf("═══════════════════════════════════════════════════════════════════\n")
	fmt.Printf("  🚀 ENDPOINT: IMPORTAR RESIDENTES DESDE EXCEL\n")
	fmt.Printf("═══════════════════════════════════════════════════════════════════\n\n")

	// Parsear hp_id
	hpIDParam := c.Param("hp_id")
	fmt.Printf("📋 [VALIDACION] HP ID: '%s'\n", hpIDParam)

	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportResidentsExcel - Error parseando HP ID: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando ID")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID de propiedad horizontal inválido",
			"error":   "Debe ser numérico",
		})
		return
	}
	fmt.Printf("   ✅ HP ID parseado: %d\n\n", hpID)

	// Obtener archivo
	fmt.Printf("📂 [VALIDACION] Obteniendo archivo...\n")
	file, err := c.FormFile("file")
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportResidentsExcel - Error obteniendo archivo: %v\n", err)
		h.logger.Error().Err(err).Msg("Error obteniendo archivo Excel")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No se proporcionó el archivo Excel",
			"error":   err.Error(),
		})
		return
	}
	fmt.Printf("   ✅ Archivo: '%s' (%.2f KB)\n\n", file.Filename, float64(file.Size)/1024)

	// Validar extensión
	ext := filepath.Ext(file.Filename)
	if ext != ".xlsx" && ext != ".xls" {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportResidentsExcel - Extensión inválida: %s\n", ext)
		h.logger.Error().Str("extension", ext).Msg("Extensión no permitida")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Formato de archivo no válido",
			"error":   "Solo se permiten archivos .xlsx o .xls",
		})
		return
	}

	// Validar tamaño (máximo 10MB)
	if file.Size > 10*1024*1024 {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportResidentsExcel - Archivo muy grande: %d bytes\n", file.Size)
		h.logger.Error().Int64("size", file.Size).Msg("Archivo muy grande")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "El archivo es muy grande",
			"error":   "El tamaño máximo es 10MB",
		})
		return
	}

	// Guardar archivo temporal
	fmt.Printf("💾 [GUARDANDO] Archivo temporal...\n")
	tempDir := os.TempDir()
	tempFile := filepath.Join(tempDir, fmt.Sprintf("import_residents_%d_%s", hpID, file.Filename))
	fmt.Printf("   Ruta: %s\n", tempFile)

	if err := c.SaveUploadedFile(file, tempFile); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportResidentsExcel - Error guardando temporal: %v\n", err)
		h.logger.Error().Err(err).Msg("Error guardando archivo temporal")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Error procesando el archivo",
			"error":   err.Error(),
		})
		return
	}
	fmt.Printf("   ✅ Guardado\n\n")

	// Eliminar archivo temporal al finalizar
	defer func() {
		fmt.Printf("🗑️  [LIMPIEZA] Eliminando archivo temporal...\n")
		os.Remove(tempFile)
		fmt.Printf("   ✅ Eliminado\n\n")
	}()

	// Llamar al use case
	result, err := h.useCase.ImportResidentsFromExcel(c.Request.Context(), uint(hpID), tempFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportResidentsExcel - Error procesando: %v\n", err)
		h.logger.Error().Err(err).Uint("hp_id", uint(hpID)).Msg("Error importando residentes")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Error procesando el archivo Excel",
			"error":   err.Error(),
			"details": result.Errors,
		})
		return
	}

	fmt.Printf("✅ [IMPORTACION EXITOSA]\n")
	fmt.Printf("   Total: %d\n", result.Total)
	fmt.Printf("   Creados: %d\n\n", result.Created)

	h.logger.Info().
		Uint("hp_id", uint(hpID)).
		Int("total", result.Total).
		Int("created", result.Created).
		Msg("✅ Residentes importados exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("✅ Importación completada: %d residentes creados", result.Created),
		"data": gin.H{
			"total":   result.Total,
			"created": result.Created,
			"errors":  result.Errors,
		},
	})
}
