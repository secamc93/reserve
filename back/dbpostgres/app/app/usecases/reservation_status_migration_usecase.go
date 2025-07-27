package usecases

import (
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"
)

// ReservationStatusMigrationUseCase maneja la migración e inicialización de estados de reserva
type ReservationStatusMigrationUseCase struct {
	systemUseCase *SystemUseCase
	logger        log.ILogger
}

// NewReservationStatusMigrationUseCase crea una nueva instancia del caso de uso de migración de estados de reserva
func NewReservationStatusMigrationUseCase(systemUseCase *SystemUseCase, logger log.ILogger) *ReservationStatusMigrationUseCase {
	return &ReservationStatusMigrationUseCase{
		systemUseCase: systemUseCase,
		logger:        logger,
	}
}

// Execute ejecuta la migración de estados de reserva
func (uc *ReservationStatusMigrationUseCase) Execute() error {
	uc.logger.Info().Msg("Inicializando estados de reserva...")

	statuses := []models.ReservationStatus{
		{Code: "pending", Name: "Pendiente"},
		{Code: "confirmed", Name: "Confirmada"},
		{Code: "cancelled", Name: "Cancelada"},
		{Code: "completed", Name: "Completada"},
		{Code: "no_show", Name: "No Show"},
	}

	// Verificar si ya existen estados de reserva en la base de datos
	existingStatuses, err := uc.systemUseCase.GetAllReservationStatuses()
	if err != nil {
		return err
	}

	// Si ya existen estados, saltar la migración
	if len(existingStatuses) > 0 {
		uc.logger.Info().Int("statuses_count", len(existingStatuses)).Msg("✅ Estados de reserva ya existen, saltando migración")
		return nil
	}

	// Inicializar estados usando el caso de uso
	if err := uc.systemUseCase.InitializeReservationStatuses(statuses); err != nil {
		return err
	}

	uc.logger.Info().Int("statuses_count", len(statuses)).Msg("✅ Estados de reserva creados correctamente")
	return nil
}
