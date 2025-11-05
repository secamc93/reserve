package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// ScopeUseCase maneja la lógica de negocio para scopes y business types
type ScopeUseCase struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewScopeUseCase crea una nueva instancia del caso de uso de scopes
func NewScopeUseCase(db *gorm.DB, logger log.ILogger) *ScopeUseCase {
	return &ScopeUseCase{
		db:     db,
		logger: logger,
	}
}

// InitializeScopes inicializa los scopes del sistema
func (uc *ScopeUseCase) InitializeScopes(scopes []models.Scope) error {
	uc.logger.Info().Msg("Inicializando scopes del sistema...")

	for _, scope := range scopes {
		exists, err := uc.ExistsScopeByCode(scope.Code)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.db.Create(&scope).Error; err != nil {
				uc.logger.Error().Err(err).Msg("Error al crear scope")
				return err
			}
		}
	}

	uc.logger.Info().Int("scopes_count", len(scopes)).Msg("✅ Scopes del sistema inicializados correctamente")
	return nil
}

// InitializeBusinessTypes inicializa los tipos de negocio del sistema
func (uc *ScopeUseCase) InitializeBusinessTypes(businessTypes []models.BusinessType) error {
	uc.logger.Info().Msg("Inicializando tipos de negocio del sistema...")

	for _, businessType := range businessTypes {
		exists, err := uc.ExistsBusinessTypeByCode(businessType.Code)
		if err != nil {
			return err
		}

		if !exists {
			if err := uc.db.Create(&businessType).Error; err != nil {
				uc.logger.Error().Err(err).Msg("Error al crear tipo de negocio")
				return err
			}
		}
	}

	uc.logger.Info().Int("business_types_count", len(businessTypes)).Msg("✅ Tipos de negocio del sistema inicializados correctamente")
	return nil
}

// GetScopeByCode obtiene un scope por su código
func (uc *ScopeUseCase) GetScopeByCode(code string) (*models.Scope, error) {
	var scope models.Scope
	if err := uc.db.Where("code = ?", code).First(&scope).Error; err != nil {
		uc.logger.Error().Err(err).Str("code", code).Msg("Error al obtener scope por código")
		return nil, err
	}
	return &scope, nil
}

// GetBusinessTypeByCode obtiene un tipo de negocio por su código
func (uc *ScopeUseCase) GetBusinessTypeByCode(code string) (*models.BusinessType, error) {
	var businessType models.BusinessType
	if err := uc.db.Where("code = ?", code).First(&businessType).Error; err != nil {
		uc.logger.Error().Err(err).Str("code", code).Msg("Error al obtener tipo de negocio por código")
		return nil, err
	}
	return &businessType, nil
}

// ExistsScopeByCode verifica si existe un scope con el código especificado
func (uc *ScopeUseCase) ExistsScopeByCode(code string) (bool, error) {
	var count int64
	if err := uc.db.Model(&models.Scope{}).Where("code = ?", code).Count(&count).Error; err != nil {
		uc.logger.Error().Err(err).Str("code", code).Msg("Error al verificar existencia de scope por código")
		return false, err
	}
	return count > 0, nil
}

// ExistsBusinessTypeByCode verifica si existe un tipo de negocio con el código especificado
func (uc *ScopeUseCase) ExistsBusinessTypeByCode(code string) (bool, error) {
	var count int64
	if err := uc.db.Model(&models.BusinessType{}).Where("code = ?", code).Count(&count).Error; err != nil {
		uc.logger.Error().Err(err).Str("code", code).Msg("Error al verificar existencia de tipo de negocio por código")
		return false, err
	}
	return count > 0, nil
}
