package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
	"fmt"
)

// TestBusinessMigrationUseCase maneja la migración e inicialización del negocio de prueba
type TestBusinessMigrationUseCase struct {
	systemUseCase *SystemUseCase
	scopeUseCase  *ScopeUseCase
	logger        log.ILogger
}

// NewTestBusinessMigrationUseCase crea una nueva instancia del caso de uso de migración del negocio de prueba
func NewTestBusinessMigrationUseCase(systemUseCase *SystemUseCase, scopeUseCase *ScopeUseCase, logger log.ILogger) *TestBusinessMigrationUseCase {
	return &TestBusinessMigrationUseCase{
		systemUseCase: systemUseCase,
		scopeUseCase:  scopeUseCase,
		logger:        logger,
	}
}

// Execute ejecuta la migración del negocio de prueba
func (uc *TestBusinessMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Creando negocio de prueba...")

	// 1. Verificar que el business type requerido existe
	uc.logger.Debug().Msg("Verificando dependencias: business type 'restaurant'")

	restaurantType, err := uc.scopeUseCase.GetBusinessTypeByCode("restaurant")
	if err != nil {
		uc.logger.Error().Err(err).Str("business_type_code", "restaurant").Msg("❌ Error al obtener business type 'restaurant'")
		return err
	}
	if restaurantType == nil {
		uc.logger.Error().Str("business_type_code", "restaurant").Msg("❌ Business type 'restaurant' no encontrado. Asegúrate de ejecutar la migración de business types primero")
		return fmt.Errorf("business type 'restaurant' no encontrado")
	}
	uc.logger.Debug().Uint("restaurant_type_id", restaurantType.ID).Str("restaurant_type_name", restaurantType.Name).Msg("✅ Business type 'restaurant' encontrado")

	// 2. Verificar si el negocio de prueba ya existe
	uc.logger.Debug().Str("business_code", "test-restaurant").Msg("Verificando si el negocio de prueba ya existe...")
	exists, err := uc.systemUseCase.ExistsBusinessByCode("test-restaurant")
	if err != nil {
		uc.logger.Error().Err(err).Str("business_code", "test-restaurant").Msg("❌ Error al verificar negocio existente")
		return err
	}

	if exists {
		uc.logger.Info().Str("business_code", "test-restaurant").Msg("✅ Negocio de prueba ya existe, saltando creación")
		return nil
	}

	// 3. Crear el negocio de prueba con el ID del business type verificado
	uc.logger.Info().Str("business_type_name", restaurantType.Name).Uint("business_type_id", restaurantType.ID).Msg("Creando negocio de prueba...")

	testBusiness := models.Business{
		Name:               "Trattoria La Bella",
		Code:               "test-restaurant",
		BusinessTypeID:     restaurantType.ID, // ✅ ID verificado del business type
		Timezone:           "America/Bogota",
		Address:            "Calle 123 #45-67, Bogotá, Colombia",
		Description:        "Restaurante italiano de prueba para desarrollo",
		LogoURL:            "https://example.com/logo.png",
		PrimaryColor:       "#1f2937",
		SecondaryColor:     "#3b82f6",
		CustomDomain:       "test.trattoria.com",
		IsActive:           true,
		EnableDelivery:     false,
		EnablePickup:       true,
		EnableReservations: true,
	}

	if err := uc.systemUseCase.CreateBusiness(&testBusiness); err != nil {
		uc.logger.Error().Err(err).Str("business_name", testBusiness.Name).Str("business_code", testBusiness.Code).Msg("❌ Error al crear negocio de prueba")
		return err
	}

	uc.logger.Info().Str("business_name", testBusiness.Name).Str("business_code", testBusiness.Code).Uint("business_id", testBusiness.ID).Msg("✅ Negocio de prueba creado correctamente")
	return nil
}
