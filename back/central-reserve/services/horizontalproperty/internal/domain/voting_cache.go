package domain

import (
	"context"
	"sync"
)

// VotingCacheService - Servicio de cache para votaciones en tiempo real
type VotingCacheService interface {
	// PublishVote publica un nuevo voto en el cache y notifica a los suscriptores
	PublishVote(votingID uint, vote VoteDTO) error

	// GetVotingState obtiene el estado actual de una votación (todos los votos)
	GetVotingState(votingID uint) ([]VoteDTO, error)

	// Subscribe suscribe un canal para recibir actualizaciones de votos de una votación
	Subscribe(ctx context.Context, votingID uint) (<-chan VoteDTO, error)

	// Unsubscribe cancela la suscripción de un canal
	Unsubscribe(votingID uint, ch <-chan VoteDTO)

	// ClearVoting limpia el cache de una votación específica
	ClearVoting(votingID uint)

	// InitializeVoting inicializa el cache de una votación con votos existentes
	InitializeVoting(votingID uint, votes []VoteDTO) error
}

// VotingCache - Implementación del cache de votaciones
type VotingCache struct {
	mu          sync.RWMutex
	votings     map[uint][]VoteDTO      // Almacena votos por voting_id
	subscribers map[uint][]chan VoteDTO // Canales de suscriptores por voting_id
}

// NewVotingCache crea una nueva instancia del cache
func NewVotingCache() *VotingCache {
	return &VotingCache{
		votings:     make(map[uint][]VoteDTO),
		subscribers: make(map[uint][]chan VoteDTO),
	}
}

// PublishVote publica un nuevo voto
func (vc *VotingCache) PublishVote(votingID uint, vote VoteDTO) error {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	// Agregar voto al cache
	vc.votings[votingID] = append(vc.votings[votingID], vote)

	// Notificar a todos los suscriptores
	if subscribers, exists := vc.subscribers[votingID]; exists {
		for _, ch := range subscribers {
			select {
			case ch <- vote:
				// Voto enviado exitosamente
			default:
				// Canal lleno o cerrado, continuar
			}
		}
	}

	return nil
}

// GetVotingState obtiene todos los votos de una votación
func (vc *VotingCache) GetVotingState(votingID uint) ([]VoteDTO, error) {
	vc.mu.RLock()
	defer vc.mu.RUnlock()

	votes, exists := vc.votings[votingID]
	if !exists {
		return []VoteDTO{}, nil
	}

	// Retornar copia para evitar modificaciones concurrentes
	result := make([]VoteDTO, len(votes))
	copy(result, votes)
	return result, nil
}

// Subscribe crea una suscripción para recibir votos en tiempo real
func (vc *VotingCache) Subscribe(ctx context.Context, votingID uint) (<-chan VoteDTO, error) {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	// Crear canal con buffer para evitar bloqueos
	ch := make(chan VoteDTO, 100)

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
func (vc *VotingCache) Unsubscribe(votingID uint, ch <-chan VoteDTO) {
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
func (vc *VotingCache) ClearVoting(votingID uint) {
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
}

// InitializeVoting inicializa el cache con votos existentes
func (vc *VotingCache) InitializeVoting(votingID uint, votes []VoteDTO) error {
	vc.mu.Lock()
	defer vc.mu.Unlock()

	vc.votings[votingID] = make([]VoteDTO, len(votes))
	copy(vc.votings[votingID], votes)

	return nil
}
