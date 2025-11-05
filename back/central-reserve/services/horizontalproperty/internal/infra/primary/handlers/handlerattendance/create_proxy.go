package handlerattendance

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// CreateProxy godoc
//
//	@Summary		Crear apoderado
//	@Description	Crea un nuevo apoderado para una unidad de propiedad
//	@Tags			Apoderados
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		request.CreateProxyRequest	true	"Datos del apoderado"
//	@Success		201		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/proxies [post]
func (h *AttendanceHandler) CreateProxy(c *gin.Context) {
	var req request.CreateProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}

	// Obtener business_id del token (no del request)
	isSuperAdmin := middleware.IsSuperAdmin(c)
	var businessID uint
	var exists bool
	businessID, exists = middleware.GetBusinessID(c)

	if !exists && !isSuperAdmin {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Error:   "business_id no disponible en el token",
		})
		return
	}

	// Si es super admin y no hay business_id en el token, usar el del request (opcional)
	if isSuperAdmin && businessID == 0 {
		businessID = req.BusinessID
	}

	dto := domain.CreateProxyDTO{
		BusinessID:      businessID, // Usar business_id del token
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
	c.JSON(http.StatusCreated, gin.H{
		"success":    true,
		"message":    "Apoderado creado exitosamente",
		"proxy_name": created.ProxyName,
		"proxy_id":   created.ID,
		"data":       response.ProxyResponse(*created),
	})
}
