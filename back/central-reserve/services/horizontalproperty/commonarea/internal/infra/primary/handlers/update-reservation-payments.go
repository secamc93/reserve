package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// UpdateReservationPayments marca el depósito y/o el pago completo de una reserva
func (h *CommonAreaHandler) UpdateReservationPayments(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateReservationPayments")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	var req request.UpdatePaymentsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	if req.DepositPaid == nil && req.FullPaymentPaid == nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Indique deposit_paid o full_payment_paid"})
		return
	}
	if _, ok := h.loadReservationInScope(c, id); !ok {
		return
	}
	reservation, err := h.useCase.UpdateReservationPayments(ctx, id, domain.UpdatePaymentsDTO{
		DepositPaid:     req.DepositPaid,
		FullPaymentPaid: req.FullPaymentPaid,
	})
	if err != nil {
		h.writeUseCaseError(c, err, "Error actualizando pagos")
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Message: "Pagos actualizados", Data: mappers.ReservationToResponse(reservation)})
}
