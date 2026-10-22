package handlers

import (
	"errors"
	"io"
	"net/http"

	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

const maxEventBytes = 64 << 10

// WompiEvents godoc
//
//	@Summary		Webhook de eventos de Wompi
//	@Description	Recibe transaction.updated. Público: se autentica con la firma del evento
//	@Tags			Cobro de votaciones
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	response.Success
//	@Failure		401	{object}	response.ErrorResponse
//	@Router			/payments/wompi/events [post]
func (h *handler) WompiEvents(c *gin.Context) {
	body, err := io.ReadAll(io.LimitReader(c.Request.Body, maxEventBytes))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Cuerpo inválido"})
		return
	}
	err = h.useCase.HandleGatewayEvent(c.Request.Context(), body)
	switch {
	case err == nil:
		c.JSON(http.StatusOK, response.Success{Success: true, Message: "Evento procesado"})
	case errors.Is(err, domainerrors.ErrInvalidEventSignature):
		h.logger.Warn().Err(err).Msg("Evento de Wompi con firma inválida")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "Firma inválida"})
	case errors.Is(err, domainerrors.ErrPaymentNotFound), errors.Is(err, domainerrors.ErrTransactionMismatch):
		// Firmado pero no aplicable (otra referencia, otro ambiente o monto distinto): se confirma
		// la recepción para que Wompi no lo reintente; queda en el log.
		h.logger.Warn().Err(err).Msg("Evento de Wompi sin pago aplicable")
		c.JSON(http.StatusOK, response.Success{Success: true, Message: "Evento recibido sin cambios"})
	default:
		h.logger.Error().Err(err).Msg("Error procesando evento de Wompi")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error procesando el evento"})
	}
}
