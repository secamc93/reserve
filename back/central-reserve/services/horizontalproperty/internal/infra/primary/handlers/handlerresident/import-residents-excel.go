package handlerresident

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

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
//	@Param			business_id	formData	int		false	"ID del business (opcional para super admin)"
//	@Param			file	formData	file	true	"Archivo Excel (.xlsx)"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/residents/import-excel [post]
func (h *ResidentHandler) ImportResidentsExcel(c *gin.Context) {
	// Configurar contexto de logging
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ImportResidentsExcel")

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

	// Agregar business_id al contexto para logging
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	h.logger.Info(ctx).Bool("is_super_admin", isSuperAdmin).Msg("Importando residentes desde Excel")

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
	tempDir := os.TempDir()
	tempFile := filepath.Join(tempDir, fmt.Sprintf("import_residents_%d_%s", businessID, file.Filename))

	if err := c.SaveUploadedFile(file, tempFile); err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error guardando archivo temporal")
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Error procesando el archivo",
			"error":   err.Error(),
		})
		return
	}

	// Eliminar archivo temporal al finalizar
	defer func() {
		fmt.Printf("🗑️  [LIMPIEZA] Eliminando archivo temporal...\n")
		os.Remove(tempFile)
		fmt.Printf("   ✅ Eliminado\n\n")
	}()

	// Llamar al use case
	result, err := h.useCase.ImportResidentsFromExcel(ctx, businessID, tempFile)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error importando residentes")
		var details []string
		if result != nil {
			details = result.Errors
		} else {
			details = []string{}
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Error procesando el archivo Excel",
			"error":   err.Error(),
			"details": details,
		})
		return
	}

	h.logger.Info(ctx).Int("created", result.Created).Int("total_errors", len(result.Errors)).Msg("Residentes importados desde Excel exitosamente")

	fmt.Printf("✅ [IMPORTACION EXITOSA]\n")
	fmt.Printf("   Total: %d\n", result.Total)
	fmt.Printf("   Creados: %d\n\n", result.Created)

	h.logger.Info(ctx).
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
