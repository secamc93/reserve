package cache

import (
	"context"
	"sync"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// VotingCache - Implementación del cache de votaciones
type VotingCache struct {
	mu          sync.RWMutex
	votings     map[uint][]domain.VoteDTO        // Almacena votos por voting_id
	subscribers map[uint][]chan domain.VoteEvent // Canales de suscriptores por voting_id
}

// New crea una nueva instancia del cache
func New() *VotingCache {
	return &VotingCache{
		votings:     make(map[uint][]domain.VoteDTO),
		subscribers: make(map[uint][]chan domain.VoteEvent),
	}
}

// PublishVote publica un nuevo voto
func (vc *VotingCache) PublishVote(votingID uint, vote domain.VoteDTO) error {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	// Agregar voto al cache
	vc.votings[votingID] = append(vc.votings[votingID], vote)

	// Crear evento de nuevo voto
	event := domain.VoteEvent{
		Type: "new_vote",
		Vote: vote,
	}

	// Notificar a todos los suscriptores
	if subscribers, exists := vc.subscribers[votingID]; exists {
		for _, ch := range subscribers {
			select {
			case ch <- event:
				// Voto enviado exitosamente
			default:
				// Canal lleno o cerrado, continuar
			}
		}
	}

	return nil
}

// RemoveVote elimina un voto del cache y notifica a los suscriptores
func (vc *VotingCache) RemoveVote(votingID uint, voteID uint) error {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	// Buscar y eliminar el voto del cache
	votes, exists := vc.votings[votingID]
	if !exists {
		return nil // No hay votos en esta votación
	}

	// Crear nuevo slice sin el voto eliminado
	var newVotes []domain.VoteDTO
	var removedVote *domain.VoteDTO

	for _, vote := range votes {
		if vote.ID == voteID {
			removedVote = &vote
			continue // Saltar este voto
		}
		newVotes = append(newVotes, vote)
	}

	// Actualizar el cache
	vc.votings[votingID] = newVotes

	// Crear evento de voto eliminado
	if removedVote != nil {
		event := domain.VoteEvent{
			Type: "vote_deleted",
			Vote: *removedVote,
		}

		// Notificar a todos los suscriptores sobre la eliminación
		if subscribers, exists := vc.subscribers[votingID]; exists {
			for _, ch := range subscribers {
				select {
				case ch <- event:
					// Voto eliminado enviado exitosamente
				default:
					// Canal lleno o cerrado, continuar
				}
			}
		}
	}

	return nil
}

// GetVotingState obtiene todos los votos de una votación
func (vc *VotingCache) GetVotingState(votingID uint) ([]domain.VoteDTO, error) {
	vc.mu.RLock()
	defer vc.mu.RUnlock()

	votes, exists := vc.votings[votingID]
	if !exists {
		return []domain.VoteDTO{}, nil
	}

	// Retornar copia para evitar modificaciones concurrentes
	result := make([]domain.VoteDTO, len(votes))
	copy(result, votes)
	return result, nil
}

// Subscribe crea una suscripción para recibir votos en tiempo real
func (vc *VotingCache) Subscribe(ctx context.Context, votingID uint) (<-chan domain.VoteEvent, error) {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	// Crear canal con buffer para evitar bloqueos
	ch := make(chan domain.VoteEvent, 100)

	// Agregar a la lista de suscriptores
	vc.subscribers[votingID] = append(vc.subscribers[votingID], ch)

	// Goroutine para limpiar cuando el contexto se cancele
	go func() {
		<-ctx.Done()
		vc.Unsubscribe(votingID, ch)
	}()

	return ch, nil
}

// Unsubscribe elimina una suscripción
func (vc *VotingCache) Unsubscribe(votingID uint, ch <-chan domain.VoteEvent) {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	subscribers := vc.subscribers[votingID]
	for i, subscriber := range subscribers {
		if subscriber == ch {
			// Remover del slice
			vc.subscribers[votingID] = append(subscribers[:i], subscribers[i+1:]...)
			close(subscriber)
			break
		}
	}

	// Si no quedan suscriptores, limpiar el slice
	if len(vc.subscribers[votingID]) == 0 {
		delete(vc.subscribers, votingID)
	}
}

// ClearVoting limpia el cache de una votación
func (vc *VotingCache) ClearVoting(votingID uint) error {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	delete(vc.votings, votingID)

	// Cerrar todos los canales de suscriptores
	if subscribers, exists := vc.subscribers[votingID]; exists {
		for _, ch := range subscribers {
			close(ch)
		}
		delete(vc.subscribers, votingID)
	}

	return nil
}

// InitializeVoting inicializa el cache con votos existentes
func (vc *VotingCache) InitializeVoting(votingID uint, votes []domain.VoteDTO) error {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	vc.votings[votingID] = make([]domain.VoteDTO, len(votes))
	copy(vc.votings[votingID], votes)

	return nil
}
