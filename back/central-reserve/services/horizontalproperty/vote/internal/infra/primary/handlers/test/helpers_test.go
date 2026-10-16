package handlers_test

import (
	"bufio"
	"encoding/json"
	"net/http"
	"strings"
	"testing"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasecredentials"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasepublic"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseshared"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlercredentials"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlerpublic"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlerresults"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotes"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotings"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/cache"

	"github.com/gin-gonic/gin"
)

const testSecret = "secreto-de-prueba"

type fixedConfig map[string]string

func (c fixedConfig) Get(k string) string { return c[k] }

// newRouter arma el router del módulo (mismas rutas que bundle.go) con casos de uso reales
// sobre un repositorio mock y el cache real (el mismo mecanismo de publicación que en prod).
func newRouter(t *testing.T, repo domain.VotingRepository) (*gin.Engine, *cache.VotingCache) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	logger := mocks.NewMockLogger()
	middleware.InitFromEnv(fixedConfig{"JWT_SECRET": testSecret}, logger)

	vc := cache.New()
	groups := usecasevotinggroups.New(repo, vc, logger)
	votings := usecasevotings.New(repo, vc, logger)
	options := usecasevotingoptions.New(repo, vc, logger)
	votes := usecasevotes.New(repo, vc, logger)
	public := usecasepublic.New(repo, vc, logger)
	results := usecaseresults.New(repo, vc, logger)
	shared := usecaseshared.New(repo, vc, logger)

	h := handlers.New(
		handlervotinggroups.New(groups, logger),
		handlervotings.New(votings, logger),
		handlerresults.New(results, votings, votes, groups, vc, logger),
		handlervotingoptions.New(options, logger),
		handlervotes.New(votes, logger),
		handlerpublic.New(public, groups, votings, votes, results, shared, vc, testSecret, logger),
		handlercredentials.New(usecasecredentials.New(repo, logger, nil), logger),
		groups,
		votings,
	)
	r := gin.New()
	h.RegisterRoutes(r.Group("/api/v1"))
	return r, vc
}

type sseEvent struct {
	Name string
	Data map[string]any
}

// readSSE lee eventos de un stream SSE y los entrega por un canal hasta que se cierra.
func readSSE(resp *http.Response) <-chan sseEvent {
	ch := make(chan sseEvent, 32)
	go func() {
		defer close(ch)
		sc := bufio.NewScanner(resp.Body)
		var name string
		for sc.Scan() {
			line := sc.Text()
			switch {
			case strings.HasPrefix(line, "event:"):
				name = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
			case strings.HasPrefix(line, "data:"):
				var data map[string]any
				_ = json.Unmarshal([]byte(strings.TrimSpace(strings.TrimPrefix(line, "data:"))), &data)
				ch <- sseEvent{Name: name, Data: data}
			}
		}
	}()
	return ch
}

// waitEvent espera el siguiente evento distinto de heartbeat y verifica su nombre.
func waitEvent(t *testing.T, ch <-chan sseEvent, want string, timeout time.Duration) sseEvent {
	t.Helper()
	deadline := time.After(timeout)
	for {
		select {
		case ev, ok := <-ch:
			if !ok {
				t.Fatalf("el stream se cerró esperando el evento %q", want)
			}
			if ev.Name == "heartbeat" {
				continue
			}
			if ev.Name != want {
				t.Fatalf("se esperaba el evento %q, llegó %q (%v)", want, ev.Name, ev.Data)
			}
			return ev
		case <-deadline:
			t.Fatalf("timeout esperando el evento %q", want)
		}
	}
}

// voteCount devuelve el vote_count de la opción optionID en el data de un evento.
func voteCount(t *testing.T, data map[string]any, optionID uint) int {
	t.Helper()
	results, _ := data["results"].([]any)
	for _, r := range results {
		m := r.(map[string]any)
		if uint(m["voting_option_id"].(float64)) == optionID {
			if _, ok := m["percentage_by_coefficient"]; !ok {
				t.Errorf("los resultados deben traer percentage_by_coefficient: %v", m)
			}
			return int(m["vote_count"].(float64))
		}
	}
	t.Fatalf("la opción %d no está en los resultados: %v", optionID, data["results"])
	return 0
}
