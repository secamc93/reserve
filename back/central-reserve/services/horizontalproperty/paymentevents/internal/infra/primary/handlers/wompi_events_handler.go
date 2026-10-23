package handlers

import (
	"errors"
	"io"
	"net/http"

	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/services/horizontalproperty/paymentevents/internal/infra/primary/handlers/response"
	"central_reserve/shared/payments/wompi"

	"github.com/gin-gonic/gin"
)

const maxEventBytes = 64 << 10

// WompiEvents godoc
//
//	@Summary		Webhook de eventos de Wompi
//	@Description	Recibe transaction.updated, valida la firma y lo pasa al módulo dueño de la referencia (DIA- días de votación, MEMB- membresías). Wompi reintenta si no recibe 200
//	@Tags			Pagos
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	response.Result
//	@Failure		401	{object}	response.Result
//	@Router			/payments/wompi/events [post]
func (h *handler) WompiEvents(c *gin.Context) {
	body, err := io.ReadAll(io.LimitReader(c.Request.Body, maxEventBytes))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Result{Success: false, Message: "Cuerpo inválido"})
		return
	}
	tx, err := h.client.ParseEvent(body)
	switch {
	case errors.Is(err, wompi.ErrInvalidSignature):
		h.logger.Warn().Err(err).Msg("Evento de Wompi con firma inválida")
		c.JSON(http.StatusUnauthorized, response.Result{Success: false, Message: "Firma inválida"})
		return
	case errors.Is(err, wompi.ErrNotConfigured):
		c.JSON(http.StatusServiceUnavailable, response.Result{Success: false, Message: "Pasarela sin configurar"})
		return
	case err != nil:
		c.JSON(http.StatusBadRequest, response.Result{Success: false, Message: "Evento inválido"})
		return
	case tx == nil:
		c.JSON(http.StatusOK, response.Result{Success: true, Message: "Evento sin transacción"})
		return
	}

	applier := h.applierFor(tx.Reference)
	if applier == nil {
		h.logger.Warn().Str("reference", tx.Reference).Msg("Evento de Wompi con referencia que ningún módulo reconoce")
		c.JSON(http.StatusOK, response.Result{Success: true, Message: "Evento recibido sin cambios"})
		return
	}
	switch err := applier.ApplyGatewayTransaction(c.Request.Context(), *tx); {
	case err == nil:
		c.JSON(http.StatusOK, response.Result{Success: true, Message: "Evento procesado"})
	case errors.Is(err, contract.ErrNotApplicable):
		h.logger.Warn().Err(err).Str("reference", tx.Reference).Msg("Evento de Wompi sin pago aplicable")
		c.JSON(http.StatusOK, response.Result{Success: true, Message: "Evento recibido sin cambios"})
	default:
		h.logger.Error().Err(err).Str("reference", tx.Reference).Msg("Error aplicando evento de Wompi")
		c.JSON(http.StatusInternalServerError, response.Result{Success: false, Message: "Error procesando el evento"})
	}
}
