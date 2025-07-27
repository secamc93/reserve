package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
)

// ScopeMigrationUseCase maneja la migración e inicialización de scopes
type ScopeMigrationUseCase struct {
	scopeUseCase *ScopeUseCase
	logger       log.ILogger
}

// NewScopeMigrationUseCase crea una nueva instancia del caso de uso de migración de scopes
func NewScopeMigrationUseCase(scopeUseCase *ScopeUseCase, logger log.ILogger) *ScopeMigrationUseCase {
	return &ScopeMigrationUseCase{
		scopeUseCase: scopeUseCase,
		logger:       logger,
	}
}

// Execute ejecuta la migración de scopes
func (uc *ScopeMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando scopes del sistema...")

	scopes := []models.Scope{
		{
			Name:        "Plataforma",
			Code:        "platform",
			Description: "Scope para roles y permisos de la plataforma",
			IsSystem:    true,
		},
		{
			Name:        "Negocio",
			Code:        "business",
			Description: "Scope para roles y permisos de negocios individuales",
			IsSystem:    true,
		},
	}

	// Verificar si todos los scopes ya existen
	allExist := true
	for _, scope := range scopes {
		exists, err := uc.scopeUseCase.ExistsScopeByCode(scope.Code)
		if err != nil {
			return err
		}
		if !exists {
			allExist = false
			break
		}
	}

	if allExist {
		uc.logger.Info().Int("scopes_count", len(scopes)).Msg("✅ Scopes ya existen, saltando migración")
		return nil
	}

	// Inicializar scopes usando el caso de uso
	if err := uc.scopeUseCase.InitializeScopes(scopes); err != nil {
		return err
	}

	uc.logger.Info().Int("scopes_count", len(scopes)).Msg("✅ Scopes creados correctamente")
	return nil
}
