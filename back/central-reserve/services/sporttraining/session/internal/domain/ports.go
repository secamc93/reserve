package domain

import "context"

// SessionRepository - Puerto para repositorio de sesiones
type SessionRepository interface {
	Create(ctx context.Context, session *TrainingSession) (*TrainingSession, error)
	GetByID(ctx context.Context, id uint, businessID uint) (*TrainingSession, error)
	Update(ctx context.Context, session *TrainingSession) (*TrainingSession, error)
	List(ctx context.Context, filters SessionFiltersDTO) (*PaginatedSessionsDTO, error)
	Cancel(ctx context.Context, dto CancelSessionDTO) (*TrainingSession, error)
}

// SessionUseCase - Puerto para casos de uso de sesiones
type SessionUseCase interface {
	CreateSession(ctx context.Context, dto CreateSessionDTO) (*TrainingSession, error)
	GetSessionByID(ctx context.Context, id uint, businessID uint) (*TrainingSession, error)
	UpdateSession(ctx context.Context, dto UpdateSessionDTO) (*TrainingSession, error)
	ListSessions(ctx context.Context, filters SessionFiltersDTO) (*PaginatedSessionsDTO, error)
	CancelSession(ctx context.Context, dto CancelSessionDTO) (*TrainingSession, error)
}
