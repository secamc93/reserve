package handlerattendance

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// Placeholder handlers - Implementar según necesidades

// ListAttendanceLists godoc
//
//	@Summary		Listar listas de asistencia
//	@Description	Lista todas las listas de asistencia por business con filtros opcionales
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query	uint	true	"ID del business"
//	@Param			title		query	string	false	"Filtro por título"
//	@Param			is_active	query	bool	false	"Filtro por activo"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/attendance/lists [get]
func (h *AttendanceHandler) ListAttendanceLists(c *gin.Context) {
	businessIDStr := c.Query("business_id")
	if businessIDStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "business_id es obligatorio"})
		return
	}
	filters := map[string]interface{}{}
	if v := c.Query("title"); v != "" {
		filters["title"] = v
	}
	if v := c.Query("is_active"); v != "" {
		filters["is_active"] = (v == "true")
	}
	lists, err := h.attendanceUseCase.ListAttendanceLists(c.Request.Context(), parseUint(businessIDStr), filters)
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

func (h *AttendanceHandler) CreateProxy(c *gin.Context) {
	var req request.CreateProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.CreateProxyDTO{
		BusinessID:      req.BusinessID,
		PropertyUnitID:  req.PropertyUnitID,
		ProxyName:       req.ProxyName,
		ProxyDni:        req.ProxyDni,
		ProxyEmail:      req.ProxyEmail,
		ProxyPhone:      req.ProxyPhone,
		ProxyAddress:    req.ProxyAddress,
		ProxyType:       req.ProxyType,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		PowerOfAttorney: req.PowerOfAttorney,
		Notes:           req.Notes,
	}
	created, err := h.attendanceUseCase.CreateProxy(c.Request.Context(), dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error creando apoderado", Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, response.ProxySuccess{Success: true, Message: "Apoderado creado", Data: response.ProxyResponse(*created)})
}

func (h *AttendanceHandler) ListProxies(c *gin.Context) {
	businessIDStr := c.Query("business_id")
	if businessIDStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "business_id es obligatorio"})
		return
	}
	filters := map[string]interface{}{}
	if v := c.Query("property_unit_id"); v != "" {
		filters["property_unit_id"] = parseUint(v)
	}
	if v := c.Query("proxy_type"); v != "" {
		filters["proxy_type"] = v
	}
	if v := c.Query("is_active"); v != "" {
		filters["is_active"] = (v == "true")
	}
	list, err := h.attendanceUseCase.ListProxies(c.Request.Context(), parseUint(businessIDStr), filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando apoderados", Error: err.Error()})
		return
	}
	out := make([]response.ProxyResponse, len(list))
	for i, p := range list {
		out[i] = response.ProxyResponse(p)
	}
	c.JSON(http.StatusOK, response.ProxiesSuccess{Success: true, Message: "Apoderados listados", Data: out})
}

func (h *AttendanceHandler) GetProxyByID(c *gin.Context) {
	id := parseUint(c.Param("id"))
	p, err := h.attendanceUseCase.GetProxyByID(c.Request.Context(), id)
	if err != nil || p == nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "No encontrado", Error: "proxy no encontrado"})
		return
	}
	c.JSON(http.StatusOK, response.ProxySuccess{Success: true, Message: "Apoderado obtenido", Data: response.ProxyResponse(*p)})
}

func (h *AttendanceHandler) UpdateProxy(c *gin.Context) {
	id := parseUint(c.Param("id"))
	var req request.UpdateProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.UpdateProxyDTO{
		ProxyName:       req.ProxyName,
		ProxyDni:        req.ProxyDni,
		ProxyEmail:      req.ProxyEmail,
		ProxyPhone:      req.ProxyPhone,
		ProxyAddress:    req.ProxyAddress,
		ProxyType:       req.ProxyType,
		IsActive:        req.IsActive,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		PowerOfAttorney: req.PowerOfAttorney,
		Notes:           req.Notes,
	}
	updated, err := h.attendanceUseCase.UpdateProxy(c.Request.Context(), id, dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error actualizando apoderado", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.ProxySuccess{Success: true, Message: "Apoderado actualizado", Data: response.ProxyResponse(*updated)})
}

func (h *AttendanceHandler) DeleteProxy(c *gin.Context) {
	id := parseUint(c.Param("id"))
	if err := h.attendanceUseCase.DeleteProxy(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error eliminando apoderado", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse[gin.H]{Success: true, Message: "Apoderado eliminado", Data: gin.H{"id": id}})
}

func (h *AttendanceHandler) GetProxiesByPropertyUnit(c *gin.Context) {
	unitID := parseUint(c.Param("unit_id"))
	list, err := h.attendanceUseCase.GetProxiesByPropertyUnit(c.Request.Context(), unitID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando apoderados por unidad", Error: err.Error()})
		return
	}
	out := make([]response.ProxyResponse, len(list))
	for i, p := range list {
		out[i] = response.ProxyResponse(p)
	}
	c.JSON(http.StatusOK, response.ProxiesSuccess{Success: true, Message: "Apoderados por unidad", Data: out})
}

func (h *AttendanceHandler) CreateAttendanceRecord(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "CreateAttendanceRecord no implementado aún",
	})
}

func (h *AttendanceHandler) ListAttendanceRecords(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "ListAttendanceRecords no implementado aún",
	})
}

func (h *AttendanceHandler) GetAttendanceRecordByID(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "GetAttendanceRecordByID no implementado aún",
	})
}

func (h *AttendanceHandler) UpdateAttendanceRecord(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "UpdateAttendanceRecord no implementado aún",
	})
}

func (h *AttendanceHandler) DeleteAttendanceRecord(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "DeleteAttendanceRecord no implementado aún",
	})
}

func (h *AttendanceHandler) VerifyAttendance(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "VerifyAttendance no implementado aún",
	})
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
//	@Description	Obtiene todos los registros de una lista de asistencia
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path	uint	true	"ID de la lista"
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
	records, err := h.attendanceUseCase.GetAttendanceRecordsByList(c.Request.Context(), parseUint(idStr))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo registros", Error: err.Error()})
		return
	}
	// map DTO -> response (iguales campos)
	out := make([]response.AttendanceRecordResponse, len(records))
	for i, r := range records {
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
		}
	}
	c.JSON(http.StatusOK, response.AttendanceRecordsSuccess{Success: true, Message: "Registros obtenidos", Data: out})
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

// parseUint helper
func parseUint(s string) uint {
	var out uint
	if v, err := strconv.ParseUint(s, 10, 32); err == nil {
		out = uint(v)
	}
	return out
}
