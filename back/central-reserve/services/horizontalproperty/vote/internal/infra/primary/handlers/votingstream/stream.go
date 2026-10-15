// Package votingstream sirve el stream SSE de resultados de una votación. Lo usan el stream
// del admin y el público para que ambos emitan exactamente los mismos eventos.
//
// Eventos (en este orden al conectar):
//
//	event: connected     data: {"message": "...", "voting_id": N, ...extra}
//	event: initial_data  data: {"voting_id": N, "total_votes": T, "results": [...], "votes": [...]*}
//	event: new_vote      data: {"voting_id": N, "total_votes": T, "results": [...], "vote": {...}*}
//	event: vote_deleted  data: {"voting_id": N, "total_votes": T, "results": [...], "vote": {...}*}
//	event: votes_reset   data: {"voting_id": N, "total_votes": 0, "results": [...]}
//	event: heartbeat     data: {"timestamp": "RFC3339"}
//
// (*) "votes" y "vote" solo se incluyen con IncludeVotes (stream del admin): el público no
// expone cómo votó cada unidad. "results" siempre trae todas las opciones activas con
// vote_count, percentage y percentage_by_coefficient.
package votingstream

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// HeartbeatInterval es cada cuánto se envía un heartbeat para mantener viva la conexión.
var HeartbeatInterval = 30 * time.Second

// VotesSource lista los votos de una votación (usecasevotes).
type VotesSource interface {
	ListVotesByVoting(ctx context.Context, votingID uint) ([]domain.VoteDTO, error)
}

// ResultsSource calcula los resultados de una votación (usecaseresults).
type ResultsSource interface {
	GetVotingResults(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error)
}

// Options configura un stream.
type Options struct {
	VotingID     uint
	IncludeVotes bool
	// Connected se agrega al data del evento connected.
	Connected gin.H
}

// Serve abre el stream SSE y lo mantiene hasta que el cliente se desconecta o la votación se
// elimina (el cache cierra el canal). Se suscribe ANTES de calcular el estado inicial para no
// perder votos que lleguen mientras tanto.
func Serve(c *gin.Context, opts Options, votes VotesSource, results ResultsSource, cache domain.VotingCacheService, logger log.ILogger) {
	ctx := c.Request.Context()

	voteChan, err := cache.Subscribe(ctx, opts.VotingID)
	if err != nil {
		logger.Error().Err(err).Uint("voting_id", opts.VotingID).Msg("Error suscribiéndose al cache de votación")
		c.JSON(500, response.ErrorResponse{Success: false, Message: "Error suscribiéndose a la votación", Error: err.Error()})
		return
	}

	// El http.Server tiene WriteTimeout (15 s): sin quitarlo para esta respuesta, el stream se
	// corta a los 15 s de abierto. Se quita solo para esta conexión.
	if err := http.NewResponseController(c.Writer).SetWriteDeadline(time.Time{}); err != nil {
		logger.Warn().Err(err).Uint("voting_id", opts.VotingID).Msg("No se pudo quitar el write deadline del stream SSE")
	}

	h := c.Writer.Header()
	h.Set("Content-Type", "text/event-stream")
	h.Set("Cache-Control", "no-cache")
	h.Set("Connection", "keep-alive")
	h.Set("X-Accel-Buffering", "no")
	c.Status(200)

	connected := gin.H{"message": "Conectado al stream de votación", "voting_id": opts.VotingID}
	for k, v := range opts.Connected {
		connected[k] = v
	}
	if !write(c, "connected", connected) {
		return
	}

	initial := snapshot(ctx, opts.VotingID, results, logger)
	if opts.IncludeVotes {
		list, err := votes.ListVotesByVoting(ctx, opts.VotingID)
		if err != nil {
			logger.Error().Err(err).Uint("voting_id", opts.VotingID).Msg("Error cargando votos para el stream")
			list = nil
		}
		initial["votes"] = mappers.MapVoteDTOsToResponses(list)
	}
	if !write(c, "initial_data", initial) {
		return
	}

	ticker := time.NewTicker(HeartbeatInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if !write(c, "heartbeat", gin.H{"timestamp": time.Now().Format(time.RFC3339)}) {
				return
			}
		case ev, ok := <-voteChan:
			if !ok {
				return
			}
			eventType := ev.Type
			if eventType != domain.VoteEventVoteDeleted && eventType != domain.VoteEventVotesReset {
				eventType = domain.VoteEventNewVote
			}
			payload := snapshot(ctx, opts.VotingID, results, logger)
			if opts.IncludeVotes && eventType != domain.VoteEventVotesReset {
				payload["vote"] = mappers.MapVoteDTOToResponse(&ev.Vote)
			}
			if !write(c, eventType, payload) {
				return
			}
		}
	}
}

// snapshot arma {"voting_id", "total_votes", "results"} con los resultados actuales de la BD.
func snapshot(ctx context.Context, votingID uint, results ResultsSource, logger log.ILogger) gin.H {
	list, err := results.GetVotingResults(ctx, votingID)
	if err != nil {
		logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo resultados para el stream")
	}
	total := 0
	for _, r := range list {
		total += r.VoteCount
	}
	return gin.H{
		"voting_id":   votingID,
		"total_votes": total,
		"results":     mappers.MapVotingResultsToResponses(list),
	}
}

// write escribe un evento SSE y hace flush. Devuelve false si el cliente ya no está.
func write(c *gin.Context, event string, data any) bool {
	b, err := json.Marshal(data)
	if err != nil {
		return false
	}
	if _, err := fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", event, b); err != nil {
		return false
	}
	c.Writer.Flush()
	return true
}
