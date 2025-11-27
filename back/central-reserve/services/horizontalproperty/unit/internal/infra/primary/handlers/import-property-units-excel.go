package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ImportPropertyUnitsExcel godoc
//
//	@Summary		Importar unidades desde Excel
//	@Description	Importa múltiples unidades de propiedad desde un archivo Excel. El Excel debe tener 2 columnas: 'Número de Unidad' y 'Coeficiente de Participación'
//	@Tags			Unidades de Propiedad
//	@Accept			multipart/form-data
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_id	formData	int		false	"ID del business (opcional para super admin)"
//	@Param			file	formData	file	true	"Archivo Excel (.xlsx)"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/property-units/import-excel [post]
func (h *PropertyUnitHandler) ImportPropertyUnitsExcel(c *gin.Context) {
	// Configurar contexto de logging una sola vez para toda la función
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ImportPropertyUnitsExcel")

	fmt.Printf("\n\n")
	fmt.Printf("═══════════════════════════════════════════════════════════════════\n")
	fmt.Printf("  🚀 ENDPOINT: IMPORTAR UNIDADES DESDE EXCEL\n")
	fmt.Printf("═══════════════════════════════════════════════════════════════════\n\n")

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
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "business_id inválido",
					"error":   "Debe ser numérico",
				})
				return
			}
			businessID = uint(businessIDFromForm)
		} else if exists && tokenBusinessID != 0 {
			businessID = tokenBusinessID
		} else {
			h.logger.Error(ctx).Msg("business_id requerido para super admin")
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "business_id requerido",
				"error":   "Debe especificar business_id en el form o tenerlo en el token",
			})
			return
		}
	} else {
		// Usuario normal: business_id siempre del token
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token inválido",
				"error":   "business_id no disponible en el token",
			})
			return
		}
		businessID = tokenBusinessID
	}

	// Agregar business_id al contexto
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	fmt.Printf("📋 [VALIDACION] Business ID determinado: %d\n", businessID)
	fmt.Printf("   Es super admin: %t\n\n", isSuperAdmin)

	// Obtener archivo del form
	fmt.Printf("📂 [VALIDACION] Obteniendo archivo del formulario...\n")
	file, err := c.FormFile("file")
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportPropertyUnitsExcel - Error obteniendo archivo: error=%v\n", err)
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo archivo Excel")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No se proporcionó el archivo Excel",
			"error":   err.Error(),
		})
		return
	}
	fmt.Printf("   ✅ Archivo recibido: '%s'\n", file.Filename)
	fmt.Printf("   Tamaño: %.2f KB (%.2f MB)\n", float64(file.Size)/1024, float64(file.Size)/1024/1024)

	// Validar extensión del archivo
	fmt.Printf("   🔍 Validando extensión...\n")
	ext := filepath.Ext(file.Filename)
	fmt.Printf("   Extensión detectada: '%s'\n", ext)

	if ext != ".xlsx" && ext != ".xls" {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportPropertyUnitsExcel - Extensión inválida: %s (solo .xlsx o .xls permitidos)\n", ext)
		h.logger.Error(ctx).Str("extension", ext).Msg("Extensión de archivo no permitida")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Formato de archivo no válido",
			"error":   "Solo se permiten archivos .xlsx o .xls",
		})
		return
	}
	fmt.Printf("   ✅ Extensión válida\n\n")

	// Validar tamaño del archivo (máximo 10MB)
	fmt.Printf("   🔍 Validando tamaño del archivo...\n")
	maxSize := int64(10 * 1024 * 1024) // 10MB
	fmt.Printf("   Tamaño actual: %d bytes (%.2f MB)\n", file.Size, float64(file.Size)/1024/1024)
	fmt.Printf("   Tamaño máximo: %d bytes (10 MB)\n", maxSize)

	if file.Size > maxSize {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportPropertyUnitsExcel - Archivo muy grande: %d bytes (max: %d bytes)\n", file.Size, maxSize)
		h.logger.Error(ctx).Int64("size", file.Size).Int64("max_size", maxSize).Msg("Archivo Excel muy grande")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "El archivo es muy grande",
			"error":   "El tamaño máximo es 10MB",
		})
		return
	}
	fmt.Printf("   ✅ Tamaño válido\n\n")

	// Guardar archivo temporal
	fmt.Printf("💾 [GUARDANDO] Archivo temporal...\n")
	tempDir := os.TempDir()
	tempFileName := fmt.Sprintf("import_units_%d_%s", businessID, file.Filename)
	tempFile := filepath.Join(tempDir, tempFileName)

	fmt.Printf("   Directorio temporal: %s\n", tempDir)
	fmt.Printf("   Nombre de archivo: %s\n", tempFileName)
	fmt.Printf("   Ruta completa: %s\n", tempFile)

	if err := c.SaveUploadedFile(file, tempFile); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] ImportPropertyUnitsExcel - Error guardando archivo temporal: error=%v\n", err)
		h.logger.Error(ctx).Err(err).Str("temp_file", tempFile).Msg("Error guardando archivo temporal")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Error procesando el archivo",
			"error":   err.Error(),
		})
		return
	}
	fmt.Printf("   ✅ Archivo guardado en disco\n\n")

	// Eliminar archivo temporal después del procesamiento
	defer func() {
		fmt.Printf("🗑️  [LIMPIEZA] Eliminando archivo temporal...\n")
		if err := os.Remove(tempFile); err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] ImportPropertyUnitsExcel - Error eliminando archivo temporal: %v\n", err)
			h.logger.Warn().Err(err).Str("temp_file", tempFile).Msg("Error eliminando archivo temporal")
		} else {
			fmt.Printf("   ✅ Archivo temporal eliminado\n\n")
		}
	}()

	// Llamar al use case para procesar el Excel
	result, err := h.useCase.ImportPropertyUnitsFromExcel(ctx, businessID, tempFile)
	if err != nil {
		status := http.StatusInternalServerError
		message := "Error procesando el archivo Excel"

		// Mapear errores específicos del caso de uso
		switch err {
		case domain.ErrPropertyUnitNotFound:
			status = http.StatusNotFound
			message = "Unidad de propiedad no encontrada"
		case domain.ErrPropertyUnitNumberExists:
			status = http.StatusConflict
			message = "Ya existe una unidad con este número"
		case domain.ErrPropertyUnitNumberRequired:
			status = http.StatusBadRequest
			message = "El número de unidad es requerido"
		case domain.ErrPropertyUnitHasResidents:
			status = http.StatusConflict
			message = "No se puede eliminar una unidad que tiene residentes"
		case domain.ErrPropertyUnitRequired:
			status = http.StatusBadRequest
			message = "La unidad de propiedad es requerida"
		}

		fmt.Fprintf(os.Stderr, "[ERROR] ImportPropertyUnitsExcel - Error procesando Excel: error=%v\n", err)
		h.logger.Error(ctx).Err(err).Uint("business_id", businessID).Msg("Error importando unidades desde Excel")
		c.JSON(status, gin.H{
			"success": false,
			"message": message,
			"error":   err.Error(),
		})
		return
	}

	fmt.Printf("✅ [IMPORTACION COMPLETADA]\n")
	fmt.Printf("   Total filas procesadas: %d\n", result.Total)
	fmt.Printf("   Unidades creadas: %d\n", result.Created)
	fmt.Printf("   Filas omitidas: %d\n", result.Skipped)
	fmt.Printf("   Errores: %d\n\n", len(result.Errors))

	if len(result.Errors) > 0 {
		fmt.Printf("⚠️  [ERRORES ENCONTRADOS]:\n")
		for _, errMsg := range result.Errors {
			fmt.Printf("   - %s\n", errMsg)
		}
		fmt.Printf("\n")
	}

	h.logger.Info(ctx).
		Uint("business_id", businessID).
		Int("total_rows", result.Total).
		Int("created", result.Created).
		Int("skipped", result.Skipped).
		Int("errors_count", len(result.Errors)).
		Msg("Importación de unidades desde Excel completada exitosamente")

	// Retornar resultado
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Importación completada: %d de %d unidades creadas", result.Created, result.Total),
		"data": gin.H{
			"total":   result.Total,
			"created": result.Created,
			"skipped": result.Skipped,
			"errors":  result.Errors,
		},
	})
}
