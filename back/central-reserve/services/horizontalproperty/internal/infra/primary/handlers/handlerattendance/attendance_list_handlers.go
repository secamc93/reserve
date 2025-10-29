package handlerattendance

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListAttendanceLists godoc
//
//	@Summary		Listar listas de asistencia
//	@Description	Lista todas las listas de asistencia por business con filtros opcionales
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query	uint	false	"ID del business (opcional para super admin)"
//	@Param			title		query	string	false	"Filtro por título"
//	@Param			is_active	query	bool	false	"Filtro por activo"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/attendance/lists [get]
func (h *AttendanceHandler) ListAttendanceLists(c *gin.Context) {
	// Verificar si es super admin
	isSuperAdmin := middleware.IsSuperAdmin(c)

	var businessID uint
	if isSuperAdmin {
		// Super admin: query params opcionales, si no hay business_id ve todo
		businessIDStr := c.Query("business_id")
		if businessIDStr != "" {
			businessID = parseUint(businessIDStr)
		}
		// Si businessIDStr está vacío, businessID = 0 significa "ver todo"
	} else {
		// Usuario normal: usar business_id del token
		var exists bool
		businessID, exists = middleware.GetBusinessID(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Error:   "business_id no disponible en el token",
			})
			return
		}
	}

	// Crear contexto con business_id para logging estructurado
	ctx := c.Request.Context()
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	// Log de información con contexto estructurado
	h.logger.Info(ctx).Uint("business_id", businessID).Bool("is_super_admin", isSuperAdmin).Msg("Listando listas de asistencia")

	filters := map[string]interface{}{}
	if v := c.Query("title"); v != "" {
		filters["title"] = v
	}
	if v := c.Query("is_active"); v != "" {
		filters["is_active"] = (v == "true")
	}
	lists, err := h.attendanceUseCase.ListAttendanceLists(ctx, businessID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando listas de asistencia", Error: err.Error()})
		return
	}
	out := make([]response.AttendanceListResponse, len(lists))
	for i, l := range lists {
		out[i] = response.AttendanceListResponse(l)
	}
	c.JSON(http.StatusOK, response.SuccessResponse[[]response.AttendanceListResponse]{Success: true, Message: "Listas obtenidas", Data: out})
}

func (h *AttendanceHandler) GetAttendanceListByID(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "GetAttendanceListByID no implementado aún",
	})
}

func (h *AttendanceHandler) UpdateAttendanceList(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "UpdateAttendanceList no implementado aún",
	})
}

// DeleteAttendanceList godoc
//
//	@Summary		Eliminar lista de asistencia
//	@Description	Elimina una lista de asistencia por ID
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path	uint	true	"ID de la lista"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/lists/{id} [delete]
func (h *AttendanceHandler) DeleteAttendanceList(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID requerido", Error: "id es obligatorio"})
		return
	}
	if err := h.attendanceUseCase.DeleteAttendanceList(c.Request.Context(), parseUint(idStr)); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error eliminando lista", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse[gin.H]{Success: true, Message: "Lista de asistencia eliminada", Data: gin.H{"id": parseUint(idStr)}})
}

// GetAttendanceSummary godoc
//
//	@Summary		Resumen de asistencia
//	@Description	Obtiene el resumen estadístico de una lista
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path	uint	true	"ID de la lista"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/lists/{id}/summary [get]
func (h *AttendanceHandler) GetAttendanceSummary(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID requerido", Error: "id es obligatorio"})
		return
	}
	summary, err := h.attendanceUseCase.GetAttendanceSummary(c.Request.Context(), parseUint(idStr))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo resumen", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.AttendanceSummarySuccess{Success: true, Message: "Resumen obtenido", Data: response.AttendanceSummaryResponse(*summary)})
}

// GetAttendanceRecordsByList godoc
//
//	@Summary		Listar registros de asistencia de una lista
//	@Description	Obtiene registros de una lista de asistencia con paginación y filtros
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path	uint	true	"ID de la lista"
//	@Param			page	query	int	false	"Página (default 1)"
//	@Param			page_size	query	int	false	"Tamaño de página (default 50)"
//	@Param			unit_number	query	string	false	"Filtro por número de unidad (CASA)"
//	@Param			attended	query	string	false	"Filtro de asistencia: true|false"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/lists/{id}/records [get]
func (h *AttendanceHandler) GetAttendanceRecordsByList(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID requerido", Error: "id es obligatorio"})
		return
	}

	page := 1
	pageSize := 50
	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := c.Query("page_size"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			pageSize = n
		}
	}
	unitNumber := c.Query("unit_number")
	var attendedPtr *bool
	if v := c.Query("attended"); v != "" {
		if v == "true" || v == "false" {
			b := (v == "true")
			attendedPtr = &b
		}
	}

	dto, err := h.attendanceUseCase.GetAttendanceRecordsByListPaged(c.Request.Context(), parseUint(idStr), unitNumber, attendedPtr, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo registros", Error: err.Error()})
		return
	}
	out := make([]response.AttendanceRecordResponse, len(dto.Data))
	for i, r := range dto.Data {
		out[i] = response.AttendanceRecordResponse{
			ID:                r.ID,
			AttendanceListID:  r.AttendanceListID,
			PropertyUnitID:    r.PropertyUnitID,
			ResidentID:        r.ResidentID,
			ProxyID:           r.ProxyID,
			AttendedAsOwner:   r.AttendedAsOwner,
			AttendedAsProxy:   r.AttendedAsProxy,
			Signature:         r.Signature,
			SignatureDate:     r.SignatureDate,
			SignatureMethod:   r.SignatureMethod,
			VerifiedBy:        r.VerifiedBy,
			VerificationDate:  r.VerificationDate,
			VerificationNotes: r.VerificationNotes,
			Notes:             r.Notes,
			IsValid:           r.IsValid,
			CreatedAt:         r.CreatedAt,
			UpdatedAt:         r.UpdatedAt,
			ResidentName:      r.ResidentName,
			ProxyName:         r.ProxyName,
			UnitNumber:        r.UnitNumber,
		}
	}
	// Headers de paginación simples
	c.Header("X-Total-Count", strconv.FormatInt(dto.Total, 10))
	c.Header("X-Page", strconv.Itoa(dto.Page))
	c.Header("X-Page-Size", strconv.Itoa(dto.PageSize))
	c.Header("X-Total-Pages", strconv.Itoa(dto.TotalPages))

	// Respuesta con metadatos de paginación
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Registros obtenidos",
		"data":        out,
		"total":       dto.Total,
		"page":        dto.Page,
		"page_size":   dto.PageSize,
		"total_pages": dto.TotalPages,
	})
}

// ExportAttendanceExcel godoc
//
//	@Summary		Exportar lista de asistencia a Excel
//	@Description	Genera un Excel horizontal con columnas: Casa (unidad), Propietario, Apoderado, Firma. Incluye título del grupo en la hoja.
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
//	@Param			id	path	uint	true	"ID de la lista"
//	@Success		200		{file}  binary
//	@Failure		400		{object} object
//	@Failure		500		{object} object
//	@Router			/attendance/lists/{id}/export-excel [get]
func (h *AttendanceHandler) ExportAttendanceExcel(c *gin.Context) {
	id := parseUint(c.Param("id"))
	// obtener registros y título
	records, err := h.attendanceUseCase.GetAttendanceRecordsByList(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo registros", Error: err.Error()})
		return
	}
	title, _ := h.attendanceUseCase.GetVotingGroupTitleByListID(c.Request.Context(), id)

	// generar CSV simple (compatible Excel) por rapidez
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=asistencia.csv")
	// título
	c.Writer.Write([]byte("\xEF\xBB\xBF")) // BOM UTF-8
	if title != "" {
		c.Writer.Write([]byte(title + "\n"))
	}
	// encabezados
	c.Writer.Write([]byte("Casa,Propietario,Apoderado,Firma\n"))
	// filas
	for _, r := range records {
		// Casa = property_unit_id (si tienes número en cache, se podría enriquecer luego)
		unit := r.UnitNumber
		owner := r.ResidentName
		proxy := r.ProxyName
		firma := ""
		line := unit + "," + owner + "," + proxy + "," + firma + "\n"
		c.Writer.Write([]byte(line))
	}
}
