package app

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

type commonAreaUseCase struct {
	commonAreaRepo  domain.CommonAreaRepository
	scheduleRepo    domain.CommonAreaScheduleRepository
	restrictionRepo domain.CommonAreaRestrictionRepository
	reservationRepo domain.CommonAreaReservationRepository
	logger          log.ILogger
}

// New crea una nueva instancia del caso de uso
func New(
	commonAreaRepo domain.CommonAreaRepository,
	scheduleRepo domain.CommonAreaScheduleRepository,
	restrictionRepo domain.CommonAreaRestrictionRepository,
	reservationRepo domain.CommonAreaReservationRepository,
	logger log.ILogger,
) domain.CommonAreaUseCase {
	contextualLogger := logger.WithModule("zonas_comunes")
	return &commonAreaUseCase{
		commonAreaRepo:  commonAreaRepo,
		scheduleRepo:    scheduleRepo,
		restrictionRepo: restrictionRepo,
		reservationRepo: reservationRepo,
		logger:          contextualLogger,
	}
}
