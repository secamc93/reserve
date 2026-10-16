package usecasecredentials

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// ICredentialsUseCase define los casos de uso de las contraseñas de voto por unidad y grupo.
type ICredentialsUseCase interface {
	// GenerateCredentials crea una contraseña aleatoria para cada unidad activa de la propiedad del
	// grupo que aún no tenga una. Con regenerate, reemplaza todas (las impresas antes dejan de
	// servir). El aislamiento por propiedad lo hace el ScopeGuard de las rutas con :group_id.
	GenerateCredentials(ctx context.Context, groupID uint, regenerate bool) (*domain.GenerateCredentialsResultDTO, error)
	ListCredentials(ctx context.Context, groupID uint, page, pageSize int) (*domain.PaginatedVotingCredentialsDTO, error)
}

// PasswordGenerator genera una contraseña nueva (inyectable para pruebas).
type PasswordGenerator func() (string, error)

// CredentialsUseCase implementa ICredentialsUseCase.
type CredentialsUseCase struct {
	repo        domain.VotingRepository
	logger      log.ILogger
	newPassword PasswordGenerator
}

// New crea el caso de uso. Si newPassword es nil usa el generador aleatorio por defecto.
func New(repo domain.VotingRepository, logger log.ILogger, newPassword PasswordGenerator) ICredentialsUseCase {
	if newPassword == nil {
		newPassword = RandomPassword
	}
	return &CredentialsUseCase{
		repo:        repo,
		logger:      logger.WithModule("contrasenas_voto"),
		newPassword: newPassword,
	}
}
