package cache_test

import (
	"context"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/secondary/cache"
)

func recv(t *testing.T, ch <-chan domain.VoteEvent) domain.VoteEvent {
	t.Helper()
	select {
	case ev, ok := <-ch:
		if !ok {
			t.Fatal("el canal del suscriptor se cerró")
		}
		return ev
	case <-time.After(time.Second):
		t.Fatal("timeout esperando evento")
	}
	return domain.VoteEvent{}
}

// ResetVotes avisa con votes_reset y NO cierra la suscripción (antes ClearVoting cortaba los streams).
func TestResetVotes_NotificaSinCerrar(t *testing.T) {
	vc := cache.New()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	ch, _ := vc.Subscribe(ctx, 5)

	_ = vc.PublishVote(5, domain.VoteDTO{ID: 1, VotingID: 5})
	if ev := recv(t, ch); ev.Type != domain.VoteEventNewVote {
		t.Fatalf("got %q", ev.Type)
	}
	_ = vc.ResetVotes(5)
	if ev := recv(t, ch); ev.Type != domain.VoteEventVotesReset {
		t.Fatalf("got %q", ev.Type)
	}
	if st, _ := vc.GetVotingState(5); len(st) != 0 {
		t.Errorf("el cache debe quedar vacío: %v", st)
	}
	_ = vc.PublishVote(5, domain.VoteDTO{ID: 2, VotingID: 5})
	if ev := recv(t, ch); ev.Type != domain.VoteEventNewVote || ev.Vote.ID != 2 {
		t.Fatalf("tras el reset la suscripción debe seguir viva: %+v", ev)
	}
}

// Una anulación se notifica aunque el voto no esté en el cache (p. ej. el stream se abrió
// después de votar): antes no se emitía nada y los resultados en vivo quedaban viejos.
func TestRemoveVote_NotificaAunqueNoEsteEnCache(t *testing.T) {
	vc := cache.New()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	ch, _ := vc.Subscribe(ctx, 6)

	_ = vc.RemoveVote(6, 77)
	ev := recv(t, ch)
	if ev.Type != domain.VoteEventVoteDeleted || ev.Vote.ID != 77 || ev.Vote.VotingID != 6 {
		t.Fatalf("evento inesperado: %+v", ev)
	}
}
