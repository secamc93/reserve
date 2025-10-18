package handlerattendance

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// ListProxies godoc
//
//	@Summary		Listar apoderados
//	@Description	Lista todos los apoderados de un business con filtros opcionales
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id		query	uint	false	"ID del business"
//	@Param			property_unit_id	query	uint	false	"Filtro por unidad de propiedad"
//	@Param			proxy_type		query	string	false	"Filtro por tipo de apoderado"
//	@Param			is_active		query	bool	false	"Filtro por activo"
//	@Success		200				{object}	object
//	@Failure		400				{object}	object
//	@Failure		500				{object}	object
//	@Router			/attendance/proxies [get]
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
