package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
)

// BusinessTypeMigrationUseCase maneja la migración e inicialización de tipos de negocio
type BusinessTypeMigrationUseCase struct {
	scopeUseCase *ScopeUseCase
	logger       log.ILogger
}

// NewBusinessTypeMigrationUseCase crea una nueva instancia del caso de uso de migración de tipos de negocio
func NewBusinessTypeMigrationUseCase(scopeUseCase *ScopeUseCase, logger log.ILogger) *BusinessTypeMigrationUseCase {
	return &BusinessTypeMigrationUseCase{
		scopeUseCase: scopeUseCase,
		logger:       logger,
	}
}

// Execute ejecuta la migración de tipos de negocio
func (uc *BusinessTypeMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando tipos de negocio...")

	businessTypes := []models.BusinessType{
		{
			Name:        "Restaurante",
			Code:        "restaurant",
			Description: "Restaurantes y establecimientos de comida",
			Icon:        "🍽️",
			IsActive:    true,
		},
		{
			Name:        "Café",
			Code:        "cafe",
			Description: "Cafés y establecimientos de bebidas",
			Icon:        "☕",
			IsActive:    true,
		},
		{
			Name:        "Bar",
			Code:        "bar",
			Description: "Bares y establecimientos nocturnos",
			Icon:        "🍺",
			IsActive:    true,
		},
		{
			Name:        "Hotel",
			Code:        "hotel",
			Description: "Hoteles y establecimientos de hospedaje",
			Icon:        "🏨",
			IsActive:    true,
		},
		{
			Name:        "Spa",
			Code:        "spa",
			Description: "Spas y centros de bienestar",
			Icon:        "💆",
			IsActive:    true,
		},
		{
			Name:        "Salón de Belleza",
			Code:        "salon",
			Description: "Salones de belleza y peluquerías",
			Icon:        "💇",
			IsActive:    true,
		},
		{
			Name:        "Clínica",
			Code:        "clinic",
			Description: "Clínicas y centros médicos",
			Icon:        "🏥",
			IsActive:    true,
		},
		{
			Name:        "Gimnasio",
			Code:        "gym",
			Description: "Gimnasios y centros deportivos",
			Icon:        "💪",
			IsActive:    true,
		},
		{
			Name:        "Estudio",
			Code:        "studio",
			Description: "Estudios de fotografía, grabación, etc.",
			Icon:        "📸",
			IsActive:    true,
		},
		{
			Name:        "Oficina",
			Code:        "office",
			Description: "Oficinas y espacios de trabajo",
			Icon:        "🏢",
			IsActive:    true,
		},
	}

	// Verificar si todos los tipos ya existen
	allExist := true
	for _, businessType := range businessTypes {
		exists, err := uc.scopeUseCase.ExistsBusinessTypeByCode(businessType.Code)
		if err != nil {
			return err
		}
		if !exists {
			allExist = false
			break
		}
	}

	if allExist {
		uc.logger.Info().Int("business_types_count", len(businessTypes)).Msg("✅ Tipos de negocio ya existen, saltando migración")
		return nil
	}

	// Inicializar tipos de negocio usando el caso de uso
	if err := uc.scopeUseCase.InitializeBusinessTypes(businessTypes); err != nil {
		return err
	}

	uc.logger.Info().Int("business_types_count", len(businessTypes)).Msg("✅ Tipos de negocio creados correctamente")
	return nil
}
