package handlervote

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// SSEVotingResults godoc
//
//	@Summary		Stream de resultados de votación en tiempo real (SSE)
//	@Description	Establece una conexión SSE para recibir votos en tiempo real de una votación específica
//	@Tags			Votaciones
//	@Accept			json
//	@Produce		text/event-stream
//	@Security		BearerAuth
//	@Param			hp_id		path		int		true	"ID de la propiedad horizontal"
//	@Param			group_id	path		int		true	"ID del grupo de votación"
//	@Param			voting_id	path		int		true	"ID de la votación"
//	@Success		200			{string}	string	"Event stream"
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/stream [get]
func (h *VotingHandler) SSEVotingResults(c *gin.Context) {
	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error parseando ID: %v\n", err)
		h.logger.Error().Err(err).Str("voting_id", votingIDParam).Msg("Error parseando ID de votación para SSE")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	// Configurar headers para SSE
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// Obtener estado actual de la votación desde el cache
	existingVotes, err := h.votingCache.GetVotingState(uint(votingID))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error obteniendo estado del cache: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error obteniendo estado del cache")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo estado de la votación",
			Error:   err.Error(),
		})
		return
	}

	// Si el cache está vacío, cargar desde la base de datos
	if len(existingVotes) == 0 {
		votes, err := h.votingUseCase.ListVotesByVoting(c.Request.Context(), uint(votingID))
		if err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error cargando votos desde BD: %v\n", err)
			h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error cargando votos desde BD")
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{
				Success: false,
				Message: "Error cargando votos",
				Error:   err.Error(),
			})
			return
		}

		// Inicializar cache con votos existentes
		if err := h.votingCache.InitializeVoting(uint(votingID), votes); err != nil {
			fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error inicializando cache: %v\n", err)
			h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error inicializando cache")
		}
		existingVotes = votes
	}

	// Enviar precarga (votos existentes)
	if len(existingVotes) > 0 {
		h.logger.Info().Uint("voting_id", uint(votingID)).Int("votes_count", len(existingVotes)).Msg("Enviando precarga de votos")

		for _, vote := range existingVotes {
			responseVote := mapper.MapVoteDTOToResponse(&vote)
			data, _ := json.Marshal(responseVote)

			event := fmt.Sprintf("event: vote\ndata: %s\n\n", string(data))
			if _, err := c.Writer.WriteString(event); err != nil {
				fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error enviando precarga: %v\n", err)
				return
			}
			c.Writer.Flush()
		}

		// Enviar evento de precarga completada
		completedEvent := fmt.Sprintf("event: preload_complete\ndata: {\"message\": \"Precarga completada\", \"total_votes\": %d}\n\n", len(existingVotes))
		c.Writer.WriteString(completedEvent)
		c.Writer.Flush()
	}

	// Suscribirse a nuevos votos
	voteChan, err := h.votingCache.Subscribe(c.Request.Context(), uint(votingID))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error suscribiéndose al cache: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error suscribiéndose al cache")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error suscribiéndose a la votación",
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info().Uint("voting_id", uint(votingID)).Msg("Cliente conectado al SSE de votación")

	// Enviar evento de conexión establecida
	connectedEvent := fmt.Sprintf("event: connected\ndata: {\"message\": \"Conectado a votación\", \"voting_id\": %d}\n\n", votingID)
	c.Writer.WriteString(connectedEvent)
	c.Writer.Flush()

	// Mantener conexión y enviar nuevos votos
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.Request.Context().Done():
			// Cliente desconectado
			h.logger.Info().Uint("voting_id", uint(votingID)).Msg("Cliente desconectado del SSE")
			return

		case vote, ok := <-voteChan:
			if !ok {
				// Canal cerrado
				h.logger.Info().Uint("voting_id", uint(votingID)).Msg("Canal de votos cerrado")
				return
			}

			// Enviar nuevo voto
			responseVote := mapper.MapVoteDTOToResponse(&vote)
			data, err := json.Marshal(responseVote)
			if err != nil {
				fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error serializando voto: %v\n", err)
				h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error serializando voto")
				continue
			}

			event := fmt.Sprintf("event: vote\ndata: %s\n\n", string(data))
			if _, err := c.Writer.WriteString(event); err != nil {
				fmt.Fprintf(os.Stderr, "[ERROR] handlervote/sse-voting-results.go - Error enviando voto por SSE: %v\n", err)
				h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Msg("Error enviando voto por SSE")
				return
			}
			c.Writer.Flush()

		case <-ticker.C:
			// Enviar heartbeat cada 30 segundos para mantener la conexión viva
			heartbeat := fmt.Sprintf("event: heartbeat\ndata: {\"timestamp\": \"%s\"}\n\n", time.Now().Format(time.RFC3339))
			if _, err := c.Writer.WriteString(heartbeat); err != nil {
				// Cliente desconectado
				return
			}
			c.Writer.Flush()
		}
	}
}
