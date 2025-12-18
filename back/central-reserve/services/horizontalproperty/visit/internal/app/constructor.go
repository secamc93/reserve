package app

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

type visitUseCase struct {
	visitorRepo   domain.VisitorRepository
	visitRepo     domain.VisitRepository
	companionRepo domain.VisitCompanionRepository
	assetRepo     domain.VisitAssetRepository
	blacklistRepo domain.VisitBlacklistRepository
	logger        log.ILogger
}

// New crea una nueva instancia del caso de uso
func New(
	visitorRepo domain.VisitorRepository,
	visitRepo domain.VisitRepository,
	companionRepo domain.VisitCompanionRepository,
	assetRepo domain.VisitAssetRepository,
	blacklistRepo domain.VisitBlacklistRepository,
	logger log.ILogger,
) domain.VisitUseCase {
	contextualLogger := logger.WithModule("visitas")
	return &visitUseCase{
		visitorRepo:   visitorRepo,
		visitRepo:     visitRepo,
		companionRepo: companionRepo,
		assetRepo:     assetRepo,
		blacklistRepo: blacklistRepo,
		logger:        contextualLogger,
	}
}
