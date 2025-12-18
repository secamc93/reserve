package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/secondary/repository"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

// CreateReservation crea una nueva reserva
func (uc *commonAreaUseCase) CreateReservation(ctx context.Context, dto domain.CreateReservationDTO) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateReservation")

	// Validaciones básicas
	if dto.CommonAreaID == 0 {
		return nil, fmt.Errorf("common_area_id es requerido")
	}
	if dto.PropertyUnitID == 0 {
		return nil, fmt.Errorf("property_unit_id es requerido")
	}

	// Obtener zona común
	area, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, dto.CommonAreaID)
	if err != nil {
		return nil, err
	}

	// Validar capacidad
	if dto.NumberOfGuests > area.MaxCapacity {
		return nil, domain.ErrExceedsCapacity
	}

	// Validar disponibilidad
	available, err := uc.CheckAvailability(ctx, domain.CheckAvailabilityDTO{
		CommonAreaID:    dto.CommonAreaID,
		ReservationDate: dto.ReservationDate,
		StartTime:       dto.StartTime,
		EndTime:         dto.EndTime,
	})
	if err != nil {
		return nil, err
	}
	if !available {
		return nil, domain.ErrReservationNotAvailable
	}

	// Calcular duración en horas
	startTime, err := time.Parse("15:04", dto.StartTime)
	if err != nil {
		return nil, fmt.Errorf("formato de hora inicio inválido: %w", err)
	}
	endTime, err := time.Parse("15:04", dto.EndTime)
	if err != nil {
		return nil, fmt.Errorf("formato de hora fin inválido: %w", err)
	}
	durationHours := endTime.Sub(startTime).Hours()

	// Calcular monto total si hay tarifa
	var totalAmount *float64
	if area.HourlyRate != nil {
		amount := *area.HourlyRate * durationHours
		totalAmount = &amount
	}

	// Obtener estado inicial
	// Necesitamos acceder a la DB para obtener el estado
	// Por ahora, asumimos que el estado se obtiene por código en el repositorio
	// TODO: Agregar método GetReservationStatusByCode al repositorio o pasar el ID del estado
	statusCode := "pending"
	if !area.RequiresApproval {
		statusCode = "approved"
	}

	// Obtener el ID del estado - necesitamos agregar un método helper o hacerlo en el repositorio
	// Por ahora, creamos la reserva con un statusID temporal que se actualizará
	// Necesitamos obtener el estado desde el repositorio o agregar un método helper
	reservationRepo, ok := uc.reservationRepo.(*repository.CommonAreaReservationRepository)
	if !ok {
		return nil, fmt.Errorf("repositorio de reservas no es del tipo esperado")
	}

	var status models.CommonAreaReservationStatus
	db := reservationRepo.GetDB(ctx)
	if err := db.Where("code = ?", statusCode).First(&status).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estado %s: %w", statusCode, err)
	}

	// Crear reserva
	reservation := &domain.CommonAreaReservation{
		BusinessID:          dto.BusinessID,
		CommonAreaID:        dto.CommonAreaID,
		PropertyUnitID:      dto.PropertyUnitID,
		ResidentID:          dto.ResidentID,
		ReservationStatusID: status.ID,
		ReservationDate:     dto.ReservationDate,
		StartTime:           dto.StartTime,
		EndTime:             dto.EndTime,
		DurationHours:       durationHours,
		RequiresApproval:    area.RequiresApproval,
		NumberOfGuests:      dto.NumberOfGuests,
		Purpose:             dto.Purpose,
		SpecialRequests:     dto.SpecialRequests,
		IsRecurring:         dto.IsRecurring,
		TotalAmount:         totalAmount,
		DepositAmount:       area.DepositAmount,
		NotifyResident:      true,
		NotifyAdmin:         true,
		ResidentNotes:       dto.SpecialRequests,
	}

	created, err := uc.reservationRepo.CreateReservation(ctx, reservation)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando reserva")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", created.ID).Uint("common_area_id", dto.CommonAreaID).Msg("Reserva creada exitosamente")

	return created, nil
}
